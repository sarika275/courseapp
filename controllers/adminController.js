const User = require('../models/User');
const Course = require('../models/Course');
const Student = require('../models/Student');

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple authentication (in a real app, use bcrypt for passwords)
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

// Register a new admin/teacher
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new user
    const user = new User({
      username,
      password, // In a real app, hash password before saving
      role: role || 'teacher'
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during registration', error: error.message });
  }
};

// Get admin dashboard data
exports.getDashboard = async (req, res) => {
  try {
    // Get counts
    const courseCount = await Course.countDocuments();
    const studentCount = await Student.countDocuments();
    
    // Get latest courses
    const latestCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get latest enrollments
    const latestStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      statistics: {
        courseCount,
        studentCount
      },
      latestCourses,
      latestStudents
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// Get all enrolled students for courses
exports.getEnrolledStudents = async (req, res) => {
  try {
    const courses = await Course.find().populate('enrolledStudents', 'name email phone');
    
    const formattedCourses = courses.map(course => ({
      id: course._id,
      name: course.name,
      facultyName: course.facultyName,
      seats: course.seats,
      enrolledCount: course.enrolledStudents.length,
      students: course.enrolledStudents
    }));
    
    res.status(200).json(formattedCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled students', error: error.message });
  }
}; 