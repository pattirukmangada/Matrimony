<?php

class OTPService {

    public static function generateOTP() {
        return rand(100000, 999999);
    }

    public static function storeOTP($db, $identifier, $type, $otp) {
        $stmt = $db->prepare("
            INSERT INTO otp_logs (identifier, type, otp_code, expires_at)
            VALUES (:identifier, :type, :otp, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
        ");

        $stmt->execute([
            'identifier' => $identifier,
            'type' => $type,
            'otp' => $otp
        ]);
    }

    public static function sendEmailOTP($email, $otp) {
        // TEMP: disable real email
        error_log("Email OTP for $email: $otp");
        return true;
    }

    public static function sendSMSOTP($mobile, $otp) {
        // TEMP: disable real SMS
        error_log("SMS OTP for $mobile: $otp");
        return true;
    }
}
