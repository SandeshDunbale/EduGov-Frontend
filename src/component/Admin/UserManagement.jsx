import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Eye, Loader2 } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './UserManagement.css';

const UserManagement = () => {
    const [allRecords, setAllRecords] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDocs, setUserDocs] = useState([]);
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    
    const [showModal, setShowModal] = useState(false);

    const extractData = (res) => {
        if (!res || !res.data) return [];
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data.content)) return res.data.content;
        return [];
    };

    useEffect(() => {
        let isMounted = true; 

        const loadData = async () => {
            const token = localStorage.getItem('token'); 
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                const [studentRes, facultyRes] = await Promise.all([
                    axios.get('http://localhost:8002/students/all', config),
                    axios.get('http://localhost:8002/faculty/all', config)
                ]);

                if (!isMounted) return; 

                const safeStudents = extractData(studentRes);
                const safeFaculty = extractData(facultyRes);

                const students = safeStudents.map(u => ({
                    ...u, 
                    role: 'STUDENT', 
                    dbId: u.studentId || u.id || u.userId || Math.random().toString(36).substr(2, 9)
                }));

                const faculty = safeFaculty.map(u => ({
                    ...u, 
                    role: 'FACULTY', 
                    dbId: u.facultyId || u.id || u.userId || Math.random().toString(36).substr(2, 9)
                }));

                setAllRecords([...students, ...faculty]);
            } catch (e) {
                console.error("Failed to fetch users:", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []); 

    const handleStatusUpdate = async (dbId, role, isApproved) => {
        const servicePath = role === 'STUDENT' ? 'students' : 'faculty';
        const action = isApproved ? 'approve' : 'decline';
        const token = localStorage.getItem('token');

        setProcessingId(dbId);

        try {
            await axios.patch(
                `http://localhost:8002/${servicePath}/${dbId}/${action}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAllRecords(prev =>
                prev.map(user =>
                    user.dbId === dbId
                        ? { ...user, status: isApproved ? 'APPROVED' : 'DECLINED' }
                        : user
                )
            );
        } catch (e) {
            console.error("Status Update Error:", e);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDocVerify = async (docId, isApproved) => {
        const statusValue = isApproved ? 'APPROVED' : 'DECLINED';
        const adminNotes = isApproved ? "Verified" : "Rejected";
        const token = localStorage.getItem('token');

        setProcessingId(`doc-${docId}`);
        try {
            await axios.patch(
                `http://localhost:8002/api/documents/verify/${docId}`,
                null,
                {
                    params: { 
                        status: statusValue,
                        notes: adminNotes,
                        adminId: 1
                    },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setUserDocs(prev =>
                prev.map(doc =>
                    doc.documentId === docId
                        ? { ...doc, uploadStatus: statusValue, adminNotes: adminNotes }
                        : doc
                )
            );
        } catch (e) {
            console.error("Doc Update Error:", e);
        } finally {
            setProcessingId(null);
        }
    };

    const openModal = (user) => {
        setSelectedUser(user);
        setActiveTab('basic');
        setUserDocs([]);
        setShowModal(true); 
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleShowDocs = async () => {
        setActiveTab('docs');
        const targetId = selectedUser?.userId || selectedUser?.dbId;

        if (targetId) {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(
                    `http://localhost:8002/api/documents/user/${targetId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUserDocs(Array.isArray(res.data) ? res.data : []);
            } catch {
                setUserDocs([]);
            }
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <div className="text-secondary fw-bold fs-5 d-flex align-items-center">
                    <Loader2 className="spinner me-2" size={24} /> Loading Institutional Data...
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="table-responsive bg-white rounded shadow-sm p-3 border">
                <table className="table table-borderless align-middle m-0">
                    <thead className="bg-light border-bottom">
                        <tr>
                            <th className="py-3 text-secondary text-uppercase small">User Details</th>
                            <th className="py-3 text-secondary text-uppercase small text-center">Role</th>
                            <th className="py-3 text-secondary text-uppercase small text-center">Status</th>
                            <th className="py-3 text-secondary text-uppercase small text-center">Profile</th>
                            <th className="py-3 text-secondary text-uppercase small text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allRecords.length > 0 ? (
                            allRecords.map((user, index) => (
                                <tr key={`user-${user.dbId}-${index}`} className="border-bottom">
                                    <td className="py-3">
                                        <b className="text-dark d-block mb-1">{user.name || 'Unknown User'}</b>
                                        <small className="text-muted">{user.email || 'No email provided'}</small>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge bg-secondary px-3 py-2">{user.role}</span>
                                    </td>
                                    <td className="text-center">
                                        <span className={`status-pill ${user.status?.toLowerCase() || 'pending'}`}>
                                            {user.status || 'PENDING'}
                                        </span>
                                    </td>
                                    {/* 🟢 FIXED: Prevent text wrapping in actions column */}
                                    <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                                        <button
                                            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1 fw-bold"
                                            onClick={() => openModal(user)}
                                        >
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        {processingId === user.dbId ? (
                                            <div className="processing-text justify-content-center small">
                                                <Loader2 className="spinner me-1" size={14} /> Processing
                                            </div>
                                        ) : (
                                            /* 🟢 FIXED: Added flex-nowrap to prevent buttons from stacking weirdly */
                                            <div className="d-flex justify-content-center gap-2 flex-nowrap">
                                                <button
                                                    className="btn btn-success btn-sm px-3 fw-bold flex-fill"
                                                    disabled={user.status !== 'PENDING'}
                                                    onClick={() => handleStatusUpdate(user.dbId, user.role, true)}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm px-3 fw-bold flex-fill"
                                                    disabled={user.status !== 'PENDING'}
                                                    onClick={() => handleStatusUpdate(user.dbId, user.role, false)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-muted p-5">
                                    No records found in the database.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL LOGIC */}
            {showModal && (
                <div 
                    className="modal fade show d-block" 
                    tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} 
                    onClick={closeModal} 
                >
                    <div 
                        className="modal-dialog modal-lg modal-dialog-centered" 
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-light border-bottom-0 pb-0">
                                <h5 className="modal-title fw-bold px-2 pt-2">User Administration</h5>
                                <button type="button" className="btn-close me-2 mt-2" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body px-4 pb-4">
                                <div className="tab-container mt-2">
                                    <button
                                        className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('basic')}
                                    >
                                        Profile Information
                                    </button>
                                    <button
                                        className={`tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
                                        onClick={handleShowDocs}
                                    >
                                        Verification Documents
                                    </button>
                                </div>

                                {activeTab === 'basic' && (
                                    <div className="details-grid mt-4">
                                        {Object.entries(selectedUser || {})
                                            .filter(([key]) =>
                                                !['userId', 'studentId', 'facultyId', 'dbId', 'password', 'authorities'].includes(key)
                                            )
                                            .map(([key, value]) => (
                                                <div key={key} className="detail-card shadow-sm">
                                                    <div className="detail-label text-uppercase mb-1 fw-bold text-primary" style={{fontSize: '0.75rem'}}>
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </div>
                                                    <div className="detail-value text-dark fs-6">
                                                        {value?.toString() || <span className="text-muted fst-italic">Not Provided</span>}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {activeTab === 'docs' && (
                                    <div className="mt-4">
                                        {userDocs.length > 0 ? (
                                            userDocs.map(doc => (
                                                <div className="doc-card shadow-sm" key={doc.documentId}>
                                                    <div style={{ flex: 1 }}>
                                                        <div className="fw-bold text-dark fs-5">{doc.docType}</div>
                                                        <div className="small text-muted mb-2">Doc ID: {doc.documentId}</div>
                                                        
                                                        {doc.file_url && (
                                                            <a
                                                                href={doc.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-decoration-none fw-bold"
                                                            >
                                                                <Eye size={16} className="me-1"/> View Source File
                                                            </a>
                                                        )}
                                                        
                                                        <div className="mt-3">
                                                            <span className={`badge px-3 py-2 ${doc.uploadStatus === 'APPROVED' ? 'bg-success' : doc.uploadStatus === 'DECLINED' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                                Status: {doc.uploadStatus}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="ms-3 pe-3">
                                                        {processingId === `doc-${doc.documentId}` ? (
                                                            <Loader2 className="spinner text-primary" size={28}/>
                                                        ) : (
                                                            <div className="btn-group-vertical gap-2">
                                                                <button 
                                                                    className="btn btn-outline-success btn-sm fw-bold px-4 rounded"
                                                                    disabled={doc.uploadStatus !== 'PENDING'}
                                                                    onClick={() => handleDocVerify(doc.documentId, true)}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button 
                                                                    className="btn btn-outline-danger btn-sm fw-bold px-4 rounded"
                                                                    disabled={doc.uploadStatus !== 'PENDING'}
                                                                    onClick={() => handleDocVerify(doc.documentId, false)}
                                                                >
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center bg-light rounded p-5 mt-3 border">
                                                <p className="text-muted fw-bold mb-0">No documents have been uploaded by this user.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;