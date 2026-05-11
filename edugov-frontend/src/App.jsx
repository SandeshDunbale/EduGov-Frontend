import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './component/layout/navbar/navbar';
import Sidebar from './component/layout/sidebar/sidebar';
import Footer from './component/layout/footer/footer';

// General Pages
import Home from './pages/home/home';

// Compliance Pages
import ComplianceDashboard from './pages/compliance/dashboard';
import SystemScan from './pages/compliance/scan';
import ComplianceRecords from './pages/compliance/records';
import ManualEntry from './pages/compliance/entry';

// Auditor Pages
import AuditorDashboard from './pages/auditor/dashboard';
import PendingAudits from './pages/auditor/pending';
import SubmitApprovals from './pages/auditor/approvals';
import AuditList from './pages/auditor/AuditList'; // 👈 Added here

// Dummy Component for testing
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

  // Define all public pages where the Sidebar should NOT appear
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  return (
    <div className="App">
      <Navbar />
      
      <div className="app-body">
        {/* Only render Sidebar on non-public pages */}
        {!isPublicPage && <Sidebar role={currentRole} />}
        
        <main className="main-content">
          {/* Developer Test Dropdown */}
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

          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Compliance Officer Routes */}
            <Route path="/compliance/dashboard" element={<ComplianceDashboard />} />
            <Route path="/compliance/scan" element={<SystemScan />} />
            <Route path="/compliance/records" element={<ComplianceRecords />} />
            <Route path="/compliance/entry" element={<ManualEntry />} />
            
            {/* Government Auditor Routes */}
            <Route path="/auditor/dashboard" element={<AuditorDashboard />} />
            <Route path="/auditor/pending" element={<PendingAudits />} />
            <Route path="/auditor/approvals" element={<SubmitApprovals />} />
            <Route path="/auditor/audits" element={<AuditList />} /> {/* 👈 Backend route */}
            
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