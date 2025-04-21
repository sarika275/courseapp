document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const studentsTableBody = document.getElementById('studentsTableBody');
  const studentDetailsModal = document.getElementById('studentDetailsModal');
  const closeModalBtn = studentDetailsModal.querySelector('.close');
  const studentName = document.getElementById('studentName');
  const studentEmail = document.getElementById('studentEmail');
  const studentPhone = document.getElementById('studentPhone');
  const enrolledDate = document.getElementById('enrolledDate');
  const enrolledCoursesList = document.getElementById('enrolledCoursesList');
  
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

  // Handle logout
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  });

  // Close modal when clicking the close button
  closeModalBtn.addEventListener('click', () => {
    studentDetailsModal.style.display = 'none';
  });

  // Close modal when clicking outside of it
  window.addEventListener('click', (e) => {
    if (e.target === studentDetailsModal) {
      studentDetailsModal.style.display = 'none';
    }
  });

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const students = await response.json();
      displayStudents(students);
      
    } catch (error) {
      console.error('Error fetching students:', error);
      studentsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="error-message">Failed to load students</td>
        </tr>
      `;
    }
  };

  // Display students in table
  const displayStudents = (students) => {
    if (!students || students.length === 0) {
      studentsTableBody.innerHTML = `
        <tr>
          <td colspan="6">No students available</td>
        </tr>
      `;
      return;
    }

    let tableHTML = '';
    students.forEach(student => {
      const enrolledCount = student.enrolledCourses ? student.enrolledCourses.length : 0;
      const enrollmentDate = new Date(student.createdAt).toLocaleDateString();
      
      tableHTML += `
        <tr>
          <td>${student.name}</td>
          <td>${student.email}</td>
          <td>${student.phone}</td>
          <td>${enrolledCount} courses</td>
          <td>${enrollmentDate}</td>
          <td class="action-buttons">
            <button class="btn btn-primary btn-sm view-student-btn" data-id="${student._id}">View Details</button>
            <button class="btn btn-danger btn-sm delete-student-btn" data-id="${student._id}">Delete</button>
          </td>
        </tr>
      `;
    });

    studentsTableBody.innerHTML = tableHTML;

    // Add event listeners to action buttons
    addActionButtonListeners(students);
  };

  // Add event listeners to student action buttons
  const addActionButtonListeners = (students) => {
    // View student details buttons
    const viewButtons = document.querySelectorAll('.view-student-btn');
    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        const studentId = button.getAttribute('data-id');
        showStudentDetails(studentId);
      });
    });
    
    // Delete student buttons
    const deleteButtons = document.querySelectorAll('.delete-student-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const studentId = button.getAttribute('data-id');
        deleteStudent(studentId);
      });
    });
  };

  // Show student details
  const showStudentDetails = async (studentId) => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }
      
      const student = await response.json();
      
      // Set student details in modal
      studentName.textContent = student.name;
      studentEmail.textContent = student.email;
      studentPhone.textContent = student.phone;
      enrolledDate.textContent = new Date(student.createdAt).toLocaleDateString();
      
      // Display enrolled courses
      if (!student.enrolledCourses || student.enrolledCourses.length === 0) {
        enrolledCoursesList.innerHTML = '<p>Student is not enrolled in any courses</p>';
      } else {
        let coursesHTML = '<ul class="enrolled-courses-list">';
        student.enrolledCourses.forEach(course => {
          coursesHTML += `
            <li>
              <strong>${course.name}</strong> 
              <span>Faculty: ${course.facultyName}</span>
              <span>Duration: ${course.duration}</span>
            </li>
          `;
        });
        coursesHTML += '</ul>';
        enrolledCoursesList.innerHTML = coursesHTML;
      }
      
      // Show modal
      studentDetailsModal.style.display = 'block';
      
    } catch (error) {
      console.error('Error fetching student details:', error);
      alert('Failed to load student details. Please try again.');
    }
  };

  // Delete a student
  const deleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student? This will remove them from all enrolled courses. This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete student');
      }
      
      // Refresh student list
      fetchStudents();
      
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(error.message || 'An error occurred. Please try again.');
    }
  };

  // Load students on page load
  fetchStudents();
}); 