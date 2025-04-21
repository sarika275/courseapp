document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const adminUsername = document.getElementById('adminUsername');
  const totalCoursesElement = document.getElementById('totalCourses');
  const totalStudentsElement = document.getElementById('totalStudents');
  const recentCoursesElement = document.getElementById('recentCourses');
  const recentEnrollmentsElement = document.getElementById('recentEnrollments');
  const enrollmentTableBody = document.getElementById('enrollmentTableBody');
  const refreshEnrollmentBtn = document.getElementById('refreshEnrollmentBtn');
  const studentsModal = document.getElementById('studentsModal');
  const closeModalBtn = studentsModal.querySelector('.close');
  const modalCourseName = document.getElementById('modalCourseName');
  const studentsTableBody = document.getElementById('studentsTableBody');

  // Check authentication
  const checkAuth = () => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      window.location.href = '/admin/login';
      return null;
    }
    return JSON.parse(adminUser);
  };

  const user = checkAuth();
  if (!user) return;

  // Display username
  adminUsername.textContent = user.username;

  // Handle logout
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  });

  // Close modal when clicking the close button
  closeModalBtn.addEventListener('click', () => {
    studentsModal.style.display = 'none';
  });

  // Close modal when clicking outside of it
  window.addEventListener('click', (e) => {
    if (e.target === studentsModal) {
      studentsModal.style.display = 'none';
    }
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/admin/api/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      
      // Update statistics
      totalCoursesElement.textContent = data.statistics.courseCount;
      totalStudentsElement.textContent = data.statistics.studentCount;
      
      // Update recent courses
      displayRecentCourses(data.latestCourses);
      
      // Update recent enrollments
      displayRecentEnrollments(data.latestStudents);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Failed to load dashboard data. Please try again.');
    }
  };

  // Fetch enrolled students data
  const fetchEnrolledStudents = async () => {
    try {
      const response = await fetch('/admin/api/enrolled-students');
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrollment data');
      }
      
      const courses = await response.json();
      displayEnrollmentTable(courses);
      
    } catch (error) {
      console.error('Error fetching enrollment data:', error);
      enrollmentTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="error-message">Failed to load enrollment data</td>
        </tr>
      `;
    }
  };

  // Display recent courses
  const displayRecentCourses = (courses) => {
    if (!courses || courses.length === 0) {
      recentCoursesElement.innerHTML = '<p>No courses available</p>';
      return;
    }

    let coursesHTML = '';
    courses.forEach(course => {
      const availableSeats = course.seats - (course.enrolledStudents ? course.enrolledStudents.length : 0);
      
      coursesHTML += `
        <div class="dashboard-item">
          <h4>${course.name}</h4>
          <p><strong>Faculty:</strong> ${course.facultyName}</p>
          <p><strong>Seats:</strong> ${availableSeats} of ${course.seats} available</p>
        </div>
      `;
    });

    recentCoursesElement.innerHTML = coursesHTML;
  };

  // Display recent enrollments
  const displayRecentEnrollments = (students) => {
    if (!students || students.length === 0) {
      recentEnrollmentsElement.innerHTML = '<p>No recent enrollments</p>';
      return;
    }

    let studentsHTML = '';
    students.forEach(student => {
      studentsHTML += `
        <div class="dashboard-item">
          <h4>${student.name}</h4>
          <p>${student.email}</p>
          <p><strong>Courses Enrolled:</strong> ${student.enrolledCourses.length}</p>
        </div>
      `;
    });

    recentEnrollmentsElement.innerHTML = studentsHTML;
  };

  // Display enrollment table
  const displayEnrollmentTable = (courses) => {
    if (!courses || courses.length === 0) {
      enrollmentTableBody.innerHTML = `
        <tr>
          <td colspan="6">No enrollment data available</td>
        </tr>
      `;
      return;
    }

    let tableHTML = '';
    courses.forEach(course => {
      const availableSeats = course.seats - course.enrolledCount;
      
      tableHTML += `
        <tr>
          <td>${course.name}</td>
          <td>${course.facultyName}</td>
          <td>${course.seats}</td>
          <td>${course.enrolledCount}</td>
          <td>${availableSeats}</td>
          <td class="action-buttons">
            <button class="btn btn-primary btn-sm view-students-btn" data-id="${course.id}" data-name="${course.name}">
              View Students
            </button>
          </td>
        </tr>
      `;
    });

    enrollmentTableBody.innerHTML = tableHTML;

    // Add event listeners to view students buttons
    const viewStudentsBtns = document.querySelectorAll('.view-students-btn');
    viewStudentsBtns.forEach(button => {
      button.addEventListener('click', showStudentsModal);
    });
  };

  // Show students modal
  const showStudentsModal = (e) => {
    const courseId = e.currentTarget.getAttribute('data-id');
    const courseName = e.currentTarget.getAttribute('data-name');
    
    // Set course name in modal title
    modalCourseName.textContent = courseName;
    
    // Show modal
    studentsModal.style.display = 'block';
    
    // Show loading state
    studentsTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="loading">Loading students...</td>
      </tr>
    `;
    
    // Find the course with this ID in our data
    fetch('/admin/api/enrolled-students')
      .then(response => response.json())
      .then(courses => {
        const course = courses.find(c => c.id === courseId);
        
        if (!course || !course.students || course.students.length === 0) {
          studentsTableBody.innerHTML = `
            <tr>
              <td colspan="3">No students enrolled in this course</td>
            </tr>
          `;
          return;
        }
        
        let tableHTML = '';
        course.students.forEach(student => {
          tableHTML += `
            <tr>
              <td>${student.name}</td>
              <td>${student.email}</td>
              <td>${student.phone}</td>
            </tr>
          `;
        });
        
        studentsTableBody.innerHTML = tableHTML;
      })
      .catch(error => {
        console.error('Error fetching students:', error);
        studentsTableBody.innerHTML = `
          <tr>
            <td colspan="3" class="error-message">Failed to load students</td>
          </tr>
        `;
      });
  };

  // Refresh enrollment data
  refreshEnrollmentBtn.addEventListener('click', fetchEnrolledStudents);
  
  // Load data on page load
  fetchDashboardData();
  fetchEnrolledStudents();
}); 