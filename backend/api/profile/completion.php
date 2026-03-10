<?php
/**
 * GET /api/profile/completion.php
 * Returns profile completion percentage
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

header("Content-Type: application/json");

/* Authenticate user */
$auth = JWTHandler::requireAuth();
$userId = $auth->user_id;

$db = (new Database())->getConnection();

/* Get profile */
$stmt = $db->prepare("SELECT * FROM profiles WHERE user_id = :user_id");
$stmt->execute(['user_id' => $userId]);

$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profile) {
    echo json_encode([
        "completion" => 0
    ]);
    exit;
}

/* Fields to check */
$fields = [
    "gender",
    "date_of_birth",
    "height_cm",
    "religion",
    "caste",
    "mother_tongue",
    "marital_status",
    "city",
    "state",
    "education",
    "profession",
    "company",
    "annual_income",
    "about_me",
    "profile_image"
];

$total = count($fields);
$filled = 0;

foreach ($fields as $field) {
    if (!empty($profile[$field])) {
        $filled++;
    }
}

/* Calculate percentage */
$percentage = round(($filled / $total) * 100);

echo json_encode([
    "completion" => $percentage,
    "filled_fields" => $filled,
    "total_fields" => $total
]);