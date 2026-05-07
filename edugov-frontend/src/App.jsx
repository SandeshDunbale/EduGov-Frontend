import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Home from './pages/home/home';
// Layout Components
import Navbar from './component/layout/navbar/navbar';
import Sidebar from './component/layout/sidebar/sidebar';
import Footer from './component/layout/footer/footer';
import { AuthProvider } from './context/AuthContext';

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

// We moved the layout inside this component so we can read the URL
const AppContent = () => {
  const location = useLocation();
  const [currentRole, setCurrentRole] = useState('STUDENT');

  // 1. Define all public pages where the Sidebar should NOT appear
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact'];
  
  // 2. Check if the current URL is in that list
  const isPublicPage = publicRoutes.includes(location.pathname);

  return (
    <div className="App">
      {/* Global Top Navigation (Modal now lives inside here!) */}
      <Navbar />
      
      <div className="app-body">
        
        {/* Only render the Sidebar if we are on a secure dashboard page */}
        {!isPublicPage && <Sidebar role={currentRole} />}
        
        <main className="main-content">
          
          {/* Hide the Developer Test Dropdown on public pages too */}
          {!isPublicPage && (
            <div style={{ padding: '15px', backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', marginBottom: '20px', borderRadius: '8px', margin: '0 20px' }}>
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

          {/* React Router Page Routing */}
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* The catch-all route for your simulated dashboard pages */}
            <Route path="/*" element={<PageContent />} />
          </Routes>

        </main>
      </div>
      
      {/* Global Footer */}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* AppContent now lives inside the Router, allowing it to read the URL */}
      <AppContent />
    </BrowserRouter>
  );
}


export default App;