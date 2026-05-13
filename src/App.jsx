import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages & Components
import Home from './pages/home/Home';
import About from './pages/about/About';
import Committees from './pages/committees/Committees';
import Contact from './pages/contact/Contact';
import Navbar from './component/layout/navbar/navbar';
import Sidebar from './component/layout/sidebar/sidebar';
import Footer from './component/layout/footer/footer';

// Module 2 Components
import UserManagement from './component/Admin/UserManagement';
import StudentProfile from './component/profile/StudentProfile';
import FacultyProfile from './component/profile/FacultyProfile';
import LoginPage from './component/common/login';
import Register from './component/Registration/BasicDetails';

// 1. Admin Pages
import AdminPrograms from './pages/Univ_Admin/Programs/AdminPrograms';
import AdminCourses from './pages/Univ_Admin/Courses/AdminCourses';
import AdminEnrollments from './pages/Univ_Admin/Enrollments/AdminEnrollments';

// 2. Faculty Page
import FacultyAssignedCourses from "./pages/faculty/AssignedCourses/FacultyAssignedCourses";
import FacultyDashboard from './pages/faculty/Dashboard/FacultyDashboard';

// 3. Student Page
import StudentPrograms from './pages/Student/Programs/StudentPrograms';
import StudentDashboard from './pages/Student/Dashboard/StudentDashboard';

// Dummy Component to prove secure routing works
const PageContent = () => {
  const location = useLocation();
  return (
    <div style={{ marginTop: '20px', padding: '0 20px' }}>
      <h2>Simulated Dashboard Area</h2>
      <p style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', display: 'inline-block' }}>
        Current URL Path: <strong style={{ color: '#0284C7' }}>{location.pathname}</strong>
      </p>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();

  const [currentRole, setCurrentRole] = useState('STUDENT');

  // Pull the dynamically logged-in user from AuthContext
  const { user } = useAuth();

  // Define all public pages where the Sidebar should NOT appear
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact', '/login', '/register'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  return (
    <div className="App">
      <Navbar />
      <div className="app-body">
        {!isPublicPage && user && (
          <Sidebar role={user.role} user={user} />
        )}
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Public Pages */}
            <Route path="/about" element={<About />} /> 
            <Route path="/academic-programs" element={<Committees />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            
            {/* Secure / Profile Pages */}
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/faculty/profile" element={<FacultyProfile />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            
            {/* UNIVERSITY ADMIN GOVERNANCE ROUTES */}
            <Route path="/admin/programs/create" element={<AdminPrograms />} />
            <Route path="/admin/courses/create" element={<AdminCourses />} />
            <Route path="/admin/enrollments/approve" element={<AdminEnrollments />} />

            {/* FACULTY WORKSPACE ROUTES */}
            <Route path="/faculty/courses" element={<FacultyAssignedCourses />} />
            <Route path="/dashboard/faculty" element={<FacultyDashboard />} />

            {/* STUDENT WORKSPACE ROUTES */}
            <Route path="/student/programs" element={<StudentPrograms />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            
            {/* Catch-all route for dashboards */}
            <Route path="/*" element={<PageContent />} />
          </Routes>
        </main>
      </div>
      <div className="app-footer">
         <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;