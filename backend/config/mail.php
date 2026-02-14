<?php
/**
 * VivahBandhan - Mail Configuration (Hostinger Production Safe)
 */

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function getMailer(): PHPMailer
{
    $mail = new PHPMailer(true);

    // SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;

    // 🔴 CHANGE THIS PASSWORD IN HOSTINGER FIRST
    $mail->Username   = 'rukmanwebsolutions@matrimony.rukmantech.com';
    $mail->Password   = 'Rukman@143';

    // ✅ USE TLS 587 (More stable on Hostinger)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 465;

    // Prevent long hanging
    $mail->Timeout    = 10;

    $mail->setFrom(
        'rukmanwebsolutions@matrimony.rukmantech.com',
        'Rukman Matrimony'
    );

    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';

    return $mail;
}
