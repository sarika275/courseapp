const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Get all students
router.get('/', studentController.getAllStudents);

// Get a single student
router.get('/:id', studentController.getStudent);

// Create a new student
router.post('/', studentController.createStudent);

// Update a student
router.put('/:id', studentController.updateStudent);

// Delete a student
router.delete('/:id', studentController.deleteStudent);

// Enroll a student in a course
router.post('/:id/enroll', studentController.enrollInCourse);

module.exports = router; 