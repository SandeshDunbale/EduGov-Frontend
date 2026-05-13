import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, List, ChevronLeft, ChevronRight, User, BookOpen, ShieldCheck, Mail, Calendar, Trash2, Award, Info, AlertTriangle } from 'lucide-react';
import { EnrollmentAPI } from "../../../services/enrollmentService";
import { jwtDecode } from 'jwt-decode'; // For automatic ID retrieval
import './AdminEnrollments.css';

const AdminEnrollments = () => {
    // --- AUTOMATIC ADMIN ID RETRIEVAL ---
    const getAdminIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const decoded = jwtDecode(token);
            return decoded.userId || decoded.id; 
        } catch (error) {
            console.error("Token extraction failed", error);
            return null;
        }
    };

    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('PENDING'); 
    const [statusMsg, setStatusMsg] = useState('');
    
    const [page, setPage] = useState(1);
    const perPage = 5;

    // --- ADDED STATE FOR MODAL ---
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // --- NEW: CONFIRMATION POPUP STATE ---
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [confirmData, setConfirmData] = useState({ id: null, status: null, type: '' });

    // --- NEW: NOTIFICATION STATE ---
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (msg, type = 'success') => {
        setToast({ show: true, message: msg, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchEnrollments = async (status) => {
        setLoading(true);
        setStatusMsg('');
        try {
            let res;
            if (status === 'ALL') {
                res = await EnrollmentAPI.getAll(); 
            } else {
                res = await EnrollmentAPI.getByStatus(status); 
            }
            setEnrollments(res.data || []);
            setPage(1);
        } catch (err) {
            setEnrollments([]);
            setStatusMsg(err.response?.data?.message || `No records found.`);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchEnrollments(statusFilter); }, [statusFilter]);

    // --- ADDED CLICK HANDLER ---
    const handleRowClick = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowDetailModal(true);
    };

    // --- UPDATED: TRIGGER POPUP INSTEAD OF ALERT ---
    const handleDecision = (enrollmentId, newStatus) => {
        setConfirmData({ id: enrollmentId, status: newStatus, type: 'decision' });
        setShowConfirmPopup(true);
    };

    const handleDeleteClick = (enrollmentId) => {
        setConfirmData({ id: enrollmentId, status: null, type: 'delete' });
        setShowConfirmPopup(true);
    };

    const executeAction = async () => {
        setShowConfirmPopup(false);
        try {
            if (confirmData.type === 'decision') {
                const payload = {
                    enrollmentId: confirmData.id,
                    adminId: getAdminIdFromToken(),
                    status: confirmData.status
                };
                await EnrollmentAPI.updateStatus(payload); 
                showNotification(`Enrollment successfully ${confirmData.status === 'APPROVE' ? 'Approved' : 'Rejected'}!`, confirmData.status === 'APPROVE' ? 'success' : 'error');
            } else {
                const activeAdminId = getAdminIdFromToken();
                await EnrollmentAPI.delete(confirmData.id, activeAdminId); 
                showNotification("Enrollment record deleted successfully.", "success");
            }
            fetchEnrollments(statusFilter); 
        } catch (err) {
            showNotification(err.response?.data?.message || "Action processing failed.", "error");
        }
    };

    const last = page * perPage;
    const first = last - perPage;
    const items = enrollments.slice(first, last);
    const total = Math.ceil(enrollments.length / perPage);

    return (
        <div className="admin-container container-fluid text-start">
            
            {/* --- NOTIFICATION TOAST --- */}
            {toast.show && (
                <div className="custom-toast-container">
                    <div className={`custom-toast shadow-lg ${toast.type === 'error' ? 'toast-error' : ''}`}>
                        <div className="toast-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div className="toast-body">
                            {toast.message}
                        </div>
                        <button className="toast-close-x" onClick={() => setToast({ show: false, message: '' })}>×</button>
                        <div className="toast-loader-bar"></div>
                    </div>
                </div>
            )}

            {/* --- NEW: MIDDLE SCREEN PERMISSION POPUP --- */}
            {showConfirmPopup && (
                <div className="confirm-overlay">
                    <div className="confirm-card shadow-lg animate-pop">
                        <div className="confirm-icon">
                            <AlertTriangle size={40} color={confirmData.type === 'delete' ? "#e53e3e" : "#f59e0b"} />
                        </div>
                        <h4 className="fw-bold text-navy">{confirmData.type === 'delete' ? 'Confirm Deletion' : 'Confirm Decision'}</h4>
                        <p className="text-muted">
                            {confirmData.type === 'delete' 
                                ? "Are you sure? This action will permanently remove this record." 
                                : `Are you sure you want to ${confirmData.status === 'APPROVE' ? 'approve' : 'reject'} this enrollment?`}
                        </p>
                        <div className="confirm-actions">
                            <button className="btn btn-light px-4" onClick={() => setShowConfirmPopup(false)}>Cancel</button>
                            <button className={`btn px-4 text-white ${confirmData.type === 'delete' ? 'btn-danger' : 'btn-navy'}`} onClick={executeAction}>
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section - Responsive */}
            <div className="row align-items-center mb-4 g-3">
                <div className="col-12">
                    <h2 className="fw-bold text-navy mb-0 d-flex align-items-center gap-2">
                        <ShieldCheck className="text-teal" size={28} /> Enrollment Administration
                    </h2>
                    <p className="text-muted mb-0 small uppercase">Institutional Governance Hub | Registration Management</p>
                </div>
            </div>

            {/* Decision Tabs - Responsive Grid */}
            <div className="tab-navigation mb-4">
                <div className="row g-2 p-2 bg-white rounded shadow-sm mx-0">
                    <div className="col-6 col-md-3">
                        <button className={`tab-link w-100 ${statusFilter === 'PENDING' ? 'active' : ''}`} onClick={() => setStatusFilter('PENDING')}>
                            <Clock size={16} /> Pending
                        </button>
                    </div>
                    <div className="col-6 col-md-3">
                        <button className={`tab-link w-100 ${statusFilter === 'APPROVE' ? 'active' : ''}`} onClick={() => setStatusFilter('APPROVE')}>
                            <CheckCircle size={16} /> Approved
                        </button>
                    </div>
                    <div className="col-6 col-md-3">
                        <button className={`tab-link w-100 ${statusFilter === 'REJECT' ? 'active' : ''}`} onClick={() => setStatusFilter('REJECT')}>
                            <XCircle size={16} /> Rejected
                        </button>
                    </div>
                    <div className="col-6 col-md-3">
                        <button className={`tab-link w-100 ${statusFilter === 'ALL' ? 'active' : ''}`} onClick={() => setStatusFilter('ALL')}>
                            <List size={16} /> All Enrollments
                        </button>
                    </div>
                </div>
            </div>

            {/* Enrollment Ledger Table */}
            <div className="table-card overflow-hidden shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr className="uppercase">
                                <th className="ps-4">Request ID</th>
                                <th>Applicant</th>
                                <th>Course</th>
                                <th>Timeline</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Action</th>
                                <th className="text-center">Governance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((e) => (
                                <tr key={e.enrollmentId} onClick={() => handleRowClick(e)} style={{ cursor: 'pointer' }}>
                                    <td className="ps-4 fw-bold text-muted">ENR-{e.enrollmentId}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="user-icon-circle"><User size={14} /></div>
                                            <div>
                                                <div className="fw-bold text-dark">{e.studentName}</div>
                                                <div className="text-muted small d-flex align-items-center gap-1"><Mail size={12} /> {e.studentEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-navy">{e.courseTitle}</div>
                                        <div className="text-muted small">CS-ID: {e.courseId}</div>
                                    </td>
                                    <td>
                                        <div className="small d-flex align-items-center gap-1 text-muted">
                                            <Calendar size={12} /> {e.enrollmentDate ? new Date(e.enrollmentDate).toLocaleDateString() : 'Pending'}
                                        </div>
                                        {e.approvedByAdminName && (
                                            <div className="admin-stamp mt-1"><ShieldCheck size={12} /> {e.approvedByAdminName}</div>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge-pill ${e.status === 'PENDING' ? 'bg-pending' : e.status === 'APPROVE' || e.status === 'ACTIVE' ? 'bg-active' : 'bg-inactive'}`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    <td className="text-center" onClick={(event) => event.stopPropagation()}>
                                        {e.status === 'PENDING' ? (
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-action-approve shadow-sm" onClick={() => handleDecision(e.enrollmentId, 'APPROVE')}>Approve</button>
                                                <button className="btn btn-action-reject shadow-sm" onClick={() => handleDecision(e.enrollmentId, 'REJECT')}>Reject</button>
                                            </div>
                                        ) : (
                                            <span className="processed-label uppercase">Processed</span>
                                        )}
                                    </td>
                                    <td className="text-center" onClick={(event) => event.stopPropagation()}>
                                        <button className="btn btn-action-delete" title="Permanently Delete" onClick={() => handleDeleteClick(e.enrollmentId)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted fw-bold">
                                        {loading ? "Syncing Admission Records..." : (statusMsg || "No matching enrollment requests.")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {enrollments.length > perPage && (
                    <div className="pagination-container py-3">
                        <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
                        {[...Array(total)].map((_, i) => (
                            <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                        ))}
                        <button className="page-btn" disabled={page === total} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
                    </div>
                )}
            </div>

            {/* Enrollment Detail Modal */}
            {showDetailModal && selectedEnrollment && (
                <div className="modal show d-block p-2" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-navy text-white py-3">
                                <h5 className="modal-title d-flex align-items-center gap-2 uppercase fw-bold">
                                    <Info size={20} className="text-teal" /> Enrollment Details
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
                            </div>
                            <div className="modal-body bg-light p-4">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="bg-white p-3 rounded shadow-sm border-start border-4 border-teal h-100">
                                            <h6 className="fw-bold text-navy uppercase small border-bottom pb-2 mb-3">Applicant Information</h6>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="user-icon-circle bg-light"><User size={20}/></div>
                                                <div>
                                                    <div className="fw-bold text-dark">{selectedEnrollment.studentName}</div>
                                                    <div className="small text-muted"><Mail size={12} className="me-1"/>{selectedEnrollment.studentEmail}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="bg-white p-3 rounded shadow-sm border-start border-4 border-primary h-100">
                                            <h6 className="fw-bold text-navy uppercase small border-bottom pb-2 mb-3">Target Curriculum</h6>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="user-icon-circle bg-light"><BookOpen size={20}/></div>
                                                <div>
                                                    <div className="fw-bold text-dark">{selectedEnrollment.courseTitle}</div>
                                                    <div className="small text-muted">CS-ID: {selectedEnrollment.courseId}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="bg-white p-3 rounded shadow-sm border">
                                            <div className="row align-items-center">
                                                <div className="col-sm-4 border-end-sm">
                                                    <label className="d-block small uppercase text-muted fw-bold">Request ID</label>
                                                    <span className="fw-bold text-navy">ENR-{selectedEnrollment.enrollmentId}</span>
                                                </div>
                                                <div className="col-sm-4 border-end-sm">
                                                    <label className="d-block small uppercase text-muted fw-bold">Applied On</label>
                                                    <span className="fw-bold text-dark">
                                                        {selectedEnrollment.enrollmentDate ? new Date(selectedEnrollment.enrollmentDate).toLocaleDateString() : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="col-sm-4">
                                                    <label className="d-block small uppercase text-muted fw-bold">Current Status</label>
                                                    <span className={`badge-pill ${selectedEnrollment.status === 'PENDING' ? 'bg-pending' : 'bg-active'}`}>{selectedEnrollment.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-white border-0">
                                <button type="button" className="btn btn-edu-header px-5 py-2 uppercase shadow-sm" onClick={() => setShowDetailModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEnrollments;