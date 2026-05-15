import React, { useState, useEffect } from 'react';
import {
    FileBarChart, PieChart, BarChart3, TrendingUp,
    CheckCircle2, XCircle, Activity, Landmark,
    Download, RefreshCw, Calendar, ShieldAlert, PlusCircle, Filter, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ProgramAPI } from '../../../services/programService';
import { GrantAPI } from '../../../services/grantService';
import { ReportAPI } from '../../../services/reportService';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminReports.css';
 
const AdminReports = () => {
    const [loading, setLoading] = useState(true);
    const [systemData, setSystemData] = useState({
        programs: { total: 0, active: 0, inactive: 0 },
        projects: { total: 0, approved: 0, rejected: 0, underReview: 0 },
        grants: { totalCount: 0, totalFunding: 0, approvedFunding: 0, rejectedFunding: 0 },
        historicalReports: []
    });
 
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;
 
    const [genScope, setGenScope] = useState('PROGRAM');
    const [filterScope, setFilterScope] = useState('PROGRAM');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
 
    const getAdminIdentity = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const decoded = jwtDecode(token);
            return { name: decoded.sub.split('@')[0] };
        } catch (error) { return { name: 'University Administrator' }; }
    };
 
    const fetchAuditIntelligence = async (silent = false) => {
    try {
        if (!silent) setLoading(true);
        
        const reportsRes = await ReportAPI.getAll();
        const [progAll, grantAll] = await Promise.all([
            ProgramAPI.getAll(),
            GrantAPI.getAllGrants()
        ]);

        // ✅ FIX: Check if the API already unwrapped the data (Array.isArray)
        const programs = Array.isArray(progAll) ? progAll : (progAll?.data || []);
        const grants = Array.isArray(grantAll) ? grantAll : (grantAll?.data || []);
        
        const total = grants.reduce((sum, g) => sum + (g.amount || 0), 0);
        const approved = grants.filter(g => g.status === 'APPROVED').reduce((sum, g) => sum + (g.amount || 0), 0);
        const rejected = grants.filter(g => g.status === 'REJECTED').reduce((sum, g) => sum + (g.amount || 0), 0);

        setSystemData({
           // ... (rest of your state remains exactly the same)
                programs: {
                    total: programs.length,
                    active: programs.filter(p => p.status === 'ACTIVE').length,
                    inactive: programs.filter(p => p.status === 'INACTIVE').length
                },
                projects: {
                    total: grants.length,
                    approved: grants.filter(g => g.status === 'APPROVED').length,
                    rejected: grants.filter(g => g.status === 'REJECTED').length,
                    underReview: grants.filter(g => g.status === 'UNDER_REVIEW').length
                },
                grants: {
                    totalCount: grants.length,
                    totalFunding: total,
                    approvedFunding: approved,
                    rejectedFunding: rejected
                },
                historicalReports: (reportsRes.data || []).sort((a, b) => a.reportId - b.reportId)
            });
        } catch (err) {
            console.error("Governance Data Synthesis Failure", err);
            toast.error("OBSERVABILITY ALERT: Failed to synchronize institutional data ledger.", { className: 'large-toast' });
        } finally {
            setLoading(false);
        }
    };
 
    const handleGenerateReport = async () => {
        try {
            // 📍 Optimized: Removed full page loader for execute
            await ReportAPI.generate(genScope);
            toast.success(`TRANSPARENCY SUCCESS: ${genScope} performance metrics generated for EduGov oversight.`, { className: 'large-toast' });
            fetchAuditIntelligence(true); // Silent update
        } catch (err) {
            toast.error("MAINTAINABILITY ERROR: Automated report migration failed.", { className: 'large-toast' });
        }
    };
 
    const handleFilterByScope = async (scope) => {
        setFilterScope(scope);
        try {
            // 📍 Optimized: Fast retrieval without full page refresh
            const res = await ReportAPI.getByScope(scope);
            const sortedData = (res.data || []).sort((a, b) => a.reportId - b.reportId);
            setSystemData(prev => ({ ...prev, historicalReports: sortedData }));
            setCurrentPage(1);
            toast.info(`Performance metrics filtered for ${scope} scope. `, { className: 'large-toast' });
        } catch (err) { console.error(err); }
    };
 
    const handleDateSearch = async () => {
        if (!dateRange.start || !dateRange.end) return;
        try {
            const res = await ReportAPI.getByDateRange(dateRange.start, dateRange.end);
            const sortedData = (res.data || []).sort((a, b) => a.reportId - b.reportId);
            setSystemData(prev => ({ ...prev, historicalReports: sortedData }));
            setCurrentPage(1);
            toast.success("AUDIT TRAIL: Adherence deadlines and records retrieved.", { className: 'large-toast' });
        } catch (err) { toast.error("SEARCH FAILED: Records outside higher education network."); }
    };
 
    useEffect(() => { fetchAuditIntelligence(); }, []);
 
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = systemData.historicalReports.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(systemData.historicalReports.length / recordsPerPage);
 
    const formatMetricsToText = (jsonString) => {
        try {
            const metricsObj = JSON.parse(jsonString);
            if (Object.keys(metricsObj).length === 0) return "{}";
            return Object.entries(metricsObj)
                .map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
                    const formattedValue = (key.toLowerCase().includes('funding') || key.toLowerCase().includes('amount'))
                        ? `₹${Number(value).toLocaleString()}` : value;
                    return `${label}: ${formattedValue}`;
                }).join(" | ");
        } catch (e) { return jsonString; }
    };
 
    if (loading) {
        return (
            <div className="report-loader-container text-center">
                <div className="spinner-border text-teal" style={{width: '3rem', height: '3rem'}} role="status"></div>
                <h5 className="mt-4 fw-bold text-navy uppercase ls-2">Processing Higher Education Analytics...</h5>
            </div>
        );
    }
 
    const progActiveRate = systemData.programs.total > 0 ? (systemData.programs.active / systemData.programs.total) * 100 : 0;
    const maxVal = Math.max(systemData.projects.approved, systemData.projects.rejected, 1);
    const approvedHeight = (systemData.projects.approved / maxVal) * 100;
    const rejectedHeight = (systemData.projects.rejected / maxVal) * 100;
 
    return (
        <div className="admin-reports container-fluid p-4 text-start">
            <ToastContainer position="top-right" theme="colored" />
 
            <div className="row mb-5 align-items-center">
                <div className="col-md-8">
                    <h2 className="fw-bold text-navy mb-1 d-flex align-items-center gap-2">
                        <ShieldAlert className="text-teal" size={32} /> EduGov Reporting & Analytics Hub
                    </h2>
                    <p className="text-muted small uppercase ls-1 mb-0">Identity: {getAdminIdentity().name} | Institutional Program Oversight</p>
                </div>
                <div className="col-md-4 text-md-end">
                    <button onClick={() => fetchAuditIntelligence(true)} className="btn btn-navy-outline rounded-pill px-4">
                        <RefreshCw size={16} className="me-2" /> Sync Audit Trails
                    </button>
                </div>
            </div>
 
            <div className="row g-3 mb-5">
                <div className="col-md-4">
                    <div className="control-box bg-white p-3 rounded-4 shadow-sm border">
                        <label className="small fw-bold text-navy uppercase mb-2 d-block"><PlusCircle size={14}/> Generate Efficiency Report</label>
                        <div className="input-group">
                            <select className="form-select small" value={genScope} onChange={(e) => setGenScope(e.target.value)}>
                                <option value="PROGRAM">Academic Program</option>
                                <option value="PROJECT">Research Project</option>
                                <option value="GRANT">Grant Distribution</option>
                            </select>
                            <button className="btn bg-teal text-white fw-bold px-3" onClick={handleGenerateReport}>Execute</button>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="control-box bg-white p-3 rounded-4 shadow-sm border">
                        <label className="small fw-bold text-navy uppercase mb-2 d-block"><Filter size={14}/> Adherence Filter</label>
                        <select className="form-select small" value={filterScope} onChange={(e) => handleFilterByScope(e.target.value)}>
                            <option value="PROGRAM">Programs</option>
                            <option value="PROJECT">Research</option>
                            <option value="GRANT">Grants</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="control-box bg-white p-3 rounded-4 shadow-sm border">
                        <label className="small fw-bold text-navy uppercase mb-2 d-block"><Calendar size={14}/> Policy Monitoring Search</label>
                        <div className="input-group input-group-sm">
                            <input type="date" className="form-control" onChange={(e) => setDateRange({...dateRange, start: e.target.value})}/>
                            <input type="date" className="form-control" onChange={(e) => setDateRange({...dateRange, end: e.target.value})}/>
                            <button className="btn bg-navy text-white px-3 d-flex align-items-center justify-content-center" onClick={handleDateSearch}><Search size={14}/></button>
                        </div>
                    </div>
                </div>
            </div>
 
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="metric-card bg-white p-4 rounded-4 shadow-sm border-start border-5 border-teal">
                        <label className="text-muted small fw-bold uppercase d-block mb-2">Academic Programs</label>
                        <div className="d-flex justify-content-between align-items-end">
                            <h1 className="fw-bold text-navy mb-0">{systemData.programs.total}</h1>
                            <div className="text-end small fw-bold">
                                <div className="text-success">{systemData.programs.active} Active </div>
                                <div className="text-danger">{systemData.programs.inactive} Inactive</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="metric-card bg-white p-4 rounded-4 shadow-sm border-start border-5 border-primary">
                        <label className="text-muted small fw-bold uppercase d-block mb-2">Research Initiatives</label>
                        <div className="d-flex justify-content-between align-items-end">
                            <h1 className="fw-bold text-navy mb-0">{systemData.projects.total}</h1>
                            <div className="text-end small fw-bold text-primary">{systemData.projects.approved} Distributed Grants</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="metric-card bg-white p-4 rounded-4 shadow-sm border-start border-5 border-warning">
                        <label className="text-muted small fw-bold uppercase d-block mb-2">Resource Utilization</label>
                        <div className="d-flex justify-content-between align-items-end">
                            <h1 className="fw-bold text-navy mb-0">₹{systemData.grants.totalFunding.toLocaleString()}</h1>
                            <div className="text-end small fw-bold" style={{ fontSize: '10px' }}>
                                <div className="text-success">₹{systemData.grants.approvedFunding.toLocaleString()} Approved</div>
                                <div className="text-danger">₹{systemData.grants.rejectedFunding.toLocaleString()} Rejected</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
 
            <div className="row g-4 mb-5">
                <div className="col-lg-6">
                    <div className="analytics-box bg-white p-4 rounded-4 shadow-sm border h-100 text-center">
                        <h6 className="fw-bold text-navy mb-4 d-flex align-items-center gap-2"><PieChart size={18} className="text-teal" /> Institutional Program Distribution</h6>
                        <div className="pie-container mx-auto" style={{
                            width: '180px', height: '180px', borderRadius: '50%',
                            background: `conic-gradient(#3bbfad 0% ${progActiveRate}%, #ef4444 ${progActiveRate}% 100%)`
                        }}></div>
                        <div className="d-flex justify-content-center gap-4 mt-4 small fw-bold">
                            <div><span className="dot bg-teal"></span> Active Adherence ({Math.round(progActiveRate)}%)</div>
                            <div><span className="dot bg-danger"></span> Non-Compliant ({100 - Math.round(progActiveRate)}%)</div>
                        </div>
                    </div>
                </div>
               
                <div className="col-lg-6">
                    <div className="analytics-box bg-white p-4 rounded-4 shadow-sm border h-100">
                        <h6 className="fw-bold text-navy mb-4 d-flex align-items-center gap-2"><BarChart3 size={18} className="text-primary" /> Grant Distribution Accountability</h6>
                        <div className="bar-chart-container d-flex align-items-end justify-content-around px-4" style={{ height: '180px' }}>
                            <div className="bar-wrapper text-center">
                                <div className="bar bg-primary" style={{ height: `${approvedHeight}%`, minHeight: '45px', width: '90px', borderRadius: '8px 8px 0 0' }}></div>
                                <label className="small fw-bold mt-2 d-block">{systemData.projects.approved}</label>
                                <span className="text-muted uppercase" style={{fontSize: '10px'}}>Approved Grants</span>
                            </div>
                            <div className="bar-wrapper text-center">
                                <div className="bar bg-danger" style={{ height: `${rejectedHeight}%`, minHeight: '45px', width: '90px', borderRadius: '8px 8px 0 0' }}></div>
                                <label className="small fw-bold mt-2 d-block">{systemData.projects.rejected}</label>
                                <span className="text-muted uppercase" style={{fontSize: '10px'}}>Rejected Grants</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
 
            <div className="col-12">
                <div className="ledger-card bg-white p-4 rounded-4 shadow-sm border">
                    <h6 className="fw-bold text-navy mb-4 d-flex align-items-center gap-2"><Activity size={18} className="text-teal" />  Governance Audit Ledger</h6>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light"><tr className="uppercase small text-muted"><th>Audit ID</th><th>Scope</th><th>Performance Metrics</th><th className="text-center">Generated Timestamp</th></tr></thead>
                            <tbody>
                                {currentRecords.map(report => (
                                    <tr key={report.reportId}>
                                        <td className="ps-3 fw-bold text-navy">REP-ID : {report.reportId}</td>
                                        <td><span className="fw-bold px-3 py-2">{report.scope} Analytics</span></td>
                                        <td className="small text-navy fw-bold">{formatMetricsToText(report.metrics)}</td>
                                        <td className="text-center small"><Calendar size={12} className="me-1 text-teal"/> {new Date(report.generatedDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                   
                    <div className="pagination-wrapper d-flex justify-content-center mt-4 border-top pt-4">
                        <div className="d-flex align-items-center gap-2">
                            <button className="img-pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                                <ChevronLeft size={18} />
                            </button>
                           
                            {[...Array(totalPages).keys()].map(page => (
                                <button
                                    key={page + 1}
                                    onClick={() => setCurrentPage(page + 1)}
                                    className={`img-pagination-btn ${currentPage === page + 1 ? 'active' : ''}`}
                                >
                                    {page + 1}
                                </button>
                            ))}
 
                            <button className="img-pagination-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default AdminReports;