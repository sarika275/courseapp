const Student = require('../models/Student');
const Course = require('../models/Course');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// Get a single student
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('enrolledCourses', 'name facultyName duration');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
};

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Check if student with this email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }
    
    const student = new Student({
      name,
      email,
      phone
    });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Remove this student from all enrolled courses
    await Course.updateMany(
      { enrolledStudents: req.params.id },
      { $pull: { enrolledStudents: req.params.id } }
    );
    
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
};

// Enroll student in a course
exports.enrollInCourse = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { courseId } = req.body;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if there are available seats
    if (course.enrolledStudents.length >= course.seats) {
      return res.status(400).json({ message: 'No seats available in this course' });
    }
    
    // Check if student is already enrolled
    if (student.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }
    
    // Add course to student
    student.enrolledCourses.push(courseId);
    await student.save();
    
    // Add student to course
    course.enrolledStudents.push(studentId);
    await course.save();
    
    res.status(200).json({ message: 'Enrolled successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling in course', error: error.message });
  }
}; 