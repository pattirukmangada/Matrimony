<?php
/**
 * POST /api/admin/verify-id.php
 * 
 * Admin approves or rejects ID verification.
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
    $stmt = $db->prepare("
        UPDATE profile_verifications SET id_verified = 1, verified_at = NOW()
        WHERE user_id = :user_id
    ");
    $stmt->execute(['user_id' => $userId]);
    echo json_encode(['success' => true, 'message' => 'ID verification approved']);
} else {
    $stmt = $db->prepare("
        UPDATE profile_verifications SET id_verified = 0, id_document_path = NULL
        WHERE user_id = :user_id
    ");
    $stmt->execute(['user_id' => $userId]);
    echo json_encode(['success' => true, 'message' => 'ID verification rejected']);
}
