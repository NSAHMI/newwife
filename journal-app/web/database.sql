CREATE DATABASE IF NOT EXISTS journal_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE journal_app;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(80) NOT NULL,
    body TEXT NOT NULL,
    mood ENUM('happy','calm','sad','angry','anxious','grateful') NOT NULL DEFAULT 'calm',
    image_url VARCHAR(500) DEFAULT NULL,
    tags JSON DEFAULT NULL,
    word_count INT DEFAULT 0,
    date_key DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at DESC),
    INDEX idx_user_datekey (user_id, date_key)
);
