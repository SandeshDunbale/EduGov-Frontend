import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Eye, Loader2 } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './UserManagement.css';

const UserManagement = () => {

    const [allRecords, setAllRecords] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDocs, setUserDocs] = useState([]);
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const token = localStorage.getItem('token');

    const fetchRecords = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [studentRes, facultyRes] = await Promise.all([
                axios.get('http://localhost:8002/students/all', config),
                axios.get('http://localhost:8002/faculty/all', config)
            ]);

            const students = studentRes.data.map(u => ({
                ...u, role: 'STUDENT', dbId: u.studentId
            }));

            const faculty = facultyRes.data.map(u => ({
                ...u, role: 'FACULTY', dbId: u.facultyId
            }));

            setAllRecords([...students, ...faculty]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleStatusUpdate = async (dbId, role, isApproved) => {
        const servicePath = role === 'STUDENT' ? 'students' : 'faculty';
        const action = isApproved ? 'approve' : 'decline';

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
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDocVerify = async (docId, isApproved) => {
        const statusValue = isApproved ? 'APPROVED' : 'DECLINED';
        const adminNotes = isApproved ? "Verified" : "Rejected";
        const adminId = 1; 

        setProcessingId(`doc-${docId}`);
        try {
            await axios.patch(
                `http://localhost:8002/api/documents/verify/${docId}`,
                null,
                {
                    params: { 
                        status: statusValue,
                        notes: adminNotes,
                        adminId: adminId
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

        const modal = new window.bootstrap.Modal(
            document.getElementById('viewModal')
        );
        modal.show();
    };

    const handleShowDocs = async () => {
        setActiveTab('docs');

        if (selectedUser?.userId) {
            try {
                const res = await axios.get(
                    `http://localhost:8002/api/documents/user/${selectedUser.userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUserDocs(res.data);
            } catch {
                setUserDocs([]);
            }
        }
    };

    if (loading) return <div className="text-center p-5">Loading...</div>;

    return (
        <div className="p-4">
            <table className="table table-borderless bg-white">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Details</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {allRecords.map(user => (
                      <tr key={`${user.role}-${user.dbId}`}>
                            <td>
                                <b>{user.name}</b><br />
                                {user.email}
                            </td>
                            <td>{user.role}</td>
                            <td>
                                <span className={`status-pill ${user.status?.toLowerCase()}`}>
                                    {user.status}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openModal(user)}
                                >
                                    <Eye size={14} /> View
                                </button>
                            </td>
                            <td>
                                {processingId === user.dbId ? (
                                    <div className="processing-text">
                                        <Loader2 className="spinner me-2" />
                                        Processing...
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-success btn-sm me-2"
                                            disabled={user.status !== 'PENDING'}
                                            onClick={() => handleStatusUpdate(user.dbId, user.role, true)}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            disabled={user.status !== 'PENDING'}
                                            onClick={() => handleStatusUpdate(user.dbId, user.role, false)}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="modal fade" id="viewModal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>User Details</h5>
                            <button className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="tab-container">
                                <button
                                    className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('basic')}
                                >
                                    Profile
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
                                    onClick={handleShowDocs}
                                >
                                    Documents
                                </button>
                            </div>

                            {activeTab === 'basic' && (
                                <div className="details-grid">
                                    {Object.entries(selectedUser || {})
                                        .filter(([key]) =>
                                            !['userId', 'studentId', 'facultyId', 'dbId', 'password']
                                                .includes(key)
                                        )
                                        .map(([key, value]) => (
                                            <div key={key} className="detail-card">
                                                <div className="detail-label">
                                                    {key.replace(/([A-Z])/g, ' $1')}
                                                </div>
                                                <div className="detail-value">
                                                    {value?.toString() || 'N/A'}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div>
                                    {userDocs.length > 0 ? (
                                        userDocs.map(doc => (
                                            <div className="doc-card" key={doc.documentId}>
                                                <div style={{ flex: 1 }}>
                                                    <div className="fw-bold">{doc.docType}</div>
                                                    <div className="small text-muted">ID: {doc.documentId}</div>
                                                    
                                                    {/* VIEW DOCUMENT LINK RESTORED */}
                                                    {doc.file_url && (
                                                        <a
                                                            href={doc.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-link px-0 mt-1 d-block"
                                                        >
                                                            View Document
                                                        </a>
                                                    )}
                                                    
                                                    <span className={`badge mt-2 ${doc.uploadStatus === 'APPROVED' ? 'bg-success' : doc.uploadStatus === 'DECLINED' ? 'bg-danger' : 'bg-warning'}`}>
                                                        {doc.uploadStatus}
                                                    </span>
                                                </div>

                                                <div className="ms-3">
                                                    {processingId === `doc-${doc.documentId}` ? (
                                                        <Loader2 className="spinner" />
                                                    ) : (
                                                        <div className="btn-group">
                                                            <button 
                                                                className="btn btn-outline-success btn-sm"
                                                                disabled={doc.uploadStatus !== 'PENDING'}
                                                                onClick={() => handleDocVerify(doc.documentId, true)}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm"
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
                                        <p className="text-center mt-3">No documents found</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;