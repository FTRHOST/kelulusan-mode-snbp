const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = mysql.createPool({
  host: '62.72.7.236',
  user: 'db_lulus',
  password: '5WGdMfnn4caY5PmZ', // Update with your MySQL password
  database: 'db_lulus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute queries with promise
function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// Routes

// Get all students
app.get('/students', async (req, res) => {
  try {
    const rows = await query("SELECT * FROM students");
    res.json({
      message: "success",
      data: rows
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get student by NIS
app.get('/students/:nis', async (req, res) => {
  const nis = req.params.nis;
  try {
    const rows = await query("SELECT * FROM students WHERE nis = ?", [nis]);
    if (rows.length === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    res.json({
      message: "success",
      data: rows[0]
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add new student
app.post('/students', async (req, res) => {
  const { nis, name, status } = req.body;
  if (!nis || !name || !status) {
    res.status(400).json({ error: "Please provide nis, name, and status" });
    return;
  }
  try {
    const result = await query('INSERT INTO students (nis, name, status) VALUES (?, ?, ?)', [nis, name, status]);
    res.json({
      message: "Student added",
      data: { id: result.insertId, nis, name, status }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update student status
app.put('/students/:nis', async (req, res) => {
  const nis = req.params.nis;
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ error: "Please provide status" });
    return;
  }
  try {
    const result = await query('UPDATE students SET status = ? WHERE nis = ?', [status, nis]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    res.json({
      message: "Student updated",
      data: { nis, status }
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
