<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../services/OTPService.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$email = trim($input['identifier'] ?? '');
$otp   = trim($input['otp'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{6}$/', $otp)) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

try {

    $db = (new Database())->getConnection();

    if (!OTPService::verifyOTP($db, $email, 'email', $otp)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired OTP']);
        exit;
    }

    $tempData = OTPService::getTempRegistration($db, $email);

    if (!$tempData) {
        http_response_code(400);
        echo json_encode(['error' => 'Registration expired']);
        exit;
    }

    $db->beginTransaction();

    $stmt = $db->prepare("
        INSERT INTO users
        (full_name, email, mobile, gender, dob, religion, location, password_hash, status, email_verified, is_active)
        VALUES
        (:full_name, :email, :mobile, :gender, :dob, :religion, :location, :password_hash, 'pending', 1, 1)
    ");

    $stmt->execute($tempData);

    OTPService::deleteTempRegistration($db, $email);

    $db->commit();

    echo json_encode(['success' => true]);

} catch (Throwable $e) {

    if ($db && $db->inTransaction()) {
        $db->rollBack();
    }

    error_log("Verify OTP Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode(['error' => 'Account creation failed']);
}
