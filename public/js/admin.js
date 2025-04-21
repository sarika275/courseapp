document.addEventListener('DOMContentLoaded', () => {
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminRegisterForm = document.getElementById('adminRegisterForm');
  const loginSection = document.querySelector('.auth-section');
  const registerSection = document.getElementById('registerSection');
  const registerLink = document.getElementById('registerLink');
  const loginLink = document.getElementById('loginLink');
  const errorMessage = document.getElementById('errorMessage');
  const registerErrorMessage = document.getElementById('registerErrorMessage');

  // Handle form switching
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'flex';
  });

  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.display = 'none';
    loginSection.style.display = 'flex';
  });

  // Handle admin login
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch('/admin/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }
      
      const data = await response.json();
      
      // Save user data to localStorage for session management
      localStorage.setItem('adminUser', JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        role: data.user.role
      }));
      
      // Redirect to dashboard
      window.location.href = '/admin/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      errorMessage.textContent = error.message || 'Login failed. Please try again.';
    }
  });

  // Handle admin registration
  adminRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate password match
    if (password !== confirmPassword) {
      registerErrorMessage.textContent = 'Passwords do not match';
      return;
    }
    
    try {
      const response = await fetch('/admin/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username, 
          password,
          role: 'teacher' // Default role
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Display success message
      alert('Registration successful! You can now log in.');
      
      // Switch to login form
      registerSection.style.display = 'none';
      loginSection.style.display = 'flex';
      
      // Pre-fill username
      document.getElementById('username').value = username;
    } catch (error) {
      console.error('Registration error:', error);
      registerErrorMessage.textContent = error.message || 'Registration failed. Please try again.';
    }
  });

  // Check if user is already logged in
  const checkAuth = () => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      window.location.href = '/admin/dashboard';
    }
  };
  
  // Check auth on page load
  checkAuth();
}); 