<?php
/**
 * VivahBandhan - Mail Configuration
 * 
 * Requires:
 * composer require phpmailer/phpmailer
 */

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

/**
 * Returns a configured PHPMailer instance
 *
 * @return PHPMailer
 * @throws Exception
 */
function getMailer(): PHPMailer
{
    $mail = new PHPMailer(true);

    // Enable SMTP
    $mail->isSMTP();

    // SMTP Configuration (from environment variables)
    $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = getenv('SMTP_USER') ?: '';
    $mail->Password   = getenv('SMTP_PASS') ?: '';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = getenv('SMTP_PORT') ?: 465;

    // Optional Debug (disable in production)
    if (getenv('SMTP_DEBUG') === 'true') {
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    }

    // Sender Info
    $mail->setFrom(
        getenv('SMTP_FROM') ?: 'rukmanwebsolutions@matrimony.rukmantech.com',
        getenv('SMTP_FROM_NAME') ?: 'Rukman Web Solutions'
    );

    // Email format
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';

    return $mail;
}
