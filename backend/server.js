const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
let db;

async function initializeDbPool() {
  db = await mysql.createPool({
    host: '62.72.7.236',
    user: 'db_lulus',
    password: '5WGdMfnn4caY5PmZ',
    database: 'db_lulus',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

async function query(sql, params) {
  const [results] = await db.execute(sql, params);
  return results;
}

// Initialize database tables if not exist
async function initializeDatabase() {
  try {
    await query(`
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
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS announcement (
        id INT AUTO_INCREMENT PRIMARY KEY,
        open_time DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if announcement table has data, insert default if empty
    const rows = await query("SELECT COUNT(*) as count FROM announcement");
    if (rows[0].count === 0) {
      await query("INSERT INTO announcement (open_time) VALUES (?)", ['2025-06-03 11:30:00']);
    }

    console.log("Database initialized");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

// Get student by NIS with announcement time check
app.get('/students/:nis', async (req, res) => {
  const nis = req.params.nis;
  const currentTime = new Date();

  try {
    // Get announcement open time
    const announcementRows = await query("SELECT open_time FROM announcement ORDER BY id DESC LIMIT 1");
    if (announcementRows.length === 0) {
      return res.status(500).json({ error: "Announcement open time not set" });
    }
    const announcementTime = new Date(announcementRows[0].open_time);

    if (currentTime < announcementTime) {
      const diffSeconds = Math.round((announcementTime.getTime() - currentTime.getTime()) / 1000);
      let countdownMessage = `Pengumuman akan tersedia dalam ${diffSeconds} detik.`;
      return res.status(403).json({
        error: "Akses ditutup.",
        message: "Pengumuman belum dapat diakses. Silakan coba lagi nanti.",
        detail: countdownMessage,
        waktu_pengumuman_resmi: announcementRows[0].open_time,
        waktu_server_saat_ini: currentTime.toISOString()
      });
    }

    // Fetch student data
    const studentRows = await query(
      'SELECT nis, name, jurusan, birthday, school, regency, province, status_kelulusan FROM students WHERE nis = ?',
      [nis]
    );
    if (studentRows.length === 0) {
      return res.status(404).json({
        error: "Student not found",
        message: `Data untuk NIS ${nis} tidak ditemukan.`,
        waktu_akses: currentTime.toISOString(),
        waktu_pengumuman_resmi: announcementRows[0].open_time
      });
    }

    const student = studentRows[0];
    // Map status_kelulusan from string to 1/0
    const statusKelulusanMapped = student.status_kelulusan === 'LULUS' ? 1 : 0;

    return res.json({
      ...student,
      status_kelulusan: statusKelulusanMapped,
      waktu_akses: currentTime.toISOString(),
      waktu_pengumuman_resmi: announcementRows[0].open_time
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Add new student
app.post('/students', async (req, res) => {
  const { nis, name, jurusan, birthday, school, regency, province, status_kelulusan } = req.body;
  if (!nis || !name) {
    res.status(400).json({ error: "Please provide nis and name" });
    return;
  }
  try {
    await query('INSERT INTO students (nis, name, jurusan, birthday, school, regency, province, status_kelulusan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      nis,
      name,
      jurusan || null,
      birthday || null,
      school || null,
      regency || null,
      province || null,
      status_kelulusan !== undefined ? (status_kelulusan === 1 ? 'LULUS' : 'TIDAK LULUS') : null
    ]);
    res.json({
      message: "Student added",
      data: { nis, name, jurusan, birthday, school, regency, province, status_kelulusan }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update student
app.put('/students/:nis', async (req, res) => {
  const nis = req.params.nis;
  const { name, jurusan, birthday, school, regency, province, status_kelulusan } = req.body;
  if (!status_kelulusan) {
    res.status(400).json({ error: "Please provide status_kelulusan" });
    return;
  }
  try {
    const result = await query('UPDATE students SET name = ?, jurusan = ?, birthday = ?, school = ?, regency = ?, province = ?, status_kelulusan = ? WHERE nis = ?', [
      name,
      jurusan,
      birthday,
      school,
      regency,
      province,
      status_kelulusan === 1 ? 'LULUS' : 'TIDAK LULUS',
      nis
    ]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    res.json({
      message: "Student updated",
      data: { nis, name, jurusan, birthday, school, regency, province, status_kelulusan }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete student
app.delete('/students/:nis', async (req, res) => {
  const nis = req.params.nis;
  try {
    const result = await query('DELETE FROM students WHERE nis = ?', [nis]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get announcement open time
app.get('/announcement/open-time', async (req, res) => {
  try {
    const rows = await query("SELECT open_time FROM announcement ORDER BY id DESC LIMIT 1");
    if (rows.length === 0) {
      res.status(404).json({ message: "Announcement open time not set" });
      return;
    }
    res.json({
      message: "success",
      open_time: rows[0].open_time
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update announcement open time
app.put('/announcement/open-time', async (req, res) => {
  const { open_time } = req.body;
  if (!open_time) {
    res.status(400).json({ error: "Please provide open_time" });
    return;
  }
  try {
    await query("INSERT INTO announcement (open_time) VALUES (?)", [open_time]);
    res.json({
      message: "Announcement open time updated",
      open_time: open_time
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

(async () => {
  await initializeDbPool();
  await initializeDatabase();

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
