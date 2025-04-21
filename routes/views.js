const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

// Home page
router.get('/', viewController.renderHome);

// Admin login page
router.get('/admin/login', viewController.renderAdminLogin);

// Admin dashboard
router.get('/admin/dashboard', viewController.renderAdminDashboard);

// Admin courses management
router.get('/admin/dashboard/courses', viewController.renderAdminCourses);

// Admin students management
router.get('/admin/dashboard/students', viewController.renderAdminStudents);

module.exports = router; 

