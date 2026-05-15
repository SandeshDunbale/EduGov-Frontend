import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, BookOpen, Microscope, Wallet, 
    CheckCircle2, Clock, XCircle, Calendar, 
    ArrowUpRight, BarChart3, PieChart, Activity,
    TrendingUp, FileText, Globe, ShieldCheck
} from 'lucide-react';
import { CourseAPI } from '../../../services/courseService';
import { ProjectAPI } from '../../../services/projectService';
import { GrantAPI } from '../../../services/grantService';
import { jwtDecode } from 'jwt-decode';
import './FacultyDashboard.css';

const FacultyDashboard = () => {
    // Identity Extraction from verified JWT Payload
    const getFacultyId = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const decoded = jwtDecode(token);
            return decoded.facultyId; 
        } catch (error) { return null; }
    };

    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [projects, setProjects] = useState([]);
    const [grants, setGrants] = useState([]);
    
    // Analytics State
    const [stats, setStats] = useState({
        activeCourses: 0,
        inactiveCourses: 0,
        projectTotal: 0,
        pendingGrantAmt: 0,
        approvedGrantAmt: 0
    });

    useEffect(() => {
        const syncFacultyDossier = async () => {
            const fId = getFacultyId();
            if (!fId) return;

            try {
                setLoading(true);
                // Concurrent Data Fetching
                const [courseRes, projectRes, grantRes] = await Promise.all([
                    CourseAPI.getByFacultyId(fId),
                    // If this still fails, double-check if the method should be 'getByFacultyId' to match CourseAPI
                    ProjectAPI.getProjectsByFaculty(fId), 
                    GrantAPI.getGrantHistory(fId)
                ]);

                // Robust array extraction in case the API returns the array directly instead of inside .data
                const courseList = Array.isArray(courseRes) ? courseRes : (courseRes.data || []);
                const projectList = Array.isArray(projectRes) ? projectRes : (projectRes.data || []);
                const grantList = Array.isArray(grantRes) ? grantRes : (grantRes.data || []);

                setCourses(courseList);
                setProjects(projectList);
                setGrants(grantList);

                // Intelligence Logic: Derived from Service Implementation
                setStats({
                    activeCourses: courseList.filter(c => c.status === 'ACTIVE' || c.status === 'APPROVE').length,
                    inactiveCourses: courseList.filter(c => c.status !== 'ACTIVE' && c.status !== 'APPROVE').length,
                    projectTotal: projectList.length,
                    pendingGrantAmt: grantList
                        .filter(g => g.status === 'SUBMITTED')
                        .reduce((sum, g) => sum + (g.requestedAmount || 0), 0),
                    approvedGrantAmt: grantList
                        .filter(g => g.status === 'APPROVED')
                        .reduce((sum, g) => sum + (g.requestedAmount || 0), 0)
                });

            } catch (err) {
                console.error("Governance Sync Failure", err);
            } finally {
                setLoading(false);
            }
        };
        syncFacultyDossier();
    }, []);

    if (loading) {
        return (
            <div className="edu-loader-overlay">
                <div className="loader-box">
                    <div className="spinner-border text-teal" role="status"></div>
                    <span className="mt-3 fw-bold text-navy uppercase small ls-2">Authenticating Portfolio...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="faculty-dashboard container-fluid p-4 text-start">
            {/* --- DASHBOARD HEADER --- */}
            <div className="row mb-4 align-items-center">
                <div className="col-md-8">
                    <h2 className="fw-bold text-navy mb-1 d-flex align-items-center gap-2">
                        <ShieldCheck className="text-teal" size={32} /> Faculty Activity Dashboard
                    </h2>
                    <p className="text-muted small uppercase ls-1 mb-0">Faculty Work Hub | Courses & Research </p>
                </div>
                <div className="col-md-4 text-md-end">
                    <div className="current-date-pill px-3 py-2 rounded-pill bg-white shadow-sm border d-inline-flex align-items-center gap-2">
                        <Calendar size={16} className="text-teal" />
                        <span className="small fw-bold text-navy">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* --- ANALYTICS SUITE (Section A) --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="stat-card glass-card p-4 rounded-4 border-0 border-bottom border-5 border-teal">
                        <div className="d-flex justify-content-between">
                            <div>
                                <label className="d-block text-muted small fw-bold uppercase mb-1">Academic Load</label>
                                <h2 className="fw-bold text-navy mb-0">{stats.activeCourses} <span className="fs-6 text-muted fw-normal">Courses</span></h2>
                            </div>
                            <div className="stat-icon-box bg-teal-subtle text-teal"><BookOpen size={24}/></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card glass-card p-4 rounded-4 border-0 border-bottom border-5 border-primary">
                        <div className="d-flex justify-content-between">
                            <div>
                                <label className="d-block text-muted small fw-bold uppercase mb-1">Project Portfolio</label>
                                <h2 className="fw-bold text-navy mb-0">{stats.projectTotal} <span className="fs-6 text-muted fw-normal">Projects</span></h2>
                            </div>
                            <div className="stat-icon-box bg-primary-subtle text-primary"><Microscope size={24}/></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="stat-card glass-card p-4 rounded-4 border-0 border-bottom border-5 border-warning">
                        <div className="d-flex justify-content-between">
                            <div>
                                <label className="d-block text-muted small fw-bold uppercase mb-1">Total Funding</label>
                                <h2 className="fw-bold text-navy mb-0">&#x20B9; {stats.approvedGrantAmt.toLocaleString()}</h2>
                            </div>
                            <div className="stat-icon-box bg-warning-subtle text-warning"><Wallet size={24}/></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* --- COURSE MANAGEMENT (Section B) --- */}
                <div className="col-lg-6">
                    <div className="content-card shadow-sm rounded-4 bg-white p-4 h-100 border">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-navy mb-0 d-flex align-items-center gap-2">
                                <BookOpen size={20} className="text-teal" /> Assigned Teaching Registry
                            </h5>
                            <span className="badge bg-light text-navy border fw-bold">{courses.length} Total</span>
                        </div>
                        <div className="custom-scrollable-container">
                            {courses.length > 0 ? courses.map(c => (
                                <div className="interactive-item p-3 mb-3 border rounded-4" key={c.courseId}>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <h6 className="fw-bold text-dark mb-1">{c.title}</h6>
                                            <span className="small text-muted uppercase fw-bold" style={{fontSize:'10px'}}>Program: {c.programTitle}</span>
                                        </div>
                                        <span className={`badge-pill ${c.status === 'ACTIVE' || c.status === 'APPROVE' ? 'bg-success-subtle text-success' : 'bg-light text-muted'}`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <p className="text-muted small text-truncate-2 mb-2">{c.description}</p>
                                    <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                                        <div className="text-teal fw-bold small">CS-ID : {c.courseId}</div>
                                        <div className="small text-muted fw-bold uppercase">PGM-ID : {c.programId}</div>
                                    </div>
                                </div>
                            )) : <div className="empty-state py-5 text-center text-muted italic">No instructional assignments found.</div>}
                        </div>
                    </div>
                </div>

                {/* --- RESEARCH PORTFOLIO (Section C) --- */}
                <div className="col-lg-6">
                    <div className="content-card shadow-sm rounded-4 bg-white p-4 h-100 border">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-navy mb-0 d-flex align-items-center gap-2">
                                <Microscope size={20} className="text-primary" /> Research Initiatives | Project Panel
                            </h5>
                            <button className="btn btn-primary-soft btn-sm fw-bold px-3">View All Reports</button>
                        </div>
                        <div className="custom-scrollable-container">
                            {/* FIXED: Added robust fallback to handle 0 projects gracefully */}
                            {projects.length > 0 ? projects.map(p => (
                                <div className="interactive-item project-card p-3 mb-3 border-0 bg-light rounded-4" key={p.projectId}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="fw-bold text-navy">{p.title}</div>
                                        <div className={`status-dot-label ${p.status === 'COMPLETED' ? 'active' : 'pending'}`}>
                                            <span className="dot"></span> {p.status}
                                        </div>
                                    </div>
                                    <div className="text-muted mb-3" style={{fontSize: '11px', lineHeight:'1.4'}}>{p.description}</div>
                                    <div className="d-flex justify-content-between align-items-center border-top border-white pt-2">
                                        <div className="small text-muted d-flex align-items-center gap-1">
                                            <Calendar size={12}/> {p.startDate} — {p.endDate}
                                        </div>
                                        <ArrowUpRight size={16} className="text-primary" />
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state py-5 text-center text-muted italic">No active research projects found.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- GRANT FUNDING TRACKER (Section D) --- */}
                <div className="col-12">
                    <div className="content-card shadow-sm rounded-4 bg-white p-4 border">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-navy mb-0 d-flex align-items-center gap-2">
                                <Wallet size={20} className="text-warning" /> Funding Approval Tracker
                            </h5>
                            <Globe size={18} className="text-muted" />
                        </div>
                        <div className="table-responsive custom-table-scroll">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="sticky-top bg-white">
                                    <tr className="uppercase small text-muted border-bottom">
                                        <th className="border-0 ps-3">Reference</th>
                                        <th className="border-0">Requested Date</th>
                                        <th className="border-0">Requested Amount</th>
                                        <th className="border-0 text-center">Status</th>
                                        <th className="border-0 text-center">Governance Audit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grants.length > 0 ? grants.map(g => (
                                        <tr key={g.applicationID}>
                                            <td className="ps-3 fw-bold text-navy">APP-ID : {g.applicationID}</td>
                                            <td className="small text-muted">{g.submittedDate}</td>
                                            <td className="fw-bold text-dark">&#x20B9; {g.requestedAmount.toLocaleString()}</td>
                                            <td className="text-center">
                                                {/* FIXED: Added missing $ in the template literal to enable status colors */}
                                                <span className={`badge-pill ${g.status === 'APPROVED' ? 'bg-success-subtle text-success' : g.status === 'SUBMITTED' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}`}>
                                                    {g.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {g.status === 'APPROVED' ? <CheckCircle2 className="text-success shadow-sm" size={20}/> : 
                                                 g.status === 'SUBMITTED' ? <Clock className="text-warning shadow-sm" size={20}/> : 
                                                 <XCircle className="text-danger shadow-sm" size={20}/>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted">No funding records found for this identity.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;