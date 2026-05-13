import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, BookOpen, CheckCircle, Clock, XCircle, 
    Calendar, GraduationCap, BarChart3, User, ShieldCheck, Activity, Award, Inbox
} from 'lucide-react'; 
import { EnrollmentAPI } from '../../../services/enrollmentService';
import { jwtDecode } from 'jwt-decode';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const getStudentIdentity = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const decoded = jwtDecode(token);
            return {
                studentId: decoded.studentId,
                name: decoded.sub?.split('@')[0] || 'Student'
            };
        } catch (error) { return null; }
    };

    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

    useEffect(() => {
        const syncAcademicDossier = async () => {
            const identity = getStudentIdentity();
            if (!identity?.studentId) return;

            try {
                setLoading(true);
                
                const [resApprove, resPending, resReject] = await Promise.all([
                    EnrollmentAPI.getByStatus('APPROVE'),
                    EnrollmentAPI.getByStatus('PENDING'),
                    EnrollmentAPI.getByStatus('REJECT')
                ]).catch(async () => {
                    return [ {data: []}, {data: []}, {data: []} ];
                });

                const combinedData = [
                    ...(resApprove?.data || []),
                    ...(resPending?.data || []),
                    ...(resReject?.data || [])
                ];
                
                const personalData = combinedData.filter(e => e.studentId === identity.studentId);
                
                setEnrollments(personalData);
                setStats({
                    total: personalData.length,
                    approved: personalData.filter(e => e.status === 'APPROVE' || e.status === 'ACTIVE').length,
                    pending: personalData.filter(e => e.status === 'PENDING').length,
                    rejected: personalData.filter(e => e.status === 'REJECT').length
                });

            } catch (err) {
                console.error("Governance Data Sync Failure", err);
            } finally {
                setLoading(false);
            }
        };
        syncAcademicDossier();
    }, []);

    if (loading) {
        return (
            <div className="edu-glass-loader">
                <div className="loader-box">
                    <div className="spinner-grow text-teal" role="status"></div>
                    <span className="mt-3 fw-bold text-navy uppercase small ls-2">Authorizing Identity...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="student-dashboard container-fluid p-4 text-start">
            {/* Header Section */}
            <div className="row mb-4 align-items-center">
                <div className="col-md-8 text-start">
                    <h2 className="fw-bold text-navy mb-1 d-flex align-items-center gap-2">
                        <Award className="text-teal" size={32} /> My Learning Dashboard
                    </h2>
                    <p className="text-muted small uppercase ls-1 mb-0">
                        Student Hub | My Performance
                    </p>
                </div>
                <div className="col-md-4 text-md-end">
                    
                </div>
            </div>

            {/* Metrics Section */}
            <div className="row g-3 mb-5">
                {[
                    { label: 'Total Enrollments', value: stats.total, icon: Inbox, color: 'navy', border: '#1f3b55' },
                    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'teal', border: '#3bbfad' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'warning', border: '#f59e0b' },
                    { label: 'Declined', value: stats.rejected, icon: XCircle, color: '#cb0f0fff', border: '#ea0909ff' },
                ].map((stat, idx) => (
                    <div className="col-md-3" key={idx}>
                        <div className="stat-card glass-morphism p-4 rounded-4 border-0 h-100" style={{borderLeft: `5px solid ${stat.border}`}}>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <label className="d-block text-muted small fw-bold uppercase mb-1">{stat.label}</label>
                                    <h2 className={`fw-bold mb-0`} style={{color: stat.color === 'navy' ? '#1f3b55' : stat.color === 'teal' ? '#3bbfad' : stat.color === 'warning' ? '#f59e0b' : stat.color}}>{stat.value}</h2>
                                </div>
                                <div className={`stat-icon-wrap bg-light text-navy`}><stat.icon size={22}/></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {/* Main Ledger Section */}
                <div className="col-lg-8">
                    <div className="dashboard-content-box bg-white p-4 rounded-4 shadow-sm h-100 border">
                        <h5 className="fw-bold text-navy mb-4 d-flex align-items-center gap-2">
                            <GraduationCap size={22} className="text-teal" /> Course Enrollment Logs
                        </h5>
                        <div className="enrollment-list-scroll px-2">
                            {enrollments.length > 0 ? enrollments.map(e => (
                                <div className="enrollment-card-horizontal p-3 mb-3 border rounded-4 shadow-sm" key={e.enrollmentId}>
                                    <div className="row align-items-center g-3">
                                        <div className="col-md-6 text-start">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="course-avatar bg-light text-navy rounded-3"><BookOpen size={18}/></div>
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-1">{e.courseTitle}</h6>
                                                    <div className="d-flex gap-2 small text-muted">
                                                        <span className="text-teal fw-bold">ENR-ID : {e.enrollmentId}</span>
                                                        <span>•</span>
                                                        <span>Enroll CS-ID : {e.courseId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3 text-center">
                                            <div className={`status-badge-custom ${e.status.toLowerCase()}`}>
                                                <span className="pulse-dot"></span> {e.status}
                                            </div>
                                        </div>
                                        <div className="col-md-3 text-md-end">
                                            <div className="text-muted uppercase fw-bold" style={{fontSize: '9px'}}>Submission Date</div>
                                            <div className="small fw-bold text-navy">{new Date(e.enrollmentDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    {e.approvedByAdminName && (
                                        <div className="admin-verification-bar mt-3 pt-2 border-top d-flex align-items-center gap-2">
                                            <ShieldCheck size={14} className="text-teal" />
                                            <span className="text-muted small">Verified by : <strong className="text-navy">{e.approvedByAdminName}</strong></span>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="empty-enrollment-state py-5 text-center">
                                    <p className="text-muted italic small">No enrollment history found matching your ID.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Analytics Section */}
                <div className="col-lg-4">
                    <div className="insights-card bg-navy text-white p-4 rounded-4 shadow-sm h-100 position-relative overflow-hidden">
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 position-relative">
                            <BarChart3 size={20} className="text-teal" /> Academic Standing
                        </h5>
                        
                        {/* Approved Progress Box */}
                        <div className="glass-insight mb-3 p-4 rounded-4 border border-white border-opacity-10 text-center">
                            <label className="d-block small uppercase text-teal fw-bold mb-2">Approved Courses Progress</label>
                            <h1 className="fw-bold text-white mb-0 display-4">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</h1>
                            <div className="progress mt-3 bg-white bg-opacity-10" style={{height: '8px'}}>
                                <div className="progress-bar bg-teal" style={{width: `${stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%`}}></div>
                            </div>
                        </div>

                        {/* Declined Progress Box */}
                        <div className="glass-insight mb-3 p-4 rounded-4 border border-white border-opacity-10 text-center">
                            <label className="d-block small uppercase text-danger text-center fw-bold mb-2">Declined Courses Progress</label>
                            <h1 className="fw-bold text-white mb-0 display-4">{stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%</h1>
                            <div className="progress mt-3 bg-white bg-opacity-10" style={{height: '8px'}}>
                                <div className="progress-bar bg-danger" style={{width: `${stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%`}}></div>
                            </div>
                        </div>

                        <p className="small opacity-50 italic mt-5 text-center">Verified Education Governance System Record © 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;