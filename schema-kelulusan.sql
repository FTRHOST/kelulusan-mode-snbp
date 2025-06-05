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
    status_kelulusan TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    open_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default announcement open time (example)
INSERT INTO announcement (waktu_pengumuman_resmi) VALUES ('2025-06-03 11:30:00');

-- Insert example student data with jurusan and numeric status_kelulusan
INSERT INTO students (nis, name, status_kelulusan, jurusan, birthday, school, regency, province) VALUES
('5987', 'Muhammad Fathir Al Faruq', 1, 'Matematika dan Ilmu Pengetahuan Alam (MIPA)', STR_TO_DATE('26/06/2007', '%d/%m/%Y'), 'MA NU 01 BANYUPUTIH', 'Kab. Batang', 'Prov. Jawa Tengah'),
('0076387755', 'Siti Aminah', 0, 'Ilmu Sosial dan Humaniora', STR_TO_DATE('15/08/2007', '%d/%m/%Y'), 'MA NU 01 BANYUPUTIH', 'Kab. Batang', 'Prov. Jawa Tengah'),
('0076387756', 'Tono Pramono', 1, 'Agama', STR_TO_DATE('21/04/2007', '%d/%m/%Y'), 'MA NU 01 BANYUPUTIH', 'Kab. Batang', 'Prov. Jawa Tengah'),
('5829', 'Abdullah Faqih Hun Syasya Khon', 1, 'Bahasa (BB)', STR_TO_DATE('28/04/2007', '%d/%m/%Y'), 'MA NU 01 BANYUPUTIH', 'Kab. Batang', 'Prov. Jawa Tengah'),
('5982', 'Muhamad Irzadul Ibad', 0, 'Keagamaan (Agm)', STR_TO_DATE('17/02/2008', '%d/%m/%Y'), 'MA NU 01 BANYUPUTIH', 'Kab. Batang', 'Prov. Jawa Tengah');
