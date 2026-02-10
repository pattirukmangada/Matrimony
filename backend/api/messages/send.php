<?php
/**
 * POST /api/messages/send.php
 * 
 * Send a message. Only allowed between mutually accepted interests.
 * Free plan users cannot message.
 * 
 * Body: { receiver_id, message }
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
$message = trim($input['message'] ?? '');

if (!$receiverId || empty($message)) {
    http_response_code(422);
    echo json_encode(['error' => 'receiver_id and message are required']);
    exit;
}

if (strlen($message) > 2000) {
    http_response_code(422);
    echo json_encode(['error' => 'Message too long (max 2000 characters)']);
    exit;
}

$db = (new Database())->getConnection();

// Check subscription — free users cannot message
$stmt = $db->prepare("
    SELECT plan_name FROM subscriptions
    WHERE user_id = :user_id AND status = 'active' AND end_date >= CURDATE()
    AND plan_name IN ('gold','platinum')
    ORDER BY end_date DESC LIMIT 1
");
$stmt->execute(['user_id' => $senderId]);
if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'Messaging requires Gold or Platinum plan. Upgrade to message.']);
    exit;
}

// Check mutual accepted interest
$stmt = $db->prepare("
    SELECT id FROM interests
    WHERE ((sender_id = :me AND receiver_id = :them) OR (sender_id = :them2 AND receiver_id = :me2))
    AND status = 'accepted' AND admin_approved = 1
    LIMIT 1
");
$stmt->execute([
    'me' => $senderId, 'them' => $receiverId,
    'them2' => $receiverId, 'me2' => $senderId,
]);
if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'Messaging is only allowed after mutual interest is accepted and admin-approved.']);
    exit;
}

// Sanitize and insert message
$safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
$stmt = $db->prepare("
    INSERT INTO messages (sender_id, receiver_id, message) VALUES (:sender_id, :receiver_id, :message)
");
$stmt->execute([
    'sender_id'   => $senderId,
    'receiver_id' => $receiverId,
    'message'     => $safeMessage,
]);

echo json_encode(['success' => true, 'message_id' => (int)$db->lastInsertId()]);
