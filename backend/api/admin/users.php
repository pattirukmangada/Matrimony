<?php
/**
 * GET  /api/admin/users.php?page=1&status=active
 * POST /api/admin/users.php  — Ban/suspend/activate user
 * 
 * Body for POST: { user_id, action ('ban'|'suspend'|'activate') }
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

$admin = JWTHandler::requireAdmin();
$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $page   = max(1, filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT) ?: 1);
    $status = filter_input(INPUT_GET, 'status', FILTER_SANITIZE_SPECIAL_CHARS);
    $limit  = 20;
    $offset = ($page - 1) * $limit;

    $where = "1=1";
    $params = [];
    if ($status && in_array($status, ['pending','active','suspended','banned'])) {
        $where .= " AND u.status = :status";
        $params['status'] = $status;
    }

    $countStmt = $db->prepare("SELECT COUNT(*) as cnt FROM users u WHERE {$where}");
    $countStmt->execute($params);
    $total = $countStmt->fetch()['cnt'];

    $sql = "
        SELECT u.id, u.full_name, u.email, u.mobile, u.status, u.admin_approved, u.created_at,
               s.plan_name, s.end_date as sub_end
        FROM users u
        LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active' AND s.end_date >= CURDATE()
        WHERE {$where}
        ORDER BY u.created_at DESC
        LIMIT :lim OFFSET :off
    ";
    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue('lim', $limit, PDO::PARAM_INT);
    $stmt->bindValue('off', $offset, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode([
        'users' => $stmt->fetchAll(),
        'total' => (int)$total,
        'page'  => $page,
        'total_pages' => ceil($total / $limit),
    ]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input  = json_decode(file_get_contents('php://input'), true);
    $userId = filter_var($input['user_id'] ?? 0, FILTER_VALIDATE_INT);
    $action = $input['action'] ?? '';

    if (!$userId || !in_array($action, ['ban','suspend','activate'])) {
        http_response_code(422);
        echo json_encode(['error' => 'user_id and action (ban/suspend/activate) required']);
        exit;
    }

    $statusMap = ['ban' => 'banned', 'suspend' => 'suspended', 'activate' => 'active'];
    $newStatus = $statusMap[$action];

    $stmt = $db->prepare("UPDATE users SET status = :status WHERE id = :id");
    $stmt->execute(['status' => $newStatus, 'id' => $userId]);

    echo json_encode(['success' => true, 'message' => "User {$action}d successfully"]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
