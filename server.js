const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const viewRoutes = require('./routes/views');
const courseRoutes = require('./routes/courses');
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');

// Change route order: View routes first, then API routes
// View routes
app.use('/', viewRoutes);

// API routes
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/admin/api', adminRoutes); // Changed from '/admin' to '/admin/api'

// Connect to MongoDB
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/courseapp';

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
};

// Start server function
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    startServer();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB, starting server anyway...', err.message);
    startServer();
  }); 