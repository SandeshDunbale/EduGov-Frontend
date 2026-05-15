import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
import LoginPage from './component/common/login';
import Register from './component/Registration/BasicDetails';

// 1. Admin Pages
import AdminPrograms from './pages/Univ_Admin/Programs/AdminPrograms';
import AdminCourses from './pages/Univ_Admin/Courses/AdminCourses';
import AdminEnrollments from './pages/Univ_Admin/Enrollments/AdminEnrollments';
import AdminReports from './pages/Univ_Admin/Reports/AdminReports'; // Added Import
import AdminDashboard from './pages/Univ_Admin/Dashboard/AdminDashboard'; // <-- NEWLY ADDED IMPORT

// 2. Faculty Page
import FacultyAssignedCourses from "./pages/faculty/AssignedCourses/FacultyAssignedCourses";
import FacultyDashboard from './pages/faculty/Dashboard/FacultyDashboard';

// 3. Student Page
import StudentPrograms from './pages/Student/Programs/StudentPrograms';
import StudentDashboard from './pages/Student/Dashboard/StudentDashboard';

// 4. Mod 4 Components (Vaishnavi)
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

// Dummy Component to prove secure routing works for unbuilt pages
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

const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Developer simulation role
  const [simulatedRole, setSimulatedRole] = useState('STUDENT');

  // Define all public pages where the Sidebar should NOT appear
  const publicRoutes = ['/', '/about', '/academic-programs', '/contact', '/login', '/register'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  // Use real user role if logged in, otherwise use simulated role
  const activeRole = user ? user.role : simulatedRole;

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navbar />
      
      {/* We use flex-grow-1 to push the footer to the bottom */}
      <div className="app-body d-flex flex-grow-1">
        
        {/* Only render Sidebar if on a secure page */}
        {!isPublicPage && (
          <Sidebar role={activeRole} user={user} />
        )}
        
        {/* Added w-100 to ensure main content takes up remaining width */}
        <main className="main-content w-100">
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
            <Route path="/dashboard/admin" element={<AdminDashboard />} /> {/* <-- NEWLY ADDED ROUTE */}
            <Route path="/admin/programs/create" element={<AdminPrograms />} />
            <Route path="/admin/courses/create" element={<AdminCourses />} />
            <Route path="/admin/enrollments/approve" element={<AdminEnrollments />} />
            <Route path="/admin/reports" element={<AdminReports />} /> {/* Added Route */}

            {/* FACULTY WORKSPACE ROUTES */}
            <Route path="/faculty/courses" element={<FacultyAssignedCourses />} />
            <Route path="/dashboard/faculty" element={<FacultyDashboard />} />

            {/* STUDENT WORKSPACE ROUTES */}
            <Route path="/student/programs" element={<StudentPrograms />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />

            {/* MOD 4 ROUTES (Projects, Grants, Manager) */}
            <Route path="/faculty/projects" element={<ProjectsPage />} />
            <Route path="/faculty/projects/create" element={<CreateProjectPage />} />
            <Route path="/faculty/projects/edit/:projectId" element={<EditProjectPage />} />
            <Route path="/faculty/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/faculty/grants" element={<GrantsPage />} />
            <Route path="/manager/grants/approve" element={<ApproveGrantsPage />} />
            <Route path="/dashboard/manager" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />

            {/* RESOURCES & INFRASTRUCTURE ROUTES */}
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

            {/* 👤 COMPLIANCE OFFICER Routes */}
            <Route path="/dashboard/compliance" element={<ComplianceDashboard />} />
            <Route path="/compliance/scan" element={<SystemScan />} />
            <Route path="/compliance/records" element={<ComplianceRecords />} />
            <Route path="/compliance/entry" element={<ManualEntry />} />
            <Route path="/compliance/audit-management" element={<ComplianceAuditPage />} /> 
            
            {/* 👤 GOVT AUDITOR Routes */}
            <Route path="/dashboard/auditor" element={<AuditorDashboard />} />
            <Route path="/auditor/dashboard" element={<AuditorDashboard />} />
            <Route path="/auditor/pending" element={<PendingAudits />} />
            <Route path="/auditor/approvals" element={<SubmitApprovals />} />
            <Route path="/auditor/audits" element={<AuditorAuditList />} /> 
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;