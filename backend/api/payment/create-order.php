<?php
/**
 * POST /api/payment/create-order.php
 * 
 * Create a Razorpay order for subscription purchase.
 * 
 * Body: { plan ('gold' or 'platinum') }
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
$plan = $input['plan'] ?? '';

$plans = [
    'gold'     => ['price' => 99900, 'display' => '₹999', 'duration_months' => 3],
    'platinum' => ['price' => 199900, 'display' => '₹1,999', 'duration_months' => 6],
];

if (!isset($plans[$plan])) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid plan. Choose gold or platinum.']);
    exit;
}

$keyId     = getenv('RAZORPAY_KEY_ID') ?: '';
$keySecret = getenv('RAZORPAY_KEY_SECRET') ?: '';

if (empty($keyId) || empty($keySecret)) {
    http_response_code(500);
    echo json_encode(['error' => 'Payment gateway not configured']);
    exit;
}

// Create Razorpay order via API
$orderData = [
    'amount'   => $plans[$plan]['price'], // in paise
    'currency' => 'INR',
    'receipt'  => 'VB_' . $userId . '_' . time(),
    'notes'    => [
        'user_id'   => $userId,
        'plan_name' => $plan,
    ],
];

$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt_array($ch, [
    CURLOPT_USERPWD        => "{$keyId}:{$keySecret}",
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($orderData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create payment order']);
    exit;
}

$order = json_decode($response, true);

echo json_encode([
    'success'  => true,
    'order_id' => $order['id'],
    'amount'   => $plans[$plan]['price'],
    'currency' => 'INR',
    'key_id'   => $keyId,
    'plan'     => $plan,
    'display_price' => $plans[$plan]['display'],
]);
