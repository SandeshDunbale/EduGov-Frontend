import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
//import ReportsPieChart from '../../component/common/ReportsPieChart';

const AdminDashboard = () => {

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    programs: 0,
    reports: 0
  });

  const [programStatusChart, setProgramStatusChart] = useState([]);

  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await API.get('/api/reports');
        const allReports = res.data || [];
        setReports(allReports);

        // Latest PROGRAM report for Active / Inactive chart
        const latestProgramReport = allReports
          .filter(r => r.scope === 'PROGRAM')
          .sort((a, b) => b.reportId - a.reportId)[0];

        if (latestProgramReport?.metrics) {
          const metrics =
            typeof latestProgramReport.metrics === 'string'
              ? JSON.parse(latestProgramReport.metrics)
              : latestProgramReport.metrics;

          setProgramStatusChart([
            { name: 'Active Programs', value: Number(metrics.activePrograms) || 0, color: '#198754' },
            { name: 'Inactive Programs', value: Number(metrics.inactivePrograms) || 0, color: '#dc3545' }
          ]);

          setStats(prev => ({
            ...prev,
            programs:
              (Number(metrics.activePrograms) || 0) +
              (Number(metrics.inactivePrograms) || 0),
            reports: allReports.length
          }));
        }

      } catch (error) {
        console.error('Dashboard Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* ================== LOADING STATE ================== */
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary mb-3" />
        <p className="fw-bold text-secondary">
          Connecting to EduGov Services...
        </p>
      </div>
    );
  }

  /* ================== UI ================== */
  return (
    <div className="container-fluid p-4 bg-light min-vh-100">

      <h2 className="fw-bold mb-4 border-bottom pb-2">
        University Admin Dashboard
      </h2>

      {/* ================== STATS ================== */}
      <div className="row g-4 mb-5">
        {[
          { label: 'Active Users', value: stats.users, color: 'primary' },
          { label: 'Total Programs', value: stats.programs, color: 'success' },
          { label: 'Reports Generated', value: stats.reports, color: 'info' }
        ].map((item, idx) => (
          <div className="col-md-4" key={idx}>
            <div className={`card shadow-sm border-start border-4 border-${item.color}`}>
              <div className="card-body">
                <h6 className="text-muted fw-bold small text-uppercase">
                  {item.label}
                </h6>
                <h2 className="fw-bold mb-0">{item.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================== CHARTS ================== */}
      <div className="row g-4">

        {/* Program Status Pie */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-4 bg-white h-100">
            <h5 className="fw-bold mb-4 text-center">
              Program Status Distribution
            </h5>

            {programStatusChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={programStatusChart}
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {programStatusChart.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted">
                No program metrics available.
              </p>
            )}
          </div>
        </div>

        {/* Reports Distribution Pie */}
        <div className="col-lg-6">
          <ReportsPieChart reports={reports} />
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
