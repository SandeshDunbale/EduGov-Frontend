import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages & Components
import Home from './pages/home/home';
import Navbar from './component/layout/navbar/navbar';
import Sidebar from './component/layout/sidebar/sidebar';
import Footer from './component/layout/footer/footer';

// 1. Admin Pages
import AdminPrograms from './pages/Univ_Admin/Programs/AdminPrograms';
import AdminCourses from './pages/Univ_Admin/Courses/AdminCourses';
import AdminEnrollments from './pages/Univ_Admin/Enrollments/AdminEnrollments';

// 2. Faculty Page
import FacultyAssignedCourses from "./pages/faculty/AssignedCourses/FacultyAssignedCourses";
// 📍 ADDED: Faculty Dashboard Import
import FacultyDashboard from './pages/faculty/Dashboard/FacultyDashboard';

// 📍 3. Student Page - ADD THIS IMPORT
import StudentPrograms from './pages/Student/Programs/StudentPrograms';
// 📍 ADDED: Student Dashboard Import
import StudentDashboard from './pages/Student/Dashboard/StudentDashboard';

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
  const { user } = useAuth();

  const publicRoutes = ['/', '/about', '/academic-programs', '/contact'];
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

            {/* UNIVERSITY ADMIN GOVERNANCE ROUTES */}
            <Route path="/admin/programs/create" element={<AdminPrograms />} />
            <Route path="/admin/courses/create" element={<AdminCourses />} />
            <Route path="/admin/enrollments/approve" element={<AdminEnrollments />} />

            {/* FACULTY WORKSPACE ROUTES */}
            <Route path="/faculty/courses" element={<FacultyAssignedCourses />} />
            {/* 📍 ADDED: Faculty Dashboard Route */}
            <Route path="/dashboard/faculty" element={<FacultyDashboard />} />

            {/* 📍 STUDENT WORKSPACE ROUTES */}
            <Route path="/student/programs" element={<StudentPrograms />} />
            {/* 📍 ADDED: Student Dashboard Route */}
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            
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