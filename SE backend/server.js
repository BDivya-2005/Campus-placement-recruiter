
// ------------------ Imports ------------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
// ✅ Make the uploads folder public
app.use('/uploads', express.static('uploads'));

// ------------------ MongoDB Connection ------------------
mongoose.connect('mongodb://127.0.0.1:27017/placementDB')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// ------------------ Ensure uploads folder exists ------------------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------ Schemas ------------------

// Company Schema
const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'company' },
  isActive: { type: Boolean, default: true } // ✅ added field
});

const Company = mongoose.model('Company', companySchema);

// User Schema (student/admin)
const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  branch: { type: String },
  year: { type: String },
  role: { type: String, required: true }
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

// Student Profile Schema
const studentProfileSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  branch: { type: String, default: '' },
  skills: { type: [String], default: [] },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  linkedIn: { type: String, default: '' }
});
const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

// Student Resume Schema
const studentResumeSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});
const StudentResume = mongoose.model('StudentResume', studentResumeSchema);


// ===================== Student Schema =====================

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  year: { type: String },
  skills: { type: [String], default: [] },
  resumeFile: { type: String }, // file path or URL
  appliedCompanies: { type: [String], default: [] } // list of company names or IDs
});

const Student = mongoose.model('Student', studentSchema);


// ------------------ Multer Setup ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

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

// ------------------ Jobs (With Company Name) ------------------
app.get("/jobs/all", async (req, res) => {
  try {
    const jobs = await Job.find().populate("companyId", "companyName");
    const formatted = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      companyName: job.companyId?.companyName || "Unknown",
      companyId: job.companyId?._id,
      location: job.location,
    }));
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// ------------------ Apply for a Job ------------------
// ------------------ Apply for a Job ------------------
app.post("/jobs/apply", async (req, res) => {
  try {
    const { studentId, jobId, companyId } = req.body;

    if (!studentId || !jobId)
      return res.status(400).json({ message: "Missing studentId or jobId" });

    // Find the job and company info
    const job = await Job.findById(jobId).populate("companyId", "companyName");
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Check if already applied
    const existing = await Application.findOne({ studentId, jobId });
    if (existing)
      return res.status(400).json({ message: "Already applied for this job" });

    // Create application with companyId
    const application = await Application.create({
      studentId,
      jobId,
      companyId: job.companyId._id
    });

    // Add student activity with job title & company name
    await StudentActivity.create({
      studentId,
      description: `Applied for "${job.title}" at "${job.companyId.companyName}".`
    });

    res.json({
      message: `Application for "${job.title}" submitted successfully!`,
      application
    });
  } catch (err) {
    console.error("Error applying for job:", err);
    res.status(500).json({ message: "Error applying for job" });
  }
});

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
    const activities = await CompanyActivity.find({ companyId: req.params.companyId })
      .sort({ createdAt: -1 });
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
    const questions = await Question.find({ companyId: req.params.companyId })
      .sort({ createdAt: -1 });
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

// ------------------ Student Profile ------------------

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
    res.status(500).json({ message: 'Error fetching profile' });
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

    res.json({ message: 'Profile saved successfully!', profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving profile' });
  }
});

// ------------------ Resume Upload ------------------
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

// Get the last uploaded resume for a student
app.get('/student/resume/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Get the latest resume uploaded
    const resume = await StudentResume.findOne({ studentId }).sort({ uploadedAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    res.json({ filename: resume.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching resume' });
  }
});


// Get all questions with company names
app.get('/questions/all-with-company', async (req, res) => {
  try {
    const questions = await Question.find().populate('companyId', 'companyName').sort({ createdAt: -1 });

    const formatted = questions.map(q => ({
      _id: q._id,
      title: q.title,
      difficulty: q.difficulty,
      companyName: q.companyId.companyName
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});


app.post('/jobs/apply', async (req, res) => {
  try {
    const { jobId, studentId } = req.body;
    if (!jobId || !studentId) return res.status(400).json({ message: 'JobId and StudentId required' });

    // Check if already applied
    const existing = await Application.findOne({ jobId, studentId });
    if (existing) return res.status(400).json({ message: 'Already applied for this job' });

    const application = await Application.create({ jobId, studentId });
    await StudentActivity.create({ studentId, description: `Applied for job ID: ${jobId}` });

    res.json({ message: 'Application submitted successfully!', application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error applying for job' });
  }
});

app.get('/company/:companyId/students', async (req, res) => {
  try {
    const { companyId } = req.params;

    // Get all jobs for this company
    const jobs = await Job.find({ companyId }).select('_id title');
    const jobIds = jobs.map(job => job._id);

    // Find all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('studentId', 'username email branch year');

    // Format student list
    const students = applications.map(app => ({
      name: app.studentId.username,
      email: app.studentId.email,
      branch: app.studentId.branch,
      year: app.studentId.year,
      appliedAt: app.appliedAt,
      jobId: app.jobId
    }));

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching applicants' });
  }
});

app.get('/questions/company/:companyId', async (req, res) => {
  try {
    const questions = await Question.find({ companyId: req.params.companyId }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});


/// ✅ Application Schema
const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  companyName: String,
  appliedAt: { type: Date, default: Date.now }
});
const Application = mongoose.model('Application', applicationSchema);




// Get all jobs (with company name)
app.get("/jobs/all", async (req, res) => {
  try {
    const jobs = await Job.find().populate("companyId", "name");
    const formattedJobs = jobs.map((job) => ({
      _id: job._id,
      title: job.title,
      companyName: job.companyId?.name || "Unknown",
      companyId: job.companyId?._id || null,
      location: job.location,
    }));
    res.json(formattedJobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// Apply for a job
app.post("/jobs/apply", async (req, res) => {
  try {
    const { studentId, jobId, companyId } = req.body;

    if (!studentId || !jobId || !companyId)
      return res.status(400).json({ message: "Missing studentId, jobId, or companyId" });

    const existing = await Application.findOne({ studentId, jobId });
    if (existing) return res.status(400).json({ message: "Already applied for this job" });

    const application = await Application.create({ studentId, jobId, companyId });

    res.json({ message: "Application submitted successfully!", application });
  } catch (err) {
    console.error("Error applying for job:", err);
    res.status(500).json({ message: "Error applying for job" });
  }
});

// Get applicants for a specific company
app.get("/company/:companyId/students", async (req, res) => {
  try {
    const applications = await Application.find({ companyId: req.params.companyId })
      .populate("studentId", "username email branch year")
      .populate("jobId", "title")
      .populate("companyId", "name");

    const applicants = applications.map((app) => ({
      id: app.studentId._id,
      name: app.studentId.username,
      email: app.studentId.email,
      branch: app.studentId.branch,
      year: app.studentId.year,
      appliedTo: app.jobId.title,
      companyName: app.companyId.name,
      appliedAt: app.appliedAt,
    }));

    res.json(applicants);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ message: "Error fetching applicants" });
  }
}); 

app.get('/jobs/all', async (req, res) => {
  try {
    const jobs = await Job.find().populate('companyId', 'companyName');
    const jobList = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      companyName: job.companyId?.companyName || 'Unknown',
      companyId: job.companyId?._id,  // ✅ include companyId
      location: job.location
    }));
    res.json(jobList);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

app.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('username email branch year');
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching students' });
  }
});
app.delete('/students/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting student' });
  }
});

app.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find().select('companyName email');
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

app.delete('/companies/:id', async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting company' });
  }
});
// ------------------ Admin User Management ------------------

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update user
app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ------------------ Admin Reports ------------------
app.get('/admin/reports', async (req, res) => {
  try {
    const totalStudentsPlaced = await Application.countDocuments();
    const totalJobsPosted = await Job.countDocuments();
    const activeCompanies = await Company.countDocuments();

    res.json({
      totalStudentsPlaced,
      totalJobsPosted,
      activeCompanies
    });
  } catch (err) {
    console.error('Error fetching admin reports:', err);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

app.get('/admin/reports/companies', async (req, res) => {
  const companies = await Company.find();
  const formatted = companies.map(c => ({
    _id: c._id,
    name: c.companyName,  // 👈 added alias
    email: c.email,
    role: c.role,
    isActive: c.isActive
  }));
  res.json(formatted);
});


// For students placed
app.get('/admin/reports/students', async (req, res) => {
  const students = await Student.find({ placed: true });
  res.json(students);
});

// For jobs
app.get('/admin/reports/jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

// ✅ Corrected /admin/resumes route
app.get('/admin/resumes', async (req, res) => {
  try {
    // Get all users who are students
    const students = await User.find({ role: 'student' }).select('username email branch year _id');

    // Get all resumes
    const resumes = await StudentResume.find().sort({ uploadedAt: -1 });

    // Merge both lists so each student gets their resume if available
    const data = students.map(student => {
      const studentResume = resumes.find(r => r.studentId.toString() === student._id.toString());
      return {
        id: student._id,
        name: student.username,
        email: student.email,
        branch: student.branch,
        year: student.year,
        resumeUrl: studentResume ? `http://localhost:3000${studentResume.filePath}` : null,
        uploadedAt: studentResume ? studentResume.uploadedAt : null
      };
    });

    res.json(data);
  } catch (err) {
    console.error('Error fetching all student resumes:', err);
    res.status(500).json({ message: 'Error fetching student resumes' });
  }
});

// ------------------ Company-wise Student Resumes ------------------

app.get('/company/:companyName/resumes', async (req, res) => {
  try {
    const companyName = req.params.companyName;

    // Fetch students who applied to this company
    const students = await Student.find({ appliedCompanies: companyName });

    res.json(students);
  } catch (err) {
    console.error('Error fetching resumes for company:', err);
    res.status(500).send('Error fetching resumes for company');
  }
});

// ------------------ Company-wise Student Resumes ------------------
app.get('/api/company/:companyName/resumes', async (req, res) => {
  try {
    const companyName = req.params.companyName;
    const students = await Student.find({
      appliedCompanies: companyName
    });

    // Filter out students without valid data
    const validStudents = students.filter(s => s.name && s.email);

    res.json(validStudents);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});


app.get('/api/company/:companyId/resumes', async (req, res) => {
  try {
    const { companyId } = req.params;

    // Get all students who applied to this company's jobs
    const applications = await Application.find({ companyId }).populate('studentId');
    const studentIds = applications.map(a => a.studentId._id.toString());

    const students = await User.find({ _id: { $in: studentIds }, role: 'student' })
      .select('username email branch year _id');
    const profiles = await StudentProfile.find({ studentId: { $in: studentIds } });
    const resumes = await StudentResume.find({ studentId: { $in: studentIds } });

    const merged = students.map(stu => {
      const profile = profiles.find(p => p.studentId === stu._id.toString());
      const resume = resumes.find(r => r.studentId === stu._id.toString());
      return {
        _id: stu._id,
        name: profile?.name || stu.username || 'N/A',
        email: profile?.email || stu.email || 'N/A',
        branch: profile?.branch || stu.branch || 'N/A',
        skills: profile?.skills?.length ? profile.skills : ['N/A'],
        resumeFile: resume ? `http://localhost:3000${resume.filePath}` : null
      };
    });

    res.json(merged);
  } catch (err) {
    console.error('Error fetching company resumes:', err);
    res.status(500).json({ message: 'Error fetching company resumes' });
  }
});


// GET resumes for company
// ✅ Unified route: Get all students with their profile & resume info
app.get('/api/company/resumes', async (req, res) => {
  try {
    // Get all students
    const students = await User.find({ role: 'student' })
      .select('username email branch year _id');

    // Get all profiles & resumes
    const profiles = await StudentProfile.find();
    const resumes = await StudentResume.find().sort({ uploadedAt: -1 });

    // Merge all data
    const combined = students.map(stu => {
      const profile = profiles.find(p => p.studentId === stu._id.toString());
      const resume = resumes.find(r => r.studentId === stu._id.toString());

      return {
        _id: stu._id,
        name: profile?.name || stu.username || 'N/A',
        email: profile?.email || stu.email || 'N/A',
        branch: profile?.branch || stu.branch || 'N/A',
        skills: profile?.skills?.length ? profile.skills : ['N/A'],
        resumeFile: resume ? `http://localhost:3000${resume.filePath}` : null
      };
    });

    res.json(combined);
  } catch (err) {
    console.error('❌ Error fetching combined resumes:', err);
    res.status(500).json({ message: 'Error fetching resumes' });
  }
});


// DELETE resume
app.delete('/api/company/resumes/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    console.error('Error deleting resume:', err);
    res.status(500).json({ error: 'Error deleting resume' });
  }
});

// ------------------ Resume Download ------------------
app.get('/student/resume/download/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const resume = await StudentResume.findOne({ studentId }).sort({ uploadedAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const filePath = path.join(__dirname, resume.filePath);
    res.download(filePath, resume.filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (err) {
    console.error('Error downloading resume:', err);
    res.status(500).json({ message: 'Server error downloading resume' });
  }
});

app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath, err => {
    if (err) res.status(404).json({ message: 'File not found' });
  });
});




// ------------------ Start Server ------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
