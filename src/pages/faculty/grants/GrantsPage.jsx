import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { grantService } from '../../../services/grantService';
import './GrantsPage.css';
import { jwtDecode } from 'jwt-decode';


const GrantsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tab State: 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
    const [activeTab, setActiveTab] = useState('ALL');

    // 1. 👈 NEW: Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const applicationsPerPage = 5; // You can change this to show more/less rows

    // 2. 👈 NEW: Reset to page 1 whenever the user switches tabs
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

                // 3. Safety check: What if a Student tries to load this page?
                if (!facultyId) {
                    console.error("Access Denied: This user does not have a Faculty ID.");
                    setLoading(false);
                    return;
                }

                // 4. Fetch the data using the real ID!
                const data = await grantService.getGrantHistory(facultyId);

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
        .reduce((sum, app) => sum + app.requestedAmount, 0);

    // Filter the table data based on the Active Tab
    const filteredApplications = applications.filter(app => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'PENDING') return app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW';
        return app.status === activeTab;
    });

    // 3. 👈 NEW: Pagination Math
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
                return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill"><Clock size={12} className="me-1" /> Pending Review</span>;
            case 'APPROVED':
                return <span className="badge bg-success text-white px-3 py-2 rounded-pill"><CheckCircle size={12} className="me-1" /> Approved</span>;
            case 'REJECTED':
                return <span className="badge bg-danger text-white px-3 py-2 rounded-pill"><XCircle size={12} className="me-1" /> Rejected</span>;
            default:
                return <span className="badge bg-secondary px-3 py-2 rounded-pill">{status}</span>;
        }
    };

    return (
        <div className="container-fluid py-4">

            {/* HEADER & METRICS ROW */}
            <div className="row mb-4 g-4">

                {/* Page Title */}
                <div className="col-12 col-lg-8">
                    <div className="bg-white p-4 rounded shadow-sm border h-100 d-flex flex-column justify-content-center">
                        <h2 className="fw-bold text-navy mb-1">Financial & Grants Dashboard</h2>
                        <p className="text-muted mb-0">Track your funding requests, application history, and approved grants.</p>
                    </div>
                </div>

                {/* Total Funding Metric Card */}
                <div className="col-12 col-lg-4">
                    <div className="grants-metric-card p-4 h-100 d-flex flex-column justify-content-center">
                        <h6 className="text-white-50 text-uppercase fw-bold tracking-wider mb-2">Total Funding Secured</h6>
                        <h2 className="fw-bold mb-0 d-flex align-items-center gap-2">
                            ₹ {totalApprovedFunding.toLocaleString()} {/* 🟢 Added toLocaleString() for nice comma formatting! */}
                        </h2>
                    </div>
                </div>
            </div>

            {/* DATA TABLE SECTION */}
            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-header bg-white border-bottom p-4">

                    {/* BOOTSTRAP TABS */}
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
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light text-muted small text-uppercase">
                                        <tr>
                                            <th className="ps-4 py-3">App ID</th>
                                            <th className="py-3">Project Title</th>
                                            <th className="py-3">Date Submitted</th>
                                            <th className="py-3 text-end">Amount Requested</th>
                                            <th className="pe-4 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-top-0">
                                        {/* 4. 👈 NEW: Map over currentApplications instead of filteredApplications */}
                                        {currentApplications.map((app) => (
                                            <tr key={app.applicationID}>
                                                <td className="ps-4 py-3 text-muted">#{app.applicationID}</td>
                                                <td className="py-3 fw-semibold text-dark">
                                                    {app.projectTitle || "Unknown Project"}
                                                </td>
                                                <td className="py-3 text-secondary">{app.submittedDate}</td>
                                                <td className="py-3 text-end fw-bold text-dark">
                                                    ₹{app.requestedAmount.toLocaleString()} {/* 🟢 Added toLocaleString() here too! */}
                                                </td>
                                                <td className="pe-4 py-3 text-center">
                                                    {getStatusBadge(app.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 5. 👈 NEW: Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center p-4 border-top">
                                    <nav aria-label="Grants page navigation">
                                        <ul className="pagination mb-0 shadow-sm">
                                            
                                            {/* Previous Button */}
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>

                                            {/* Page Numbers */}
                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                    <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                                        <button 
                                                            className="page-link" 
                                                            onClick={() => paginate(pageNumber)}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    </li>
                                                );
                                            })}

                                            {/* Next Button */}
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
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