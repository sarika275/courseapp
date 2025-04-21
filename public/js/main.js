document.addEventListener('DOMContentLoaded', () => {
  const coursesContainer = document.getElementById('coursesContainer');
  const enrollmentModal = document.getElementById('enrollmentModal');
  const closeModalBtn = enrollmentModal.querySelector('.close');
  const enrollmentForm = document.getElementById('enrollmentForm');
  
  // Form fields
  const courseIdField = document.getElementById('courseId');
  const courseNameSpan = document.getElementById('courseName');
  const courseDescriptionSpan = document.getElementById('courseDescription');
  const courseFacultySpan = document.getElementById('courseFaculty');
  const courseDurationSpan = document.getElementById('courseDuration');
  const availableSeatsSpan = document.getElementById('availableSeats');
  const studentNameField = document.getElementById('studentName');
  const studentEmailField = document.getElementById('studentEmail');
  const studentPhoneField = document.getElementById('studentPhone');
  
  // Fetch and display all courses
  fetchCourses();

  // Close modal when clicking the close button
  closeModalBtn.addEventListener('click', () => {
    enrollmentModal.style.display = 'none';
  });

  // Close modal when clicking outside of it
  window.addEventListener('click', (e) => {
    if (e.target === enrollmentModal) {
      enrollmentModal.style.display = 'none';
    }
  });

  // Handle enrollment form submission
  enrollmentForm.addEventListener('submit', handleEnrollment);

  // Function to fetch courses from API
  async function fetchCourses() {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const courses = await response.json();
      displayCourses(courses);
    } catch (error) {
      console.error('Error:', error);
      coursesContainer.innerHTML = `<p class="error-message">Error loading courses. Please try again later.</p>`;
    }
  }

  // Function to display courses
  function displayCourses(courses) {
    if (!courses || courses.length === 0) {
      coursesContainer.innerHTML = '<p>No courses available at the moment.</p>';
      return;
    }

    let coursesHTML = '';
    courses.forEach(course => {
      const availableSeats = course.seats - (course.enrolledStudents ? course.enrolledStudents.length : 0);
      const isFullClass = availableSeats <= 0;
      
      coursesHTML += `
        <div class="course-card">
          <div class="course-content">
            <h3 class="course-title">${course.name}</h3>
            <div class="course-details">
              <p class="course-detail"><strong>Faculty:</strong> ${course.facultyName}</p>
              <p class="course-detail"><strong>Duration:</strong> ${course.duration}</p>
              <p class="course-description">${truncateDescription(course.description, 100)}</p>
            </div>
            <div class="course-seats">
              <span>Seats:</span>
              <span class="seats-left">${availableSeats} available</span>
            </div>
            <button class="enroll-btn" 
                    data-id="${course._id}"
                    data-name="${course.name}"
                    data-description="${course.description}"
                    data-faculty="${course.facultyName}"
                    data-duration="${course.duration}"
                    data-seats="${course.seats}"
                    data-enrolled="${course.enrolledStudents ? course.enrolledStudents.length : 0}"
                    ${isFullClass ? 'disabled' : ''}>
              ${isFullClass ? 'Class Full' : 'Enroll Now'}
            </button>
          </div>
        </div>
      `;
    });

    coursesContainer.innerHTML = coursesHTML;

    // Add event listeners to enroll buttons
    const enrollButtons = document.querySelectorAll('.enroll-btn');
    enrollButtons.forEach(button => {
      if (!button.disabled) {
        button.addEventListener('click', openEnrollmentModal);
      }
    });
  }

  // Function to open enrollment modal
  function openEnrollmentModal(e) {
    const button = e.currentTarget;
    const courseId = button.getAttribute('data-id');
    const courseName = button.getAttribute('data-name');
    const courseDescription = button.getAttribute('data-description');
    const courseFaculty = button.getAttribute('data-faculty');
    const courseDuration = button.getAttribute('data-duration');
    const totalSeats = parseInt(button.getAttribute('data-seats'));
    const enrolledStudents = parseInt(button.getAttribute('data-enrolled'));
    const availableSeats = totalSeats - enrolledStudents;

    // Set values in the modal
    courseIdField.value = courseId;
    courseNameSpan.textContent = courseName;
    courseDescriptionSpan.textContent = courseDescription;
    courseFacultySpan.textContent = courseFaculty;
    courseDurationSpan.textContent = courseDuration;
    availableSeatsSpan.textContent = availableSeats;

    // Clear form fields
    studentNameField.value = '';
    studentEmailField.value = '';
    studentPhoneField.value = '';

    // Show the modal
    enrollmentModal.style.display = 'block';
  }

  // Function to handle enrollment form submission
  async function handleEnrollment(e) {
    e.preventDefault();

    const courseId = courseIdField.value;
    const studentName = studentNameField.value;
    const studentEmail = studentEmailField.value;
    const studentPhone = studentPhoneField.value;

    try {
      // First create the student
      const studentResponse = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: studentName,
          email: studentEmail,
          phone: studentPhone
        })
      });

      if (!studentResponse.ok) {
        const errorData = await studentResponse.json();
        throw new Error(errorData.message || 'Failed to create student');
      }

      const studentData = await studentResponse.json();

      // Then enroll the student in the course
      const enrollResponse = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: studentData._id
        })
      });

      if (!enrollResponse.ok) {
        const errorData = await enrollResponse.json();
        throw new Error(errorData.message || 'Failed to enroll in course');
      }

      // Show success message and close modal
      alert('Enrollment successful! You have been enrolled in the course.');
      enrollmentModal.style.display = 'none';

      // Refresh the courses display
      fetchCourses();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred during enrollment. Please try again.');
    }
  }

  // Helper function to truncate long descriptions
  function truncateDescription(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}); 