<?php
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function getMailer(): PHPMailer
{
    $mail = new PHPMailer(true);

    // SMTP Configuration
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;

    $mail->Username   = 'rukmanwebsolutions@matrimony.rukmantech.com';
    $mail->Password   = 'Rukman@143';   // ⚠ move to ENV later

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->Timeout = 15;

    $mail->setFrom(
        'rukmanwebsolutions@matrimony.rukmantech.com',
        'VivahBandhan'
    );

    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';

    return $mail;
}
