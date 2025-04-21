const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin login
router.post('/login', adminController.login);

// Register a new admin/teacher
router.post('/register', adminController.register);

// Get dashboard data
router.get('/api/dashboard', adminController.getDashboard);

// Get all enrolled students for courses
router.get('/enrolled-students', adminController.getEnrolledStudents);

module.exports = router; 