// Render the home page
exports.renderHome = (req, res) => {
  res.render('index');
};

// Render the admin login page
exports.renderAdminLogin = (req, res) => {
  res.render('admin/login');
};

// Render the admin dashboard
exports.renderAdminDashboard = (req, res) => {
  res.render('admin/dashboard');
};

// Render the admin courses page
exports.renderAdminCourses = (req, res) => {
  res.render('admin/courses');
};

// Render the admin students page
exports.renderAdminStudents = (req, res) => {
  res.render('admin/students');
}; 