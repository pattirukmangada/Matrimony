<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

header("Content-Type: application/json");

/* Only POST allowed */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

/* Authenticate */
$auth = JWTHandler::requireAuth();
$userId = $auth->user_id;

$db = (new Database())->getConnection();

/* Sanitize helper */
function clean($value, $max = 100){
    if(!$value) return null;
    return htmlspecialchars(substr(trim($value),0,$max),ENT_QUOTES,'UTF-8');
}

/* Get form fields */

$fields = [

'gender'         => $_POST['gender'] ?? null,
'date_of_birth'  => $_POST['date_of_birth'] ?? null,
'height_cm'      => $_POST['height_cm'] ?? null,

'religion'       => clean($_POST['religion'] ?? '',50),
'caste'          => clean($_POST['caste'] ?? '',100),
'mother_tongue'  => clean($_POST['mother_tongue'] ?? '',50),

'marital_status' => $_POST['marital_status'] ?? 'never_married',

'city'           => clean($_POST['city'] ?? '',100),
'state'          => clean($_POST['state'] ?? '',100),
'country'        => clean($_POST['country'] ?? '',100),

'education'      => clean($_POST['education'] ?? '',100),
'profession'     => clean($_POST['profession'] ?? '',100),
'company'        => clean($_POST['company'] ?? '',100),
'annual_income'  => clean($_POST['annual_income'] ?? '',50),

'about_me'       => clean($_POST['about_me'] ?? '',1000),

'nakshatra'      => clean($_POST['nakshatra'] ?? '',50),
'rasi'           => clean($_POST['rasi'] ?? '',50),
'gotra'          => clean($_POST['gotra'] ?? '',50),

'father_name'    => clean($_POST['father_name'] ?? '',100),
'mother_name'    => clean($_POST['mother_name'] ?? '',100),
'siblings'       => clean($_POST['siblings'] ?? '',50),
'family_type'    => clean($_POST['family_type'] ?? '',50)

];

/* Validate required fields */

if(!$fields['gender'] || !$fields['date_of_birth']){
    http_response_code(422);
    echo json_encode([
        'error'=>'Gender and Date of Birth required'
    ]);
    exit;
}

/* Handle image upload */

if(isset($_FILES['profile_image']) && $_FILES['profile_image']['tmp_name']){

    $dir = __DIR__ . '/../../uploads/profile/';

    if(!file_exists($dir)){
        mkdir($dir,0777,true);
    }

    $fileName = time().'_'.basename($_FILES['profile_image']['name']);

    move_uploaded_file(
        $_FILES['profile_image']['tmp_name'],
        $dir.$fileName
    );

    $fields['profile_image'] = '/uploads/profile/'.$fileName;
}

/* Update user name if provided */

if(isset($_POST['full_name'])){

    $stmt = $db->prepare("
        UPDATE users 
        SET full_name = :name
        WHERE id = :uid
    ");

    $stmt->execute([
        'name'=>clean($_POST['full_name'],100),
        'uid'=>$userId
    ]);
}

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

    $stmt = $db->prepare($sql);
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
    "message"=>"Profile updated successfully"
]);