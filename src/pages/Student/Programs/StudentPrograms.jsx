import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, ArrowRight, ArrowLeft, Calendar, BookOpen, Send, Info, Clock, User, Mail, X } from 'lucide-react';
import { ProgramAPI } from '../../../services/programService';
import { CourseAPI } from '../../../services/courseService';
import { EnrollmentAPI } from '../../../services/enrollmentService';
import { jwtDecode } from 'jwt-decode';
import './StudentPrograms.css';
 
const StudentPrograms = () => {
    // --- AUTOMATIC IDENTITY EXTRACTION ---
    const getStudentIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const decoded = jwtDecode(token);
            return decoded.studentId;
        } catch (error) {
            console.error("Identity extraction failed", error);
            return null;
        }
    };
 
    // State Variables
    const [programs, setPrograms] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('CATALOG');
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [courseErrorMsg, setCourseErrorMsg] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
   
    // FIXED: Added missing state variables
    const [enrollments, setEnrollments] = useState([]);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
 
    const showNotification = (msg, type = 'success') => {
        setToast({ show: true, message: msg, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };
 
    // Fetch Programs and Enrollments on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
           
            // 1. FETCH PROGRAMS (This was completely missing)
            try {
                // Adjust "getAll" to whatever your ProgramAPI method is named (e.g., getPrograms, fetchAll)
                const programResponse = await ProgramAPI.getAll();
                setPrograms(programResponse.data || programResponse);
            } catch (err) {
                console.error("Failed to fetch programs", err);
                showNotification("Failed to load program catalog", "error");
            }
 
            // 2. FETCH ENROLLMENTS
            const studentId = getStudentIdFromToken(); // FIXED: using the correct function name
            if (studentId) {
                try {
                    const safeFetch = (apiCall) => apiCall.catch(() => ({ data: [] }));
 
                    const [resApprove, resPending, resReject] = await Promise.all([
                        safeFetch(EnrollmentAPI.getByStatus('APPROVE')),
                        safeFetch(EnrollmentAPI.getByStatus('PENDING')),
                        safeFetch(EnrollmentAPI.getByStatus('REJECT'))
                    ]);
 
                    const combinedData = [
                        ...(resApprove?.data || []),
                        ...(resPending?.data || []),
                        ...(resReject?.data || [])
                    ];
                   
                    // FIXED: studentId is direct, not identity.studentId
                    const personalData = combinedData.filter(
                        e => String(e.studentId) === String(studentId)
                    );
                   
                    setEnrollments(personalData);
                    setStats({
                        total: personalData.length,
                        approved: personalData.filter(e => e.status === 'APPROVE' || e.status === 'ACTIVE').length,
                        pending: personalData.filter(e => e.status === 'PENDING').length,
                        rejected: personalData.filter(e => e.status === 'REJECT').length
                    });
 
                } catch (err) {
                    console.error("Governance Data Sync Failure", err);
                }
            }
           
            setLoading(false);
        };
 
        fetchInitialData();
    }, []);
 
    // FIXED: Added the missing handler for the "View Courses" button
    const handleViewCourses = async (program) => {
        setSelectedProgram(program);
        setView('COURSES');
        setLoading(true);
        try {
            // Adjust to match your CourseAPI method (e.g., getByProgramId)
            const response = await CourseAPI.getByProgramId(program.programId);
            setCourses(response.data || response);
            if (!response.data || response.data.length === 0) {
                 setCourseErrorMsg("No courses found for this program.");
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
            setCourseErrorMsg("Failed to load courses.");
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };
 
    // ... (Keep handleEnroll and the rest of your return() JSX exactly as it is)
 
    // Trigger Enrollment POST
    const handleEnroll = async (courseId) => {
        const sId = getStudentIdFromToken();
       
        if (!sId) {
            showNotification("Security Error: Student identity not found. Please re-login.", "error");
            return;
        }
 
        try {
            const payload = { studentId: sId, courseId: courseId };
            await EnrollmentAPI.apply(payload);
            showNotification("Application successful! Status: PENDING", "success");
        } catch (err) {
            showNotification(err.response?.data?.message || "Enrollment failed.", "error");
        }
    };
 
    const filteredPrograms = programs.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.programId.toString() === searchQuery
    );
 
    return (
        <div className="student-workspace container-fluid p-3 p-md-4">
           
            {/* --- CUSTOM NOTIFICATION TOAST (Based on Sample) --- */}
            {toast.show && (
                <div className={`custom-toast shadow-lg ${toast.type === 'error' ? 'toast-error' : ''}`}>
                    <div className="toast-icon-wrapper">
                        {toast.type === 'success' ? (
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <Info size={18} />
                        )}
                    </div>
                    <div className="toast-body">
                        {toast.message}
                    </div>
                    <button className="toast-close-x" onClick={() => setToast({ ...toast, show: false })}>×</button>
                    <div className="toast-loader-bar"></div>
                </div>
            )}
 
            {/* Header Navigation */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div className="text-start">
                    <h2 className="fw-bold text-navy mb-0">
                        {view === 'CATALOG' ? 'Academic Course Enrollment' : selectedProgram?.title}
                    </h2>
                    <p className="text-muted small mb-0 uppercase">
                        {view === 'CATALOG' ? 'Explore academic pathways | Student Portal' : 'Choose a Course for Enrollment'}
                    </p>
                </div>
                {view === 'COURSES' && (
                    <button className="btn btn-outline-navy btn-sm d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                            onClick={() => setView('CATALOG')}>
                        <ArrowLeft size={16} /> Back to programs Catalog
                    </button>
                )}
            </div>
 
            {/* Integrated Search Bar (Only for Catalog View) */}
            {view === 'CATALOG' && (
                <div className="card border-0 shadow-sm mb-4 p-2 search-card">
                    <div className="search-wrapper position-relative">
                        <Search size={18} className="icon-left text-muted position-absolute" style={{left: '15px', top: '50%', transform: 'translateY(-50%)'}} />
                        <input
                            type="text" className="form-control border-0 bg-light ps-5 py-2"
                            placeholder="Search Program by Title or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            )}
 
            {/* Main Content Area */}
            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5 text-muted uppercase small fw-bold">Syncing Admission Records...</div>
                ) : view === 'CATALOG' ? (
                    filteredPrograms.length > 0 ? filteredPrograms.map(p => (
                        <div className="col-lg-4 col-md-6" key={p.programId}>
                            <div className="program-card h-100 shadow-sm border-0 bg-white p-4 text-start d-flex flex-column">
                                <div className="card-accent mb-3"></div>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="icon-circle bg-light text-primary"><GraduationCap size={20} /></div>
                                    <span className={`badge-pill small uppercase fw-bold ${p.status === 'ACTIVE' ? 'bg-active' : 'bg-inactive'}`}>
                                        {p.status}
                                    </span>
                                </div>
                               
                                <div className="program-card-body flex-grow-1 overflow-auto pe-2 mb-3">
                                    <h5 className="fw-bold text-navy mb-2">{p.title}</h5>
                                    <p className="text-muted small mb-3">{p.description}</p>
                                   
                                    <div className="program-meta-info border-top pt-2 mt-2">
                                        <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                                            <Calendar size={14} className="text-teal" />
                                            <span className="tiny fw-bold uppercase">Activation Date:</span>
                                            <span className="small text-dark">{p.startDate}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-muted">
                                            <Clock size={14} className="text-danger" />
                                            <span className="tiny fw-bold uppercase">Expiration Date:</span>
                                            <span className="small text-dark">{p.endDate}</span>
                                        </div>
                                    </div>
                                </div>
 
                                <div className="pt-3 border-top mt-auto d-flex justify-content-end align-items-center">
                                    <button className="btn btn-navy btn-sm d-flex align-items-center gap-2 px-3" onClick={() => handleViewCourses(p)}>
                                        View Courses <ArrowRight size={14}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : <div className="col-12 text-center py-4 text-muted italic">No programs match your search criteria.</div>
                ) : (
                    courses.length > 0 ? courses.map(course => (
                        <div className="col-lg-6 col-md-12" key={course.courseId}>
                            <div className="course-detail-card shadow-sm border-0 bg-white text-start d-flex flex-column">
                                {/* Fixed Header for Course Card */}
                                <div className="p-4 border-bottom bg-light-subtle rounded-top-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="badge bg-navy text-white tiny uppercase fw-bold">CS-ID-{course.courseId}</span>
                                        <span className={`badge-pill tiny uppercase fw-bold ${course.status === 'ACTIVE' ? 'bg-active' : 'bg-inactive'}`}>
                                            {course.status}
                                        </span>
                                    </div>
                                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                        <BookOpen size={20} className="text-teal" /> {course.title}
                                    </h5>
                                </div>
 
                                {/* Scrollable Body for Course Card */}
                                <div className="course-card-body flex-grow-1 overflow-auto p-4" style={{maxHeight: '200px'}}>
                                    <label className="tiny fw-bold text-muted uppercase d-block mb-1">Course Curriculum Overview</label>
                                    <p className="text-muted small mb-4" style={{lineHeight: '1.6'}}>{course.description}</p>
                                   
                                    <div className="faculty-assignment p-3 rounded-3 bg-light border-start border-4 border-teal">
                                        <label className="tiny fw-bold text-navy uppercase d-block mb-2">Assigned Faculty</label>
                                        <div className="d-flex flex-column gap-1">
                                            <div className="d-flex align-items-center gap-2 small fw-bold text-dark">
                                                <User size={14} className="text-muted" /> {course.facultyName || 'Instruction Pending'}
                                            </div>
                                            <div className="d-flex align-items-center gap-2 small text-muted">
                                                <Mail size={14} /> {course.facultyEmail || 'No contact provided'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
 
                                {/* Footer Action */}
                                <div className="p-3 border-top bg-white rounded-bottom-4">
                                    <button className="btn btn-edu-header w-100 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-bold uppercase"
                                            onClick={() => handleEnroll(course.courseId)}>
                                        Enroll Now <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-12 text-center py-5">
                            <h4 className="fw-bold text-navy uppercase">
                                {courseErrorMsg}
                            </h4>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
 
export default StudentPrograms;