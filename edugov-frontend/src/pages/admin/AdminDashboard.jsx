import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ users: 1240, programs: 0, enrollments: 0, reports: 0 });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchDynamicData = async () => {
            try {
                // Ensure your Gateway is on 8002 and Service is on Eureka
                const response = await API.get('/api/reports');
                const allReports = response.data || [];

                // Filter for latest Program report to get Active/Inactive metrics
                const latestProg = allReports
                    .filter(r => r.scope === 'PROGRAM')
                    .sort((a, b) => b.reportId - a.reportId)[0];

                if (latestProg) {
                    const m = typeof latestProg.metrics === 'string' 
                        ? JSON.parse(latestProg.metrics) 
                        : latestProg.metrics;

                    setChartData([
                        { name: 'Active', value: Number(m.activePrograms) || 0, color: '#198754' }, // Bootstrap Success Green
                        { name: 'Inactive', value: Number(m.inactivePrograms) || 0, color: '#dc3545' } // Bootstrap Danger Red
                    ]);

                    setStats(prev => ({
                        ...prev,
                        programs: (Number(m.activePrograms) || 0) + (Number(m.inactivePrograms) || 0),
                        reports: allReports.length
                    }));
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDynamicData();
    }, []);

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="fw-bold text-secondary">Connecting to EduGov Services...</p>
        </div>
    );

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <h2 className="fw-bold mb-4 text-dark border-bottom pb-2">University Admin Dashboard</h2>
            
            {/* Stats Overview */}
            <div className="row g-4 mb-5">
                {[
                    { label: 'Active Users', val: stats.users, border: 'primary' },
                    { label: 'Total Programs', val: stats.programs, border: 'success' },
                    { label: 'Reports Generated', val: stats.reports, border: 'info' }
                ].map((item, index) => (
                    <div key={index} className="col-md-4">
                        <div className={`card shadow-sm border-0 border-start border-4 border-${item.border} p-3`}>
                            <div className="card-body">
                                <h6 className="text-muted fw-bold text-uppercase small">{item.label}</h6>
                                <h2 className="fw-bold mb-0">{item.val}</h2>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Visualization Section */}
            <div className="row">
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                        <h5 className="fw-bold mb-4 text-center">Program Status Distribution</h5>
                        <div style={{ width: '100%', height: 350 }}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted italic">No program metrics available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
