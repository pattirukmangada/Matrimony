<?php
/**
 * VivahBandhan - JWT Configuration
 * 
 * Uses firebase/php-jwt library.
 * Install: composer require firebase/php-jwt
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

class JWTHandler {
    private static $secret;
    private static $issuer = 'vivahbandhan.com';
    private static $expiry = 86400; // 24 hours

    public static function init(): void {
        self::$secret = getenv('JWT_SECRET') ?: 'CHANGE_THIS_TO_A_STRONG_RANDOM_STRING_64_CHARS';
    }

    /**
     * Generate a JWT token for a user
     */
    public static function generateToken(int $userId, string $role = 'user'): string {
        self::init();
        $payload = [
            'iss'     => self::$issuer,
            'iat'     => time(),
            'exp'     => time() + self::$expiry,
            'user_id' => $userId,
            'role'    => $role,
        ];
        return JWT::encode($payload, self::$secret, 'HS256');
    }

    /**
     * Validate and decode a JWT token
     * Returns decoded payload or null on failure
     */
    public static function validateToken(string $token): ?object {
        self::init();
        try {
            return JWT::decode($token, new Key(self::$secret, 'HS256'));
        } catch (ExpiredException $e) {
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Extract token from Authorization header
     */
    public static function getBearerToken(): ?string {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (preg_match('/Bearer\s(\S+)/', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Middleware: require authenticated user, returns decoded payload
     */
    public static function requireAuth(): object {
        $token = self::getBearerToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Authorization token required']);
            exit;
        }
        $decoded = self::validateToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit;
        }
        return $decoded;
    }

    /**
     * Middleware: require admin role
     */
    public static function requireAdmin(): object {
        $decoded = self::requireAuth();
        if ($decoded->role !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit;
        }
        return $decoded;
    }
}
