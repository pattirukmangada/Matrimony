<?php
/**
 * GET /api/profile/get.php?user_id=X
 * 
 * Get user profile. Access rules:
 * - Own profile: full details always visible
 * - Admin: full details always visible
 * - Other user with accepted+admin-approved interest: full details visible
 * - Other user without approved interest: limited details only
 * - Unregistered: no access
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
$requesterId = $auth->user_id;
$requesterRole = $auth->role;

$targetUserId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
if (!$targetUserId) {
    $targetUserId = $requesterId; // Default to own profile
}

$db = (new Database())->getConnection();

// Check if target user exists and is approved
$stmt = $db->prepare("SELECT id, full_name, email, mobile, admin_approved, status FROM users WHERE id = :id");
$stmt->execute(['id' => $targetUserId]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

// Determine access level
$isOwn   = ($requesterId == $targetUserId);
$isAdmin = ($requesterRole === 'admin');

$hasApprovedInterest = false;
if (!$isOwn && !$isAdmin) {
    // Check for mutual accepted + admin-approved interest
    $stmt = $db->prepare("
        SELECT id FROM interests
        WHERE ((sender_id = :me AND receiver_id = :them) OR (sender_id = :them2 AND receiver_id = :me2))
        AND status = 'accepted' AND admin_approved = 1
        LIMIT 1
    ");
    $stmt->execute([
        'me' => $requesterId, 'them' => $targetUserId,
        'them2' => $targetUserId, 'me2' => $requesterId,
    ]);
    $hasApprovedInterest = (bool)$stmt->fetch();
}

// Get profile
$stmt = $db->prepare("SELECT * FROM profiles WHERE user_id = :user_id");
$stmt->execute(['user_id' => $targetUserId]);
$profile = $stmt->fetch();

// Get privacy settings
$stmt = $db->prepare("SELECT * FROM privacy_settings WHERE user_id = :user_id");
$stmt->execute(['user_id' => $targetUserId]);
$privacy = $stmt->fetch();

// Get verifications
$stmt = $db->prepare("SELECT * FROM profile_verifications WHERE user_id = :user_id");
$stmt->execute(['user_id' => $targetUserId]);
$verifications = $stmt->fetch();

// Get approved photos
$stmt = $db->prepare("SELECT id, file_path, is_primary FROM photos WHERE user_id = :user_id AND admin_approved = 1");
$stmt->execute(['user_id' => $targetUserId]);
$photos = $stmt->fetchAll();

// Get subscription
$stmt = $db->prepare("
    SELECT plan_name, status, end_date FROM subscriptions
    WHERE user_id = :user_id AND status = 'active' AND end_date >= CURDATE()
    ORDER BY end_date DESC LIMIT 1
");
$stmt->execute(['user_id' => $targetUserId]);
$subscription = $stmt->fetch();

// Build response based on access level
$canSeeFullDetails = $isOwn || $isAdmin || $hasApprovedInterest;

// Check phone visibility based on privacy settings
$showPhone = false;
if ($isOwn || $isAdmin) {
    $showPhone = true;
} elseif ($privacy) {
    switch ($privacy['show_phone']) {
        case 'everyone':
            $showPhone = true;
            break;
        case 'premium_only':
            // Check if requester has premium subscription
            $stmt = $db->prepare("
                SELECT id FROM subscriptions
                WHERE user_id = :user_id AND plan_name IN ('gold','platinum')
                AND status = 'active' AND end_date >= CURDATE() LIMIT 1
            ");
            $stmt->execute(['user_id' => $requesterId]);
            $showPhone = (bool)$stmt->fetch();
            break;
        case 'after_interest':
            $showPhone = $hasApprovedInterest;
            break;
        case 'nobody':
        default:
            $showPhone = false;
    }
}

$response = [
    'user' => [
        'id'        => $user['id'],
        'full_name' => $user['full_name'],
        'email'     => $canSeeFullDetails ? $user['email'] : null,
        'mobile'    => $showPhone ? $user['mobile'] : ($user['mobile'] ? substr($user['mobile'], 0, 2) . 'XXXXXX' . substr($user['mobile'], -2) : null),
        'phone_hidden' => !$showPhone,
        'admin_approved' => (bool)$user['admin_approved'],
    ],
    'profile'       => $profile ?: null,
    'verifications' => $verifications ? [
        'mobile_verified'  => (bool)$verifications['mobile_verified'],
        'email_verified'   => (bool)$verifications['email_verified'],
        'id_verified'      => (bool)$verifications['id_verified'],
        'premium_verified' => (bool)$verifications['premium_verified'],
    ] : null,
    'photos'       => $photos,
    'subscription' => $subscription,
    'access_level' => $canSeeFullDetails ? 'full' : 'limited',
];

// If limited access, hide sensitive profile fields
if (!$canSeeFullDetails && $profile) {
    unset($response['profile']['about_me']);
    $response['profile']['annual_income'] = 'Hidden';
    $response['profile']['company'] = 'Hidden';
}

echo json_encode($response);
