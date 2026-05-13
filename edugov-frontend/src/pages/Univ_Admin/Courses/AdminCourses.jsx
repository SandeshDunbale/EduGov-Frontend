import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, RefreshCcw, ChevronLeft, ChevronRight, BookOpen, GraduationCap, User, Mail, AlertTriangle } from 'lucide-react';
import { CourseAPI } from '../../../services/courseService';
import { jwtDecode } from 'jwt-decode'; // Required for automatic token extraction
import './AdminCourses.css';

const AdminCourses = () => {
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

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [idQuery, setIdQuery] = useState('');
    const [programQuery, setProgramQuery] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [valErrors, setValErrors] = useState({});

    const [page, setPage] = useState(1);
    const perPage = 5;

    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // --- NEW: CONFIRMATION POPUP STATE ---
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    const [formData, setFormData] = useState({
        title: '', description: '', facultyId: '',
        program: { programId: '' }, status: 'ACTIVE',
        createdByAdminId: null // Initialized as null, set dynamically on save/open
    });

    // --- NOTIFICATION STATE ---
    const [toast, setToast] = useState({ show: false, message: '' });

    const showNotification = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    /** * LOAD ALL: Synchronized with CourseServiceImpl.getAllCourses()
     * Captures "No courses found in the database." message directly from backend.
     */
    const loadAll = async () => {
        setLoading(true);
        setStatusMsg('');
        setIdQuery('');
        setProgramQuery('');
        try {
            const res = await CourseAPI.getAll(); 
            setCourses(res.data || []);
            setPage(1);
        } catch (err) {
            setCourses([]);
            setStatusMsg(err.response?.data?.message || "No courses registered.");
        } finally { setLoading(false); }
    };

    useEffect(() => { loadAll(); }, []);

    /**
     * SEARCH BY ID: Synchronized with CourseServiceImpl.getCourseById(Long courseId)
     * Replaces the entire list to ensure data integrity.
     */
    const doIdSearch = async (val) => {
        if (!val) { loadAll(); return; }
        setLoading(true);
        setProgramQuery('');
        setStatusMsg('');
        try {
            const res = await CourseAPI.getById(val);
            setCourses(res.data ? [res.data] : []); 
            setPage(1);
        } catch (err) {
            setCourses([]);
            setStatusMsg(err.response?.data?.message || `Course #${val} not found.`);
        } finally { setLoading(false); }
    };

    /**
     * SEARCH BY PROGRAM: Synchronized with CourseServiceImpl.getCoursesByProgramId(Long programId)
     * Maps the List<CourseDTO> response directly to state.
     */
    const doProgramSearch = async (val) => {
        if (!val) { loadAll(); return; }
        setLoading(true);
        setIdQuery('');
        setStatusMsg('');
        try {
            const res = await CourseAPI.getByProgramId(val);
            setCourses(res.data || []);
            setPage(1);
        } catch (err) {
            setCourses([]);
            setStatusMsg(err.response?.data?.message || "No results for this program.");
        } finally { setLoading(false); }
    };

    const onEnter = (e, type) => {
        if (e.key === 'Enter') {
            if (type === 'id') doIdSearch(idQuery);
            else if (type === 'program') doProgramSearch(programQuery);
        }
    };

    /**
     * ON SAVE: Synchronized with createCourse and updateCourse logic.
     * Handles specific APIExceptions like "Program is INACTIVE" or "Course title already exists".
     */
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            setShowConfirmPopup(true);
        } else {
            executeSave();
        }
    };

    const executeSave = async () => {
        setValErrors({});
        setShowConfirmPopup(false);
        
        // --- DYNAMIC ID ASSIGNMENT RIGHT BEFORE API CALL ---
        const activeAdminId = getAdminIdFromToken();
        const payload = {
            ...formData,
            createdByAdminId: activeAdminId,
            program: { programId: formData.program.programId }
        };

        try {
            if (isEdit) {
                await CourseAPI.update(formData.courseId, payload);
                showNotification(`Course "${formData.title}" updated successfully!`);
            } else {
                await CourseAPI.save(payload);
                showNotification(`Course "${formData.title}" created successfully!`);
            }
            setShowModal(false); // Modal automatically closes
            loadAll();
        } catch (err) {
            const backendData = err.response?.data;
            if (err.response?.status === 400 && backendData?.details) {
                const errorMap = {};
                backendData.details.split(', ').forEach(errStr => {
                    const parts = errStr.split(': ');
                    if (parts.length > 1) {
                        // --- FIX: Storing only the message (parts[1]), not the key (parts[0]) ---
                        errorMap[parts[0].trim()] = parts[1].trim(); 
                    } else {
                        errorMap.global = errStr;
                    }
                });
                setValErrors(errorMap);
            } 
            else if (backendData?.message) {
                setValErrors({ global: backendData.message });
            }
        }
    };

    const handleRowClick = (course) => {
        setSelectedCourse(course);
        setShowDetailModal(true);
    };

    const last = page * perPage;
    const first = last - perPage;
    const items = courses.slice(first, last);
    const total = Math.ceil(courses.length / perPage);

    return (
        <div className="admin-container container-fluid">
            
            {/* --- NOTIFICATION TOAST --- */}
            {toast.show && (
                <div className="custom-toast-container">
                    <div className="custom-toast shadow-lg">
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

            {/* --- MIDDLE SCREEN PERMISSION POPUP --- */}
            {showConfirmPopup && (
                <div className="confirm-overlay">
                    <div className="confirm-card shadow-lg animate-pop">
                        <div className="confirm-icon">
                            <AlertTriangle size={40} color="#f59e0b" />
                        </div>
                        <h4 className="fw-bold text-navy">Confirm Update</h4>
                        <p className="text-muted">Are you sure ! You want to update this course's details?</p>
                        <div className="confirm-actions">
                            <button className="btn btn-light px-4" onClick={() => setShowConfirmPopup(false)}>Cancel</button>
                            <button className="btn btn-navy px-4 text-white" onClick={executeSave}>Yes, Update</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="row align-items-center mb-4 g-3">
                <div className="col-md-8 text-start">
                    <h2 className="fw-bold text-navy mb-0">Course Administration</h2>
                    <p className="text-muted mb-0 small uppercase">Academic Governance Hub | Curriculum Management</p>
                </div>
                <div className="col-md-4 text-md-end text-start">
                    <button className="btn btn-edu-header d-inline-flex align-items-center gap-2 px-4 py-2 shadow-sm"
                        onClick={() => {
                            const activeId = getAdminIdFromToken();
                            setFormData({ title: '', description: '', facultyId: '', program: { programId: '' }, status: 'ACTIVE', createdByAdminId: activeId });
                            setValErrors({}); setIsEdit(false); setShowModal(true);
                        }}>
                        <Plus size={18} /> Create Course
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm p-3 mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-lg-4 col-md-6">
                        <label className="form-label small fw-bold text-muted uppercase">Search by Course ID </label>
                        <div className="search-wrapper">
                            <Search size={18} className="icon-left" />
                            <input type="number" className="form-control no-spin" placeholder="Course ID..."
                                value={idQuery} onChange={(e) => setIdQuery(e.target.value)} onKeyDown={(e) => onEnter(e, 'id')} />
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6">
                        <label className="form-label small fw-bold text-muted uppercase">Search Courses by Program ID</label>
                        <div className="search-wrapper">
                            <GraduationCap size={18} className="icon-left" />
                            <input type="number" className="form-control no-spin" placeholder="Program ID..."
                                value={programQuery} onChange={(e) => setProgramQuery(e.target.value)} onKeyDown={(e) => onEnter(e, 'program')} />
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-12">
                        <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                            style={{ height: '42px' }} onClick={loadAll}>
                            <RefreshCcw size={18} /> All Courses
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-card overflow-hidden shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr className="uppercase">
                                <th className="ps-4">ID</th>
                                <th>Course Details</th>
                                <th>Linked Program</th>
                                <th>Assigned Faculty</th>
                                <th>Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((c) => (
                                <tr key={c.courseId} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(c)}>
                                    <td className="ps-4 fw-bold text-muted">{c.courseId}</td>
                                    <td>
                                        <div className="fw-bold text-dark">{c.title}</div>
                                        <div className="small text-muted text-truncate" style={{ maxWidth: '250px' }}>{c.description}</div>
                                    </td>
                                    <td>
                                        <div className="small fw-bold text-navy">{c.programTitle}</div>
                                        <div className="text-muted" style={{ fontSize: '10px' }}>PGM-ID: {c.programId}</div>
                                    </td>
                                    <td>
                                        <div className="small fw-bold">{c.facultyName}</div>
                                        <div className="text-muted" style={{ fontSize: '10px' }}>{c.facultyEmail || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <span className={`badge-pill ${c.status === 'ACTIVE' ? 'bg-active' : 'bg-inactive'}`}>{c.status}</span>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center" onClick={(e) => {
                                            e.stopPropagation();
                                            setFormData({ ...c, program: { programId: c.programId } });
                                            setIsEdit(true); setValErrors({}); setShowModal(true);
                                        }}>
                                            <button className="btn btn-link p-0 text-primary"><Edit size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted fw-bold">
                                        {loading ? "Syncing with Backend..." : (statusMsg || "No matching data found.")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {courses.length > perPage && (
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
            {showDetailModal && selectedCourse && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-navy text-white py-3">
                                <h5 className="modal-title d-flex align-items-center gap-2 uppercase"><BookOpen size={22} /> Course Specification</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-start bg-light">
                                <div className="p-4 bg-white rounded shadow-sm mb-3">
                                    <h3 className="fw-bold text-navy mb-2">{selectedCourse.title}</h3>
                                    <p className="text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{selectedCourse.description}</p>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-white rounded shadow-sm border-start border-4 border-primary">
                                            <label className="small fw-bold text-muted d-block mb-1 uppercase">Linked Program</label>
                                            <span className="fw-bold text-dark">{selectedCourse.programTitle}</span>
                                            <div className="small text-muted">PGM-ID: {selectedCourse.programId} | Status: {selectedCourse.programStatus}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-white rounded shadow-sm border-start border-4 border-info">
                                            <label className="small fw-bold text-muted d-block mb-1 uppercase">Faculty Assignment</label>
                                            <span className="fw-bold text-dark d-block">{selectedCourse.facultyName}</span>
                                            <span className="small text-muted">{selectedCourse.facultyEmail}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-white border-0">
                                <button type="button" className="btn btn-navy w-100 uppercase" onClick={() => setShowDetailModal(false)}>Close View</button>
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
                                <h5 className="modal-title fw-bold uppercase">{isEdit ? 'Update Course Info' : ' New Course Entry'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleFormSubmit}>
                                <div className="modal-body p-4 text-start">
                                    {valErrors.global && <div className="alert alert-danger py-2 small fw-bold mb-3">{valErrors.global}</div>}

                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted uppercase">Course Title</label>
                                        <input type="text" className={`form-control ${valErrors.title ? 'is-invalid' : ''}`}
                                            value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                        {valErrors.title && <div className="text-danger small mt-1 fw-bold">{valErrors.title}</div>}
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold text-muted uppercase">Program ID</label>
                                            <input type="number" className="form-control no-spin"
                                                disabled={isEdit} placeholder="PID..."
                                                value={formData.program.programId} onChange={(e) => setFormData({ ...formData, program: { programId: e.target.value } })} />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold text-muted uppercase">Faculty ID</label>
                                            <input type="number" className="form-control no-spin"
                                                placeholder="FID..."
                                                value={formData.facultyId} onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted uppercase">Description</label>
                                        <textarea className="form-control" rows="3" value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                                    </div>

                                    <div className="mb-3">
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
                                        {isEdit ? 'Apply Changes' : 'Launch Course'}
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

export default AdminCourses;