-- SQL schema for Kelulusan Mode SNBP backend with detailed student fields

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nis VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    jurusan VARCHAR(255),
    birthday DATE,
    school VARCHAR(255),
    regency VARCHAR(255),
    province VARCHAR(255),
    status_kelulusan ENUM('LULUS', 'TIDAK LULUS', 'UNKNOWN') DEFAULT 'UNKNOWN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    open_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default announcement open time (example)
INSERT INTO announcement (open_time) VALUES ('2025-06-03 11:30:00');
