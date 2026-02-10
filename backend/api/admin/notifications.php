<?php
/**
 * GET /api/admin/notifications.php?page=1
 * 
 * List admin notifications (registration approvals, interest approvals, etc.)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$admin = JWTHandler::requireAdmin();

$page  = max(1, filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT) ?: 1);
$limit = 20;
$offset = ($page - 1) * $limit;

$db = (new Database())->getConnection();

// Unread count
$stmt = $db->prepare("SELECT COUNT(*) as cnt FROM admin_notifications WHERE is_read = 0");
$stmt->execute();
$unread = $stmt->fetch()['cnt'];

// List notifications
$stmt = $db->prepare("
    SELECT an.*, u.full_name, u.email
    FROM admin_notifications an
    INNER JOIN users u ON u.id = an.user_id
    ORDER BY an.created_at DESC
    LIMIT :lim OFFSET :off
");
$stmt->bindValue('lim', $limit, PDO::PARAM_INT);
$stmt->bindValue('off', $offset, PDO::PARAM_INT);
$stmt->execute();

echo json_encode([
    'notifications' => $stmt->fetchAll(),
    'unread_count'  => (int)$unread,
    'page'          => $page,
]);
