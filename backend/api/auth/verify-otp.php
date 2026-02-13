<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/mail.php';
require_once __DIR__ . '/../../services/OTPService.php';

header('Content-Type: application/json');

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
    echo json_encode(['error' => 'Invalid input.']);
    exit;
}

try {

    $db = (new Database())->getConnection();

    if (!OTPService::verifyOTP($db, $identifier, $type, $otp)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired OTP']);
        exit;
    }

    $column = $type === 'email' ? 'email_verified' : 'mobile_verified';
    $field  = $type === 'email' ? 'email' : 'mobile';

    // Mark verified
    $stmt = $db->prepare("UPDATE users SET {$column} = 1 WHERE {$field} = :identifier");
    $stmt->execute(['identifier' => $identifier]);

    /*
    🔥 NEW LOGIC:
    If email verified → remove any unused SMS OTP
    */
    if ($type === 'email') {

        // Get user mobile
        $stmt = $db->prepare("SELECT mobile FROM users WHERE email = :identifier");
        $stmt->execute(['identifier' => $identifier]);
        $userData = $stmt->fetch();

        if ($userData && !empty($userData['mobile'])) {

            // Invalidate all unused SMS OTPs
            $stmt = $db->prepare("
                UPDATE otp_logs
                SET is_used = 1
                WHERE identifier = :mobile
                AND type = 'sms'
                AND is_used = 0
            ");

            $stmt->execute(['mobile' => $userData['mobile']]);
        }
    }

    // Fetch updated status
    $stmt = $db->prepare("
        SELECT id, email_verified, mobile_verified 
        FROM users 
        WHERE {$field} = :identifier
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
        'both_verified' => (bool)($user['email_verified'] && $user['mobile_verified'])
    ]);

} catch (Throwable $e) {

    error_log("OTP Verify Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode(['error' => 'Verification failed']);
}
