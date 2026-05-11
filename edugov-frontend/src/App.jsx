import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Layout
import Navbar from "./component/layout/navbar/navbar";
import Sidebar from "./component/layout/sidebar/sidebar";
import Footer from "./component/layout/footer/footer";

// Core Pages
import Home from "./pages/home/Home";

// ✅ YOUR MODULE (Resource Management)
import ManageResources from "./pages/manager/resources/ManageResources";
import ManageInfrastructure from "./pages/manager/resources/ManageInfrastructure";
import ManagerRequestsPage from "./pages/manager/resources/ManagerRequestsPage";
import RequestFormPage from "./pages/request/RequestFormPage";

// ✅ TEAMMATE MODULE (Projects / Grants)
// import ProjectsPage from "./pages/faculty/projects/ProjectsPage";
// import CreateProjectPage from "./pages/faculty/projects/CreateProjectPage";
// import ProjectDetailsPage from "./pages/faculty/projects/ProjectDetailsPage";
// import EditProjectPage from "./pages/faculty/projects/EditProjectPage";
// import GrantsPage from "./pages/faculty/grants/GrantsPage";
// import ApproveGrantsPage from "./pages/manager/ApproveGrantsPage";
// ManagerDashboard from "./pages/manager/ManagerDashboard";

// ✅ Fallback Page
const PageContent = () => {
  const location = useLocation();
  return (
    <div style={{ marginTop: "20px", padding: "20px" }}>
      <h2>Simulated Dashboard Area</h2>
      <p style={{ padding: "15px", backgroundColor: "#fff", border: "1px solid #ddd" }}>
        Current URL: <b>{location.pathname}</b>
      </p>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();

  const [currentRole, setCurrentRole] = useState("STUDENT");

  // ✅ Public pages
  const publicRoutes = ["/", "/about", "/academic-programs", "/contact"];
  const isPublicPage = publicRoutes.includes(location.pathname);

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navbar />

      <div className="app-body d-flex flex-grow-1">

        {/* ✅ Sidebar only once */}
        {!isPublicPage && user && (
          <Sidebar role={currentRole} user={user} />
        )}

        <main className="main-content w-100">

          {/* ✅ Dev Role Switch */}
          {!isPublicPage && (
            <div
              style={{
                padding: "10px",
                background: "#f8fafc",
                borderBottom: "1px solid #ddd",
                marginBottom: "15px",
              }}
            >
              <span style={{ marginRight: "10px" }}>Test Role:</span>

              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="PROG_MANAGER">Program Manager</option>
                <option value="UNIV_ADMIN">University Admin</option>
                <option value="COMPLIANCE_OFFICER">Compliance</option>
                <option value="GOVT_AUDITOR">Auditor</option>
              </select>
            </div>
          )}

          {/* ✅ ROUTES */}
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Home />} />

            {/* ✅ RESOURCE SYSTEM */}
            <Route path="/manager/resources"
              element={currentRole === "PROG_MANAGER" ? <ManageResources /> : <PageContent />}
            />
            <Route path="/manager/infrastructure"
              element={currentRole === "PROG_MANAGER" ? <ManageInfrastructure /> : <PageContent />}
            />
            <Route path="/manager/requests"
              element={currentRole === "PROG_MANAGER" ? <ManagerRequestsPage role={currentRole} /> : <PageContent />}
            />

            <Route path="/student/request"
              element={currentRole === "STUDENT" ? <RequestFormPage role="STUDENT" /> : <PageContent />}
            />

            <Route path="/faculty/request"
              element={currentRole === "FACULTY" ? <RequestFormPage role="FACULTY" /> : <PageContent />}
            />

            {/* ✅ TEAMMATE MODULE */}
            {/* <Route path="/faculty/projects" element={<ProjectsPage />} />
            <Route path="/faculty/projects/create" element={<CreateProjectPage />} />
            <Route path="/faculty/projects/edit/:projectId" element={<EditProjectPage />} />
            <Route path="/faculty/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/faculty/grants" element={<GrantsPage />} />
            <Route path="/manager/grants/approve" element={<ApproveGrantsPage />} /> */}
            {/* <Route path="/manager/dashboard" element={<ManagerDashboard />} /> */}

            {/* ✅ FALLBACK */}
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
