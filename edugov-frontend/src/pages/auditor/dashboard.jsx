import React, { useMemo, useState } from 'react';
import { Clock, Stamp, CheckCircle, AlertTriangle, FileText, Building, Calendar } from 'lucide-react';

const mockAudits = [
  {
    auditId: 501,
    scope: 'Engineering College',
    type: 'Financial Audit',
    status: 'SCHEDULED',
    priority: 'high',
    date: '2024-02-22T10:00:00Z',
    auditor: 'Auditor 1',
    findings: 'Critical: missing disclosures',
    description: 'Quarterly financial audit pending.'
  },
  {
    auditId: 502,
    scope: 'Arts Institute',
    type: 'Academic Audit',
    status: 'IN_PROGRESS',
    priority: 'medium',
    date: '2024-02-20T10:00:00Z',
    auditor: 'Auditor 2',
    findings: 'Under review findings',
    description: 'Academic compliance review in progress.'
  },
  {
    auditId: 503,
    scope: 'Medical Institute',
    type: 'Compliance Audit',
    status: 'PENDING_REVIEW',
    priority: 'low',
    date: '2024-03-01T10:00:00Z',
    auditor: null,
    findings: 'TBD',
    description: 'Scheduled compliance audit.'
  },
  {
    auditId: 504,
    scope: 'Tech College',
    type: 'Governance Audit',
    status: 'COMPLETED',
    priority: 'medium',
    date: '2024-02-05T10:00:00Z',
    auditor: 'Auditor 3',
    findings: 'Critical: none',
    description: 'Completed governance audit.'
  }
];

function getDaysUntilDue(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getStatusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'completed':
    case 'report_generated':
      return '#10b981';
    case 'in_progress':
      return '#3b82f6';
    case 'pending_review':
    case 'scheduled':
      return '#f59e0b';
    default:
      return '#64748b';
  }
}

function getPriorityColor(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#10b981';
    default:
      return '#64748b';
  }
}

const AuditorDashboard = () => {
  const [audits] = useState(mockAudits);

  const { stats, recentAudits, upcomingDeadlines } = useMemo(() => {
    const pendingAudits = audits.filter((a) => a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS').length;

    const now = new Date();
    const completedThisMonth = audits.filter((a) => {
      if (a.status === 'COMPLETED' || a.status === 'REPORT_GENERATED') {
        const auditDate = new Date(a.date);
        return auditDate.getMonth() === now.getMonth() && auditDate.getFullYear() === now.getFullYear();
      }
      return false;
    }).length;

    const approvalsPending = audits.filter((a) => a.status === 'PENDING_REVIEW').length;
    const criticalFindings = audits.filter((a) => (a.findings || '').toLowerCase().includes('critical')).length;

    const recent = audits.slice(0, 4).map((audit) => ({
      id: audit.auditId || audit.id,
      institution: `Institution ${audit.scope || 'Unknown'}`,
      status: (audit.status || 'pending').toLowerCase().replace('_', ' '),
      dueDate: audit.date ? new Date(audit.date).toLocaleDateString() : 'TBD',
      priority: audit.priority || 'medium'
    }));

    return {
      stats: {
        pendingAudits,
        completedThisMonth,
        approvalsPending,
        criticalFindings
      },
      recentAudits: recent,
      upcomingDeadlines: [
        { task: 'Annual Compliance Review', institution: 'State University', dueDate: '2024-01-22' },
        { task: 'Financial Audit', institution: 'Tech College', dueDate: '2024-01-28' },
        { task: 'Program Accreditation', institution: 'Medical Institute', dueDate: '2024-02-05' }
      ]
    };
  }, [audits]);

  const statsCards = [
    { title: 'Pending Audits', value: String(stats.pendingAudits), icon: Clock, color: 'orange' },
    { title: 'Completed This Month', value: String(stats.completedThisMonth), icon: CheckCircle, color: 'green' },
    { title: 'Approvals Pending', value: String(stats.approvalsPending), icon: Stamp, color: 'blue' },
    { title: 'Critical Findings', value: String(stats.criticalFindings), icon: AlertTriangle, color: 'red' }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>Government Auditor Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Oversee and manage educational institution audits and compliance approvals (frontend-only).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {statsCards.map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>{stat.title}</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{stat.value}</p>
              </div>
              <div style={{ backgroundColor: `var(--color-${stat.color}-100)`, padding: '12px', borderRadius: '8px' }}>
                <stat.icon size={24} color={`var(--color-${stat.color}-600)`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>Recent Audits</h3>
          <div style={{ spaceY: '15px' }}>
            {recentAudits.map((audit, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{audit.id}</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{audit.institution}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ background: getStatusColor(audit.status) + '20', color: getStatusColor(audit.status), padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
                      {audit.status}
                    </span>
                    <span style={{ background: getPriorityColor(audit.priority) + '20', color: getPriorityColor(audit.priority), padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
                      {audit.priority}
                    </span>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Due: {audit.dueDate}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>Upcoming Deadlines</h3>
          <div style={{ spaceY: '15px' }}>
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{deadline.task}</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{deadline.institution}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Due</p>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{deadline.dueDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <button
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onClick={() => alert('Frontend-only: pending list not connected yet.')}
          >
            <Clock size={20} />
            View Pending Audits
          </button>
          <button
            style={{
              background: '#10b981',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onClick={() => alert('Frontend-only: approvals not connected yet.')}
          >
            <Stamp size={20} />
            Submit Approvals
          </button>
          <button
            style={{
              background: '#f59e0b',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onClick={() => alert('Frontend-only: generate reports not connected yet.')}
          >
            <FileText size={20} />
            Generate Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;

