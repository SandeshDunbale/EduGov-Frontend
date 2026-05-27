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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 6;

  useEffect(() => {
    const currentUserId = user?.userId || user?.id;
    if (currentUserId) {
      fetchDashboardData(currentUserId);
    }
  }, [user]);

  const fetchDashboardData = async (managerId) => {
    setLoading(true);
    try {
      // 1. Fetch Pending
      const pendingData = await GrantAPI.getPendingApplications();
      // SORTING PENDING: Newest (highest ID) first
      setPendingApps((pendingData || []).sort((a, b) => b.applicationId - a.applicationId));

      // 2. Fetch History
      const historyData = await GrantAPI.getManagerDecisionHistory(managerId);
      //  SORTING HISTORY: Newest (highest ID) first
      setHistoryApps((historyData || []).sort((a, b) => b.applicationId - a.applicationId));

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

  // Pagination calculation
  const indexOfLastApp = currentPage * applicationsPerPage;
  const indexOfFirstApp = indexOfLastApp - applicationsPerPage;
  const currentApplications = filteredHistory.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(filteredHistory.length / applicationsPerPage);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [historyFilter]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  if (error) return (
    <div className="alert alert-danger m-4 text-center" role="alert">
      {error}
    </div>
  );

  return (
    <div className="container-fluid py-4 px-3 px-md-4" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <h2 className="mb-4" style={{ color: '#1E293B', fontWeight: 'bold' }}>Manager Workspace</h2>

      {/* --- KPI CARDS --- */}
      <div className="row mb-4 mb-md-5 g-3 g-md-4">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 border-start border-warning border-4 h-100" style={{ borderRadius: '8px' }}>
            <div className="card-body py-3 py-md-4">
              <h6 className="text-muted text-uppercase small fw-bold mb-2">Pending Approvals</h6>
              <h3 className="mb-0 fw-bold" style={{ color: '#334155' }}>{pendingApps.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 border-start border-success border-4 h-100" style={{ borderRadius: '8px' }}>
            <div className="card-body py-3 py-md-4">
              <h6 className="text-muted text-uppercase small fw-bold mb-2">Approved Grants</h6>
              <h3 className="mb-0 fw-bold" style={{ color: '#334155' }}>{historyApps.filter(a => a.status === 'APPROVED').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 border-start border-primary border-4 h-100" style={{ borderRadius: '8px' }}>
            <div className="card-body py-3 py-md-4">
              <h6 className="text-muted text-uppercase small fw-bold mb-2">Total Value Approved</h6>
              <h3 className="mb-0 fw-bold text-success">
                ₹{historyApps
                  .filter(a => a.status === 'APPROVED')
                  .reduce((sum, app) => sum + (Number(app.requestedAmount) || 0), 0)
                  .toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* --- DECISION HISTORY SECTION --- */}
      <div className="d-flex flex-wrap justify-content-between align-items-end mb-3" style={{ gap: '1rem' }}>
        <h4 className="mb-0" style={{ color: '#334155', fontWeight: '600' }}>My Decision History</h4>
        <div className="btn-group shadow-sm flex-wrap" role="group">
          <button 
            className={`btn btn-sm ${historyFilter === 'ALL' ? 'btn-secondary fw-bold' : 'btn-outline-secondary'}`} 
            onClick={() => setHistoryFilter('ALL')}
            style={{ borderRadius: '4px 0 0 4px' }}
          >
            All
          </button>
          <button 
            className={`btn btn-sm ${historyFilter === 'APPROVED' ? 'btn-success fw-bold' : 'btn-outline-success'}`} 
            onClick={() => setHistoryFilter('APPROVED')}
          >
            Approved
          </button>
          <button 
            className={`btn btn-sm ${historyFilter === 'REJECTED' ? 'btn-danger fw-bold' : 'btn-outline-danger'}`} 
            onClick={() => setHistoryFilter('REJECTED')}
            style={{ borderRadius: '0 4px 4px 0' }}
          >
            Rejected
          </button>
        </div>
      </div>
      <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive text-nowrap" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="table table-hover align-middle mb-0">
              
              {/*  FIXED: I changed 'text-muted' to 'text-white' on all these headers! */}
              <thead style={{ backgroundColor: '#1E3A5F' }}> {/* Added dark blue bg so white text is visible */}
                <tr>
                  <th className="ps-4 py-3 text-white text-uppercase small border-bottom-0">App ID</th>
                  <th className="py-3 text-white text-uppercase small border-bottom-0">Project Title</th>
                  <th className="py-3 text-white text-uppercase small border-bottom-0">Decision Date</th>
                  <th className="py-3 text-white text-uppercase small border-bottom-0">Amount</th>
                  <th className="py-3 text-white text-uppercase small border-bottom-0 text-center">Status</th>
                  <th className="pe-4 py-3 text-white text-uppercase small border-bottom-0 text-center">Details</th>
                </tr>
              </thead>

              <tbody>
                {currentApplications.length > 0 ? (
                  currentApplications.map((app) => (
                    <tr key={app.applicationID || app.id}>
                      {/* Your custom App ID logic remains exactly the same */}
                      <td className="ps-4 text-muted small">{app.applicationId || app.id}</td>
                      
                      <td className="fw-semibold" style={{ color: '#1E293B' }}>
                        {app.project?.title || app.projectTitle || "Research Project"}
                      </td>
                      <td className="text-muted small">{app.submittedDate || "N/A"}</td> 
                      <td className="fw-medium">₹{(Number(app.requestedAmount) || 0).toLocaleString()}</td>
                      <td className="text-center">
                        <span className={`badge bg-${app.status === 'APPROVED' ? 'success' : 'danger'}`} style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                          {app.status}
                        </span>
                      </td>
                      <td className="pe-4 text-center">
                        <button 
                          className="btn btn-sm btn-outline-primary px-3" 
                          onClick={() => handleViewDetails(app)}
                          style={{ borderRadius: '20px', fontWeight: '500' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No records found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "30px", gap: "8px", marginBottom: "20px" }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              width: "32px",
              height: "32px",
              border: currentPage === 1 ? "1px solid #e2e8f0" : "1px solid #d1d5db",
              background: currentPage === 1 ? "#f3f4f6" : "white",
              borderRadius: "4px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? "0.5" : "1",
              transition: "0.2s",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280"
            }}
          >
            ←
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                style={{
                  width: "32px",
                  height: "32px",
                  border: currentPage === pageNumber ? "1px solid #1e3a5f" : "1px solid #e2e8f0",
                  background: currentPage === pageNumber ? "#1e3a5f" : "white",
                  color: currentPage === pageNumber ? "white" : "#1e293b",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "0.2s",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              width: "32px",
              height: "32px",
              border: currentPage === totalPages ? "1px solid #e2e8f0" : "1px solid #d1d5db",
              background: currentPage === totalPages ? "#f3f4f6" : "white",
              borderRadius: "4px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? "0.5" : "1",
              transition: "0.2s",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280"
            }}
          >
            →
          </button>
        </div>
      )}

      {/* --- BOOTSTRAP MODAL --- */}
      {showModal && selectedApp && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040, backgroundColor: 'rgba(15, 23, 42, 0.6)' }}></div>
          <div className="modal fade show d-block p-2 p-md-0" style={{ zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                <div className="modal-header bg-light border-bottom-0" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                  <h5 className="modal-title fw-bold" style={{ color: '#1E293B' }}>Application Details</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-3 p-md-4">
                  <div className="mb-4">
                    <h6 className="text-uppercase text-muted fw-bold small mb-2" style={{ letterSpacing: '0.5px' }}>Faculty & Status</h6>
                    <div className="p-3 bg-light rounded border border-light">
                      <p className="mb-2"><strong style={{ color: '#475569' }}>Name:</strong> {selectedApp.faculty?.name || "N/A"}</p>
                      <p className="mb-2"><strong style={{ color: '#475569' }}>Email:</strong> {selectedApp.faculty?.email || "N/A"}</p>
                      <p className="mb-0 d-flex align-items-center gap-2">
                        <strong style={{ color: '#475569' }}>Current Status:</strong> 
                        <span className={`badge bg-${selectedApp.status === 'APPROVED' ? 'success' : 'danger'}`}>
                          {selectedApp.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h6 className="text-uppercase text-muted fw-bold small mb-2" style={{ letterSpacing: '0.5px' }}>Project Content</h6>
                    <div className="p-3 border rounded border-light">
                      <p className="mb-3 fw-bold" style={{ color: '#1E293B', fontSize: '1.1rem' }}>{selectedApp.project?.title || "Project Details"}</p>
                      {loadingDetails ? (
                        <div className="text-muted small py-3 d-flex align-items-center">
                          <span className="spinner-border spinner-border-sm me-2 text-primary"></span>
                          Loading full description...
                        </div>
                      ) : (
                        <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                          {projectDetails?.description || "No detailed description available."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button type="button" className="btn btn-secondary px-4 fw-medium" onClick={() => setShowModal(false)} style={{ borderRadius: '6px' }}>Close</button>
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