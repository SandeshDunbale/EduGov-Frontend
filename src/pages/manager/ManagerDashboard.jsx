import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { ProjectAPI } from '../../services/projectService'; 
import { GrantAPI } from '../../services/grantService'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const ManagerDashboard = () => {
  const { user } = useAuth(); 
  
  const [pendingApps, setPendingApps] = useState([]);
  const [historyApps, setHistoryApps] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('ALL'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const currentUserId = user?.userId || user?.id;
    if (currentUserId) {
      fetchDashboardData(currentUserId);
    }
  }, [user]);

  const fetchDashboardData = async (managerId) => {
    setLoading(true);
    try {
      // 1. Fetch Pending (unchanged)
      const pendingData = await GrantAPI.getPendingApplications();
      setPendingApps(pendingData || []);

      // 2. Fetch History using the specific MANAGER endpoint you showed me!
      const historyData = await GrantAPI.getManagerDecisionHistory(managerId);
      console.log("DEBUG - Manager History Data:", historyData);
      setHistoryApps(historyData || []);

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (applicationId, decision) => {
    const isConfirmed = window.confirm(`Are you sure you want to ${decision} this application?`);
    if (!isConfirmed) return;

    try {
      const managerId = user?.userId || user?.id;
      await GrantAPI.submitDecision(applicationId, managerId, decision);
      
      alert(`Application successfully ${decision}!`);
      fetchDashboardData(managerId); 
    } catch (err) {
      alert("Failed to process decision. Please check your connection.");
    }
  };

  const handleViewDetails = async (app) => {
    setSelectedApp(app);
    setShowModal(true);
    setLoadingDetails(true);
    setProjectDetails(null); 
    
    try {
      const projectIdToFetch = app.project?.projectId || app.projectId;
      if (projectIdToFetch) {
        const fullProjectData = await ProjectAPI.getProjectById(projectIdToFetch);
        setProjectDetails(fullProjectData);
      }
    } catch (error) {
      console.error("Failed to load project details", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredHistory = historyApps.filter(app => {
    if (historyFilter === 'ALL') return true;
    return app.status === historyFilter;
  });

  if (loading) return <div className="p-4 text-center mt-5 spinner-border text-primary" role="status"></div>;
  if (error) return <div className="p-4 text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#F8FAFC' }}>
      <h2 className="mb-4" style={{ color: '#1E293B', fontWeight: 'bold' }}>Manager Workspace</h2>

      {/* KPI CARDS */}
      <div className="row mb-5 g-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-warning border-4">
            <div className="card-body">
              <h6 className="text-muted">Pending Approvals</h6>
              <h3 className="mb-0">{pendingApps.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-success border-4">
            <div className="card-body">
              <h6 className="text-muted">Approved Grants</h6>
              <h3 className="mb-0">{historyApps.filter(a => a.status === 'APPROVED').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-primary border-4">
            <div className="card-body">
              <h6 className="text-muted">Total Value Approved</h6>
              <h3 className="mb-0 text-success">
                ₹{historyApps
                  .filter(a => a.status === 'APPROVED')
                  .reduce((sum, app) => sum + (Number(app.requestedAmount) || 0), 0)
                  .toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* DECISION HISTORY SECTION */}
      <div className="d-flex justify-content-between align-items-end mb-3">
        <h4 className="mb-0" style={{ color: '#334155' }}>My Decision History</h4>
        <div className="btn-group shadow-sm">
          <button className={`btn btn-sm ${historyFilter === 'ALL' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setHistoryFilter('ALL')}>All</button>
          <button className={`btn btn-sm ${historyFilter === 'APPROVED' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setHistoryFilter('APPROVED')}>Approved</button>
          <button className={`btn btn-sm ${historyFilter === 'REJECTED' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setHistoryFilter('REJECTED')}>Rejected</button>
        </div>
      </div>
      
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>App ID</th>
                <th>Project Title</th>
                <th>Decision Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((app) => (
                  <tr key={app.applicationID || app.id}>
                    <td>{app.applicationID || app.id}</td>
                    <td className="fw-semibold">
                        {app.project?.title || app.projectTitle || "Research Project"}
                    </td>
                    <td className="text-muted small">{app.submittedDate || "N/A"}</td> 
                    <td>₹{(Number(app.requestedAmount) || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-${app.status === 'APPROVED' ? 'success' : 'danger'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary px-3" onClick={() => handleViewDetails(app)}>View</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOTSTRAP MODAL */}
      {showModal && selectedApp && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-light border-bottom-0">
                  <h5 className="modal-title fw-bold">Application Details</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <h6 className="text-uppercase text-muted fw-bold small mb-3">Faculty & Status</h6>
                    <div className="p-3 bg-light rounded">
                      <p className="mb-1"><strong>Name:</strong> {selectedApp.faculty?.name || "N/A"}</p>
                      <p className="mb-1"><strong>Email:</strong> {selectedApp.faculty?.email || "N/A"}</p>
                      <p className="mb-0"><strong>Current Status:</strong> <span className={`badge bg-${selectedApp.status === 'APPROVED' ? 'success' : 'danger'}`}>{selectedApp.status}</span></p>
                    </div>
                  </div>
                  <div>
                    <h6 className="text-uppercase text-muted fw-bold small mb-3">Project Content</h6>
                    <div className="p-3 border rounded">
                      <p className="mb-2 fw-bold">{selectedApp.project?.title || "Project Details"}</p>
                      {loadingDetails ? (
                        <div className="text-muted small py-2"><span className="spinner-border spinner-border-sm me-2"></span>Loading full description...</div>
                      ) : (
                        <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-line' }}>
                          {projectDetails?.description || "No detailed description available."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;