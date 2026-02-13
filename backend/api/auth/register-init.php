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

// Validate same as before...

$fullName = trim($input['full_name'] ?? '');
$email    = trim($input['email'] ?? '');
$mobile   = trim($input['mobile'] ?? '');
$password = $input['password'] ?? '';
$gender   = trim($input['gender'] ?? '');
$dob      = trim($input['dob'] ?? '');
$religion = trim($input['religion'] ?? '');
$location = trim($input['location'] ?? '');

$db = (new Database())->getConnection();

// Check duplicate
$stmt = $db->prepare("SELECT id FROM users WHERE email = :email OR mobile = :mobile LIMIT 1");
$stmt->execute([
    'email' => $email,
    'mobile' => $mobile
]);

if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email or mobile already registered']);
    exit;
}

// Generate OTP
$emailOtp = OTPService::generateOTP();
OTPService::storeOTP($db, $email, 'email', $emailOtp);

if (!OTPService::sendEmailOTP($email, $emailOtp)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send OTP']);
    exit;
}

// 🔐 Store user data temporarily in OTP table (important)
OTPService::storeTempRegistration($db, $email, [
    'full_name' => $fullName,
    'email' => $email,
    'mobile' => $mobile,
    'password' => password_hash($password, PASSWORD_BCRYPT),
    'gender' => $gender,
    'dob' => $dob,
    'religion' => $religion,
    'location' => $location,
]);

echo json_encode([
    'success' => true,
    'message' => 'OTP sent to email'
]);
