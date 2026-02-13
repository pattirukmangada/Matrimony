<?php
/**
 * POST /api/auth/verify-otp.php
 * Email OTP verification only.
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../services/OTPService.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$email = trim($input['identifier'] ?? '');
$type  = trim($input['type'] ?? '');
$otp   = trim($input['otp'] ?? '');

/* ---------------- VALIDATION ---------------- */

if (
    empty($email) ||
    $type !== 'email' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !preg_match('/^\d{6}$/', $otp)
) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

try {

    $db = (new Database())->getConnection();

    // Verify OTP
    if (!OTPService::verifyOTP($db, $email, 'email', $otp)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired OTP']);
        exit;
    }

    // Mark email verified
    $stmt = $db->prepare("
        UPDATE users 
        SET email_verified = 1 
        WHERE email = :email
    ");
    $stmt->execute(['email' => $email]);

    // Activate account
    $stmt = $db->prepare("
        UPDATE users 
        SET is_active = 1 
        WHERE email = :email
    ");
    $stmt->execute(['email' => $email]);

    echo json_encode([
        'success' => true,
        'message' => 'Email verified successfully.'
    ]);

} catch (Throwable $e) {

    error_log("OTP Verify Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode(['error' => 'Verification failed']);
}
