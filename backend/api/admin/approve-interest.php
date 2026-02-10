<?php
/**
 * POST /api/admin/approve-interest.php
 * 
 * Admin approves an interest request so the receiver can see full details.
 * 
 * Body: { interest_id, action ('approve' or 'reject') }
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
$interestId = filter_var($input['interest_id'] ?? 0, FILTER_VALIDATE_INT);
$action = $input['action'] ?? '';

if (!$interestId || !in_array($action, ['approve', 'reject'])) {
    http_response_code(422);
    echo json_encode(['error' => 'interest_id and action (approve/reject) required']);
    exit;
}

$db = (new Database())->getConnection();

if ($action === 'approve') {
    $stmt = $db->prepare("UPDATE interests SET admin_approved = 1 WHERE id = :id");
    $stmt->execute(['id' => $interestId]);
    $message = 'Interest approved. Receiver can now see sender details.';
} else {
    $stmt = $db->prepare("DELETE FROM interests WHERE id = :id AND status = 'pending'");
    $stmt->execute(['id' => $interestId]);
    $message = 'Interest rejected and removed.';
}

echo json_encode(['success' => true, 'message' => $message]);
