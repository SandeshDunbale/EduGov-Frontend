import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Layout Components
import Navbar from './component/layout/navbar/navbar';
import Sidebar from './component/layout/sidebar/sidebar';
import Footer from './component/layout/footer/footer';

// Pages
import Home from './pages/home/home';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';

// Dummy Component for unbuilt pages
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
  const { user } = useAuth(); // Pull real logged-in user
  
  // State for Developer Simulation Mode
  const [currentRole, setCurrentRole] = useState('UNIV_ADMIN');

  // Define public pages where Sidebar/Test Mode is hidden
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navbar />
      
      <div className="app-body d-flex flex-grow-1">
        {/* Render Sidebar on secure pages. Uses currentRole for simulation or user.role for real auth */}
        {!isPublicPage && (
          <Sidebar role={user ? user.role : currentRole} />
        )}
        
        <main className="main-content w-100">
          {/* Developer Test Mode Dropdown (Hidden on public pages) */}
          {!isPublicPage && (
            <div style={{ padding: '15px', backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', marginBottom: '20px', borderRadius: '8px', margin: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: '600', color: '#1E293B' }}>Developer Test Mode:</span>
                <label style={{ fontSize: '0.9rem', color: '#475569' }}>Simulate Role As:</label>
                <select 
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="UNIV_ADMIN">University Admin</option>
                  <option value="PROG_MANAGER">Program Manager</option>
                  <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
                  <option value="GOVT_AUDITOR">Government Auditor</option>
                </select>
              </div>
            </div>
          )}

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/reports" element={<AdminReports />} />

            {/* Catch-all */}
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
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;