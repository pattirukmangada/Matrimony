<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../services/OTPService.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$email = trim($input['identifier'] ?? '');
$otp   = trim($input['otp'] ?? '');

$db = (new Database())->getConnection();

// Verify OTP
if (!OTPService::verifyOTP($db, $email, 'email', $otp)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid OTP']);
    exit;
}

// Fetch temporary data
$tempData = OTPService::getTempRegistration($db, $email);

if (!$tempData) {
    http_response_code(400);
    echo json_encode(['error' => 'Registration data expired']);
    exit;
}

try {
    $db->beginTransaction();

    $stmt = $db->prepare("
        INSERT INTO users 
        (full_name, email, mobile, gender, dob, religion, location, password_hash, status, email_verified)
        VALUES 
        (:full_name, :email, :mobile, :gender, :dob, :religion, :location, :password_hash, 'pending', 1)
    ");

    $stmt->execute($tempData);

    $userId = $db->lastInsertId();

    // Insert other tables same as before

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully'
    ]);

} catch (Throwable $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create account']);
}
