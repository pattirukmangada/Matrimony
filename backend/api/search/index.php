<?php
/**
 * GET /api/search/index.php
 * 
 * Search profiles with filters. Only shows admin-approved profiles.
 * 
 * Query params: age_min, age_max, religion, caste, city, state,
 *               education, income, marital_status, page, limit
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

$db = (new Database())->getConnection();

// Parse filters
$filters = [];
$params  = [];

// Base: only admin-approved and active users
$where = "u.admin_approved = 1 AND u.is_active = 1 AND u.status = 'active'";

// Age range (calculated from date_of_birth)
$ageMin = filter_input(INPUT_GET, 'age_min', FILTER_VALIDATE_INT);
$ageMax = filter_input(INPUT_GET, 'age_max', FILTER_VALIDATE_INT);
if ($ageMin) {
    $where .= " AND p.date_of_birth <= DATE_SUB(CURDATE(), INTERVAL :age_min YEAR)";
    $params['age_min'] = $ageMin;
}
if ($ageMax) {
    $where .= " AND p.date_of_birth >= DATE_SUB(CURDATE(), INTERVAL :age_max YEAR)";
    $params['age_max'] = $ageMax;
}

// Religion
$religion = filter_input(INPUT_GET, 'religion', FILTER_SANITIZE_SPECIAL_CHARS);
if ($religion && $religion !== 'any') {
    $where .= " AND p.religion = :religion";
    $params['religion'] = $religion;
}

// Caste
$caste = filter_input(INPUT_GET, 'caste', FILTER_SANITIZE_SPECIAL_CHARS);
if ($caste) {
    $where .= " AND p.caste LIKE :caste";
    $params['caste'] = "%{$caste}%";
}

// Location
$city = filter_input(INPUT_GET, 'city', FILTER_SANITIZE_SPECIAL_CHARS);
if ($city) {
    $where .= " AND (p.city LIKE :city OR p.state LIKE :city_state)";
    $params['city'] = "%{$city}%";
    $params['city_state'] = "%{$city}%";
}

// Education
$education = filter_input(INPUT_GET, 'education', FILTER_SANITIZE_SPECIAL_CHARS);
if ($education && $education !== 'any') {
    $where .= " AND p.education = :education";
    $params['education'] = $education;
}

// Income
$income = filter_input(INPUT_GET, 'income', FILTER_SANITIZE_SPECIAL_CHARS);
if ($income && $income !== 'any') {
    $where .= " AND p.annual_income = :income";
    $params['income'] = $income;
}

// Marital status
$maritalStatus = filter_input(INPUT_GET, 'marital_status', FILTER_SANITIZE_SPECIAL_CHARS);
if ($maritalStatus && $maritalStatus !== 'any') {
    $where .= " AND p.marital_status = :marital_status";
    $params['marital_status'] = $maritalStatus;
}

// Pagination
$page  = max(1, filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT) ?: 1);
$limit = min(50, max(1, filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT) ?: 12));
$offset = ($page - 1) * $limit;

// Count total
$countSql = "
    SELECT COUNT(*) as total
    FROM users u
    INNER JOIN profiles p ON p.user_id = u.id
    WHERE {$where}
";
$stmt = $db->prepare($countSql);
$stmt->execute($params);
$total = $stmt->fetch()['total'];

// Fetch profiles (premium users first via subscription join)
$sql = "
    SELECT u.id, u.full_name, u.admin_approved,
           p.gender, p.date_of_birth, p.religion, p.caste, p.city, p.state,
           p.education, p.profession, p.annual_income, p.profile_image, p.marital_status,
           pv.mobile_verified, pv.email_verified, pv.id_verified, pv.premium_verified,
           CASE WHEN s.plan_name = 'platinum' THEN 1
                WHEN s.plan_name = 'gold' THEN 2
                ELSE 3 END as plan_priority
    FROM users u
    INNER JOIN profiles p ON p.user_id = u.id
    LEFT JOIN profile_verifications pv ON pv.user_id = u.id
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active' AND s.end_date >= CURDATE()
    WHERE {$where}
    ORDER BY plan_priority ASC, u.created_at DESC
    LIMIT :lim OFFSET :off
";
$stmt = $db->prepare($sql);
foreach ($params as $key => $val) {
    $stmt->bindValue($key, $val);
}
$stmt->bindValue('lim', $limit, PDO::PARAM_INT);
$stmt->bindValue('off', $offset, PDO::PARAM_INT);
$stmt->execute();
$profiles = $stmt->fetchAll();

// Calculate age for each profile
foreach ($profiles as &$p) {
    if ($p['date_of_birth']) {
        $dob = new DateTime($p['date_of_birth']);
        $p['age'] = $dob->diff(new DateTime())->y;
    }
    unset($p['date_of_birth']); // Don't expose raw DOB in search
}

echo json_encode([
    'profiles'     => $profiles,
    'total'        => (int)$total,
    'page'         => $page,
    'limit'        => $limit,
    'total_pages'  => ceil($total / $limit),
]);
