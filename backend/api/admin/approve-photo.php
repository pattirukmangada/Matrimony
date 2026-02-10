<?php
/**
 * POST /api/admin/approve-photo.php
 * 
 * Admin approves or rejects a user's photo.
 * 
 * Body: { photo_id, action ('approve' or 'reject') }
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
$photoId = filter_var($input['photo_id'] ?? 0, FILTER_VALIDATE_INT);
$action  = $input['action'] ?? '';

if (!$photoId || !in_array($action, ['approve', 'reject'])) {
    http_response_code(422);
    echo json_encode(['error' => 'photo_id and action (approve/reject) required']);
    exit;
}

$db = (new Database())->getConnection();

if ($action === 'approve') {
    $stmt = $db->prepare("UPDATE photos SET admin_approved = 1 WHERE id = :id");
    $stmt->execute(['id' => $photoId]);
    echo json_encode(['success' => true, 'message' => 'Photo approved']);
} else {
    // Delete the rejected photo
    $stmt = $db->prepare("SELECT file_path FROM photos WHERE id = :id");
    $stmt->execute(['id' => $photoId]);
    $photo = $stmt->fetch();
    if ($photo && file_exists(__DIR__ . '/../../uploads/' . $photo['file_path'])) {
        unlink(__DIR__ . '/../../uploads/' . $photo['file_path']);
    }
    $stmt = $db->prepare("DELETE FROM photos WHERE id = :id");
    $stmt->execute(['id' => $photoId]);
    echo json_encode(['success' => true, 'message' => 'Photo rejected and removed']);
}
