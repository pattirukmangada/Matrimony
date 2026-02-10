<?php
/**
 * VivahBandhan - Email & SMS OTP Configuration
 * 
 * Email: Uses PHPMailer (composer require phpmailer/phpmailer)
 * SMS:   Uses MSG91 API (or any SMS gateway)
 */

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

class OTPService {
    private static $otpExpiry = 600; // 10 minutes

    /**
     * Generate a 6-digit OTP
     */
    public static function generateOTP(): string {
        return str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Send OTP via Email using PHPMailer
     */
    public static function sendEmailOTP(string $email, string $otp): bool {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = getenv('SMTP_USER') ?: '';
            $mail->Password   = getenv('SMTP_PASS') ?: '';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = getenv('SMTP_PORT') ?: 587;

            $mail->setFrom(getenv('SMTP_FROM') ?: 'noreply@vivahbandhan.com', 'VivahBandhan');
            $mail->addAddress($email);
            $mail->Subject = 'VivahBandhan - OTP Verification';
            $mail->isHTML(true);
            $mail->Body = "
                <div style='font-family:Arial,sans-serif;max-width:400px;margin:auto;padding:20px;'>
                    <h2 style='color:#DC143C;'>VivahBandhan</h2>
                    <p>Your OTP verification code is:</p>
                    <h1 style='letter-spacing:8px;color:#333;text-align:center;'>{$otp}</h1>
                    <p style='color:#888;font-size:12px;'>This code expires in 10 minutes. Do not share it with anyone.</p>
                </div>
            ";
            $mail->send();
            return true;
        } catch (\Exception $e) {
            error_log("Email OTP failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send OTP via SMS (MSG91 example - replace with your SMS provider)
     */
    public static function sendSMSOTP(string $mobile, string $otp): bool {
        $authKey = getenv('MSG91_AUTH_KEY') ?: '';
        $senderId = getenv('MSG91_SENDER_ID') ?: 'VIVAHB';
        $route = '4'; // Transactional route

        if (empty($authKey)) {
            error_log("SMS OTP: MSG91_AUTH_KEY not configured");
            return false;
        }

        $url = "https://api.msg91.com/api/v5/otp";
        $data = [
            'authkey'  => $authKey,
            'mobile'   => $mobile,
            'otp'      => $otp,
            'sender'   => $senderId,
            'message'  => "Your VivahBandhan OTP is {$otp}. Valid for 10 minutes.",
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'authkey: ' . $authKey,
            ],
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $httpCode >= 200 && $httpCode < 300;
    }

    /**
     * Store OTP in database with rate limiting
     */
    public static function storeOTP(PDO $db, string $identifier, string $type, string $otp): bool {
        // Rate limiting: max 5 OTPs per hour per identifier
        $stmt = $db->prepare("
            SELECT COUNT(*) as cnt FROM otp_logs
            WHERE identifier = :identifier AND type = :type
            AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ");
        $stmt->execute(['identifier' => $identifier, 'type' => $type]);
        $count = $stmt->fetch()['cnt'];

        if ($count >= 5) {
            http_response_code(429);
            echo json_encode(['error' => 'Too many OTP requests. Try again after 1 hour.']);
            exit;
        }

        // Invalidate previous OTPs
        $stmt = $db->prepare("
            UPDATE otp_logs SET is_used = 1
            WHERE identifier = :identifier AND type = :type AND is_used = 0
        ");
        $stmt->execute(['identifier' => $identifier, 'type' => $type]);

        // Insert new OTP
        $hashedOtp = password_hash($otp, PASSWORD_DEFAULT);
        $expiresAt = date('Y-m-d H:i:s', time() + self::$otpExpiry);
        $stmt = $db->prepare("
            INSERT INTO otp_logs (identifier, type, otp_hash, expires_at)
            VALUES (:identifier, :type, :otp_hash, :expires_at)
        ");
        return $stmt->execute([
            'identifier' => $identifier,
            'type'       => $type,
            'otp_hash'   => $hashedOtp,
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * Verify an OTP
     */
    public static function verifyOTP(PDO $db, string $identifier, string $type, string $otp): bool {
        $stmt = $db->prepare("
            SELECT id, otp_hash FROM otp_logs
            WHERE identifier = :identifier AND type = :type
            AND is_used = 0 AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute(['identifier' => $identifier, 'type' => $type]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($otp, $row['otp_hash'])) {
            return false;
        }

        // Mark as used
        $stmt = $db->prepare("UPDATE otp_logs SET is_used = 1 WHERE id = :id");
        $stmt->execute(['id' => $row['id']]);
        return true;
    }
}
