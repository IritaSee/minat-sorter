const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors()); 
app.use(express.json()); 

let db;

async function init() {
  db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'minat_sorter'
  });

  console.log('✅ Connected to MySQL!');

  await db.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      gender VARCHAR(10),
      school_name VARCHAR(255),
      custom_school_name VARCHAR(255),
      submitted_at DATETIME
    )
  `);
  console.log('✅ Table students ready.');

  await db.query(`
    CREATE TABLE IF NOT EXISTS job_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT,
      set_id VARCHAR(10),
      ranked_jobs JSON,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);
  console.log('✅ Table job_preferences ready.');

  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}

app.post('/api/submit-student', async (req, res) => {
  const { studentInfo, jobPreferences, submittedAt } = req.body;
  const { name, gender, schoolName, customSchoolName } = studentInfo;

  try {
    const [studentResult] = await db.query(
      `INSERT INTO students (name, gender, school_name, custom_school_name, submitted_at) VALUES (?, ?, ?, ?, ?)`,
      [name, gender, schoolName, customSchoolName, submittedAt]
    );

    const studentId = studentResult.insertId;

    const values = jobPreferences.map(pref => [
      studentId,
      pref.setId,
      JSON.stringify(pref.rankedJobs)
    ]);

    await db.query(
      `INSERT INTO job_preferences (student_id, set_id, ranked_jobs) VALUES ?`,
      [values]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:id/references', async (req, res) => {
  const studentId = req.params.id;

  try {
    const [studentRows] = await db.query(
      `SELECT name, gender, school_name, custom_school_name, submitted_at FROM students WHERE id = ?`,
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentRows[0];

    const [preferenceRows] = await db.query(
      `SELECT set_id, ranked_jobs FROM job_preferences WHERE student_id = ?`,
      [studentId]
    );

    const preferences = preferenceRows.map(pref => ({
      setId: pref.set_id,
      rankedJobs: JSON.parse(pref.ranked_jobs)
    }));

    res.json({
      studentInfo: {
        name: student.name,
        gender: student.gender,
        schoolName: student.school_name,
        customSchoolName: student.custom_school_name,
      },
      jobPreferences: preferences,
      submittedAt: student.submitted_at,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, gender, school_name AS schoolName, custom_school_name AS customSchoolName, submitted_at AS submittedAt
      FROM students
      ORDER BY submitted_at DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

init();