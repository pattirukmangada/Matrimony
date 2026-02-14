<?php

class OTPService
{
    private static int $otpExpiry = 600; // 10 minutes

    /* =========================================================
       OTP GENERATION
    ========================================================= */

    public static function generateOTP(): string
    {
        return (string) random_int(100000, 999999);
    }

    /* =========================================================
       STORE OTP (Rate Limited)
    ========================================================= */

    public static function storeOTP(PDO $db, string $identifier, string $type, string $otp): bool
    {
        try {

            // Rate limit: max 5 per hour
            $stmt = $db->prepare("
                SELECT COUNT(*) as cnt
                FROM otp_logs
                WHERE identifier = :identifier
                AND type = :type
                AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ");

            $stmt->execute([
                'identifier' => $identifier,
                'type'       => $type
            ]);

            $count = (int) ($stmt->fetch()['cnt'] ?? 0);

            if ($count >= 5) {
                throw new Exception("Too many OTP requests. Try again later.");
            }

            // Invalidate old unused OTPs
            $stmt = $db->prepare("
                UPDATE otp_logs
                SET is_used = 1
                WHERE identifier = :identifier
                AND type = :type
                AND is_used = 0
            ");

            $stmt->execute([
                'identifier' => $identifier,
                'type'       => $type
            ]);

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
                'expires_at' => $expiresAt
            ]);

        } catch (Throwable $e) {
            error_log("Store OTP Error: " . $e->getMessage());
            throw $e;
        }
    }

    /* =========================================================
       DELETE OTP
    ========================================================= */

    public static function deleteOTP(PDO $db, string $identifier, string $type): void
    {
        try {
            $stmt = $db->prepare("
                DELETE FROM otp_logs
                WHERE identifier = :identifier
                AND type = :type
            ");

            $stmt->execute([
                'identifier' => $identifier,
                'type'       => $type
            ]);
        } catch (Throwable $e) {
            error_log("Delete OTP Error: " . $e->getMessage());
        }
    }

    /* =========================================================
       SEND EMAIL OTP (Using PHP mail() - Hostinger Safe)
    ========================================================= */

    public static function sendEmailOTP(string $email, string $otp): bool
    {
        $subject = "VivahBandhan - OTP Verification";

        $message = "
            <html>
            <body style='font-family:Arial,sans-serif'>
                <h2 style='color:#DC143C;'>VivahBandhan</h2>
                <p>Your OTP verification code is:</p>
                <h1 style='letter-spacing:8px;text-align:center;'>{$otp}</h1>
                <p>This code expires in 10 minutes.</p>
            </body>
            </html>
        ";

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8\r\n";
        $headers .= "From: VivahBandhan <rukmanwebsolutions@matrimony.rukmantech.com>\r\n";

        return mail($email, $subject, $message, $headers);
    }

    /* =========================================================
       VERIFY OTP
    ========================================================= */

    public static function verifyOTP(PDO $db, string $identifier, string $type, string $otp): bool
    {
        try {

            $stmt = $db->prepare("
                SELECT id, otp_hash
                FROM otp_logs
                WHERE identifier = :identifier
                AND type = :type
                AND is_used = 0
                AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1
            ");

            $stmt->execute([
                'identifier' => $identifier,
                'type'       => $type
            ]);

            $row = $stmt->fetch();

            if (!$row || !password_verify($otp, $row['otp_hash'])) {
                return false;
            }

            // Mark OTP as used
            $stmt = $db->prepare("
                UPDATE otp_logs
                SET is_used = 1
                WHERE id = :id
            ");

            $stmt->execute(['id' => $row['id']]);

            return true;

        } catch (Throwable $e) {
            error_log("Verify OTP Error: " . $e->getMessage());
            return false;
        }
    }

    /* =========================================================
       TEMP REGISTRATION STORAGE
    ========================================================= */

    public static function storeTempRegistration(PDO $db, string $email, array $data): void
    {
        $stmt = $db->prepare("
            INSERT INTO temp_registrations (email, data)
            VALUES (:email, :data)
            ON DUPLICATE KEY UPDATE data = :data
        ");

        $stmt->execute([
            'email' => $email,
            'data'  => json_encode($data)
        ]);
    }

    public static function getTempRegistration(PDO $db, string $email): array|false
    {
        $stmt = $db->prepare("
            SELECT data
            FROM temp_registrations
            WHERE email = :email
            LIMIT 1
        ");

        $stmt->execute(['email' => $email]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        return json_decode($row['data'], true);
    }

    public static function deleteTempRegistration(PDO $db, string $email): void
    {
        $stmt = $db->prepare("
            DELETE FROM temp_registrations
            WHERE email = :email
        ");

        $stmt->execute(['email' => $email]);
    }
}
