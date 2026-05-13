import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages & Components
import Home from './pages/home/Home';
import Navbar from './component/layout/navbar/navbar';
import Sidebar from './component/layout/sidebar/sidebar';
import Footer from './component/layout/footer/footer';
import UserManagement from './component/Admin/UserManagement';
import { AuthProvider } from './context/AuthContext';
import StudentProfile from './component/profile/StudentProfile';

// Import your other components like Sidebar, Navbar, Login etc.

import FacultyProfile from './component/profile/FacultyProfile';
// Correct paths for App.jsx (located in src folder)
import LoginPage from './component/common/login';
import Register from './component/Registration/BasicDetails';

// Dummy Component to prove routing works inside your layout



const PageContent = () => {
  const location = useLocation();
  return (
    <div style={{ marginTop: '20px', padding: '0 20px' }}>
      <h2>Simulated Dashboard Area</h2>
      <p style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', display: 'inline-block' }}>
        Current URL Path: <strong style={{ color: '#0284C7' }}>{location.pathname}</strong>
      </p>
      <p style={{ color: '#666', marginTop: '10px' }}>
        Your secure governance modules will render here after login.
      </p>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();

  const [currentRole, setCurrentRole] = useState('STUDENT');

  // 1. Define all public pages where the Sidebar should NOT appear
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact','/login', '/register'];

  
  // 📍 Pull the dynamically logged-in user from AuthContext
  const { user } = useAuth();

  // Define public pages where Sidebar is hidden
  // const publicRoutes = ['/', '/about', '/academic-programs', '/contact'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  return (
    <div className="App">
      <Navbar />
      
      <div className="app-body">
        
        {/* 📍 Only render Sidebar if on a secure page AND the user is actually logged in */}
        {!isPublicPage && user && (
          <Sidebar role={user.role} user={user} />
        )}
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />



                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<Register />} />
                    
                      <Route path="/student/profile" element={<StudentProfile />} />
                      <Route path="/faculty/profile" element={<FacultyProfile />} />
                      <Route path="/admin/user-management" element={<UserManagement />} />
 


 
            {/* The catch-all route for your simulated dashboard pages */}
            {/* Catch-all route for dashboards */}
            <Route path="/*" element={<PageContent />} />


  
          </Routes>
        </main>

      </div>
      <Footer />
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

// 📍 Notice NO ReactDOM.createRoot here. That belongs in index.js/main.jsx!
export default App;