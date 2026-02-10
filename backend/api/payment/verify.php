<?php
/**
 * POST /api/payment/verify.php
 * 
 * Verify Razorpay payment and activate subscription.
 * 
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan }
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

$orderId   = $input['razorpay_order_id'] ?? '';
$paymentId = $input['razorpay_payment_id'] ?? '';
$signature = $input['razorpay_signature'] ?? '';
$plan      = $input['plan'] ?? '';

if (empty($orderId) || empty($paymentId) || empty($signature) || !in_array($plan, ['gold', 'platinum'])) {
    http_response_code(422);
    echo json_encode(['error' => 'Missing payment verification data']);
    exit;
}

$keySecret = getenv('RAZORPAY_KEY_SECRET') ?: '';

// Verify signature
$expectedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $keySecret);

if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(400);
    echo json_encode(['error' => 'Payment verification failed — invalid signature']);
    exit;
}

$plans = [
    'gold'     => ['price' => 999.00, 'months' => 3],
    'platinum' => ['price' => 1999.00, 'months' => 6],
];

$db = (new Database())->getConnection();

// Deactivate existing subscriptions
$stmt = $db->prepare("UPDATE subscriptions SET status = 'expired' WHERE user_id = :user_id AND status = 'active'");
$stmt->execute(['user_id' => $userId]);

// Create new subscription
$startDate = date('Y-m-d');
$endDate   = date('Y-m-d', strtotime("+{$plans[$plan]['months']} months"));

$stmt = $db->prepare("
    INSERT INTO subscriptions (user_id, plan_name, price, start_date, end_date, status, payment_id, order_id)
    VALUES (:user_id, :plan_name, :price, :start_date, :end_date, 'active', :payment_id, :order_id)
");
$stmt->execute([
    'user_id'    => $userId,
    'plan_name'  => $plan,
    'price'      => $plans[$plan]['price'],
    'start_date' => $startDate,
    'end_date'   => $endDate,
    'payment_id' => $paymentId,
    'order_id'   => $orderId,
]);

// If platinum, set premium_verified
if ($plan === 'platinum') {
    $stmt = $db->prepare("UPDATE profile_verifications SET premium_verified = 1 WHERE user_id = :user_id");
    $stmt->execute(['user_id' => $userId]);
}

echo json_encode([
    'success'    => true,
    'message'    => ucfirst($plan) . ' plan activated successfully!',
    'plan'       => $plan,
    'start_date' => $startDate,
    'end_date'   => $endDate,
]);
