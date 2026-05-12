import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate  } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ManagerDashboard from './pages/manager/ManagerDashboard';
// Pages & Components
import Home from './pages/home/Home';
import Navbar from './component/layout/navbar/navbar';
import Sidebar from './component/layout/sidebar/sidebar';
import Footer from './component/layout/footer/footer';

// Your Mod 4 Components
import ProjectsPage from './pages/faculty/projects/ProjectsPage';
import CreateProjectPage from './pages/faculty/projects/CreateProjectPage';
import ProjectDetailsPage from './pages/faculty/projects/ProjectDetailsPage';
import EditProjectPage from './pages/faculty/projects/EditProjectPage';
import GrantsPage from './pages/faculty/grants/GrantsPage';
import ApproveGrantsPage from './pages/manager/ApproveGrantsPage';

// Dummy Component to prove secure routing works for unbuilt pages
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
  
  // Define all public pages where the Sidebar should NOT appear
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navbar />
      
      {/* We use flex-grow-1 to push the footer to the bottom */}
      <div className="app-body d-flex flex-grow-1">
        
        {/* 📍 Only render Sidebar if on a secure page AND the user is actually logged in */}
        {!isPublicPage && user && (
          <Sidebar role={user.role} user={user} />
        )}
        
        {/* Added w-100 to ensure main content takes up remaining width */}
        <main className="main-content w-100">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            {/* YOUR MOD 4 ROUTES */}
            <Route path="/faculty/projects" element={<ProjectsPage />} />
            <Route path="/faculty/projects/create" element={<CreateProjectPage />} />
            <Route path="/faculty/projects/edit/:projectId" element={<EditProjectPage />} />
            <Route path="/faculty/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/faculty/grants" element={<GrantsPage />} />
            <Route path="/manager/grants/approve" element={<ApproveGrantsPage />} />
            <Route path="/dashboard/manager" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            {/* The catch-all route for any other dashboard pages */}
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

export default App;