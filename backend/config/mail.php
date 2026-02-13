<?php
/**
 * VivahBandhan - Mail Configuration (Hostinger)
 * Requires: composer require phpmailer/phpmailer
 */

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function getMailer(): PHPMailer
{
    $mail = new PHPMailer(true);

    try {

        // SMTP settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.hostinger.com';
        $mail->SMTPAuth   = true;

        // 🔴 IMPORTANT: Use your real email credentials
        $mail->Username   = 'rukmanwebsolutions@matrimony.rukmantech.com';
        $mail->Password   = 'Rukman@143';

        // ✅ Correct for port 465
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        // Prevent long hanging (very important)
        $mail->Timeout    = 15;

        // Sender
        $mail->setFrom(
            'rukmanwebsolutions@matrimony.rukmantech.com',
            'Rukman Web Solutions'
        );

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';

        return $mail;

    } catch (Exception $e) {

        error_log("Mailer configuration error: " . $e->getMessage());
        throw $e;
    }
}
