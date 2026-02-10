<?php
/**
 * POST /api/interest/send.php
 * 
 * Send interest to another user.
 * Creates admin notification for approval.
 * Free plan: max 5 interests per day.
 * 
 * Body: { receiver_id }
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
$senderId = $auth->user_id;

$input = json_decode(file_get_contents('php://input'), true);
$receiverId = filter_var($input['receiver_id'] ?? 0, FILTER_VALIDATE_INT);

if (!$receiverId || $receiverId == $senderId) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid receiver']);
    exit;
}

$db = (new Database())->getConnection();

// Check receiver exists and is approved
$stmt = $db->prepare("SELECT id, full_name, admin_approved FROM users WHERE id = :id AND admin_approved = 1");
$stmt->execute(['id' => $receiverId]);
$receiver = $stmt->fetch();

if (!$receiver) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

// Check if interest already sent
$stmt = $db->prepare("SELECT id FROM interests WHERE sender_id = :sender AND receiver_id = :receiver");
$stmt->execute(['sender' => $senderId, 'receiver' => $receiverId]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Interest already sent']);
    exit;
}

// Check daily limit for free users
$stmt = $db->prepare("
    SELECT plan_name FROM subscriptions
    WHERE user_id = :user_id AND status = 'active' AND end_date >= CURDATE()
    ORDER BY end_date DESC LIMIT 1
");
$stmt->execute(['user_id' => $senderId]);
$sub = $stmt->fetch();

if (!$sub || $sub['plan_name'] === 'free') {
    $stmt = $db->prepare("
        SELECT COUNT(*) as cnt FROM interests
        WHERE sender_id = :sender_id AND DATE(created_at) = CURDATE()
    ");
    $stmt->execute(['sender_id' => $senderId]);
    if ($stmt->fetch()['cnt'] >= 5) {
        http_response_code(429);
        echo json_encode(['error' => 'Daily interest limit reached (5/day). Upgrade to Gold or Platinum for unlimited.']);
        exit;
    }
}

// Create interest (admin_approved = 0 by default)
$stmt = $db->prepare("
    INSERT INTO interests (sender_id, receiver_id, status, admin_approved)
    VALUES (:sender_id, :receiver_id, 'pending', 0)
");
$stmt->execute(['sender_id' => $senderId, 'receiver_id' => $receiverId]);
$interestId = (int)$db->lastInsertId();

// Get sender name for notification
$stmt = $db->prepare("SELECT full_name FROM users WHERE id = :id");
$stmt->execute(['id' => $senderId]);
$sender = $stmt->fetch();

// Notify admin
$stmt = $db->prepare("
    INSERT INTO admin_notifications (type, reference_id, user_id, message)
    VALUES ('interest', :ref_id, :user_id, :message)
");
$stmt->execute([
    'ref_id'  => $interestId,
    'user_id' => $senderId,
    'message' => "{$sender['full_name']} sent interest to {$receiver['full_name']} — awaiting admin approval.",
]);

echo json_encode([
    'success' => true,
    'message' => 'Interest sent. It will be reviewed by admin before the receiver is notified.',
    'interest_id' => $interestId,
]);
