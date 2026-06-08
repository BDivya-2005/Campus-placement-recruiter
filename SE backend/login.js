// ------------------ Imports ------------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());

// ------------------ MongoDB Connection ------------------
mongoose.connect('mongodb://127.0.0.1:27017/placementDB')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ------------------ Schemas ------------------

// Company Schema
const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'company' }
});
const Company = mongoose.model('Company', companySchema);

// User Schema (student/admin)
const userSchema = new mongoose.Schema({
  username: { type: String }, // for students
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  branch: { type: String }, // for students
  year: { type: String },   // for students
  role: { type: String, required: true } // 'student' or 'admin'
});
const User = mongoose.model('User', userSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  createdAt: { type: Date, default: Date.now }
});
const Job = mongoose.model('Job', jobSchema);

// Company Activity Schema
const companyActivitySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const CompanyActivity = mongoose.model('CompanyActivity', companyActivitySchema);

// Student Activity Schema
const studentActivitySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const StudentActivity = mongoose.model('StudentActivity', studentActivitySchema);

// Question Schema
const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  createdAt: { type: Date, default: Date.now }
});
const Question = mongoose.model('Question', questionSchema);

// ------------------ Registration ------------------
app.post('/register', async (req, res) => {
  try {
    const { role, email, password, username, branch, year, companyName } = req.body;

    if (!role || !email || !password) return res.status(400).json({ message: 'Role, email, and password are required!' });

    if (role === 'company') {
      if (!companyName) return res.status(400).json({ message: 'Company name is required!' });
      const existingCompany = await Company.findOne({ email: email.toLowerCase().trim() });
      if (existingCompany) return res.status(400).json({ message: 'Company email already exists!' });

      const hashed = await bcrypt.hash(password, 10);
      const newCompany = new Company({ email: email.toLowerCase().trim(), password: hashed, companyName: companyName.trim() });
      await newCompany.save();
      return res.json({ message: 'Company registered successfully!', companyId: newCompany._id });
    } else {
      // student or admin
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) return res.status(400).json({ message: `${role} email already exists!` });

      const hashed = await bcrypt.hash(password, 10);
      const newUser = new User({
        email: email.toLowerCase().trim(),
        password: hashed,
        role,
        username: role === 'student' ? username : undefined,
        branch: role === 'student' ? branch : undefined,
        year: role === 'student' ? year : undefined
      });
      await newUser.save();
      return res.json({ message: `${role} registered successfully!`, userId: newUser._id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ------------------ Login ------------------
app.post('/login', async (req, res) => {
  try {
    const { role, email, password } = req.body;
    let user;

    if (role === 'company') {
      user = await Company.findOne({ email: email.toLowerCase().trim() });
      if (!user) return res.status(400).json({ message: 'Company not found!' });
    } else {
      user = await User.findOne({ email: email.toLowerCase().trim(), role });
      if (!user) return res.status(400).json({ message: `${role} not found!` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password!' });

    res.json({
      message: 'Login successful!',
      role,
      id: user._id,
      name: user.companyName || user.username || user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ------------------ Jobs ------------------

// Add Job
app.post('/jobs/add', async (req, res) => {
  try {
    const { title, location, companyId } = req.body;
    if (!title || !location || !companyId) return res.status(400).json({ message: 'All fields required' });

    const newJob = await Job.create({ title, location, companyId });
    await CompanyActivity.create({ companyId, description: `Posted a new job: "${title}"` });

    res.json({ message: 'Job added successfully', job: newJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding job' });
  }
});

// Update Job
app.put('/jobs/update/:jobId', async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.jobId, { title: req.body.title, location: req.body.location }, { new: true });
    if (!updatedJob) return res.status(404).json({ message: 'Job not found!' });

    await CompanyActivity.create({ companyId: updatedJob.companyId, description: `Updated job: "${updatedJob.title}"` });
    res.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating job' });
  }
});

// Delete Job
app.delete('/jobs/delete/:jobId', async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.jobId);
    if (!deletedJob) return res.status(404).json({ message: 'Job not found!' });

    await CompanyActivity.create({ companyId: deletedJob.companyId, description: `Deleted job: "${deletedJob.title}"` });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting job' });
  }
});

// Get all Jobs
app.get('/jobs/all', async (req, res) => {
  try {
    const jobs = await Job.find().populate('companyId', 'companyName');
    const formattedJobs = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      location: job.location,
      companyName: job.companyId.companyName
    }));
    res.json(formattedJobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get Jobs by Company
app.get('/jobs/company/:companyId', async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.params.companyId });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// ------------------ Company Activities ------------------
app.get('/activities/:companyId', async (req, res) => {
  try {
    const activities = await CompanyActivity.find({ companyId: req.params.companyId }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// ------------------ Student Activities ------------------

// Add student activity
app.post('/student/activity', async (req, res) => {
  try {
    const { studentId, description } = req.body;
    if (!studentId || !description) return res.status(400).json({ message: 'All fields required' });

    const activity = await StudentActivity.create({ studentId, description });
    res.json({ message: 'Activity logged', activity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging activity' });
  }
});

// Get student activities
app.get('/student/activity/:studentId', async (req, res) => {
  try {
    const activities = await StudentActivity.find({ studentId: req.params.studentId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// ------------------ Questions ------------------

// Add Question
app.post('/questions/add', async (req, res) => {
  try {
    const { title, difficulty, companyId } = req.body;
    if (!title || !difficulty || !companyId) return res.status(400).json({ message: 'All fields required' });

    const newQuestion = await Question.create({ title, difficulty, companyId });
    res.json({ message: 'Question added successfully', question: newQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding question' });
  }
});

// Get Questions by Company
app.get('/questions/company/:companyId', async (req, res) => {
  try {
    const questions = await Question.find({ companyId: req.params.companyId }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Update Question
app.put('/questions/update/:questionId', async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.questionId,
      { title: req.body.title, difficulty: req.body.difficulty },
      { new: true }
    );
    if (!updatedQuestion) return res.status(404).json({ message: 'Question not found!' });
    res.json({ message: 'Question updated', question: updatedQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating question' });
  }
});

// Delete Question
app.delete('/questions/delete/:questionId', async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.questionId);
    if (!deletedQuestion) return res.status(404).json({ message: 'Question not found!' });
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting question' });
  }
});



// ------------------ StudentProfile Schema ------------------
const studentProfileSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true }, // ties profile to logged-in user
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  branch: { type: String, default: '' },
  skills: { type: [String], default: [] },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  linkedIn: { type: String, default: '' }
});

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

// ------------------ PROFILE ROUTES ------------------
// Fetch profile by studentId
app.get('/student/profile/:studentId', async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ studentId: req.params.studentId });

    if (!profile) {
      return res.json({
        studentId: req.params.studentId,
        name: '',
        email: '',
        branch: '',
        skills: [],
        phone: '',
        address: '',
        linkedIn: ''
      });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error fetching profile' });
  }
});

// Create or Update profile
app.post('/student/profile/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { name, email, branch, skills, phone, address, linkedIn } = req.body;

    const profile = await StudentProfile.findOneAndUpdate(
      { studentId },
      { $set: { name, email, branch, skills, phone, address, linkedIn } },
      { new: true, upsert: true }
    );

    res.json({ message: '✅ Profile saved successfully!', profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error saving profile' });
  }
});


// ---------------- Resume Schema ----------------
const studentResumeSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});
const StudentResume = mongoose.model('StudentResume', studentResumeSchema);

// ---------------- Multer Setup ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ---------------- Routes ----------------

// Upload resume (separate from profile)
app.post('/student/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    const studentId = req.body.studentId;
    if (!req.file || !studentId) return res.status(400).json({ message: 'No file or studentId provided' });

    const filePath = `/uploads/${req.file.filename}`;
    await StudentResume.create({
      studentId,
      filename: req.file.originalname,
      filePath
    });

    res.json({ message: 'Resume uploaded successfully!', resumeUrl: filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading resume' });
  }
});

// ------------------ Start Server ------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ Multer setup for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ✅ Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  branch: String,
  skills: [String],
  resumeFile: String
});
const Student = mongoose.model('Student', studentSchema);

// ✅ Upload resume API
app.post('/api/company/resumes', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, branch, skills } = req.body;
    const student = new Student({
      name,
      email,
      branch,
      skills: skills ? skills.split(',') : [],
      resumeFile: req.file.filename
    });
    await student.save();
    res.json({ message: 'Resume uploaded successfully!' });
  } catch (err) {
    console.error('Error uploading resume:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Fetch all resumes
app.get('/api/company/resumes', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching resumes' });
  }
});

// ✅ Proper download / view route
app.get('/api/company/resumes/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath); // 👈 opens the file in browser (inline)
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// ✅ Start server
app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
