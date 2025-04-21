document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const addCourseBtn = document.getElementById('addCourseBtn');
  const coursesTableBody = document.getElementById('coursesTableBody');
  const courseModal = document.getElementById('courseModal');
  const closeModalBtn = courseModal.querySelector('.close');
  const courseForm = document.getElementById('courseForm');
  const courseModalTitle = document.getElementById('courseModalTitle');
  const courseSubmitBtn = document.getElementById('courseSubmitBtn');
  const studentsModal = document.getElementById('studentsModal');
  const closeStudentsModalBtn = studentsModal.querySelector('.close');
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

  // Handle logout
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  });

  // Close course modal
  closeModalBtn.addEventListener('click', () => {
    courseModal.style.display = 'none';
  });

  // Close students modal
  closeStudentsModalBtn.addEventListener('click', () => {
    studentsModal.style.display = 'none';
  });

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === courseModal) {
      courseModal.style.display = 'none';
    }
    if (e.target === studentsModal) {
      studentsModal.style.display = 'none';
    }
  });

  // Open modal to add new course
  addCourseBtn.addEventListener('click', () => {
    // Reset form
    courseForm.reset();
    document.getElementById('courseId').value = '';
    
    // Update modal title and button text
    courseModalTitle.textContent = 'Add New Course';
    courseSubmitBtn.textContent = 'Add Course';
    
    // Show modal
    courseModal.style.display = 'block';
  });

  // Handle course form submission
  courseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const courseId = document.getElementById('courseId').value;
    const name = document.getElementById('courseName').value;
    const description = document.getElementById('courseDescription').value;
    const facultyName = document.getElementById('facultyName').value;
    const seats = document.getElementById('seats').value;
    const duration = document.getElementById('duration').value;
    
    const courseData = {
      name,
      description,
      facultyName,
      seats,
      duration
    };
    
    try {
      let response;
      
      if (courseId) {
        // Update existing course
        response = await fetch(`/api/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(courseData)
        });
      } else {
        // Create new course
        response = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(courseData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save course');
      }
      
      // Close modal and refresh course list
      courseModal.style.display = 'none';
      fetchCourses();
      
    } catch (error) {
      console.error('Error saving course:', error);
      alert(error.message || 'An error occurred. Please try again.');
    }
  });

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const courses = await response.json();
      displayCourses(courses);
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      coursesTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="error-message">Failed to load courses</td>
        </tr>
      `;
    }
  };

  // Display courses in table
  const displayCourses = (courses) => {
    if (!courses || courses.length === 0) {
      coursesTableBody.innerHTML = `
        <tr>
          <td colspan="6">No courses available</td>
        </tr>
      `;
      return;
    }

    let tableHTML = '';
    courses.forEach(course => {
      const enrolledCount = course.enrolledStudents ? course.enrolledStudents.length : 0;
      
      tableHTML += `
        <tr>
          <td>${course.name}</td>
          <td>${course.facultyName}</td>
          <td>${course.duration}</td>
          <td>${course.seats}</td>
          <td>${enrolledCount}</td>
          <td class="action-buttons">
            <button class="btn btn-primary btn-sm edit-course-btn" data-id="${course._id}">Edit</button>
            <button class="btn btn-danger btn-sm delete-course-btn" data-id="${course._id}">Delete</button>
            <button class="btn btn-primary btn-sm view-students-btn" data-id="${course._id}" data-name="${course.name}">
              Students
            </button>
          </td>
        </tr>
      `;
    });

    coursesTableBody.innerHTML = tableHTML;

    // Add event listeners to action buttons
    addActionButtonListeners(courses);
  };

  // Add event listeners to course action buttons
  const addActionButtonListeners = (courses) => {
    // Edit course buttons
    const editButtons = document.querySelectorAll('.edit-course-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const courseId = button.getAttribute('data-id');
        openEditCourseModal(courseId, courses);
      });
    });
    
    // Delete course buttons
    const deleteButtons = document.querySelectorAll('.delete-course-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const courseId = button.getAttribute('data-id');
        deleteCourse(courseId);
      });
    });
    
    // View students buttons
    const viewStudentsButtons = document.querySelectorAll('.view-students-btn');
    viewStudentsButtons.forEach(button => {
      button.addEventListener('click', () => {
        const courseId = button.getAttribute('data-id');
        const courseName = button.getAttribute('data-name');
        showStudentsModal(courseId, courseName);
      });
    });
  };

  // Open modal to edit course
  const openEditCourseModal = (courseId, courses) => {
    const course = courses.find(c => c._id === courseId);
    
    if (!course) {
      alert('Course not found');
      return;
    }
    
    // Set form values
    document.getElementById('courseId').value = course._id;
    document.getElementById('courseName').value = course.name;
    document.getElementById('courseDescription').value = course.description;
    document.getElementById('facultyName').value = course.facultyName;
    document.getElementById('seats').value = course.seats;
    document.getElementById('duration').value = course.duration;
    
    // Update modal title and button text
    courseModalTitle.textContent = 'Edit Course';
    courseSubmitBtn.textContent = 'Update Course';
    
    // Show modal
    courseModal.style.display = 'block';
  };

  // Delete a course
  const deleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete course');
      }
      
      // Refresh course list
      fetchCourses();
      
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(error.message || 'An error occurred. Please try again.');
    }
  };

  // Show students modal for a course
  const showStudentsModal = async (courseId, courseName) => {
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
    
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }
      
      const course = await response.json();
      
      if (!course.enrolledStudents || course.enrolledStudents.length === 0) {
        studentsTableBody.innerHTML = `
          <tr>
            <td colspan="3">No students enrolled in this course</td>
          </tr>
        `;
        return;
      }
      
      let tableHTML = '';
      course.enrolledStudents.forEach(student => {
        tableHTML += `
          <tr>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
          </tr>
        `;
      });
      
      studentsTableBody.innerHTML = tableHTML;
      
    } catch (error) {
      console.error('Error fetching students:', error);
      studentsTableBody.innerHTML = `
        <tr>
          <td colspan="3" class="error-message">Failed to load students</td>
        </tr>
      `;
    }
  };

  // Load courses on page load
  fetchCourses();
}); 