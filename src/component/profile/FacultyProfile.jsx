import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Calendar, FileText, Eye } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
 
const FacultyProfile = () => {
    const [facultyInfo, setFacultyInfo] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
 
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
 
    // EduGov Brand Color
    const themeBlue = '#0284C7';
 
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
 
    if (loading) return (
<div className="d-flex justify-content-center py-5">
<div className="spinner-border" style={{ color: themeBlue }} role="status">
<span className="visually-hidden">Loading...</span>
</div>
</div>
    );
 
    return (
<div className="container py-5" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
<div className="row g-4">
                {/* --- LEFT COLUMN: Faculty Profile Details --- */}
<div className="col-lg-4">
<div className="card border-0 h-100" style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '12px' }}>
<div className="card-body p-4">
<div className="text-center mb-4">
<div 
                                    className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3" 
                                    style={{ width: '80px', height: '80px', backgroundColor: 'rgba(2, 132, 199, 0.1)' }}
>
<User size={40} style={{ color: themeBlue }} />
</div>
<h4 className="fw-bold mb-1" style={{ color: '#1E293B' }}>
                                    {facultyInfo?.name || "Faculty Name"}
</h4>
<p className="text-muted small mb-2">Faculty ID: {userId}</p>
                                {getStatusBadge(facultyInfo?.status)}
</div>
 
                            <div className="border-top pt-4 mt-2">
<h6 className="fw-bold small text-uppercase mb-3" style={{ color: '#94A3B8', letterSpacing: '1px' }}>
                                    Contact Information
</h6>
<div className="mb-3 d-flex align-items-center">
<Mail size={18} className="me-3" style={{ color: themeBlue }} />
<span className="text-truncate" style={{ color: '#475569', fontWeight: 500 }}>
                                        {facultyInfo?.email || 'N/A'}
</span>
</div>
<div className="mb-3 d-flex align-items-center">
<Phone size={18} className="me-3" style={{ color: themeBlue }} />
<span style={{ color: '#475569', fontWeight: 500 }}>
                                        {facultyInfo?.phone || 'N/A'}
</span>
</div>
<div className="mb-3 d-flex align-items-start">
<MapPin size={18} className="me-3 mt-1" style={{ color: themeBlue, flexShrink: 0 }} />
<span style={{ color: '#475569', fontWeight: 500, lineHeight: '1.4' }}>
                                        {facultyInfo?.address || 'N/A'}
</span>
</div>
<div className="d-flex align-items-center">
<Calendar size={18} className="me-3" style={{ color: themeBlue }} />
<span style={{ color: '#475569', fontWeight: 500 }}>
                                        {facultyInfo?.dob || 'N/A'}
</span>
</div>
</div>
</div>
</div>
</div>
 
                {/* --- RIGHT COLUMN: Academic Documents Table --- */}
<div className="col-lg-8">
<div className="card border-0 h-100" style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                        {/* Table Header Area */}
<div className="bg-white px-4 py-3 border-bottom d-flex align-items-center">
<FileText size={22} className="me-2" style={{ color: themeBlue }} />
<h5 className="fw-bold mb-0" style={{ color: '#1E293B' }}>Academic Documents</h5>
</div>
<div className="card-body p-0">
                            {/* 📍 text-nowrap and WebkitOverflowScrolling makes this safe for iPhone browsers */}
<div className="table-responsive text-nowrap" style={{ WebkitOverflowScrolling: 'touch' }}>
<table className="table table-hover align-middle mb-0">
<thead style={{ backgroundColor: '#F8FAFC' }}>
<tr>
<th className="ps-4 text-center border-bottom-0 text-uppercase text-muted" style={{ width: '35%', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', padding: '1rem' }}>Document Type</th>
<th className="text-center border-bottom-0 text-uppercase text-muted" style={{ width: '35%', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', padding: '1rem' }}>ID Number</th>
<th className="text-center pe-4 border-bottom-0 text-uppercase text-muted" style={{ width: '30%', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', padding: '1rem' }}>Action</th>
</tr>
</thead>
<tbody>
                                        {documents.length > 0 ? documents.map((doc) => (
<tr key={doc.documentId}>
<td className="ps-4 text-center py-3">
<span className="fw-bold" style={{ color: '#334155' }}>{doc.docType}</span>
</td>
<td className="text-center text-muted font-monospace small py-3">
                                                    {doc.docNum}
</td>
<td className="text-center pe-4 py-3">
<a
                                                        href={doc.file_url?.startsWith('http') ? doc.file_url : `http://localhost:8002/api/documents/file/${doc.file_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-sm d-inline-flex align-items-center"
                                                        style={{ 
                                                            color: themeBlue, 
                                                            backgroundColor: 'rgba(2, 132, 199, 0.1)',
                                                            border: 'none',
                                                            fontWeight: 600,
                                                            padding: '6px 16px',
                                                            borderRadius: '6px'
                                                        }}
>
<Eye size={16} className="me-2" /> View
</a>
</td>
</tr>
                                        )) : (
<tr>
<td colSpan="3" className="text-center py-5 text-muted">
<div className="d-flex flex-column align-items-center justify-content-center">
<FileText size={32} style={{ color: '#CBD5E1', marginBottom: '10px' }} />
<span style={{ fontWeight: 500 }}>No documents found for this faculty member.</span>
</div>
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