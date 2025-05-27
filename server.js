const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors()); 
app.use(express.json()); 

const uri = process.env.MONGODB_URI;
let client;
let db;
let studentsCollection;
let jobPreferencesCollection;


async function init() {
  client = new MongoClient(uri);
  await client.connect();
  console.log('✅ Connected to MongoDB Atlas!');

  db = client.db('minat_sorter'); 
  studentsCollection = db.collection('students');
  jobPreferencesCollection = db.collection('job_preferences');

  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}

app.post('/api/submit-student', async (req, res) => {
  const { studentInfo, jobPreferences, submittedAt } = req.body;
  const { name, gender, schoolName, customSchoolName } = studentInfo;

  try {
    const studentResult = await studentsCollection.insertOne({
      name,
      gender,
      schoolName,
      customSchoolName,
      submittedAt: new Date(submittedAt)
    });

    const studentId = studentResult.insertedId;

    const prefsToInsert = jobPreferences.map(pref => ({
      studentId,
      setId: pref.setId,
      rankedJobs: pref.rankedJobs
    }));

    await jobPreferencesCollection.insertMany(prefsToInsert);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:id/references', async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await studentsCollection.findOne({ _id: new ObjectId(studentId) });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    const preferencesCursor = jobPreferencesCollection.find({ studentId: student._id });
    const preferences = await preferencesCursor.toArray();

    const formattedPrefs = preferences.map(pref => ({
      setId: pref.setId,
      rankedJobs: pref.rankedJobs
    }));

    res.json({
      studentInfo: {
        name: student.name,
        gender: student.gender,
        schoolName: student.schoolName,
        customSchoolName: student.customSchoolName
      },
      jobPreferences: formattedPrefs,
      submittedAt: student.submittedAt,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await studentsCollection
      .find()
      .sort({ submittedAt: -1 })
      .project({ name: 1, gender: 1, schoolName: 1, customSchoolName: 1, submittedAt: 1 })
      .toArray();

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

init();