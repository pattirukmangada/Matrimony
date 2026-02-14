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

try {

    $db = (new Database())->getConnection();

    $stmt = $db->prepare("
        SELECT id FROM users
        WHERE email = :email OR mobile = :mobile
        LIMIT 1
    ");

    $stmt->execute([
        'email'  => $input['email'],
        'mobile' => $input['mobile']
    ]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email or mobile already registered']);
        exit;
    }

    $otp = OTPService::generateOTP();

    OTPService::storeOTP($db, $input['email'], 'email', $otp);

    OTPService::sendEmailOTP($input['email'], $otp);

    OTPService::storeTempRegistration($db, $input['email'], [
        'full_name'     => $input['full_name'],
        'email'         => $input['email'],
        'mobile'        => $input['mobile'],
        'gender'        => $input['gender'],
        'dob'           => $input['dob'],
        'religion'      => $input['religion'],
        'location'      => $input['location'],
        'password_hash' => password_hash($input['password'], PASSWORD_BCRYPT)
    ]);

    echo json_encode(['success' => true]);

} catch (Throwable $e) {

    error_log("Register Init Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode(['error' => 'Registration failed']);
}
