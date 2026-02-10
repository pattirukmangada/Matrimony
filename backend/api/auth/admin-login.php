<?php
/**
 * POST /api/auth/admin-login.php
 * 
 * Separate admin login system.
 * 
 * Body: { username, password }
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

$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(422);
    echo json_encode(['error' => 'Username and password are required']);
    exit;
}

$db = (new Database())->getConnection();

$stmt = $db->prepare("
    SELECT id, username, email, password_hash, full_name, is_active
    FROM admins WHERE username = :username LIMIT 1
");
$stmt->execute(['username' => $username]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

if (!$admin['is_active']) {
    http_response_code(403);
    echo json_encode(['error' => 'Admin account is disabled']);
    exit;
}

$token = JWTHandler::generateToken($admin['id'], 'admin');

echo json_encode([
    'success' => true,
    'token'   => $token,
    'admin'   => [
        'id'        => $admin['id'],
        'username'  => $admin['username'],
        'full_name' => $admin['full_name'],
    ],
]);
