import React, { useState, useEffect, useMemo } from 'react';
import API from '../../api/axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { ShieldCheck, Activity, DollarSign, List, RefreshCw, Plus, Search, Filter, FileText } from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScope, setFilterScope] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [selectedScope, setSelectedScope] = useState('GRANT');

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/reports');
      setReports(res.data || []);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllReports(); }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await API.post(`/api/reports/generate?scope=${selectedScope}`);
      setShowModal(false);
      fetchAllReports();
    } catch (err) {
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const getParsedMetrics = (report) => {
    if (!report.metrics) return {};
    return typeof report.metrics === 'string' ? JSON.parse(report.metrics) : report.metrics;
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.reportId?.toString().includes(searchTerm) || 
                           r.scope?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesScope = filterScope === 'ALL' || r.scope === filterScope;
      return matchesSearch && matchesScope;
    }).sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate));
  }, [reports, searchTerm, filterScope]);

  /* ================= VISUALIZATION DATA ================= */
  
  const grantData = useMemo(() => {
    return filteredReports
      .filter(r => r.scope === 'GRANT')
      .map(r => ({
        date: r.generatedDate,
        amount: getParsedMetrics(r).totalGrants || 0 
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredReports]);

  const programStatusData = useMemo(() => {
    const latestProg = filteredReports.filter(r => r.scope === 'PROGRAM')[0];
    if (!latestProg) return [];
    const m = getParsedMetrics(latestProg);
    return [
      { name: 'Total Programs', value: m.totalPrograms || 0 }
    ];
  }, [filteredReports]);

  const projectApprovalData = useMemo(() => {
    const latestProj = filteredReports.filter(r => r.scope === 'PROJECT')[0];
    if (!latestProj) return [];
    const m = getParsedMetrics(latestProj);
    return [
      { name: 'Total Projects', count: m.totalProjects || 0 }
    ];
  }, [filteredReports]);

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0 text-dark">System Analytics</h2>
          <p className="text-muted small">Microservice Data Aggregator</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Generate New Report
          </button>
          <button className="btn btn-white border shadow-sm" onClick={fetchAllReports} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin-animation' : ''} />
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent border-0"><Search size={16}/></span>
                <input type="text" className="form-control border-0 shadow-none" placeholder="Search by ID or Scope..." onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="col-md-4 border-start">
              <select className="form-select form-select-sm border-0 shadow-none" onChange={(e) => setFilterScope(e.target.value)}>
                <option value="ALL">All Categories</option>
                <option value="GRANT">Grants</option>
                <option value="PROGRAM">Programs</option>
                <option value="PROJECT">Projects</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* BIG VISUALIZATIONS ROW */}
      <div className="row g-4 mb-5">
        {/* 1. GRANTS - Extended Width and Height */}
        <div className="col-xl-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold text-dark mb-4 d-flex align-items-center">
                <DollarSign size={24} className="me-2 text-success"/> GRANT FUNDING TRENDS
              </h5>
              <div style={{ width: '100%', height: 450 }}>
                <ResponsiveContainer>
                  <BarChart data={grantData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" fontSize={12} tickMargin={10} />
                    <YAxis fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar name="Funding Amount" dataKey="amount" fill="#198754" radius={[6, 6, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PROGRAMS & PROJECTS - Stacked column for size */}
        <div className="col-xl-5">
          <div className="row g-4 h-100">
            <div className="col-12">
              <div className="card border-0 shadow-sm text-center h-100">
                <div className="card-body p-4">
                  <h6 className="fw-bold text-muted mb-4 text-start d-flex align-items-center">
                    <List size={20} className="me-2 text-primary"/> PROGRAM REACH
                  </h6>
                  <div className="d-flex align-items-center">
                    <div style={{ width: '60%', height: 200 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={programStatusData.length ? programStatusData : [{name: 'Empty', value: 1}]} innerRadius={60} outerRadius={85} dataKey="value">
                            <Cell fill="#0d6efd" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-start ms-4">
                        <h1 className="fw-bold display-4 mb-0 text-primary">{programStatusData[0]?.value || 0}</h1>
                        <p className="text-muted text-uppercase small ls-wide">Active Programs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card border-0 shadow-sm text-center h-100">
                <div className="card-body p-4">
                  <h6 className="fw-bold text-muted mb-4 text-start d-flex align-items-center">
                    <ShieldCheck size={20} className="me-2 text-warning"/> PROJECT VOLUME
                  </h6>
                  <div className="d-flex align-items-center justify-content-between px-4">
                     <div className="text-start">
                        <h1 className="fw-bold display-4 mb-0 text-warning">{projectApprovalData[0]?.count || 0}</h1>
                        <p className="text-muted text-uppercase small ls-wide">Total Tracked Projects</p>
                     </div>
                     <div className="bg-light rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: '120px', height: '120px', border: '8px solid #ffc107'}}>
                        <Activity size={40} className="text-warning" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <h6 className="mb-0 fw-bold"><FileText size={18} className="me-2"/> Recent Report Entries</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="border-0 px-4">ID</th>
                <th className="border-0">Scope</th>
                <th className="border-0">Generated Date</th>
                <th className="border-0">Metrics Preview</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.reportId}>
                  <td className="px-4 fw-bold">#{report.reportId}</td>
                  <td>
                    <span className={`badge rounded-pill ${
                      report.scope === 'GRANT' ? 'bg-success-subtle text-success' : 
                      report.scope === 'PROGRAM' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning'
                    }`}>
                      {report.scope}
                    </span>
                  </td>
                  <td className="text-muted">{report.generatedDate}</td>
                  <td className="small text-truncate" style={{ maxWidth: '300px' }}>
                    {report.metrics}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header border-0">
                <h5 className="fw-bold">Generate Snapshot</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <label className="form-label small fw-bold">Microservice Target</label>
                <select className="form-select" value={selectedScope} onChange={(e) => setSelectedScope(e.target.value)}>
                  <option value="GRANT">Grant Service (Funding Data)</option>
                  <option value="PROGRAM">Program Service (Activity Data)</option>
                  <option value="PROJECT">Project Service (Task Data)</option>
                </select>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light" onClick={() => setShowModal(false)}>Close</button>
                <button className="btn btn-primary px-4" onClick={handleGenerateReport} disabled={loading}>
                  {loading ? 'Running...' : 'Run Generation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin-animation { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .bg-success-subtle { background-color: #d1e7dd; }
        .bg-primary-subtle { background-color: #cfe2ff; }
        .bg-warning-subtle { background-color: #fff3cd; }
        .ls-wide { letter-spacing: 1px; }
      `}</style>
    </div>
  );
};

export default AdminReports;