<?php
/**
 * POST /api/admin/approve-user.php
 * 
 * Admin approves a user's profile to be visible in search.
 * 
 * Body: { user_id, action ('approve' or 'reject') }
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$admin = JWTHandler::requireAdmin();

$input = json_decode(file_get_contents('php://input'), true);
$userId = filter_var($input['user_id'] ?? 0, FILTER_VALIDATE_INT);
$action = $input['action'] ?? '';

if (!$userId || !in_array($action, ['approve', 'reject'])) {
    http_response_code(422);
    echo json_encode(['error' => 'user_id and action (approve/reject) required']);
    exit;
}

$db = (new Database())->getConnection();

if ($action === 'approve') {
    $stmt = $db->prepare("UPDATE users SET admin_approved = 1, status = 'active' WHERE id = :id");
    $stmt->execute(['id' => $userId]);
    $message = 'User profile approved and visible in search.';
} else {
    $stmt = $db->prepare("UPDATE users SET admin_approved = 0, status = 'pending' WHERE id = :id");
    $stmt->execute(['id' => $userId]);
    $message = 'User profile rejected.';
}

echo json_encode(['success' => true, 'message' => $message]);
