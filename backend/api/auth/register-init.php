<?php
/**
 * POST /api/auth/register-init.php
 * Step 1: Validate user data
 * Step 2: Generate & send Email OTP
 * Step 3: Store temporary registration data
 */

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

/* ---------------- VALIDATION ---------------- */

$fullName = trim($input['full_name'] ?? '');
$email    = trim($input['email'] ?? '');
$mobile   = trim($input['mobile'] ?? '');
$password = $input['password'] ?? '';
$gender   = trim($input['gender'] ?? '');
$dob      = trim($input['dob'] ?? '');
$religion = trim($input['religion'] ?? '');
$location = trim($input['location'] ?? '');

if (
    empty($fullName) ||
    empty($email) ||
    empty($mobile) ||
    empty($password) ||
    empty($gender) ||
    empty($dob) ||
    empty($religion) ||
    empty($location)
) {
    http_response_code(422);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}

if (!preg_match('/^[6-9]\d{9}$/', $mobile)) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid mobile number']);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(422);
    echo json_encode(['error' => 'Password must be at least 8 characters']);
    exit;
}

/* ---------------- DATABASE ---------------- */

try {

    $db = (new Database())->getConnection();

    /* ---- Check duplicate user ---- */

    $stmt = $db->prepare("
        SELECT id 
        FROM users 
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

    /* ---- Generate OTP ---- */

    $emailOtp = OTPService::generateOTP();

    OTPService::storeOTP($db, $email, 'email', $emailOtp);

    if (!OTPService::sendEmailOTP($email, $emailOtp)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send OTP']);
        exit;
    }

    /* ---- Store temporary registration ---- */

    OTPService::storeTempRegistration($db, $email, [
        'full_name'     => $fullName,
        'email'         => $email,
        'mobile'        => $mobile,
        'password_hash' => password_hash($password, PASSWORD_BCRYPT),
        'gender'        => $gender,
        'dob'           => $dob,
        'religion'      => $religion,
        'location'      => $location,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'OTP sent to email'
    ]);

} catch (Throwable $e) {

    error_log("Register Init Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode(['error' => 'Registration failed']);
}
