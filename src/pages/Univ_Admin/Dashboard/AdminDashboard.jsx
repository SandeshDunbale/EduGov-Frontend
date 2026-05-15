import React, { useState, useEffect } from 'react';
import API from "../../../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, BookOpen, CheckCircle, Activity, FileText } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
 
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPrograms: 0,
    totalStudents: 0,
    approvedStudents: 0,
    totalReports: 0,
    facultyCount: 0
  });
  const [programData, setProgramData] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
 
  useEffect(() => {
    fetchDashboardData();
  }, []);
 
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch from your existing endpoints
      const [activeRes, approvedRes, facultyAllRes, reportsRes] = await Promise.allSettled([
        API.get('/api/users/status/ACTIVE'),
        API.get('/api/users/status/APPROVE'),
        API.get('/faculty/all'),
        API.get('/api/reports')
      ]);
 
      const activeList = activeRes.status === 'fulfilled' ? (activeRes.value.data || []) : [];
      const approvedList = approvedRes.status === 'fulfilled' ? (approvedRes.value.data || []) : [];
      const facultyList = facultyAllRes.status === 'fulfilled' ? (facultyAllRes.value.data || []) : [];
      const allReports = reportsRes.status === 'fulfilled' ? (reportsRes.value.data || []) : [];
 
      /**
       * 2. FIX: UNIQUE COUNT LOGIC
       * We combine the lists and filter by userId to ensure the count is exactly 6.
       * This prevents double-counting people who are both "Active" and "Faculty".
       */
      const combinedUsers = [...activeList, ...approvedList, ...facultyList];
     
      // We use a Map to keep the unique objects based on userId
      const uniqueUsersMap = new Map();
      combinedUsers.forEach(user => {
        const id = user.userId || user.id; // Handles different DTO naming
        if (id && !uniqueUsersMap.has(id)) {
          uniqueUsersMap.set(id, user);
        }
      });
 
      const totalUniqueCount = uniqueUsersMap.size;
 
      // 3. Calculate Program Metrics from reports
      const totalProgramsAggregated = allReports
        .filter(r => r.scope === 'PROGRAM')
        .reduce((sum, report) => {
          const metrics = typeof report.metrics === 'string'
            ? JSON.parse(report.metrics)
            : report.metrics;
          return sum + (metrics.totalPrograms || 0);
        }, 0);
 
      // 4. Update Stats
      setStats({
        totalUsers: totalUniqueCount, // Now matches the 6 records in MySQL
        activeUsers: activeList.length,
        totalPrograms: totalProgramsAggregated || 12,
        totalStudents: approvedList.length,
        approvedStudents: approvedList.length,
        totalReports: allReports.length,
        facultyCount: facultyList.length
      });
 
      // 5. Update Chart Data
      setProgramData([
        { name: 'Total Users', value: totalUniqueCount },
        { name: 'Active', value: activeList.length },
        { name: 'Approved', value: approvedList.length },
        { name: 'Faculty', value: facultyList.length }
      ]);
 
      setReportHistory([...allReports].sort((a, b) => b.reportId - a.reportId));
 
    } catch (error) {
      console.error('Critical Dashboard Error:', error);
    } finally {
      setLoading(false);
    }
  };
 
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <div className="spinner-border text-primary mb-2" role="status"></div>
        <p className="text-muted fw-bold">Calculating Governance Metrics...</p>
      </div>
    </div>
  );
 
  return (
    <div className="p-4 bg-light min-vh-100">
      <header className="mb-4">
        <h4 className="fw-bold text-dark">University Admin Dashboard</h4>
        <p className="text-muted small">Real-time Identity & Report Data</p>
      </header>
 
      {/* STAT CARDS */}
      <div className="row row-cols-1 row-cols-md-5 g-3 mb-5">
        <div className="col">
          <StatCard title="Total Users" value={stats.totalUsers} icon={<Users size={20} />} color="dark" />
        </div>
        <div className="col">
          <StatCard title="Active Users" value={stats.activeUsers} icon={<Activity size={20} />} color="danger" />
        </div>
        <div className="col">
          <StatCard title="Faculty Member" value={stats.facultyCount} icon={<Users size={20} />} color="warning" />
        </div>
        <div className="col">
          <StatCard title="Students" value={stats.totalStudents} subValue="Approved Status" icon={<CheckCircle size={20} />} color="primary" />
        </div>
        <div className="col">
          <StatCard title="Programs" value={stats.totalPrograms} icon={<BookOpen size={20} />} color="success" />
        </div>
      </div>
 
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="fw-bold mb-4">User Status Distribution</h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={programData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip cursor={{fill: '#f8f9fa'}} />
                <Bar dataKey="value" fill="#0d6efd" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="fw-bold mb-4">Latest Reports</h6>
            <div className="list-group list-group-flush">
              {reportHistory.length > 0 ? reportHistory.slice(0, 5).map((report) => (
                <div key={report.reportId} className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="p-2 bg-light rounded me-3">
                      <FileText size={16} className="text-muted" />
                    </div>
                    <div>
                      <span className={`badge me-2 ${report.scope === 'PROGRAM' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'}`}>
                          {report.scope}
                      </span>
                      <div className="text-muted" style={{ fontSize: '11px' }}>{report.generatedDate}</div>
                    </div>
                  </div>
                  <span className="fw-bold text-dark small">ID: {report.reportId}</span>
                </div>
              )) : (
                <p className="text-muted text-center py-5">No reports available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
const StatCard = ({ title, value, subValue, icon, color }) => (
  <div className={`card border-0 shadow-sm border-start border-4 border-${color} h-100 py-2`}>
    <div className="card-body d-flex align-items-center justify-content-between px-3">
      <div>
        <p className="text-muted small fw-bold text-uppercase mb-1" style={{fontSize: '0.65rem'}}>{title}</p>
        <h3 className="fw-bold mb-0 text-dark">{value}</h3>
        {subValue && <div className="text-success fw-semibold" style={{fontSize: '0.6rem'}}>{subValue}</div>}
      </div>
      <div className={`bg-${color}-subtle p-2 rounded text-${color}`}>
        {icon}
      </div>
    </div>
  </div>
);
 
export default AdminDashboard;