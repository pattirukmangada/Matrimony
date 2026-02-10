<?php
/**
 * POST /api/profile/update.php
 * 
 * Create or update own profile.
 * 
 * Body: { gender, date_of_birth, height_cm, religion, caste, mother_tongue,
 *         marital_status, city, state, education, profession, company,
 *         annual_income, about_me }
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

// Sanitize all inputs
$fields = [
    'gender'         => in_array($input['gender'] ?? '', ['male','female']) ? $input['gender'] : null,
    'date_of_birth'  => $input['date_of_birth'] ?? null,
    'height_cm'      => filter_var($input['height_cm'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 100, 'max_range' => 250]]) ?: null,
    'religion'       => htmlspecialchars(substr(trim($input['religion'] ?? ''), 0, 50), ENT_QUOTES, 'UTF-8'),
    'caste'          => htmlspecialchars(substr(trim($input['caste'] ?? ''), 0, 100), ENT_QUOTES, 'UTF-8'),
    'mother_tongue'  => htmlspecialchars(substr(trim($input['mother_tongue'] ?? ''), 0, 50), ENT_QUOTES, 'UTF-8'),
    'marital_status' => in_array($input['marital_status'] ?? '', ['never_married','divorced','widowed','separated']) ? $input['marital_status'] : 'never_married',
    'city'           => htmlspecialchars(substr(trim($input['city'] ?? ''), 0, 100), ENT_QUOTES, 'UTF-8'),
    'state'          => htmlspecialchars(substr(trim($input['state'] ?? ''), 0, 100), ENT_QUOTES, 'UTF-8'),
    'education'      => htmlspecialchars(substr(trim($input['education'] ?? ''), 0, 100), ENT_QUOTES, 'UTF-8'),
    'profession'     => htmlspecialchars(substr(trim($input['profession'] ?? ''), 0, 100), ENT_QUOTES, 'UTF-8'),
    'company'        => htmlspecialchars(substr(trim($input['company'] ?? ''), 0, 100), ENT_QUOTES, 'UTF-8'),
    'annual_income'  => htmlspecialchars(substr(trim($input['annual_income'] ?? ''), 0, 50), ENT_QUOTES, 'UTF-8'),
    'about_me'       => htmlspecialchars(substr(trim($input['about_me'] ?? ''), 0, 1000), ENT_QUOTES, 'UTF-8'),
];

if (empty($fields['gender']) || empty($fields['date_of_birth'])) {
    http_response_code(422);
    echo json_encode(['error' => 'Gender and date of birth are required']);
    exit;
}

$db = (new Database())->getConnection();

// Check if profile exists
$stmt = $db->prepare("SELECT id FROM profiles WHERE user_id = :user_id");
$stmt->execute(['user_id' => $userId]);
$exists = $stmt->fetch();

if ($exists) {
    $setClauses = [];
    $params = ['user_id' => $userId];
    foreach ($fields as $key => $value) {
        $setClauses[] = "{$key} = :{$key}";
        $params[$key] = $value;
    }
    $sql = "UPDATE profiles SET " . implode(', ', $setClauses) . " WHERE user_id = :user_id";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
} else {
    $fields['user_id'] = $userId;
    $columns = implode(', ', array_keys($fields));
    $placeholders = ':' . implode(', :', array_keys($fields));
    $stmt = $db->prepare("INSERT INTO profiles ({$columns}) VALUES ({$placeholders})");
    $stmt->execute($fields);
}

echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
