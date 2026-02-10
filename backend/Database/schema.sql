-- ============================================================
-- VivahBandhan - Complete MySQL Database Schema
-- ============================================================
-- Run this file to set up the complete database:
--   mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS vivahbandhan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vivahbandhan;

-- ============================================================
-- 1. USERS TABLE (Authentication)
-- ============================================================
CREATE TABLE users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    mobile          VARCHAR(15)   NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    email_verified  TINYINT(1)    DEFAULT 0,
    mobile_verified TINYINT(1)    DEFAULT 0,
    is_active       TINYINT(1)    DEFAULT 0 COMMENT 'Activated after OTP verification',
    admin_approved  TINYINT(1)    DEFAULT 0 COMMENT 'Profile visible only after admin approval',
    status          ENUM('pending','active','suspended','banned') DEFAULT 'pending',
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_mobile (mobile),
    INDEX idx_status (status),
    INDEX idx_admin_approved (admin_approved)
) ENGINE=InnoDB;

-- ============================================================
-- 2. ADMINS TABLE (Separate admin login)
-- ============================================================
CREATE TABLE admins (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)   NOT NULL UNIQUE,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    full_name     VARCHAR(100)  NOT NULL,
    is_active     TINYINT(1)    DEFAULT 1,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Default admin (password: Admin@123 — CHANGE IN PRODUCTION!)
INSERT INTO admins (username, email, password_hash, full_name) VALUES
('admin', 'admin@vivahbandhan.com', '$2y$12$LJ3m4ys5yEz8xGqTqKvOBOQz3qRZ8kX1VdJ7J5Y5u1oGqHXE5Vz/K', 'Super Admin');

-- ============================================================
-- 3. PROFILES TABLE
-- ============================================================
CREATE TABLE profiles (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED  NOT NULL UNIQUE,
    gender        ENUM('male','female') NOT NULL,
    date_of_birth DATE          NOT NULL,
    height_cm     SMALLINT UNSIGNED,
    religion      VARCHAR(50),
    caste         VARCHAR(100),
    mother_tongue VARCHAR(50),
    marital_status ENUM('never_married','divorced','widowed','separated') DEFAULT 'never_married',
    city          VARCHAR(100),
    state         VARCHAR(100),
    country       VARCHAR(50)   DEFAULT 'India',
    education     VARCHAR(100),
    profession    VARCHAR(100),
    company       VARCHAR(100),
    annual_income VARCHAR(50),
    about_me      TEXT,
    profile_image VARCHAR(255)  COMMENT 'Primary photo URL',
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_religion (religion),
    INDEX idx_caste (caste),
    INDEX idx_city (city),
    INDEX idx_state (state),
    INDEX idx_education (education),
    INDEX idx_gender (gender),
    INDEX idx_marital_status (marital_status),
    INDEX idx_dob (date_of_birth)
) ENGINE=InnoDB;

-- ============================================================
-- 4. PARTNER PREFERENCES TABLE
-- ============================================================
CREATE TABLE partner_preferences (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          INT UNSIGNED NOT NULL UNIQUE,
    preferred_age_min TINYINT UNSIGNED DEFAULT 18,
    preferred_age_max TINYINT UNSIGNED DEFAULT 60,
    preferred_religion VARCHAR(50),
    preferred_caste   VARCHAR(100),
    preferred_education VARCHAR(100),
    preferred_location VARCHAR(200),
    preferred_income   VARCHAR(50),
    expectations       TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. PHOTOS TABLE
-- ============================================================
CREATE TABLE photos (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NOT NULL,
    file_path     VARCHAR(255) NOT NULL,
    is_primary    TINYINT(1)   DEFAULT 0,
    admin_approved TINYINT(1)  DEFAULT 0 COMMENT 'Photos require admin approval',
    uploaded_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_photos (user_id, admin_approved)
) ENGINE=InnoDB;

-- ============================================================
-- 6. PROFILE VERIFICATIONS TABLE
-- ============================================================
CREATE TABLE profile_verifications (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id           INT UNSIGNED NOT NULL,
    mobile_verified   TINYINT(1) DEFAULT 0,
    email_verified    TINYINT(1) DEFAULT 0,
    id_verified       TINYINT(1) DEFAULT 0 COMMENT 'Admin approval required',
    id_document_path  VARCHAR(255),
    premium_verified  TINYINT(1) DEFAULT 0,
    verified_at       TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_verification (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- 7. INTERESTS TABLE (Send / Accept / Reject)
-- ============================================================
CREATE TABLE interests (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sender_id   INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    status      ENUM('pending','accepted','rejected') DEFAULT 'pending',
    admin_approved TINYINT(1) DEFAULT 0 COMMENT 'Admin must approve before receiver sees full details',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_interest (sender_id, receiver_id),
    INDEX idx_receiver_status (receiver_id, status),
    INDEX idx_admin_approved (admin_approved)
) ENGINE=InnoDB;

-- ============================================================
-- 8. MESSAGES TABLE (Polling-based chat)
-- ============================================================
CREATE TABLE messages (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sender_id   INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    message     TEXT NOT NULL,
    is_read     TINYINT(1) DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (sender_id, receiver_id, created_at),
    INDEX idx_unread (receiver_id, is_read)
) ENGINE=InnoDB;

-- ============================================================
-- 9. SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE subscriptions (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    plan_name   ENUM('free','gold','platinum') DEFAULT 'free',
    price       DECIMAL(10,2) DEFAULT 0.00,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    status      ENUM('active','expired','cancelled') DEFAULT 'active',
    payment_id  VARCHAR(100) COMMENT 'Razorpay payment ID',
    order_id    VARCHAR(100) COMMENT 'Razorpay order ID',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_plan (user_id, status),
    INDEX idx_expiry (end_date, status)
) ENGINE=InnoDB;

-- ============================================================
-- 10. PRIVACY SETTINGS TABLE
-- ============================================================
CREATE TABLE privacy_settings (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL UNIQUE,
    show_phone  ENUM('nobody','premium_only','after_interest','everyone') DEFAULT 'after_interest',
    show_photos ENUM('public','premium','after_interest') DEFAULT 'public',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 11. OTP LOGS TABLE (Rate limiting + verification)
-- ============================================================
CREATE TABLE otp_logs (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    identifier  VARCHAR(255) NOT NULL COMMENT 'Email or mobile number',
    type        ENUM('email','sms') NOT NULL,
    otp_hash    VARCHAR(255) NOT NULL,
    is_used     TINYINT(1) DEFAULT 0,
    expires_at  DATETIME NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier_type (identifier, type, is_used),
    INDEX idx_rate_limit (identifier, type, created_at)
) ENGINE=InnoDB;

-- ============================================================
-- 12. ADMIN NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE admin_notifications (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type        ENUM('registration','interest','photo','id_verification') NOT NULL,
    reference_id INT UNSIGNED NOT NULL COMMENT 'ID from related table',
    user_id     INT UNSIGNED NOT NULL,
    message     VARCHAR(500) NOT NULL,
    is_read     TINYINT(1) DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_unread (is_read, created_at)
) ENGINE=InnoDB;
