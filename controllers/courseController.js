const Course = require('../models/Course');
const Student = require('../models/Student');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

// Get a single course
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('enrolledStudents', 'name email phone');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { name, description, facultyName, seats, duration } = req.body;
    const course = new Course({
      name,
      description,
      facultyName,
      seats,
      duration
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    const { name, description, facultyName, seats, duration } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, description, facultyName, seats, duration },
      { new: true, runValidators: true }
    );
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Remove this course from all enrolled students
    await Student.updateMany(
      { enrolledCourses: req.params.id },
      { $pull: { enrolledCourses: req.params.id } }
    );
    
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
};

// Enroll a student in a course
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const courseId = req.params.id;
    
    // Check if course exists and has available seats
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.enrolledStudents.length >= course.seats) {
      return res.status(400).json({ message: 'No seats available in this course' });
    }
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student is already enrolled
    if (course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }
    
    // Add student to course
    course.enrolledStudents.push(studentId);
    await course.save();
    
    // Add course to student
    student.enrolledCourses.push(courseId);
    await student.save();
    
    res.status(200).json({ message: 'Student enrolled successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling student', error: error.message });
  }
}; 