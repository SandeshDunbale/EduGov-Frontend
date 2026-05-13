import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Filter, RefreshCcw, ChevronLeft, ChevronRight, User, Calendar, Award, Mail, AlertTriangle } from 'lucide-react';
import { ProgramAPI } from '../../../services/programService';
import { jwtDecode } from 'jwt-decode'; // Required for automatic ID extraction
import './AdminPrograms.css';


const AdminPrograms = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [nameQuery, setNameQuery] = useState('');
    const [idQuery, setIdQuery] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [valErrors, setValErrors] = useState({});
    const [statusQuery, setStatusQuery] = useState('');

    const [page, setPage] = useState(1);
    const perPage = 5;

    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);

    // --- NEW: CONFIRMATION POPUP STATE ---
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    const [formData, setFormData] = useState({
        title: '', description: '', startDate: '', endDate: '', status: 'ACTIVE', createdByAdminId: null
    });

    const [toast, setToast] = useState({ show: false, message: '' });

    const showNotification = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const getAdminIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const decoded = jwtDecode(token);
            // Returns the ID from the JWT payload
            return decoded.userId || decoded.id;
        } catch (error) {
            console.error("Token extraction failed", error);
            return null;
        }
    };

    const loadAll = async () => {
        setLoading(true);
        setStatusMsg('');
        setNameQuery('');
        setIdQuery('');
        setStatusQuery('');
        try {
            const res = await ProgramAPI.getAll();
            setPrograms(res.data);
            setPage(1);
        } catch (err) {
            setPrograms([]);
            setStatusMsg(err.response?.data?.message || "No programs registered.");
        } finally { setLoading(false); }
    };

    useEffect(() => { loadAll(); }, []);

    const doNameSearch = async (val) => {
        const query = val !== undefined ? val : nameQuery;
        if (!query.trim()) return loadAll();
        setLoading(true);
        setIdQuery('');
        setStatusQuery('');
        try {
            const res = await ProgramAPI.search(query);
            setPrograms(res.data);
            setPage(1);
            setStatusMsg('');
        } catch (err) {
            setPrograms([]);
            setStatusMsg(err.response?.data?.message || "No match found.");
        } finally { setLoading(false); }
    };

    const doIdSearch = async (val) => {
        const query = val !== undefined ? val : idQuery;
        if (!query) return loadAll();
        setLoading(true);
        setNameQuery('');
        setStatusQuery('');
        try {
            const res = await ProgramAPI.getById(query);
            setPrograms(res.data ? [res.data] : []);
            setPage(1);
            setStatusMsg('');
        } catch (err) {
            setPrograms([]);
            setStatusMsg(err.response?.data?.message || "Program ID not found.");
        } finally { setLoading(false); }
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setNameQuery(val);
        doNameSearch(val);
    };

    const handleIdChange = (e) => {
        const val = e.target.value;
        setIdQuery(val);
        doIdSearch(val);
    };

    const onEnter = (e, type) => {
        if (e.key === 'Enter') {
            if (type === 'name') doNameSearch();
            else if (type === 'id') doIdSearch();
        }
    };

    // --- UPDATED SAVE LOGIC WITH PERMISSION ---
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            setShowConfirmPopup(true); // Show confirmation if it's an update
        } else {
            executeSave(); // Directly save if it's a new entry
        }
    };

    const executeSave = async () => {
        setValErrors({});
        setShowConfirmPopup(false);
        const activeAdminId = getAdminIdFromToken();
        const payload = { ...formData, createdByAdminId: activeAdminId };

        try {
            if (isEdit) {
                await ProgramAPI.update(formData.programId, payload);
                showNotification(`Program "${formData.title}" updated successfully!`);
            } else {
                await ProgramAPI.save(payload);
                showNotification(`Program "${formData.title}" created successfully!`);
            }
            setShowModal(false);
            loadAll();
        } catch (err) {
            const backendData = err.response?.data;
            if (err.response?.status === 400 && backendData?.details) {
                const errorMap = {};
                backendData.details.split(', ').forEach(errStr => {
                    const parts = errStr.split(': ');
                    if (parts.length > 1) {
                        errorMap[parts[0].trim()] = parts[1].trim();
                    } else {
                        errorMap.global = errStr;
                    }
                });
                setValErrors(errorMap);
            }
            else if (err.response?.status === 403 || err.response?.status === 503 || err.response?.status === 400) {
                setValErrors({ global: backendData?.message || "Action failed." });
            } else {
                setValErrors({ global: "Server error occurred." });
            }
        }
    };

    const onFilter = async (status) => {
        setStatusQuery(status);
        if (status === "" || !status) return loadAll();
        setLoading(true);
        setNameQuery('');
        setIdQuery('');
        try {
            const res = await ProgramAPI.getByStatus(status);
            setPrograms(res.data);
            setPage(1);
        } catch (err) {
            setPrograms([]);
            setStatusMsg(err.response?.data?.message || `No ${status} programs found.`);
        } finally { setLoading(false); }
    };

    const handleRowClick = (program) => {
        setSelectedProgram(program);
        setShowDetailModal(true);
    };

    const last = page * perPage;
    const first = last - perPage;
    const items = programs.slice(first, last);
    const total = Math.ceil(programs.length / perPage);

    return (
        <div className="admin-container container-fluid text-start">

            {/* --- NOTIFICATION TOAST --- */}
            {toast.show && (
                <div className="custom-toast shadow-lg">
                    <div className="toast-icon-wrapper">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div className="toast-body">
                        {toast.message}
                    </div>
                    <button className="toast-close-x" onClick={() => setToast({ show: false, message: '' })}>×</button>
                    <div className="toast-loader-bar"></div>
                </div>
            )}

            {/* --- NEW: MIDDLE SCREEN PERMISSION POPUP --- */}
            {showConfirmPopup && (
                <div className="confirm-overlay">
                    <div className="confirm-card shadow-lg animate-pop">
                        <div className="confirm-icon">
                            <AlertTriangle size={40} color="#f59e0b" />
                        </div>
                        <h4 className="fw-bold text-navy">Confirm Update</h4>
                        <p className="text-muted">Are you sure ! You want to update this program's details?</p>
                        <div className="confirm-actions">
                            <button className="btn btn-light px-4" onClick={() => setShowConfirmPopup(false)}>Cancel</button>
                            <button className="btn btn-navy px-4 text-white" onClick={executeSave}>Yes, Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="row align-items-center mb-4 g-3">
                <div className="col-md-8">
                    <h2 className="fw-bold text-navy mb-0">Program Administration</h2>
                    <p className="text-muted mb-0 small uppercase">Education Governance Hub | University Management</p>
                </div>
                <div className="col-md-4 text-md-end">
                    <button className="btn btn-edu-header d-inline-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                        onClick={() => {
                            const activeId = getAdminIdFromToken();
                            setFormData({ title: '', description: '', startDate: '', endDate: '', status: 'ACTIVE', createdByAdminId: activeId });
                            setValErrors({}); setIsEdit(false); setShowModal(true);
                        }}>
                        <Plus size={18} /> Create Program
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card border-0 shadow-sm p-3 mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-lg-3 col-md-6">
                        <label className="form-label small fw-bold text-muted uppercase">Search by Title</label>
                        <div className="search-wrapper">
                            <Search size={18} className="icon-left" />
                            <input type="text" className="form-control" placeholder="Program title..."
                                value={nameQuery} onChange={handleNameChange} onKeyDown={(e) => onEnter(e, 'name')} />
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <label className="form-label small fw-bold text-muted uppercase">Search by ID</label>
                        <div className="search-wrapper">
                            <Search size={18} className="icon-left" />
                            <input type="number" className="form-control no-spin" placeholder="Program ID..."
                                value={idQuery} onChange={handleIdChange} onKeyDown={(e) => onEnter(e, 'id')} />
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <label className="form-label small fw-bold text-muted uppercase">Filter Status</label>
                        <div className="search-wrapper">
                            <Filter size={18} className="icon-left" />
                            <select className="form-select" value={statusQuery} onChange={(e) => onFilter(e.target.value)}>
                                <option value="">All Status</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                            style={{ height: '42px' }} onClick={loadAll}>
                            <RefreshCcw size={18} /> All Programs
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-card overflow-hidden shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Program Details</th>
                                <th>Duration</th>
                                <th>Administrator</th>
                                <th>Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((p) => (
                                <tr key={p.programId} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(p)}>
                                    <td className="ps-4 fw-bold text-muted">{p.programId}</td>
                                    <td>
                                        <div className="fw-bold text-dark">{p.title}</div>
                                        <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>{p.description}</div>
                                    </td>
                                    <td className="small text-nowrap">
                                        <div><span className="date-label text-success">START DATE :</span> {p.startDate}</div>
                                        <div><span className="date-label text-danger">END DATE :</span> {p.endDate}</div>
                                    </td>
                                    <td>
                                        <div className="small fw-bold">{p.adminName || 'Admin'}</div>
                                        <div className="text-muted" style={{ fontSize: '10px' }}>{p.adminEmail}</div>
                                    </td>
                                    <td>
                                        <span className={`badge-pill ${p.status === 'ACTIVE' ? 'bg-active' : 'bg-inactive'}`}>{p.status}</span>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2" onClick={(e) => {
                                            e.stopPropagation();
                                            setFormData({ ...p, createdByAdminId: p.adminId });
                                            setIsEdit(true); setShowModal(true); setValErrors({});
                                        }}>
                                            <button className="btn btn-link p-0 text-primary">
                                                <Edit size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted fw-bold">
                                        {loading ? "Accessing Database..." : statusMsg}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {programs.length > perPage && (
                    <div className="pagination-container">
                        <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
                        {[...Array(total)].map((_, i) => (
                            <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                        ))}
                        <button className="page-btn" disabled={page === total} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {showDetailModal && selectedProgram && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg overflow-hidden">
                            <div className="modal-header bg-navy text-white py-3">
                                <h5 className="modal-title d-flex align-items-center gap-2 uppercase fw-bold">
                                    <Award size={22} className="text-teal" /> Program Specifications
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
                            </div>
                            <div className="modal-body p-0 bg-light">
                                <div className="p-4 bg-white border-bottom">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h3 className="fw-bold text-navy mb-0">{selectedProgram.title}</h3>
                                        <span className={`badge-pill ${selectedProgram.status === 'ACTIVE' ? 'bg-active' : 'bg-inactive'}`}>
                                             {selectedProgram.status}
                                        </span>
                                    </div>
                                    <p className="text-secondary" style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                                        {selectedProgram.description || "No detailed description provided."}
                                    </p>
                                </div>
                                <div className="p-4">
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-3 p-3 bg-white rounded border shadow-sm h-100">
                                                <div className="bg-success-subtle p-2 rounded">
                                                    <Calendar className="text-success" size={20} />
                                                </div>
                                                <div>
                                                    <label className="d-block small text-muted fw-bold uppercase">Activation Date</label>
                                                    <span className="fw-bold text-dark">{selectedProgram.startDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-3 p-3 bg-white rounded border shadow-sm h-100">
                                                <div className="bg-danger-subtle p-2 rounded">
                                                    <Calendar className="text-danger" size={20} />
                                                </div>
                                                <div>
                                                    <label className="d-block small text-muted fw-bold uppercase">Expiration Date</label>
                                                    <span className="fw-bold text-dark">{selectedProgram.endDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="p-3 bg-white rounded border shadow-sm">
                                                <h6 className="fw-bold text-navy border-bottom pb-2 mb-3 uppercase small">Administrative Metadata</h6>
                                                <div className="row">
                                                    <div className="col-sm-6 text-start">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <User size={16} className="text-teal" />
                                                            <span className="small fw-bold">Admin: {selectedProgram.adminName}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Mail size={16} className="text-teal" />
                                                            <span className="small text-muted">{selectedProgram.adminEmail}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 text-sm-end text-start">
                                                        <div className="small text-muted mb-1">Registration ID</div>
                                                        <div className="fw-bold text-navy">PGM-ID-{selectedProgram.programId}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 bg-white">
                                <button type="button" className="btn btn-edu-header px-5 py-2 uppercase shadow-sm" onClick={() => setShowDetailModal(false)}>Close View</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FORM MODAL */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-navy text-white">
                                <h5 className="modal-title fw-bold uppercase">{isEdit ? 'Update Program' : 'New Program Entry'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleFormSubmit}>
                                <div className="modal-body p-4 text-start">
                                    {valErrors.global && <div className="alert alert-danger py-2 small fw-bold mb-3">{valErrors.global}</div>}
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted uppercase">Program Title</label>
                                        <input type="text" className={`form-control ${valErrors.title ? 'is-invalid' : ''}`}
                                            value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                        {valErrors.title && <div className="text-danger small mt-1 fw-bold">{valErrors.title}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted uppercase">Description</label>
                                        <textarea className={`form-control ${valErrors.description ? 'is-invalid' : ''}`} rows="3" value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                                        {valErrors.description && <div className="text-danger small mt-1 fw-bold">{valErrors.description}</div>}
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold text-muted uppercase">Start Date</label>
                                            <input type="date" className={`form-control ${valErrors.startDate ? 'is-invalid' : ''}`}
                                                value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                                            {valErrors.startDate && <div className="text-danger small mt-1 fw-bold">{valErrors.startDate}</div>}
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold text-muted uppercase">End Date</label>
                                            <input type="date" className={`form-control ${valErrors.endDate ? 'is-invalid' : ''}`}
                                                value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                                            {valErrors.endDate && <div className="text-danger small mt-1 fw-bold">{valErrors.endDate}</div>}
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label className="form-label small fw-bold text-muted uppercase">Status</label>
                                        <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-3">
                                    <button type="button" className="btn btn-secondary px-4 shadow-sm" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-edu-header px-5 shadow-sm fw-bold uppercase">
                                        {isEdit ? 'Save Changes' : 'Launch Program'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPrograms;