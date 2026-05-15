import React, { useMemo, useState, useEffect } from 'react';
import { Activity, Database, PlusSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ComplianceService from '../../services/complianceService';

// ✅ Normalize backend result
const normalizeResult = (result) => {
  const r = (result || '').toUpperCase();
  if (['COMPLIANT', 'COMPLETED'].includes(r)) return 'COMPLIANT';
  if (r === 'VIOLATION') return 'VIOLATION';
  if (r === 'UNDER_REVIEW') return 'UNDER_REVIEW';
  return 'UNKNOWN';
};

const ComplianceDashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH REAL BACKEND DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await ComplianceService.getAllCompliance();

      console.log("✅ BACKEND DATA:", data); // DEBUG

      setRecords(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error("❌ API ERROR:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED CALCULATION LOGIC
  const { stats, recentActivities } = useMemo(() => {

    const normalized = (records || []).map((r) => ({
      ...r,
      result: normalizeResult(r.result)
    }));

    const totalScans = normalized.length;

    const compliant = normalized.filter(r => r.result === 'COMPLIANT').length;
    const pending = normalized.filter(r => r.result === 'UNDER_REVIEW').length;
    const violations = normalized.filter(r => r.result === 'VIOLATION').length;

    const complianceRate =
      totalScans > 0 ? Math.round((compliant / totalScans) * 100) : 0;

    return {
      stats: {
        totalScans,
        complianceRate,
        pendingReviews: pending,
        violationsFound: violations
      },
      recentActivities: normalized.slice(0, 4).map((record) => ({
        action: `${record.entityType || 'UNKNOWN'} Compliance Check`,
        time: record.date
          ? new Date(record.date).toLocaleDateString()
          : 'Recent',
        status:
          record.result === 'COMPLIANT'
            ? 'success'
            : record.result === 'VIOLATION'
              ? 'warning'
              : 'pending'
      }))
    };

  }, [records]);

  // ✅ RUN SCAN
  const handleRunScan = async () => {
    if (!user?.userId) {
      alert("User not logged in");
      return;
    }

    try {
      setLoading(true);

      await ComplianceService.runSystemScan(user.userId);

      alert('✅ Scan completed!');
      await fetchData();

    } catch (err) {
      console.error("Scan failed:", err);
      alert('❌ Scan failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && records.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Activity className="animate-spin" size={30} />
        <p>Loading real-time data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>

      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
        Compliance Dashboard
      </h1>

      {/* ✅ STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))', gap: '20px' }}>

        <StatCard title="Total Scans" value={stats.totalScans} icon={<Activity />} color="#3b82f6"/>
        <StatCard title="Compliance Rate" value={`${stats.complianceRate}%`} icon={<CheckCircle />} color="#10b981"/>
        <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={<Clock />} color="#f59e0b"/>
        <StatCard title="Violations Found" value={stats.violationsFound} icon={<AlertTriangle />} color="#ef4444"/>

      </div>

      {/* ✅ ACTIONS */}
      <div style={{ marginTop: 30 }}>
        <button onClick={handleRunScan} style={btn('#3b82f6')}>
          Run Scan
        </button>

        <button onClick={() => window.location.href='/compliance/records'} style={btn('#10b981')}>
          View Records
        </button>

        <button onClick={() => window.location.href='/compliance/entry'} style={btn('#f59e0b')}>
          Manual Entry
        </button>
      </div>

      {/* ✅ RECENT */}
      <div style={{ marginTop: 30 }}>
        <h2>Recent Activities</h2>

        {recentActivities.length === 0 ? (
          <p>No backend data found</p>
        ) : (
          recentActivities.map((a, i) => (
            <div key={i} style={{ padding: 10, borderBottom: '1px solid #eee' }}>
              {a.action} — {a.time}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

// ✅ SMALL COMPONENT
const StatCard = ({ title, value, icon, color }) => (
  <div style={{ padding: 20, background: 'white', borderRadius: 10 }}>
    <p>{title}</p>
    <h2>{value}</h2>
    <div style={{ color }}>{icon}</div>
  </div>
);

// ✅ BUTTON STYLE
const btn = (color) => ({
  background: color,
  color: 'white',
  marginRight: 10,
  padding: '10px 20px',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer'
});

export default ComplianceDashboard;