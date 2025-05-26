const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors()); 
app.use(express.json()); 

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'minat_sorter'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL!');

  db.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      gender VARCHAR(10),
      school_name VARCHAR(255),
      custom_school_name VARCHAR(255),
      submitted_at DATETIME
    )
  `, (err) => {
    if (err) throw err;
    console.log('✅ Table students ready.');
  });

  db.query(`
    CREATE TABLE IF NOT EXISTS job_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT,
      set_id VARCHAR(10),
      ranked_jobs JSON,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `, (err) => {
    if (err) throw err;
    console.log('✅ Table job_preferences ready.');
  });
});

app.post('/submit', (req, res) => {
    const { studentInfo, jobPreferences, submittedAt } = req.body;
  
    const { name, gender, schoolName, customSchoolName } = studentInfo;
  
    const sqlInsertStudent = `
      INSERT INTO students (name, gender, school_name, custom_school_name, submitted_at)
      VALUES (?, ?, ?, ?, ?)
    `;
  
    db.query(
      sqlInsertStudent,
      [name, gender, schoolName, customSchoolName, submittedAt],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
  
        const studentId = result.insertId;
  
        const sqlInsertPrefs = `
          INSERT INTO job_preferences (student_id, set_id, ranked_jobs)
          VALUES ?
        `;
  
        const values = jobPreferences.map(pref => [
          studentId,
          pref.setId,
          JSON.stringify(pref.rankedJobs)
        ]);
  
        db.query(sqlInsertPrefs, [values], (err2) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json({ success: true });
        });
      }
    );
});  

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));