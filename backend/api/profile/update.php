<?php

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

/* Get JSON input */
$input = json_decode(file_get_contents("php://input"), true) ?? [];

/* Sanitize helper */
function clean($value, $max = 100){
    if(!$value) return null;
    return htmlspecialchars(substr(trim($value),0,$max),ENT_QUOTES,'UTF-8');
}

/* Collect all profile fields */

$fields = [

'gender'         => in_array($input['gender'] ?? '', ['male','female']) ? $input['gender'] : null,
'date_of_birth'  => $input['date_of_birth'] ?? null,
'height_cm'      => filter_var($input['height_cm'] ?? null, FILTER_VALIDATE_INT) ?: null,

'religion'       => clean($input['religion'] ?? '',50),
'caste'          => clean($input['caste'] ?? '',100),
'mother_tongue'  => clean($input['mother_tongue'] ?? '',50),

'marital_status' => in_array($input['marital_status'] ?? '', ['never_married','divorced','widowed','separated'])
                    ? $input['marital_status'] : 'never_married',

'city'           => clean($input['city'] ?? '',100),
'state'          => clean($input['state'] ?? '',100),
'country'        => clean($input['country'] ?? '',100),

'education'      => clean($input['education'] ?? '',100),
'profession'     => clean($input['profession'] ?? '',100),
'company'        => clean($input['company'] ?? '',100),
'annual_income'  => clean($input['annual_income'] ?? '',50),

'about_me'       => clean($input['about_me'] ?? '',1000),

'profile_image'  => clean($input['profile_image'] ?? '',255),

'nakshatra'      => clean($input['nakshatra'] ?? '',50),
'rasi'           => clean($input['rasi'] ?? '',50),
'gotra'          => clean($input['gotra'] ?? '',50),

'father_name'    => clean($input['father_name'] ?? '',100),
'mother_name'    => clean($input['mother_name'] ?? '',100),
'siblings'       => clean($input['siblings'] ?? '',50),
'family_type'    => clean($input['family_type'] ?? '',50)

];

/* Required fields */

if(!$fields['gender'] || !$fields['date_of_birth']){
    http_response_code(422);
    echo json_encode([
        'error'=>'Gender and date_of_birth required'
    ]);
    exit;
}

$db = (new Database())->getConnection();

/* Check profile exists */

$stmt = $db->prepare("SELECT id FROM profiles WHERE user_id=:uid");
$stmt->execute(['uid'=>$userId]);

$exists = $stmt->fetch(PDO::FETCH_ASSOC);

if($exists){

    $set = [];
    $params = ['uid'=>$userId];

    foreach($fields as $k=>$v){
        $set[]="$k=:$k";
        $params[$k]=$v;
    }

    $sql = "UPDATE profiles SET ".implode(",",$set)." WHERE user_id=:uid";

    $stmt=$db->prepare($sql);
    $stmt->execute($params);

}else{

    $fields['user_id']=$userId;

    $cols = implode(",",array_keys($fields));
    $vals = ":".implode(",:",array_keys($fields));

    $sql="INSERT INTO profiles ($cols) VALUES ($vals)";

    $stmt=$db->prepare($sql);
    $stmt->execute($fields);
}

echo json_encode([
    "success"=>true,
    "message"=>"Profile saved successfully"
]);