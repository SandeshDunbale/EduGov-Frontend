import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { projectService } from '../../services/projectService'; // 👈 NEW: Import project service
import 'bootstrap/dist/css/bootstrap.min.css';

const ManagerDashboard = () => {
  const { user, token } = useAuth(); 
  
  const [pendingApps, setPendingApps] = useState([]);
  const [historyApps, setHistoryApps] = useState([]);
  
  const [historyFilter, setHistoryFilter] = useState('ALL'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. 👈 NEW: Modal States for "View Details"
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (user && (user.userId || user.id)) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const pendingRes = await fetch(`http://localhost:8002/api/grants/pending`, { headers: authHeaders });
      if (!pendingRes.ok) throw new Error('Failed to fetch pending applications');
      const pendingData = await pendingRes.json();
      setPendingApps(pendingData);

      const managerId = user.userId || user.id; 
      const historyRes = await fetch(`http://localhost:8002/api/grants/history/manager/${managerId}`, { headers: authHeaders });
      if (!historyRes.ok) throw new Error('Failed to fetch decision history');
      const historyData = await historyRes.json();
      setHistoryApps(historyData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (applicationId, decision) => {
    try {
      const response = await fetch(
        `http://localhost:8002/api/grants/decision/${applicationId}?userId=${user.userId}&decision=${decision}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error(`Failed to ${decision.toLowerCase()} application`);

      await fetchDashboardData();
      alert(`Application ${applicationId} successfully ${decision}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. 👈 NEW: Function to open modal and fetch full project description
  const handleViewDetails = async (app) => {
    setSelectedApp(app);
    setShowModal(true);
    setLoadingDetails(true);
    
    try {
      // We grab the projectId from the application. 
      // (Adjust 'app.projectId' if your backend calls it something slightly different like app.project.projectId)
      const projectIdToFetch = app.projectId || (app.project && app.project.projectId);
      
      if (projectIdToFetch) {
        const fullProjectData = await projectService.getProjectById(projectIdToFetch);
        setProjectDetails(fullProjectData);
      }
    } catch (error) {
      console.error("Failed to load full project description", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredHistory = historyApps.filter(app => {
    if (historyFilter === 'ALL') return true;
    return app.status === historyFilter;
  });

  const totalHistoryAmount = filteredHistory.reduce((sum, app) => sum + app.requestedAmount, 0);

  if (loading) return <div className="p-4 text-center mt-5 spinner-border text-primary" role="status"></div>;
  if (error) return <div className="p-4 text-danger text-center mt-5">Error: {error}</div>;

  return (
    <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#F8FAFC' }}>
      <h2 className="mb-4" style={{ color: '#1E293B', fontWeight: 'bold' }}>Manager Workspace</h2>

      {/* --- KPI CARDS --- */}
      <div className="row mb-5">
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
              <h6 className="text-muted">Approved Grants Managed</h6>
              <h3 className="mb-0">{historyApps.filter(a => a.status === 'APPROVED').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-primary border-4">
            <div className="card-body">
              <h6 className="text-muted">Total Value Approved</h6>
              <h3 className="mb-0 text-success">
                ₹{historyApps.filter(a => a.status === 'APPROVED').reduce((sum, app) => sum + app.requestedAmount, 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* --- DECISION HISTORY SECTION --- */}
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
          <table className="table table-striped align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>App ID</th>
                <th>Project Title</th>
                <th>Decision Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-center">Details</th> {/* 👈 NEW COLUMN HEADER */}
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((app) => (
                  <tr key={app.applicationID}>
                    <td>#{app.applicationID}</td>
                    <td>{app.projectTitle || "Unknown Project"}</td>
                    <td>{app.submittedDate || "N/A"}</td> 
                    <td>₹{app.requestedAmount.toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-${app.status === 'APPROVED' ? 'success' : 'danger'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-center">
                      {/* 👈 NEW VIEW BUTTON */}
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleViewDetails(app)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No {historyFilter !== 'ALL' ? historyFilter.toLowerCase() : ''} decisions found.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="table-light fw-bold">
              <tr>
                <td colSpan="3" className="text-end">Total Filtered Value:</td>
                <td colSpan="3" className="text-primary">₹{totalHistoryAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3. 👈 NEW: BOOTSTRAP MODAL TO SHOW DETAILS */}
      {showModal && selectedApp && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg">
                
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold text-dark">Grant Application #{selectedApp.applicationID}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>

                <div className="modal-body p-4">
                  {/* Faculty Details Section */}
                  <div className="mb-4">
                    <h6 className="text-uppercase text-muted fw-bold mb-2">Faculty Information</h6>
                    <div className="p-3 bg-white border rounded shadow-sm">
                      <p className="mb-1"><strong>Name:</strong> {selectedApp.faculty?.name || "Unknown Faculty Member"}</p>
                      {/* 👈 NEW: Added Faculty Email */}
                      <p className="mb-2"><strong>Email:</strong> {selectedApp.faculty?.email || "Not provided"}</p>
                      <p className="mb-0"><strong>Status of Grant:</strong> <span className={`badge bg-${selectedApp.status === 'APPROVED' ? 'success' : 'danger'}`}>{selectedApp.status}</span></p>
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div>
                    <h6 className="text-uppercase text-muted fw-bold mb-2">Project Details</h6>
                    <div className="p-3 bg-white border rounded shadow-sm">
                      <p className="mb-2"><strong>Title:</strong> {selectedApp.projectTitle}</p>
                      
                      {loadingDetails ? (
                        <div className="text-muted small my-3"><span className="spinner-border spinner-border-sm me-2"></span>Loading full description...</div>
                      ) : (
                        <p className="mb-0 text-secondary text-break" style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                          <strong>Description:</strong><br/>
                          {projectDetails?.description || "No detailed description available."}
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
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