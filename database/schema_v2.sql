CREATE DATABASE IF NOT EXISTS vetcare_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vetcare_v2;

CREATE TABLE IF NOT EXISTS user (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('owner', 'admin') NOT NULL DEFAULT 'owner',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pet (
    pet_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(60) NOT NULL,
    breed VARCHAR(100) NULL,
    birth_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_pets_owner (owner_id),
    CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id)
        REFERENCES user (user_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS service (
    service_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    veterinarian_name VARCHAR(120) NOT NULL,
    duration_minutes SMALLINT UNSIGNED NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_services_duration CHECK (duration_minutes > 0),
    CONSTRAINT chk_services_price CHECK (price >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointment (
    appointment_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pet_id INT UNSIGNED NOT NULL,
    service_id INT UNSIGNED NOT NULL,
    veterinarian_name VARCHAR(120) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    duration_minutes SMALLINT UNSIGNED NOT NULL,
    agreed_price DECIMAL(10,2) NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_appointments_pet_date (pet_id, scheduled_at),
    KEY idx_appointments_vet_date (veterinarian_name, scheduled_at),
    KEY idx_appointments_date_status (scheduled_at, status),
    CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id)
        REFERENCES pet (pet_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_appointments_service FOREIGN KEY (service_id)
        REFERENCES service (service_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_appointments_duration CHECK (duration_minutes > 0),
    CONSTRAINT chk_appointments_price CHECK (agreed_price >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS review (
    review_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT NULL,
    pet_comfort_level TINYINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tags JSON NULL,
    UNIQUE KEY uq_reviews_appointment (appointment_id),
    CONSTRAINT fk_reviews_appointment FOREIGN KEY (appointment_id)
        REFERENCES appointment (appointment_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_reviews_comfort CHECK (pet_comfort_level IS NULL OR pet_comfort_level BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medical_record (
    medical_record_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pet_id INT UNSIGNED NOT NULL,
    record_type ENUM('vaccination', 'treatment', 'laboratory_test') NOT NULL,
    veterinarian_name VARCHAR(120) NOT NULL,
    recorded_at DATETIME NOT NULL,
    notes TEXT NULL,
    details JSON NOT NULL,
    KEY idx_medical_records_pet_date (pet_id, recorded_at),
    CONSTRAINT fk_medical_records_pet FOREIGN KEY (pet_id)
        REFERENCES pet (pet_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;
