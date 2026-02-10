<?php
/**
 * GET /api/interest/list.php?type=received|sent
 * 
 * List interests sent or received by the authenticated user.
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$auth = JWTHandler::requireAuth();
$userId = $auth->user_id;

$type = filter_input(INPUT_GET, 'type', FILTER_SANITIZE_SPECIAL_CHARS) ?: 'received';

$db = (new Database())->getConnection();

if ($type === 'sent') {
    $stmt = $db->prepare("
        SELECT i.*, u.full_name, p.profile_image, p.city, p.education
        FROM interests i
        INNER JOIN users u ON u.id = i.receiver_id
        LEFT JOIN profiles p ON p.user_id = i.receiver_id
        WHERE i.sender_id = :user_id
        ORDER BY i.created_at DESC
    ");
} else {
    // Only show admin-approved interests to receiver
    $stmt = $db->prepare("
        SELECT i.*, u.full_name, p.profile_image, p.city, p.education
        FROM interests i
        INNER JOIN users u ON u.id = i.sender_id
        LEFT JOIN profiles p ON p.user_id = i.sender_id
        WHERE i.receiver_id = :user_id AND i.admin_approved = 1
        ORDER BY i.created_at DESC
    ");
}
$stmt->execute(['user_id' => $userId]);
$interests = $stmt->fetchAll();

echo json_encode(['interests' => $interests, 'type' => $type]);
