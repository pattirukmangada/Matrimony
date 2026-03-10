<?php
/**
 * POST /api/profile/update.php
 * Create or update own profile
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

/* Authenticate user */
$auth = JWTHandler::requireAuth();
$userId = $auth->user_id;

/* Get JSON input safely */
$input = json_decode(file_get_contents("php://input"), true) ?? [];

/* Helper function to sanitize text */
function clean($value, $max = 100) {
    if (!$value) return null;
    return htmlspecialchars(substr(trim($value), 0, $max), ENT_QUOTES, 'UTF-8');
}

/* Validate fields */
$fields = [
    'gender'         => in_array($input['gender'] ?? '', ['male','female']) ? $input['gender'] : null,
    'date_of_birth'  => $input['date_of_birth'] ?? null,
    'height_cm'      => filter_var($input['height_cm'] ?? null, FILTER_VALIDATE_INT, [
                            'options' => ['min_range' => 100, 'max_range' => 250]
                        ]) ?: null,
    'religion'       => clean($input['religion'] ?? '', 50),
    'caste'          => clean($input['caste'] ?? '', 100),
    'mother_tongue'  => clean($input['mother_tongue'] ?? '', 50),
    'marital_status' => in_array($input['marital_status'] ?? '', ['never_married','divorced','widowed','separated'])
                        ? $input['marital_status']
                        : 'never_married',
    'city'           => clean($input['city'] ?? '', 100),
    'state'          => clean($input['state'] ?? '', 100),
    'education'      => clean($input['education'] ?? '', 100),
    'profession'     => clean($input['profession'] ?? '', 100),
    'company'        => clean($input['company'] ?? '', 100),
    'annual_income'  => clean($input['annual_income'] ?? '', 50),
    'about_me'       => clean($input['about_me'] ?? '', 1000),
];

/* Required fields */
if (!$fields['gender'] || !$fields['date_of_birth']) {
    http_response_code(422);
    echo json_encode([
        'error' => 'Gender and date of birth are required'
    ]);
    exit;
}

$db = (new Database())->getConnection();

/* Check if profile already exists */
$stmt = $db->prepare("SELECT id FROM profiles WHERE user_id = :user_id");
$stmt->execute(['user_id' => $userId]);
$exists = $stmt->fetch(PDO::FETCH_ASSOC);

if ($exists) {

    /* UPDATE PROFILE */

    $setClauses = [];
    $params = ['user_id' => $userId];

    foreach ($fields as $key => $value) {
        $setClauses[] = "$key = :$key";
        $params[$key] = $value;
    }

    $sql = "UPDATE profiles SET " . implode(", ", $setClauses) . " WHERE user_id = :user_id";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

} else {

    /* INSERT PROFILE */

    $fields['user_id'] = $userId;

    $columns = implode(", ", array_keys($fields));
    $placeholders = ":" . implode(", :", array_keys($fields));

    $sql = "INSERT INTO profiles ($columns) VALUES ($placeholders)";

    $stmt = $db->prepare($sql);
    $stmt->execute($fields);
}

echo json_encode([
    'success' => true,
    'message' => 'Profile updated successfully'
]);