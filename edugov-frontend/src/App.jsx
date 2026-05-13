import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Layout Components
import Navbar from './component/layout/navbar/navbar';
import Sidebar from './component/layout/sidebar/sidebar';
import Footer from './component/layout/footer/footer';

// Pages
import Home from './pages/home/home.jsx';

// --- Compliance Officer Pages ---
import ComplianceDashboard from './pages/compliance/ComplianceDashboard.jsx';
import SystemScan from './pages/compliance/Systemscan.jsx'; // Check your folder if this is SystemScan.jsx
import ComplianceRecords from './pages/compliance/ComplianceRecords.jsx';
import ManualEntry from './pages/compliance/Manualentry.jsx'; // Check your folder if this is ManualEntry.jsx
import ComplianceAuditPage from './pages/compliance/ComplianceAuditPage.jsx'; // ✅ Added for "Audit Management"

// --- Government Auditor Pages ---
import AuditorDashboard from './pages/auditor/AuditorDashboard.jsx';
import PendingAudits from './pages/auditor/PendingAudits.jsx'; // ✅ Fixed Vite Import Error
import SubmitApprovals from './pages/auditor/SubmitApprovals.jsx';
import AuditorAuditList from './pages/auditor/AuditorAuditList.jsx'; // ✅ Fixed to use the Read-Only component

// Placeholder for unmapped secure paths
const PageContent = () => {
  const location = useLocation();
  return (
    <div style={{ marginTop: '20px', padding: '0 20px' }}>
      <h2>Secure Governance Module</h2>
      <p style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', display: 'inline-block' }}>
        Current Path: <strong style={{ color: '#0284C7' }}>{location.pathname}</strong>
      </p>
      <p style={{ color: '#666', marginTop: '10px' }}>
        Authorized content for your role is being rendered.
      </p>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Developer simulation role
  const [simulatedRole, setSimulatedRole] = useState('STUDENT');

  // Define public pages where Sidebar/DevTools should NOT appear
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  // Use real user role if logged in, otherwise use simulated role
  const activeRole = user ? user.role : simulatedRole;

  return (
    <div className="App">
      <Navbar />
      
      <div className="app-body" style={{ display: 'flex' }}>
        {/* Sidebar: Only visible on private/dashboard pages */}
        {!isPublicPage && <Sidebar role={activeRole} user={user} />}
        
        <main className="main-content" style={{ flex: 1 }}>
          {/* Developer Role Switcher: Only visible if NOT logged in and on private pages */}
          {!isPublicPage && !user && (
            <div style={{ padding: '15px', backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', marginBottom: '20px', borderRadius: '8px', margin: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontWeight: '600' }}>Dev Test Mode:</span>
                <select 
                  value={simulatedRole}
                  onChange={(e) => setSimulatedRole(e.target.value)}
                  style={{ padding: '6px', borderRadius: '4px' }}
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
            
            {/* 👤 COMPLIANCE OFFICER Routes */}
            <Route path="/compliance/dashboard" element={<ComplianceDashboard />} />
            <Route path="/compliance/scan" element={<SystemScan />} />
            <Route path="/compliance/records" element={<ComplianceRecords />} />
            <Route path="/compliance/entry" element={<ManualEntry />} />
            <Route path="/compliance/audit-management" element={<ComplianceAuditPage />} /> {/* ✅ New Menu Linked */}
            
            {/* 👤 GOVT AUDITOR Routes */}
            <Route path="/auditor/dashboard" element={<AuditorDashboard />} />
            <Route path="/auditor/pending" element={<PendingAudits />} />
            <Route path="/auditor/approvals" element={<SubmitApprovals />} />
            <Route path="/auditor/audits" element={<AuditorAuditList />} /> {/* ✅ Read-Only Linked */}
            
            {/* Fallback for other internal paths */}
            {!isPublicPage && <Route path="/*" element={<PageContent />} />}
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