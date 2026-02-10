<?php
/**
 * GET /api/messages/conversation.php?user_id=X&page=1
 * 
 * Get conversation with a specific user (polling-based).
 * Marks messages as read.
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

$otherUserId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
$page = max(1, filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT) ?: 1);
$limit = 50;
$offset = ($page - 1) * $limit;

if (!$otherUserId) {
    http_response_code(422);
    echo json_encode(['error' => 'user_id is required']);
    exit;
}

$db = (new Database())->getConnection();

// Mark unread messages as read
$stmt = $db->prepare("
    UPDATE messages SET is_read = 1
    WHERE sender_id = :other AND receiver_id = :me AND is_read = 0
");
$stmt->execute(['other' => $otherUserId, 'me' => $userId]);

// Get messages
$stmt = $db->prepare("
    SELECT id, sender_id, receiver_id, message, is_read, created_at
    FROM messages
    WHERE (sender_id = :me AND receiver_id = :other)
       OR (sender_id = :other2 AND receiver_id = :me2)
    ORDER BY created_at DESC
    LIMIT :lim OFFSET :off
");
$stmt->bindValue('me', $userId, PDO::PARAM_INT);
$stmt->bindValue('other', $otherUserId, PDO::PARAM_INT);
$stmt->bindValue('other2', $otherUserId, PDO::PARAM_INT);
$stmt->bindValue('me2', $userId, PDO::PARAM_INT);
$stmt->bindValue('lim', $limit, PDO::PARAM_INT);
$stmt->bindValue('off', $offset, PDO::PARAM_INT);
$stmt->execute();

echo json_encode([
    'messages' => array_reverse($stmt->fetchAll()),
    'page'     => $page,
]);
