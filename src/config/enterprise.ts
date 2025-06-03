// config/enterprise.ts
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '62.72.7.236',
  user: process.env.DB_USER || 'db_coba',
  password: process.env.DB_PASSWORD || 'cobainaja',
  database: process.env.DB_DATABASE || 'db_coba',
  connectionLimit: 10, // Sesuaikan sesuai kebutuhan
};

const db = mysql.createPool(dbConfig);

export default db;