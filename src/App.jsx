import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ForgotCredentialsModal from './component/common/ForgotCredentialsModal';
 
// Public Pages & Components
import Home from './pages/home/home';
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
import Register from './component/Registration/BasicDetails';
 
// 1. Admin Pages
import AdminPrograms from './pages/Univ_Admin/Programs/AdminPrograms';
import AdminCourses from './pages/Univ_Admin/Courses/AdminCourses';
import AdminEnrollments from './pages/Univ_Admin/Enrollments/AdminEnrollments';
import AdminReports from './pages/Univ_Admin/Reports/AdminReports';
import AdminDashboard from './pages/Univ_Admin/Dashboard/AdminDashboard';
 
// 2. Faculty Page
import FacultyAssignedCourses from "./pages/faculty/AssignedCourses/FacultyAssignedCourses";
import FacultyDashboard from './pages/faculty/Dashboard/FacultyDashboard';
 
// 3. Student Page
import StudentPrograms from './pages/Student/Programs/StudentPrograms';
import StudentDashboard from './pages/Student/Dashboard/StudentDashboard';
 
// 4. Mod 4 Components 
import ProjectsPage from './pages/faculty/projects/ProjectsPage';
import CreateProjectPage from './pages/faculty/projects/CreateProjectPage';
import ProjectDetailsPage from './pages/faculty/projects/ProjectDetailsPage';
import EditProjectPage from './pages/faculty/projects/EditProjectPage';
import GrantsPage from './pages/faculty/grants/GrantsPage';
import ApproveGrantsPage from './pages/manager/ApproveGrantsPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
 
// Resources & Infrastructure Components
import ManageResources from './pages/manager/resources/ManageResources';
import ManageInfrastructure from './pages/manager/resources/ManageInfrastructure';
import ManagerRequestsPage from './pages/manager/resources/ManagerRequestsPage';
import StudentResourceRequest from './pages/student/resources/StudentResourceRequest';
import FacultyInfrastructureRequest from './pages/faculty/resources/FacultyInfrastructureRequest';
 
// --- Compliance Officer Pages ---
import ComplianceDashboard from './pages/compliance/ComplianceDashboard.jsx';
import SystemScan from './pages/compliance/Systemscan.jsx';
import ComplianceRecords from './pages/compliance/ComplianceRecords.jsx';
import ManualEntry from './pages/compliance/Manualentry.jsx';
import ComplianceAuditPage from './pages/compliance/ComplianceAuditPage.jsx';
 
// --- Government Auditor Pages ---
import AuditorDashboard from './pages/auditor/AuditorDashboard.jsx';
import PendingAudits from './pages/auditor/PendingAudits.jsx';
import SubmitApprovals from './pages/auditor/SubmitApprovals.jsx';
import AuditorAuditList from './pages/auditor/AuditorAuditList.jsx';
import AdminModal from './component/common/AdminModal.jsx';
 
// Dummy Component to prove secure governance routing works for unauthorized cross-viewing
const PageContent = () => {
  const location = useLocation();
  return (
    <div style={{ marginTop: '20px', padding: '0 20px' }}>
      <h2>Secure Governance Module</h2>
      <p style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', display: 'inline-block' }}>
        Current URL Path: <strong style={{ color: '#0284C7' }}>{location.pathname}</strong>
      </p>
      <p style={{ color: '#666', marginTop: '10px' }}>
        Authorized content for your role is being rendered.
      </p>
    </div>
  );
};
 
//  NEW: Wrapper component to handle swapping between Login and Forgot Modals
const LoginView = () => {
  const navigate = useNavigate();
  const [showForgotModal, setShowForgotModal] = useState(false);
 
  return (
    <>
      <Home />
 
      {/* Show Admin Login Modal by default */}
      {!showForgotModal && (
        <AdminModal
          isOpen={true}
          onClose={() => navigate('/')}
          onForgotClick={() => setShowForgotModal(true)}
        />
      )}
 
      {/* Show Forgot Credentials Modal when triggered */}
      {showForgotModal && (
        <ForgotCredentialsModal
          isOpen={true}
          onClose={() => navigate('/')}
          onBackToLogin={() => setShowForgotModal(false)}
        />
      )}
    </>
  );
};
 
// INLINE PROTECTED ROUTE INTERCEPTOR
const ProtectedRoute = ({ children, allowedRoles, activeRole }) => {
  const { user } = useAuth();
 
  if (!user && !activeRole) {
    return <Navigate to="/login" replace />;
  }
 
  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    return <Navigate to="/" replace />;
  }
 
  return children;
};
 
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const [simulatedRole, setSimulatedRole] = useState('STUDENT');
 
  // NEW STATE: Controls the mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact', '/login', '/register'];
  const isPublicPage = publicRoutes.includes(location.pathname);
 
  const activeRole = user ? user.role : simulatedRole;
 
  return (
    <div className="App d-flex flex-column min-vh-100">
     
      {/*  PASSED PROPS: Wiring up the hamburger menu toggle */}
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
 
      <div className="app-body d-flex flex-grow-1" style={{ position: 'relative' }}>
        {!isPublicPage && (
          /*  PASSED PROPS: Telling the sidebar when to show/hide on mobile */
          <Sidebar
            role={activeRole}
            user={user}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
 
        <main className="main-content w-100">
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
            <Route path="/about" element={<About />} />
            <Route path="/academic-programs" element={<Committees />} />
            <Route path="/contact" element={<Contact />} />
 
            {/* Login & Register */}
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<Register />} />
 
            {/* Secure / Profile Pages */}
            <Route path="/student/profile" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['STUDENT', 'ROLE_STUDENT']}><StudentProfile /></ProtectedRoute>} />
            <Route path="/faculty/profile" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['FACULTY', 'ROLE_FACULTY']}><FacultyProfile /></ProtectedRoute>} />
            <Route path="/admin/user-management" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['UNIV_ADMIN', 'ROLE_UNIV_ADMIN']}><UserManagement /></ProtectedRoute>} />
 
            {/* UNIVERSITY ADMIN GOVERNANCE ROUTES */}
            <Route path="/dashboard/admin" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['UNIV_ADMIN', 'ROLE_UNIV_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/programs/create" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['UNIV_ADMIN', 'ROLE_UNIV_ADMIN']}><AdminPrograms /></ProtectedRoute>} />
            <Route path="/admin/courses/create" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['UNIV_ADMIN', 'ROLE_UNIV_ADMIN']}><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/enrollments/approve" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['UNIV_ADMIN', 'ROLE_UNIV_ADMIN']}><AdminEnrollments /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['UNIV_ADMIN', 'ROLE_UNIV_ADMIN']}><AdminReports /></ProtectedRoute>} />
 
            {/* FACULTY WORKSPACE ROUTES */}
            <Route path="/faculty/courses" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['FACULTY', 'ROLE_FACULTY']}><FacultyAssignedCourses /></ProtectedRoute>} />
            <Route path="/dashboard/faculty" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['FACULTY', 'ROLE_FACULTY']}><FacultyDashboard /></ProtectedRoute>} />
 
            {/* STUDENT WORKSPACE ROUTES */}
            <Route path="/student/programs" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['STUDENT', 'ROLE_STUDENT']}><StudentPrograms /></ProtectedRoute>} />
            <Route path="/dashboard/student" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['STUDENT', 'ROLE_STUDENT']}><StudentDashboard /></ProtectedRoute>} />
 
            {/* MOD 4 ROUTES (Projects, Grants, Manager) */}
            <Route path="/faculty/projects" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['FACULTY', 'ROLE_FACULTY']}><ProjectsPage /></ProtectedRoute>} />
            <Route path="/faculty/projects/create" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['FACULTY', 'ROLE_FACULTY']}><CreateProjectPage /></ProtectedRoute>} />
            <Route path="/faculty/projects/edit/:projectId" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['FACULTY', 'ROLE_FACULTY']}><EditProjectPage /></ProtectedRoute>} />
            <Route path="/faculty/projects/:projectId" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['FACULTY', 'ROLE_FACULTY']}><ProjectDetailsPage /></ProtectedRoute>} />
            <Route path="/faculty/grants" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['FACULTY', 'ROLE_FACULTY']}><GrantsPage /></ProtectedRoute>} />
            <Route path="/manager/grants/approve" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['PROG_MANAGER', 'ROLE_PROG_MANAGER']}><ApproveGrantsPage /></ProtectedRoute>} />
            <Route path="/dashboard/manager" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/manager/dashboard" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['PROG_MANAGER', 'ROLE_PROG_MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
 
            {/* RESOURCES & INFRASTRUCTURE ROUTES */}
            <Route path="/manager/resources" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['PROG_MANAGER', 'ROLE_PROG_MANAGER']}> {user?.role === "PROG_MANAGER" ? (<ManageResources />) : (<PageContent />)} </ProtectedRoute>} />
            <Route path="/manager/infrastructure" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['PROG_MANAGER', 'ROLE_PROG_MANAGER']}> {user?.role === "PROG_MANAGER" ? (<ManageInfrastructure />) : (<PageContent />)} </ProtectedRoute>} />
            <Route path="/manager/requests" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['PROG_MANAGER', 'ROLE_PROG_MANAGER']}> <ManagerRequestsPage role={user?.role} /> </ProtectedRoute>} />
            <Route path="/student/request" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['STUDENT', 'ROLE_STUDENT']}> {user?.role === "STUDENT" ? (<StudentResourceRequest />) : (<PageContent />)} </ProtectedRoute>} />
            <Route path="/faculty/request" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['FACULTY', 'ROLE_FACULTY']}> {user?.role === "FACULTY" ? (<FacultyInfrastructureRequest />) : (<PageContent />)} </ProtectedRoute>} />
 
            {/* 👤 COMPLIANCE OFFICER Routes */}
            <Route path="/dashboard/compliance" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['COMPLIANCE_OFFICER', 'ROLE_COMPLIANCE_OFFICER']}><ComplianceDashboard /></ProtectedRoute>} />
            <Route path="/compliance/scan" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['COMPLIANCE_OFFICER', 'ROLE_COMPLIANCE_OFFICER']}><SystemScan /></ProtectedRoute>} />
            <Route path="/compliance/records" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['COMPLIANCE_OFFICER', 'ROLE_COMPLIANCE_OFFICER']}><ComplianceRecords /></ProtectedRoute>} />
            <Route path="/compliance/entry" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['COMPLIANCE_OFFICER', 'ROLE_COMPLIANCE_OFFICER']}><ManualEntry /></ProtectedRoute>} />
            <Route path="/compliance/audit-management" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['COMPLIANCE_OFFICER', 'ROLE_COMPLIANCE_OFFICER']}><ComplianceAuditPage /></ProtectedRoute>} />
 
            {/* 👤 GOVT AUDITOR Routes */}
            <Route path="/dashboard/auditor" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['GOVT_AUDITOR', 'ROLE_GOVT_AUDITOR']}><AuditorDashboard /></ProtectedRoute>} />
            <Route path="/auditor/dashboard" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['GOVT_AUDITOR', 'ROLE_GOVT_AUDITOR']}><AuditorDashboard /></ProtectedRoute>} />
            <Route path="/auditor/pending" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['GOVT_AUDITOR', 'ROLE_GOVT_AUDITOR']}><PendingAudits /></ProtectedRoute>} />
            <Route path="/auditor/approvals" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['GOVT_AUDITOR', 'ROLE_GOVT_AUDITOR']}><SubmitApprovals /></ProtectedRoute>} />
            <Route path="/auditor/audits" element={<ProtectedRoute activeRole={activeRole} allowedRoles={['GOVT_AUDITOR', 'ROLE_GOVT_AUDITOR']}><AuditorAuditList /></ProtectedRoute>} />
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
 
export default App;