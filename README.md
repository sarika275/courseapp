# Course Enrollment System

A web application for course enrollment built with Node.js, Express, MongoDB, and EJS templates.

## Features

- **Public Features:**
  - View available courses
  - Enroll in courses by providing basic details

- **Admin (Teacher) Features:**
  - Create, edit, and delete courses
  - View enrolled students
  - Dashboard with statistics
  - User authentication

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript, EJS templates
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Other:** Mongoose, Body-parser, Cors

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB Compass installed

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd courseapp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/courseapp
   ```

4. Start the application:
   ```
   node server.js
   ```

5. Access the application in your browser:
   ```
   http://localhost:3000
   ```

## Usage

### Public View

- Visit the homepage to see all available courses
- Click "Enroll Now" on a course to register
- Fill out the enrollment form with your details

### Admin View

- Click "Admin Login" in the navigation bar
- Register as a new admin/teacher if needed
- Login with your credentials
- Use the dashboard to manage courses and view enrollments

## Project Structure

- `models/` - Database models
- `controllers/` - Business logic
- `routes/` - API and view routes
- `views/` - EJS templates
- `public/` - Static assets (CSS, JavaScript)

## API Endpoints

### Courses

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a single course
- `POST /api/courses` - Create a new course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course
- `POST /api/courses/:id/enroll` - Enroll a student in a course

### Students

- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get a single student
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student
- `POST /api/students/:id/enroll` - Enroll a student in a course

### Admin

- `POST /admin/login` - Admin login
- `POST /admin/register` - Admin registration
- `GET /admin/dashboard` - Get dashboard data
- `GET /admin/enrolled-students` - Get all enrolled students for courses 