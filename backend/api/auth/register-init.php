<?php

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

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

/* =======================
   SANITIZE INPUT
======================= */

$fullName = trim($input['full_name'] ?? '');
$email    = trim($input['email'] ?? '');
$mobile   = trim($input['mobile'] ?? '');
$password = $input['password'] ?? '';
$gender   = trim($input['gender'] ?? '');
$dob      = trim($input['dob'] ?? '');
$religion = trim($input['religion'] ?? '');
$location = trim($input['location'] ?? '');

if (
    !$fullName || !$email || !$mobile ||
    !$password || !$gender || !$dob ||
    !$religion || !$location
) {
    http_response_code(422);
    echo json_encode(['error' => 'All fields required']);
    exit;
}

$db = null;

try {

    $db = (new Database())->getConnection();

    // Check duplicate
    $stmt = $db->prepare("
        SELECT id FROM users
        WHERE email = :email OR mobile = :mobile
        LIMIT 1
    ");

    $stmt->execute([
        'email'  => $email,
        'mobile' => $mobile
    ]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email or mobile already registered']);
        exit;
    }

    // Generate OTP
    $otp = OTPService::generateOTP();

    // Store OTP
    OTPService::storeOTP($db, $email, 'email', $otp);

    // Send Email
    OTPService::sendEmailOTP($email, $otp);

    // Store temp registration
    OTPService::storeTempRegistration($db, $email, [
        'full_name'     => $fullName,
        'email'         => $email,
        'mobile'        => $mobile,
        'gender'        => $gender,
        'dob'           => $dob,
        'religion'      => $religion,
        'location'      => $location,
        'password_hash' => password_hash($password, PASSWORD_BCRYPT)
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'OTP sent successfully'
    ]);

} catch (Throwable $e) {

    http_response_code(500);
    echo json_encode([
        'error' => 'Registration failed',
        'debug' => $e->getMessage()
    ]);
}
