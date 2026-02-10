<?php
/**
 * POST /api/auth/verify-otp.php
 * 
 * Verify OTP for email or mobile.
 * Both must be verified before account is activated.
 * 
 * Body: { identifier (email or mobile), type ('email' or 'sms'), otp }
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/mail.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$identifier = trim($input['identifier'] ?? '');
$type       = trim($input['type'] ?? '');
$otp        = trim($input['otp'] ?? '');

if (empty($identifier) || !in_array($type, ['email', 'sms']) || !preg_match('/^\d{6}$/', $otp)) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid input. Provide identifier, type (email/sms), and 6-digit OTP.']);
    exit;
}

$db = (new Database())->getConnection();

// Verify OTP
if (!OTPService::verifyOTP($db, $identifier, $type, $otp)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or expired OTP']);
    exit;
}

// Update user verification status
$column = $type === 'email' ? 'email_verified' : 'mobile_verified';
$field  = $type === 'email' ? 'email' : 'mobile';

$stmt = $db->prepare("UPDATE users SET {$column} = 1 WHERE {$field} = :identifier");
$stmt->execute(['identifier' => $identifier]);

// Update profile_verifications table
$verifyCol = $type === 'email' ? 'email_verified' : 'mobile_verified';
$stmt = $db->prepare("
    UPDATE profile_verifications pv
    INNER JOIN users u ON u.id = pv.user_id
    SET pv.{$verifyCol} = 1
    WHERE u.{$field} = :identifier
");
$stmt->execute(['identifier' => $identifier]);

// Check if both are verified — activate account (but still needs admin approval to show in search)
$stmt = $db->prepare("
    SELECT id, email_verified, mobile_verified FROM users WHERE {$field} = :identifier
");
$stmt->execute(['identifier' => $identifier]);
$user = $stmt->fetch();

if ($user && $user['email_verified'] && $user['mobile_verified']) {
    $stmt = $db->prepare("UPDATE users SET is_active = 1 WHERE id = :id");
    $stmt->execute(['id' => $user['id']]);
}

echo json_encode([
    'success' => true,
    'message' => ucfirst($type) . ' verified successfully.',
    'both_verified' => (bool)($user['email_verified'] && $user['mobile_verified']),
]);
