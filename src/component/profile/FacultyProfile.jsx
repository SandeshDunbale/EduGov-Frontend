import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Calendar, FileText, Download, Eye } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const FacultyProfile = () => {
    const [facultyInfo, setFacultyInfo] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get credentials from localStorage
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); 

    useEffect(() => {
        const fetchAllData = async () => {
            if (!userId || userId === "null") {
                setLoading(false);
                return;
            }

            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                // 1. Fetch Faculty Details
                const facultyRes = await axios.get(`http://localhost:8002/faculty/user/${userId}`, config);
                setFacultyInfo(facultyRes.data);

                // 2. Fetch Documents
                const docsRes = await axios.get(`http://localhost:8002/api/documents/user/${userId}`, config);
                setDocuments(docsRes.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [token, userId]);

    const getStatusBadge = (status) => {
        const s = status?.toString().toUpperCase();
        if (s === 'APPROVE' || s === 'APPROVED') return <span className="badge bg-success">Approved</span>;
        if (s === 'REJECT' || s === 'REJECTED' || s === 'DECLINED') return <span className="badge bg-danger">Rejected</span>;
        return <span className="badge bg-warning text-dark">Pending</span>;
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container py-5">
            <div className="row g-4">
                {/* LEFT COLUMN: Faculty Profile Details */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 p-4">
                        <div className="text-center mb-4">
                            <div className="mx-auto bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                <User size={40} className="text-primary" />
                            </div>
                            <h4 className="fw-bold mb-1">{facultyInfo?.name || "Faculty Name"}</h4>
                            <p className="text-muted small">Faculty ID: {userId}</p>
                            {getStatusBadge(facultyInfo?.status)}
                        </div>

                        <div className="border-top pt-3">
                            <h6 className="fw-bold small text-muted text-uppercase mb-3">Contact Information</h6>
                            <div className="mb-2 d-flex align-items-center">
                                <Mail size={16} className="me-2 text-primary" />
                                <span className="text-truncate">{facultyInfo?.email || 'N/A'}</span>
                            </div>
                            <div className="mb-2 d-flex align-items-center">
                                <Phone size={16} className="me-2 text-primary" />
                                <span>{facultyInfo?.phone || 'N/A'}</span>
                            </div>
                            <div className="mb-2 d-flex align-items-center">
                                <MapPin size={16} className="me-2 text-primary" />
                                <span>{facultyInfo?.address || 'N/A'}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <Calendar size={16} className="me-2 text-primary" />
                                <span>{facultyInfo?.dob || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Documents Table */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3 border-bottom-0">
                            <h5 className="fw-bold mb-0 d-flex align-items-center">
                                <FileText size={20} className="me-2 text-primary" /> Academic Documents
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">Type</th>
                                            <th>ID Number</th>
                                            <th className="text-end pe-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.length > 0 ? documents.map((doc) => (
                                            <tr key={doc.documentId}>
                                                <td className="ps-4">
                                                    <span className="fw-medium">{doc.docType}</span>
                                                </td>
                                                <td className="text-muted">{doc.docNum}</td>
                                                <td className="text-end pe-4">
                                                    <a 
                                                        href={doc.file_url?.startsWith('http') ? doc.file_url : `http://localhost:8002/api/documents/file/${doc.file_url}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                                                    >
                                                        <Eye size={14} className="me-1" /> View
                                                    </a>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="text-center py-5 text-muted">
                                                    No documents found for this faculty member.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyProfile;