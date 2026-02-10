<?php
/**
 * GET /api/admin/dashboard.php
 * 
 * Admin analytics: total users, active, premium, daily registrations,
 * pending approvals, pending interests, pending photos.
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
$db = (new Database())->getConnection();

// Total users
$total = $db->query("SELECT COUNT(*) as cnt FROM users")->fetch()['cnt'];

// Active users
$active = $db->query("SELECT COUNT(*) as cnt FROM users WHERE is_active = 1 AND status = 'active'")->fetch()['cnt'];

// Premium users
$premium = $db->query("
    SELECT COUNT(DISTINCT user_id) as cnt FROM subscriptions
    WHERE plan_name IN ('gold','platinum') AND status = 'active' AND end_date >= CURDATE()
")->fetch()['cnt'];

// Today's registrations
$today = $db->query("SELECT COUNT(*) as cnt FROM users WHERE DATE(created_at) = CURDATE()")->fetch()['cnt'];

// Pending profile approvals
$pendingUsers = $db->query("SELECT COUNT(*) as cnt FROM users WHERE admin_approved = 0 AND is_active = 1")->fetch()['cnt'];

// Pending interests
$pendingInterests = $db->query("SELECT COUNT(*) as cnt FROM interests WHERE admin_approved = 0 AND status = 'pending'")->fetch()['cnt'];

// Pending photos
$pendingPhotos = $db->query("SELECT COUNT(*) as cnt FROM photos WHERE admin_approved = 0")->fetch()['cnt'];

// Pending ID verifications
$pendingIds = $db->query("
    SELECT COUNT(*) as cnt FROM profile_verifications
    WHERE id_document_path IS NOT NULL AND id_verified = 0
")->fetch()['cnt'];

// Pending users list (for approval)
$stmt = $db->prepare("
    SELECT u.id, u.full_name, u.email, u.mobile, u.created_at,
           p.gender, p.city, p.education
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.admin_approved = 0 AND u.is_active = 1
    ORDER BY u.created_at DESC LIMIT 20
");
$stmt->execute();
$pendingUsersList = $stmt->fetchAll();

// Pending interests list
$stmt = $db->prepare("
    SELECT i.id, i.created_at,
           s.full_name as sender_name, s.email as sender_email,
           r.full_name as receiver_name, r.email as receiver_email
    FROM interests i
    INNER JOIN users s ON s.id = i.sender_id
    INNER JOIN users r ON r.id = i.receiver_id
    WHERE i.admin_approved = 0 AND i.status = 'pending'
    ORDER BY i.created_at DESC LIMIT 20
");
$stmt->execute();
$pendingInterestsList = $stmt->fetchAll();

echo json_encode([
    'stats' => [
        'total_users'       => (int)$total,
        'active_users'      => (int)$active,
        'premium_users'     => (int)$premium,
        'today_registrations' => (int)$today,
    ],
    'pending' => [
        'users'     => (int)$pendingUsers,
        'interests' => (int)$pendingInterests,
        'photos'    => (int)$pendingPhotos,
        'id_verifications' => (int)$pendingIds,
    ],
    'pending_users_list'     => $pendingUsersList,
    'pending_interests_list' => $pendingInterestsList,
]);
