import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { GrantAPI } from '../../services/grantService';
import { jwtDecode } from 'jwt-decode';

const ApproveGrantsPage = () => {
  const [pendingGrants, setPendingGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Tracks which row is currently saving

  // Fetch Pending Grants immediately when the page loads
  useEffect(() => {
    fetchPendingGrants();
  }, []);

  const fetchPendingGrants = async () => {
    setLoading(true);
    try {
      const data = await GrantAPI.getPendingApplications();
      setPendingGrants(data || []);
    } catch (error) {
      console.error("Failed to fetch pending grants.", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Approve or Reject with dynamic JWT decoding
  const handleDecision = async (applicationId, decision) => {
    // 1. 👈 NEW: Confirmation Popup before doing anything!
    const isConfirmed = window.confirm(`Are you sure you want to ${decision} this grant application?`);

    // If the manager clicks "Cancel", stop the function immediately
    if (!isConfirmed) {
      return;
    }

    setProcessingId(applicationId); // This will trigger the loading screen!

    try {
      // Grab the token from Local Storage
      const token = localStorage.getItem('token');

      if (!token) {
        alert("Your session has expired. Please log in again.");
        setProcessingId(null);
        return;
      }

      // Decode the token to find out which Manager is making this decision
      const decodedToken = jwtDecode(token);
      const managerUserId = decodedToken.userId;

      // Check for 'PROG_MANAGER' to match the database/Gateway exact spelling
      if (decodedToken.role !== 'PROG_MANAGER') {
        alert("Action Denied: Only Program Managers can approve or reject grants.");
        setProcessingId(null);
        return;
      }

      // Send the real dynamic ID to the backend
      // ✅ Correct name matching your GrantService.js
      const response = await GrantAPI.submitDecision(applicationId, managerUserId, decision);
      // Circuit Breaker Check
      if (response && response.approvedByRole === 'SERVICE_UNAVAILABLE') {
        alert("Action Failed: The User Identity Microservice is offline, or User ID is invalid.");
        return;
      }

      // If successful, remove from UI
      setPendingGrants(prev => prev.filter(app => 
    (app.applicationId || app.applicationID || app.id) !== applicationId
));

      // Brief timeout so the user sees the loading screen finish
      setTimeout(() => {
        alert(`Application successfully ${decision}!`);
      }, 500);

    } catch (error) {
      alert("Failed to process decision. Please try again.");
    } finally {
      setProcessingId(null); // This turns off the loading screen
    }
  };

  // 👈 UPDATED: Formats amount with Indian Rupee (₹)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="container-fluid py-4 position-relative">

      {/* 2. 👈 NEW: FULL SCREEN LOADING OVERLAY */}
      {/* This only shows up when processingId is NOT null */}
      {processingId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', zIndex: 9999 }}
        >
          <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-4 fw-bold text-navy">Processing your decision...</h4>
          <p className="text-muted">Please wait while we update the database.</p>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="bg-white p-4 rounded shadow-sm border mb-4">
        <h2 className="fw-bold edugov-text-navy mb-1">Approve Grants</h2>
        <p className="text-muted mb-0 small">Review and process incoming faculty funding applications.</p>
      </div>

      {/* MAIN DATA CARD */}
      <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
        <div className="card-body p-0">

          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-primary mb-3"></div>
              <p>Loading pending grant applications...</p>
            </div>
          ) : pendingGrants.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <CheckCircle size={48} className="mb-3 text-success opacity-50" />
              <h5>All Caught Up!</h5>
              <p>There are no pending grant applications to review right now.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-4 py-3">App ID</th>
                    <th className="py-3">Faculty Name</th>
                    <th className="py-3">Project Title</th>
                    <th className="py-3 text-end">Amount Requested</th>
                    <th className="pe-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {pendingGrants.map((app) => (
                    <tr key={app.applicationID || app.applicationId || app.id}>
                      <td className="ps-4 py-3 text-muted">{app.applicationID || app.applicationId || app.id || "N/A"}</td>
                      <td className="py-3 fw-semibold text-dark">
                        {app.faculty?.name || "Unknown Applicant"}
                      </td>
                      <td className="py-3 text-secondary">{app.projectTitle}</td>
                      <td className="py-3 text-end fw-bold text-dark">
                        {formatCurrency(app.requestedAmount)}
                      </td>
                      <td className="pe-4 py-3">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            onClick={() => handleDecision(app.applicationId || app.applicationID || app.id, 'APPROVED')}
                            disabled={processingId !== null} // 👈 Disable if ANY row is processing
                            className="btn btn-sm btn-success d-flex align-items-center gap-1 fw-medium shadow-sm"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleDecision(app.applicationId || app.applicationID || app.id, 'REJECTED')}
                            disabled={processingId !== null} // 👈 Disable if ANY row is processing
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 fw-medium"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ApproveGrantsPage;