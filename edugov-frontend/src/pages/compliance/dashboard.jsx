import React, { useMemo, useState } from 'react';
import { Activity, Database, PlusSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const mockRecords = [
  {
    complianceId: 101,
    entityType: 'Student Records',
    notes: 'KYC documents incomplete',
    result: 'VIOLATION',
    date: '2024-02-10T10:00:00Z',
    officerName: 'Officer A'
  },
  {
    complianceId: 102,
    entityType: 'Faculty Credentials',
    notes: 'Annual training pending',
    result: 'UNDER_REVIEW',
    date: '2024-02-12T10:00:00Z',
    officerName: 'Officer A'
  },
  {
    complianceId: 103,
    entityType: 'Financial Compliance',
    notes: 'All checks passed',
    result: 'COMPLIANT',
    date: '2024-02-15T10:00:00Z',
    officerName: 'Officer B'
  },
  {
    complianceId: 104,
    entityType: 'Academic Programs',
    notes: 'Policy updated; needs verification',
    result: 'UNDER_REVIEW',
    date: '2024-02-18T10:00:00Z',
    officerName: 'Officer B'
  },
  {
    complianceId: 105,
    entityType: 'Student Records',
    notes: 'No issues found',
    result: 'COMPLIANT',
    date: '2024-02-21T10:00:00Z',
    officerName: 'Officer A'
  }
];

function normalizeResult(result) {
  const r = (result || '').toUpperCase();
  if (r === 'COMPLIANT' || r === 'COMPLETED') return 'COMPLIANT';
  if (r === 'VIOLATION') return 'VIOLATION';
  if (r === 'UNDER_REVIEW') return 'UNDER_REVIEW';
  return r;
}

const ComplianceDashboard = () => {
  const [records, setRecords] = useState(mockRecords);

  const { stats, recentActivities } = useMemo(() => {
    const normalized = records.map((r) => ({ ...r, result: normalizeResult(r.result) }));

    const totalScans = normalized.length;
    const violations = normalized.filter((r) => r.result === 'VIOLATION' || r.result === 'UNDER_REVIEW').length;
    const compliant = normalized.filter((r) => r.result === 'COMPLIANT' || r.result === 'COMPLETED').length;
    const complianceRate = totalScans > 0 ? Math.round((compliant / totalScans) * 100) : 0;

    return {
      stats: {
        totalScans,
        complianceRate,
        pendingReviews: normalized.filter((r) => r.result === 'UNDER_REVIEW').length,
        violationsFound: violations
      },
      recentActivities: normalized.slice(0, 4).map((record) => ({
        action: `${record.entityType} Compliance Check`,
        time: record.date ? new Date(record.date).toLocaleDateString() : 'Recent',
        status:
          record.result === 'COMPLIANT'
            ? 'success'
            : record.result === 'VIOLATION'
              ? 'warning'
              : 'pending'
      }))
    };
  }, [records]);

  const handleRunScan = () => {
    // Frontend-only: simulate a new scan by adding one record.
    const now = new Date().toISOString();
    const next = {
      complianceId: Math.max(...records.map((r) => r.complianceId || 0)) + 1,
      entityType: 'Automated Module Review',
      notes: 'Frontend simulated scan completed',
      result: 'UNDER_REVIEW',
      date: now,
      officerName: 'Officer (Frontend)'
    };

    setRecords((prev) => [next, ...prev]);
    alert('System scan completed successfully (frontend simulation)!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
          Compliance Officer Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Monitor and ensure compliance across all educational programs and activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}
      >
        <div
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
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>Total Scans</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.totalScans}</p>
            </div>
            <div style={{ backgroundColor: '#dbeafe', padding: '12px', borderRadius: '8px' }}>
              <Activity size={24} color="#3b82f6" />
            </div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>Compliance Rate</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.complianceRate}%</p>
            </div>
            <div style={{ backgroundColor: '#dcfce7', padding: '12px', borderRadius: '8px' }}>
              <CheckCircle size={24} color="#10b981" />
            </div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>Pending Reviews</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.pendingReviews}</p>
            </div>
            <div style={{ backgroundColor: '#fed7aa', padding: '12px', borderRadius: '8px' }}>
              <Clock size={24} color="#f59e0b" />
            </div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>Violations Found</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{stats.violationsFound}</p>
            </div>
            <div style={{ backgroundColor: '#fecaca', padding: '12px', borderRadius: '8px' }}>
              <AlertTriangle size={24} color="#ef4444" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <button
            onClick={handleRunScan}
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
          >
            <Activity size={20} />
            Run System Scan (Simulated)
          </button>

          <button
            onClick={() => alert('Frontend-only: View Records will be handled in the Records page.')} 
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
          >
            <Database size={20} />
            View Records
          </button>

          <button
            onClick={() => alert('Frontend-only: open Manual Entry page to add records.')}
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
          >
            <PlusSquare size={20} />
            Manual Entry
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>
          Recent Activities
        </h2>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
        >
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div
                key={index}
                style={{
                  padding: '15px 20px',
                  borderBottom: index < recentActivities.length - 1 ? '1px solid #e2e8f0' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor:
                        activity.status === 'success'
                          ? '#10b981'
                          : activity.status === 'warning'
                            ? '#f59e0b'
                            : '#64748b'
                    }}
                  />
                  <span style={{ fontWeight: '500', color: '#1e293b' }}>{activity.action}</span>
                </div>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{activity.time}</span>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No recent activities found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;

