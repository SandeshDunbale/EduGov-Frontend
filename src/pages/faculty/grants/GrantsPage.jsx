import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
// ✅ FIXED: Changed import name to GrantAPI
import { GrantAPI } from '../../../services/grantService';
import './GrantsPage.css';
import { jwtDecode } from 'jwt-decode';


const GrantsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tab State: 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
    const [activeTab, setActiveTab] = useState('ALL');

    // 1. Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const applicationsPerPage = 5; 

    // 2. Reset to page 1 whenever the user switches tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    useEffect(() => {
        const fetchGrantHistory = async () => {
            try {
                // 1. Grab the token from Local Storage
                const token = localStorage.getItem('token');
                
                if (!token) {
                    console.error("No token found. User might not be logged in.");
                    setLoading(false);
                    return;
                }

                // 2. Decode the token to get the dynamic Faculty ID
                const decodedToken = jwtDecode(token);
                const facultyId = decodedToken.facultyId;

                // 3. Safety check
                if (!facultyId) {
                    console.error("Access Denied: This user does not have a Faculty ID.");
                    setLoading(false);
                    return;
                }

                // 4. ✅ FIXED: Using the real API object name: GrantAPI
                const data = await GrantAPI.getGrantHistory(facultyId);

                // Sort newest first
                const sortedData = (data || []).sort((a, b) => b.applicationID - a.applicationID);
                setApplications(sortedData);
                
            } catch (error) {
                console.error("Failed to load grant history. The REAL error is:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGrantHistory();
    }, []);

    // Calculate Total Approved Funding Metric
    const totalApprovedFunding = applications
        .filter(app => app.status === 'APPROVED')
        .reduce((sum, app) => sum + (app.requestedAmount || 0), 0);

    // Filter the table data based on the Active Tab
    const filteredApplications = applications.filter(app => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'PENDING') return app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW';
        return app.status === activeTab;
    });

    // 3. Pagination Math
    const indexOfLastApp = currentPage * applicationsPerPage;
    const indexOfFirstApp = indexOfLastApp - applicationsPerPage;
    const currentApplications = filteredApplications.slice(indexOfFirstApp, indexOfLastApp);
    const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Helper for status badges
    const getStatusBadge = (status) => {
        switch (status) {
            case 'SUBMITTED':
            case 'UNDER_REVIEW':
                return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", fontSize: "clamp(11px, 2vw, 13px)" }}><Clock size={14} className="me-0" /> Pending Review</span>;
            case 'APPROVED':
                return <span className="badge bg-success text-white px-3 py-2 rounded-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", fontSize: "clamp(11px, 2vw, 13px)" }}><CheckCircle size={14} className="me-0" /> Approved</span>;
            case 'REJECTED':
                return <span className="badge bg-danger text-white px-3 py-2 rounded-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", fontSize: "clamp(11px, 2vw, 13px)" }}><XCircle size={14} className="me-0" /> Rejected</span>;
            default:
                return <span className="badge bg-secondary px-3 py-2 rounded-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", fontSize: "clamp(11px, 2vw, 13px)" }}>{status}</span>;
        }
    };

    return (
        <div className="container-fluid py-4">

            {/* HEADER & METRICS ROW */}
            <div className="row mb-4 g-4">
                <div className="col-12 col-lg-8">
                    <div className="bg-white p-4 rounded shadow-sm border h-100 d-flex flex-column justify-content-center">
                        <h2 className="fw-bold text-navy mb-1">Financial & Grants Dashboard</h2>
                        <p className="text-muted mb-0">Track your funding requests, application history, and approved grants.</p>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="grants-metric-card p-4 h-100 d-flex flex-column justify-content-center">
                        <h6 className="text-white-50 text-uppercase fw-bold tracking-wider mb-2">Total Funding Secured</h6>
                        <h2 className="fw-bold mb-0 d-flex align-items-center gap-2">
                            ₹ {totalApprovedFunding.toLocaleString()}
                        </h2>
                    </div>
                </div>
            </div>

            {/* DATA TABLE SECTION */}
            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-header bg-white border-bottom p-4">
                    <ul className="nav nav-pills custom-nav-pills gap-2">
                        <li className="nav-item">
                            <button className={`nav-link border-0 ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>
                                All Applications
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link border-0 ${activeTab === 'PENDING' ? 'active' : ''}`} onClick={() => setActiveTab('PENDING')}>
                                Pending
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link border-0 ${activeTab === 'APPROVED' ? 'active' : ''}`} onClick={() => setActiveTab('APPROVED')}>
                                Approved
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link border-0 ${activeTab === 'REJECTED' ? 'active' : ''}`} onClick={() => setActiveTab('REJECTED')}>
                                Rejected
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5 text-muted">
                            <div className="spinner-border text-primary mb-3" role="status"></div>
                            <p>Loading grant history...</p>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FileText size={48} className="mb-3 opacity-25" />
                            <h5>No applications found</h5>
                            <p>You have no grants matching this status.</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ minWidth: "900px" }}>
                                    <thead className="table-light text-muted small text-uppercase">
                                        <tr>
                                            <th className="ps-4 py-3" style={{ width: "8%", minWidth: "70px" }}>App ID</th>
                                            <th className="py-3" style={{ width: "25%", minWidth: "150px" }}>Project Title</th>
                                            <th className="py-3" style={{ width: "18%", minWidth: "120px" }}>Date Submitted</th>
                                            <th className="py-3 text-center" style={{ width: "18%", minWidth: "130px" }}>Amount Requested</th>
                                            <th className="pe-4 py-3 text-center" style={{ width: "31%", minWidth: "200px" }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {currentApplications.map((app) => (
                                            <tr key={app.applicationID || app.applicationId || app.id} style={{ transition: "background-color 0.2s ease" }}>
                                                <td className="ps-4 py-3 text-muted" style={{ width: "8%", minWidth: "70px" }}>
                                                    {app.applicationID || app.applicationId || app.id || "N/A"}
                                                </td>
                                                <td className="py-3 fw-semibold text-dark" style={{ width: "25%", minWidth: "150px" }}>
                                                    <span title={app.projectTitle} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {app.projectTitle || "Unknown Project"}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-secondary" style={{ width: "18%", minWidth: "120px" }}>
                                                    {app.submittedDate || "N/A"}
                                                </td>
                                                <td className="py-3 text-center fw-bold text-dark" style={{ width: "18%", minWidth: "130px", whiteSpace: "nowrap" }}>
                                                    ₹{(app.requestedAmount || 0).toLocaleString()}
                                                </td>
                                                <td className="pe-4 py-3 text-center" style={{ width: "31%", minWidth: "200px" }}>
                                                    {getStatusBadge(app.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div style={{ display: "flex", justifyContent: "center", marginTop: "30px", gap: "8px", paddingBottom: "20px" }}>
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
                                                onClick={() => paginate(pageNumber)}
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrantsPage;