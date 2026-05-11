import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import './reports.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download, Activity, Clock, CheckCircle, AlertCircle, Users, Mail, Search, Hash } from 'lucide-react';

const AdminReports = () => {
    // 1. Dynamic States
    const [selectedScope, setSelectedScope] = useState('PROGRAM');
    const [targetId, setTargetId] = useState(''); 
    const [dates, setDates] = useState({ start: '', end: '' });
    
    // 2. Data States
    const [userRecords, setUserRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState({ active: 0, inactive: 0, inProgress: 0, progress: 0 });

    const COLORS = { active: '#10b981', inactive: '#ef4444', inProgress: '#3b82f6', progress: '#f59e0b' };

    const fetchData = async () => {
        try {
            // Fetch users for the Record Set table
            const userRes = await API.get('/api/users/all'); 
            setUserRecords(userRes.data);

            // Fetch metrics for the chart
            const metricRes = await API.get('/api/reports/metrics');
            setMetrics(metricRes.data);
        } catch (err) {
            console.error("Fetch failed. Check CORS and Gateway.", err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleGenerate = async () => {
        if (!targetId) return alert("Please enter a Target ID first.");
        setLoading(true);
        try {
            // Passing ID in URL path: /api/reports/generate/1?scope=PROGRAM
            await API.post(`/api/reports/generate?scope=${selectedScope}`);
            alert(`Report for ID ${targetId} generated!`);
        } catch (err) {
            console.error("Error", err);
            if (err.response?.status === 401) alert("Unauthorized: Check token in localStorage.");
        } finally { setLoading(false); }
    };

    return (
        <div className="admin-container p-4 bg-light min-vh-100">
            {/* Header Area */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0 text-dark">Governance & Reports</h2>
                <button className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm">
                    <Download size={18} /> Export Results
                </button>
            </div>

            {/* Metrics Row */}
            <div className="row mb-4 g-3">
                {[
                    { t: 'Active', v: metrics.active, c: COLORS.active, i: Activity },
                    { t: 'Inactive', v: metrics.inactive, c: COLORS.inactive, i: AlertCircle },
                    { t: 'In Progress', v: metrics.inProgress, c: COLORS.inProgress, i: Clock },
                    { t: 'Completed', v: metrics.progress, c: COLORS.progress, i: CheckCircle }
                ].map((stat, i) => (
                    <div key={i} className="col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 p-3 h-100" style={{ borderLeft: `5px solid ${stat.c}` }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div><p className="text-muted small mb-0 fw-bold">{stat.t}</p><h3 className="fw-bold mb-0">{stat.v || 0}</h3></div>
                                <div className="p-2 rounded-3" style={{ backgroundColor: `${stat.c}15` }}><stat.i size={24} color={stat.c}/></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls Card */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-2">
                        <label className="form-label small fw-bold"><Hash size={14} className="me-1"/> Target ID</label>
                        <input type="number" className="form-control" placeholder="e.g. 3" value={targetId} onChange={(e) => setTargetId(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">Scope</label>
                        <select className="form-select" value={selectedScope} onChange={(e) => setSelectedScope(e.target.value)}>
                            <option value="PROGRAM">PROGRAM</option>
                            <option value="PROJECT">PROJECT</option>
                            <option value="GRANT">GRANT</option>
                        </select>
                    </div>
                    <div className="col-md-5">
                        <label className="form-label small fw-bold">Date Range Filter</label>
                        <div className="d-flex gap-2">
                            <input type="date" className="form-control" onChange={(e) => setDates({...dates, start: e.target.value})} />
                            <input type="date" className="form-control" onChange={(e) => setDates({...dates, end: e.target.value})} />
                        </div>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-primary w-100 fw-bold py-2 shadow-sm" onClick={handleGenerate} disabled={loading}>
                            {loading ? 'Wait...' : 'Generate'}
                        </button>
                    </div>
                </div>
            </div>

            {/* User Records Table */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2"><Users size={20} className="text-primary"/> User Records Set</h5>
                    <div className="input-group w-25"><span className="input-group-text bg-white"><Search size={16}/></span><input type="text" className="form-control border-start-0" placeholder="Search..."/></div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="small text-muted text-uppercase">
                                <th className="ps-4">ID</th>
                                <th>User Contact</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userRecords.map((user) => (
                                <tr key={user.id}>
                                    <td className="ps-4 fw-bold">#{user.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: 32, height: 32}}>{user.name[0]}</div>
                                            <div><div className="fw-bold">{user.name}</div><small className="text-muted">{user.email}</small></div>
                                        </div>
                                    </td>
                                    <td><span className="badge bg-light text-dark border">{user.role}</span></td>
                                    <td><span className={`badge ${user.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{user.status}</span></td>
                                    <td className="text-end pe-4"><button className="btn btn-sm btn-outline-primary" onClick={() => setTargetId(user.id)}>Select ID</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;