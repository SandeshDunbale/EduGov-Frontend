import React, { useEffect, useState, useMemo } from 'react';
import { Clock, CheckCircle, Stamp, AlertTriangle, FileText } from 'lucide-react';
import AuditService from '../../services/auditService';

const AuditorDashboard = () => {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAudits = async () => {
            try {
                const data = await AuditService.getAllAudits();
                setAudits(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchAudits();
    }, []);

    const stats = useMemo(() => {
        return {
            pending: audits.filter(a => a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS').length,
            completed: audits.filter(a => a.status === 'COMPLETED').length,
            // Checking both variations just in case the backend sends either
            review: audits.filter(a => a.status === 'PENDING_VALIDATION' || a.status === 'PENDING_REVIEW').length,
            critical: audits.filter(a => (a.findings || '').toLowerCase().includes('critical')).length
        };
    }, [audits]);

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '18px' }}>
                Loading Auditor Workspace...
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={titleStyle}>Auditor Workspace</h1>
                <p style={subtitleStyle}>Official Government Oversight & Compliance Monitoring</p>
            </div>
            
            {/* Stats Grid */}
            <div style={statsGrid}>
                <StatCard title="Active Audits" val={stats.pending} icon={Clock} color="#f59e0b" />
                <StatCard title="Validation Required" val={stats.review} icon={Stamp} color="#3b82f6" />
                <StatCard title="Completed Items" val={stats.completed} icon={CheckCircle} color="#10b981" />
                <StatCard title="Critical Findings" val={stats.critical} icon={AlertTriangle} color="#ef4444" />
            </div>

            <div style={mainGrid}>
                {/* Recent Logs Section */}
                <div style={sectionCard}>
                    <h3 style={sectionTitle}>Recent Audit Logs</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {audits.length > 0 ? audits.slice(0, 6).map(audit => (
                            <div key={audit.id || audit.auditId} style={logItem}>
                                <div style={logIcon}>
                                    {(audit.scope || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>
                                        {audit.scope}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                        ID: # {audit.id || audit.auditId}
                                    </p>
                                </div>
                                <span style={statusSmallBadge(audit.status)}>{audit.status}</span>
                            </div>
                        )) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                No recent logs available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div style={{ ...sectionCard, background: 'linear-gradient(135deg, #1e293b, #334155)', color: '#fff' }}>
                    <h3 style={{ ...sectionTitle, color: '#fff', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                        Quick Actions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <ActionButton label="Review Pending Approvals" icon={Stamp} path="/auditor/approvals" />
                        <ActionButton label="Access Official Registry" icon={FileText} path="/auditor/audits" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, val, icon: Icon, color }) => (
    <div style={{ ...statCardStyle, borderLeft: `5px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', margin: 0 }}>{title}</p>
            <Icon size={22} color={color} />
        </div>
        <p style={{ fontSize: '32px', fontWeight: '800', margin: '10px 0 0 0', color: '#0f172a' }}>{val}</p>
    </div>
);

const ActionButton = ({ label, icon: Icon, path }) => (
    <button 
        onClick={() => window.location.href = path}
        style={actionButtonStyle}
    >
        <Icon size={20} /> {label}
    </button>
);

// --- STYLES ---

const containerStyle = { padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" };
const titleStyle = { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0 };
const subtitleStyle = { color: '#64748b', fontSize: '16px', marginTop: '6px', fontWeight: '500' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '40px' };
const statCardStyle = { background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };

const mainGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' };
const sectionCard = { background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const sectionTitle = { fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 20px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' };

const logItem = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #f1f5f9', transition: 'transform 0.2s ease' };
const logIcon = { width: '42px', height: '42px', borderRadius: '10px', background: '#e2e8f0', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' };

const actionButtonStyle = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '16px 20px', borderRadius: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '15px', transition: 'background 0.2s' };

const statusSmallBadge = (status) => {
    let bg = '#f1f5f9', color = '#475569';
    if (status === 'COMPLETED') { bg = '#dcfce7'; color = '#15803d'; }
    else if (status === 'IN_PROGRESS') { bg = '#dbeafe'; color = '#1d4ed8'; }
    else if (status === 'PENDING_VALIDATION' || status === 'PENDING_REVIEW') { bg = '#fee2e2'; color = '#b91c1c'; }
    else if (status === 'SCHEDULED') { bg = '#fef3c7'; color = '#b45309'; }

    return {
        fontSize: '11px', 
        fontWeight: '800', 
        padding: '6px 12px', 
        borderRadius: '30px', 
        background: bg, 
        color: color,
        letterSpacing: '0.05em'
    };
};

export default AuditorDashboard;