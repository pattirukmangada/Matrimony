<?php
/**
 * POST /api/auth/register.php
 * 
 * Register new user + send OTP.
 * Profile is visible only after admin approval.
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/mail.php';
require_once __DIR__ . '/../../services/OTPService.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// ---------------- INPUT FIELDS ----------------

$fullName = trim($input['full_name'] ?? '');
$email    = trim($input['email'] ?? '');
$mobile   = trim($input['mobile'] ?? '');
$password = $input['password'] ?? '';

$gender   = trim($input['gender'] ?? '');
$dob      = trim($input['dob'] ?? '');
$religion = trim($input['religion'] ?? '');
$location = trim($input['location'] ?? '');

// ---------------- VALIDATION ----------------

$errors = [];

if (empty($fullName) || strlen($fullName) > 100)
    $errors[] = 'Full name is required (max 100 chars)';

if (!filter_var($email, FILTER_VALIDATE_EMAIL))
    $errors[] = 'Valid email is required';

if (!preg_match('/^[6-9]\d{9}$/', $mobile))
    $errors[] = 'Valid 10-digit Indian mobile number required';

if (strlen($password) < 8)
    $errors[] = 'Password must be at least 8 characters';

if (empty($gender))
    $errors[] = 'Gender is required';

if (empty($dob))
    $errors[] = 'Date of birth is required';

if (empty($religion))
    $errors[] = 'Religion is required';

if (empty($location))
    $errors[] = 'Location is required';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['errors' => $errors]);
    exit;
}

// ---------------- DATABASE ----------------

$db = (new Database())->getConnection();

// Check duplicate
$stmt = $db->prepare("SELECT id FROM users WHERE email = :email OR mobile = :mobile LIMIT 1");
$stmt->execute(['email' => $email, 'mobile' => $mobile]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email or mobile number already registered']);
    exit;
}

// Hash password
$passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

try {
    $db->beginTransaction();

    // Insert user
    $stmt = $db->prepare("
        INSERT INTO users 
        (full_name, email, mobile, gender, dob, religion, location, password_hash, status)
        VALUES 
        (:full_name, :email, :mobile, :gender, :dob, :religion, :location, :password_hash, 'pending')
    ");

    $stmt->execute([
        'full_name'     => htmlspecialchars($fullName, ENT_QUOTES, 'UTF-8'),
        'email'         => $email,
        'mobile'        => $mobile,
        'gender'        => $gender,
        'dob'           => $dob,
        'religion'      => $religion,
        'location'      => $location,
        'password_hash' => $passwordHash,
    ]);

    $userId = (int)$db->lastInsertId();

    // Privacy settings
    $stmt = $db->prepare("INSERT INTO privacy_settings (user_id) VALUES (:user_id)");
    $stmt->execute(['user_id' => $userId]);

    // Verification record
    $stmt = $db->prepare("INSERT INTO profile_verifications (user_id) VALUES (:user_id)");
    $stmt->execute(['user_id' => $userId]);

    // ---------------- OTP ----------------

    $emailOtp  = OTPService::generateOTP();
    $mobileOtp = OTPService::generateOTP();

    OTPService::storeOTP($db, $email, 'email', $emailOtp);
    OTPService::storeOTP($db, $mobile, 'sms', $mobileOtp);

    OTPService::sendEmailOTP($email, $emailOtp);
    OTPService::sendSMSOTP($mobile, $mobileOtp);

    // ---------------- ADMIN NOTIFICATION ----------------

    $stmt = $db->prepare("
        INSERT INTO admin_notifications (type, reference_id, user_id, message)
        VALUES ('registration', :ref_id, :user_id, :message)
    ");

    $stmt->execute([
        'ref_id'  => $userId,
        'user_id' => $userId,
        'message' => "New registration: {$fullName} ({$email}) — awaiting approval.",
    ]);

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Registration successful. OTP sent.',
        'user_id' => $userId,
    ]);

} catch (Exception $e) {

    $db->rollBack();

    http_response_code(500);
    echo json_encode([
        'error' => 'Registration failed. Please try again.'
    ]);
}
