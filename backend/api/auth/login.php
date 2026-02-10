<?php
/**
 * POST /api/auth/login.php
 * 
 * Login with email + password. Returns JWT token.
 * 
 * Body: { email, password }
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(422);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

$db = (new Database())->getConnection();

$stmt = $db->prepare("
    SELECT id, full_name, email, password_hash, is_active, admin_approved, status
    FROM users WHERE email = :email LIMIT 1
");
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

if (!$user['is_active']) {
    http_response_code(403);
    echo json_encode(['error' => 'Account not activated. Please verify your email and mobile OTP.']);
    exit;
}

if ($user['status'] === 'suspended' || $user['status'] === 'banned') {
    http_response_code(403);
    echo json_encode(['error' => 'Your account has been ' . $user['status'] . '. Contact support.']);
    exit;
}

$token = JWTHandler::generateToken($user['id'], 'user');

echo json_encode([
    'success' => true,
    'token'   => $token,
    'user'    => [
        'id'             => $user['id'],
        'full_name'      => $user['full_name'],
        'email'          => $user['email'],
        'admin_approved' => (bool)$user['admin_approved'],
    ],
]);
