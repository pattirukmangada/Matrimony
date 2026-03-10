<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

header("Content-Type: application/json");

$auth = JWTHandler::requireAuth();
$userId = $auth->user_id;

$db = (new Database())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $stmt = $db->prepare("SELECT * FROM partner_preferences WHERE user_id = :uid");
    $stmt->execute(['uid'=>$userId]);

    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["preferences"=>$data ?: []]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $input = json_decode(file_get_contents("php://input"), true);

    $fields = [
        "preferred_age_min"=>$input["preferred_age_min"] ?? null,
        "preferred_age_max"=>$input["preferred_age_max"] ?? null,
        "preferred_religion"=>$input["preferred_religion"] ?? null,
        "preferred_caste"=>$input["preferred_caste"] ?? null,
        "preferred_education"=>$input["preferred_education"] ?? null,
        "preferred_location"=>$input["preferred_location"] ?? null
    ];

    $stmt = $db->prepare("SELECT id FROM partner_preferences WHERE user_id=:uid");
    $stmt->execute(["uid"=>$userId]);

    if ($stmt->fetch()) {

        $sql="UPDATE partner_preferences SET
        preferred_age_min=:preferred_age_min,
        preferred_age_max=:preferred_age_max,
        preferred_religion=:preferred_religion,
        preferred_caste=:preferred_caste,
        preferred_education=:preferred_education,
        preferred_location=:preferred_location
        WHERE user_id=:uid";

        $fields["uid"]=$userId;

        $stmt=$db->prepare($sql);
        $stmt->execute($fields);

    } else {

        $fields["user_id"]=$userId;

        $cols=implode(",",array_keys($fields));
        $vals=":".implode(",:",array_keys($fields));

        $stmt=$db->prepare("INSERT INTO partner_preferences ($cols) VALUES ($vals)");
        $stmt->execute($fields);
    }

    echo json_encode(["success"=>true]);
}