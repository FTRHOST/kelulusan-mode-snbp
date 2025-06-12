import mysql from 'mysql2/promise';

// Konfigurasi koneksi diambil dari environment variables
const dbConfig = {
    host: '62.72.7.236',
    user: 'db_lulus',
    password: '5WGdMfnn4caY5PmZ',
    database: 'db_lulus',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
};

// Buat pool koneksi. Pool lebih efisien daripada membuat koneksi baru setiap kali.
const pool = mysql.createPool(dbConfig);

export default pool;