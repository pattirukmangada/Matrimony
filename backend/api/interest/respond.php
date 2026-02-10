<?php
/**
 * POST /api/interest/respond.php
 * 
 * Accept or reject an interest request.
 * Only the receiver can respond. Interest must be admin-approved first.
 * 
 * Body: { interest_id, action ('accept' or 'reject') }
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$auth = JWTHandler::requireAuth();
$userId = $auth->user_id;

$input = json_decode(file_get_contents('php://input'), true);
$interestId = filter_var($input['interest_id'] ?? 0, FILTER_VALIDATE_INT);
$action = $input['action'] ?? '';

if (!$interestId || !in_array($action, ['accept', 'reject'])) {
    http_response_code(422);
    echo json_encode(['error' => 'Provide interest_id and action (accept/reject)']);
    exit;
}

$db = (new Database())->getConnection();

// Get interest — must be receiver, must be admin-approved, must be pending
$stmt = $db->prepare("
    SELECT * FROM interests
    WHERE id = :id AND receiver_id = :receiver_id AND admin_approved = 1 AND status = 'pending'
");
$stmt->execute(['id' => $interestId, 'receiver_id' => $userId]);
$interest = $stmt->fetch();

if (!$interest) {
    http_response_code(404);
    echo json_encode(['error' => 'Interest not found, not approved by admin, or already responded']);
    exit;
}

$newStatus = $action === 'accept' ? 'accepted' : 'rejected';
$stmt = $db->prepare("UPDATE interests SET status = :status WHERE id = :id");
$stmt->execute(['status' => $newStatus, 'id' => $interestId]);

echo json_encode([
    'success' => true,
    'message' => "Interest {$newStatus} successfully.",
    'can_message' => $newStatus === 'accepted',
]);
