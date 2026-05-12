import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// Pages & Components
import Home from './pages/home/Home';
import Navbar from './component/layout/navbar/navbar';
import Sidebar from './component/layout/sidebar/sidebar';
import Footer from './component/layout/footer/footer';
import ManageResources from './pages/manager/resources/ManageResources';
import ManageInfrastructure from './pages/manager/resources/ManageInfrastructure';
import ManagerRequestsPage from './pages/manager/resources/ManagerRequestsPage';
import StudentResourceRequest from './pages/student/resources/StudentResourceRequest';
import FacultyInfrastructureRequest from './pages/faculty/resources/FacultyInfrastructureRequest';

// Dummy Component to prove secure routing works
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
  
  // 📍 Pull the dynamically logged-in user from AuthContext
  const { user } = useAuth();

  // Define public pages where Sidebar is hidden
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navbar />
      
      <div className="app-body d-flex flex-grow-1">
        
        {/* 📍 Only render Sidebar if on a secure page AND the user is actually logged in */}
        {!isPublicPage && user && (
          <Sidebar role={user.role} user={user} />
        )}
        
        <main className="main-content w-100">
          <Routes>
  <Route path="/" element={<Home />} />

  {/* Catch-all route for dashboards */}
  <Route path="/*" element={<PageContent />} />

  <Route
    path="/manager/resources"
    element={
      user?.role === "PROG_MANAGER" ? (
        <ManageResources />
      ) : (
        <PageContent />
      )
    }
  />

  <Route
    path="/manager/infrastructure"
    element={
      user?.role === "PROG_MANAGER" ? (
        <ManageInfrastructure />
      ) : (
        <PageContent />
      )
    }
  />

  <Route
    path="/manager/requests"
    element={
      user?.role === "PROG_MANAGER" ? (
        <ManagerRequestsPage role={user?.role} />
      ) : (
        <PageContent />
      )
    }
  />

  <Route
    path="/student/request"
    element={
      user?.role === "STUDENT" ? (
        <StudentResourceRequest />
      ) : (
        <PageContent />
      )
    }
  />

  <Route
    path="/faculty/request"
    element={
      user?.role === "FACULTY" ? (
        <FacultyInfrastructureRequest />
      ) : (
        <PageContent />
      )
    }
  />
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