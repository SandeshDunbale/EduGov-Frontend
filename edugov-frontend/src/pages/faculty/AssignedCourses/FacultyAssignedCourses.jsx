import React, { useState, useEffect } from 'react';
import { BookOpen, Briefcase, GraduationCap, Search, Info, Map, User, Calendar, Layout, Clock, ShieldCheck, Database } from 'lucide-react';
import { CourseAPI } from '../../../services/courseService';
import { ProgramAPI } from '../../../services/programService';
import { jwtDecode } from 'jwt-decode'; 
import './FacultyAssignedCourses.css';

const FacultyAssignedCourses = () => {
    // --- AUTOMATIC IDENTITY EXTRACTION ---
    const getFacultyIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const decoded = jwtDecode(token);
            return decoded.facultyId;
        } catch (error) {
            console.error("Token decoding failed", error);
            return null;
        }
    };

    const [assignedCourses, setAssignedCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [allPrograms, setAllPrograms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [courseQuery, setCourseQuery] = useState('');
    const [programQuery, setProgramQuery] = useState('');

    useEffect(() => {
        const loadFacultyData = async () => {
            setLoading(true);
            const facultyId = getFacultyIdFromToken();

            try {
                // 1. Fetch assigned duties for the faculty [cite: 526, 571]
                if (facultyId) {
                    const assignedRes = await CourseAPI.getByFacultyId(facultyId);
                    const rawCourses = assignedRes.data || [];

                    // 📍 DYNAMIC DATE FETCHING LOGIC
                    // For each assigned course, fetch its specific Program details to get the dates
                    const enrichedCourses = await Promise.all(
                        rawCourses.map(async (course) => {
                            try {
                                if (course.programId) {
                                    const progRes = await ProgramAPI.getById(course.programId); // [cite: 347]
                                    return {
                                        ...course,
                                        startDate: progRes.data?.startDate || 'N/A',
                                        endDate: progRes.data?.endDate || 'N/A'
                                    };
                                }
                                return { ...course, startDate: 'N/A', endDate: 'N/A' };
                            } catch (err) {
                                return { ...course, startDate: 'Pending', endDate: 'Pending' };
                            }
                        })
                    );
                    setAssignedCourses(enrichedCourses);
                }

                // 2. Fetch global data for catalog sections [cite: 532, 347]
                const [allCoursesRes, allProgramsRes] = await Promise.all([
                    CourseAPI.getAll(),
                    ProgramAPI.getAll()
                ]);
                setAllCourses(allCoursesRes.data || []);
                setAllPrograms(allProgramsRes.data || []);

            } catch (err) {
                console.error("Workspace sync failed", err);
            } finally { setLoading(false); }
        };
        loadFacultyData();
    }, []);

    const filteredCourses = allCourses.filter(c =>
        c.title.toLowerCase().includes(courseQuery.toLowerCase()) || c.courseId.toString() === courseQuery
    );
    const filteredPrograms = allPrograms.filter(p =>
        p.title.toLowerCase().includes(programQuery.toLowerCase()) || p.programId.toString() === programQuery
    );

    return (
        <div className="faculty-workspace container-fluid p-3 p-md-4 text-start">
            <div className="workspace-header mb-4 border-bottom pb-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-navy p-2 rounded shadow-sm text-white">
                        <Layout size={24} />
                    </div>
                    <div>
                        <h2 className="fw-bold text-navy mb-0">Faculty Academic Workspace</h2>
                        <p className="text-muted small uppercase mb-0">Assigned Duties | University Catalog | Curriculum Awareness</p>
                    </div>
                </div>
            </div>

            {/* SECTION 1: ASSIGNED COURSES (RESTYLED TO CARDS) */}
            <div className="section-container mb-5">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-2">
                        <div className="icon-pill bg-teal text-white shadow-sm"><Briefcase size={18} /></div>
                        <h5 className="fw-bold text-navy mb-0">My Assigned Teaching Load</h5>
                    </div>
                    <span className="badge bg-navy px-3 rounded-pill shadow-sm">{assignedCourses.length} Active Records</span>
                </div>

                <div className="assigned-box-scroll shadow-sm rounded-4 border bg-white p-3">
                    {loading ? (
                        <div className="text-center py-5 text-muted">
                            <div className="spinner-border spinner-border-sm me-2 text-teal"></div> 
                            Synchronizing assignment ledger...
                        </div>
                    ) : assignedCourses.length > 0 ? (
                        <div className="row g-3">
                            {assignedCourses.map(c => (
                                <div className="col-12" key={c.courseId}>
                                    <div className="detailed-duty-card border rounded-4 overflow-hidden">
                                        <div className="row g-0">
                                            {/* Course Metadata */}
                                            <div className="col-md-6 p-4 border-end bg-course-side">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="badge-pill bg-active small uppercase fw-bold">Course Details</div>
                                                    <span className="text-navy fw-bold small">CS-ID : {c.courseId}</span>
                                                </div>
                                                <h4 className="fw-bold text-navy mb-2">{c.title}</h4>
                                                <p className="text-muted small mb-3 text-description-limit">{c.description}</p>
                                                <div className="d-flex align-items-center gap-2">
                                                    <ShieldCheck size={14} className="text-teal" />
                                                    <span className="small fw-bold">Status: <span className="text-success">{c.status}</span></span>
                                                </div>
                                            </div>
                                            {/* Program Awareness Mapping */}
                                            <div className="col-md-6 p-4 bg-program-side">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="badge-pill bg-program-tag small uppercase fw-bold">Associated Program</div>
                                                    <span className="text-teal fw-bold small">PGM-ID : {c.programId}</span>
                                                </div>
                                                <h5 className="fw-bold text-dark mb-1">{c.programTitle}</h5>
                                                <p className="text-muted italic small mb-3">Governance Structure Awareness Active</p>
                                                
                                                <div className="row g-2 mb-3">
                                                    <div className="col-6 text-start">
                                                        <div className="date-box p-2 rounded bg-white border">
                                                            <div className="text-muted uppercase" style={{fontSize:'9px'}}>Activation</div>
                                                            <div className="small fw-bold text-navy"><Clock size={12} className="me-1"/> {c.startDate}</div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 text-start">
                                                        <div className="date-box p-2 rounded bg-white border">
                                                            <div className="text-muted uppercase" style={{fontSize:'9px'}}>Expiration</div>
                                                            <div className="small fw-bold text-navy"><Calendar size={12} className="me-1"/> {c.endDate}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center gap-2">
                                                    <Database size={14} className="text-navy" />
                                                    <span className="small fw-bold">Program Status: <span className="text-primary">{c.programStatus}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="alert alert-light border-dashed text-muted italic text-center py-5">
                            No active teaching assignments found in the governance hub.
                        </div>
                    )}
                </div>
            </div>

            <div className="row g-4">
                <div className="col-xl-6 col-lg-12">
                    <div className="section-card h-100 shadow-sm bg-white p-4 rounded-4">
                        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="icon-pill bg-navy text-white shadow-sm"><BookOpen size={18} /></div>
                                <h5 className="fw-bold text-navy mb-0">University Catalog</h5>
                            </div>
                            <div className="search-mini">
                                <div className="position-relative">
                                    <Search size={14} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                                    <input type="text" className="form-control ps-5" placeholder="Search Catalog..."
                                        value={courseQuery} onChange={(e) => setCourseQuery(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="scroll-list rounded border">
                            {filteredCourses.map(c => (
                                <div className="list-item border-bottom p-3 d-flex justify-content-between align-items-center" key={c.courseId}>
                                    <div className="pe-3">
                                        <div className="fw-bold text-dark small mb-1">{c.title}</div>
                                        <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '11px' }}>
                                            <User size={10} /> Faculty: {c.facultyName || 'To Be Assigned'}
                                        </div>
                                    </div>
                                    <div className="badge-pill bg-light text-navy fw-bold border text-nowrap" style={{ fontSize: '10px' }}>CS-ID : {c.courseId}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-xl-6 col-lg-12">
                    <div className="section-card h-100 shadow-sm bg-white p-4 rounded-4">
                        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="icon-pill bg-primary text-white shadow-sm"><GraduationCap size={18} /></div>
                                <h5 className="fw-bold text-navy mb-0">Program Structures</h5>
                            </div>
                            <div className="search-mini">
                                <div className="position-relative">
                                    <Search size={14} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                                    <input type="text" className="form-control ps-5" placeholder="Search Programs..."
                                        value={programQuery} onChange={(e) => setProgramQuery(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="scroll-list rounded border">
                            {filteredPrograms.map(p => (
                                <div className="list-item border-bottom p-3 text-start" key={p.programId}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="fw-bold text-navy small">{p.title}</div>
                                        <span className={`status-dot ${p.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}></span>
                                    </div>
                                    <div className="text-muted text-description" style={{ fontSize: '11px' }}>{p.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyAssignedCourses;