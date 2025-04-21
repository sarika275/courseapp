const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Get all courses
router.get('/', courseController.getAllCourses);

// Get a single course
router.get('/:id', courseController.getCourse);

// Create a new course
router.post('/', courseController.createCourse);

// Update a course
router.put('/:id', courseController.updateCourse);

// Delete a course
router.delete('/:id', courseController.deleteCourse);

// Enroll a student in a course
router.post('/:id/enroll', courseController.enrollStudent);

module.exports = router; 