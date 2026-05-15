import React, { useState } from 'react';
import { Activity, Play, Pause, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ComplianceService from '../../services/complianceService';

const scanModules = [
  { name: 'Academic Programs', status: 'completed', items: 'Auto-detected' },
  { name: 'Faculty Credentials', status: 'completed', items: 'Auto-detected' },
  { name: 'Student Records', status: 'completed', items: 'Auto-detected' },
  { name: 'Financial Compliance', status: 'completed', items: 'Auto-detected' }
];

const SystemScan = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState(null);

  const startScan = async () => {
    if (!user?.userId) {
      alert("Officer session not found. Please log in.");
      return;
    }

    try {
      setIsScanning(true);
      setScanProgress(10); // Initial kick-off progress
      setScanResults(null);
      setError(null);

      // 1. Trigger the backend Compliance Generation
      // This calls @PostMapping("/generate/{officerId}")
      await ComplianceService.runSystemScan(user.userId);

      // 2. Simulate progress while backend is processing
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);

      // 3. Fetch the updated results from the database
      const allRecords = await ComplianceService.getAllCompliance();
      
      // Filter or summarize based on current logic
      // In a production app, you might pass a 'scanId' to get specific results
      const violations = allRecords.filter((r) => r.result === 'VIOLATION').length;
      const warnings = allRecords.filter((r) => r.result === 'UNDER_REVIEW').length;
      const passed = allRecords.filter((r) => r.result === 'COMPLIANT' || r.result === 'COMPLETED').length;

      setScanProgress(100);
      clearInterval(interval);
      setIsScanning(false);

      setScanResults({
        totalChecked: allRecords.length,
        violations,
        warnings,
        passed,
        scanTime: new Date().toLocaleTimeString(),
        message: 'System-wide scan completed and persisted to database.'
      });

    } catch (err) {
      setError('Backend communication failed. Check if Compliance Service is up.');
      setIsScanning(false);
      console.error('Scan error:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>Run System Scan</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Perform comprehensive compliance scanning across all system modules.</p>
      </div>

      {/* Scan Control */}
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={startScan}
            disabled={isScanning}
            style={{
              ...btnBase,
              background: isScanning ? '#64748b' : '#3b82f6',
              cursor: isScanning ? 'not-allowed' : 'pointer',
            }}
          >
            {isScanning ? <Pause size={20} className="animate-spin" /> : <Play size={20} />}
            {isScanning ? 'Processing Service Logic...' : 'Start Real-Time Scan'}
          </button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {isScanning && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: '500', color: '#1e293b' }}>Server Processing...</span>
              <span style={{ color: '#64748b' }}>{Math.round(scanProgress)}%</span>
            </div>
            <div style={progressBg}>
              <div style={{ ...progressFill, width: `${scanProgress}%` }} />
            </div>
          </div>
        )}

        {/* Scan Modules */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>Active Modules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {scanModules.map((module, index) => (
              <div key={index} style={{ ...moduleCard, background: isScanning ? '#f8fafc' : '#f0fdf4' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500', color: '#1e293b' }}>{module.name}</span>
                  {!isScanning && <CheckCircle size={16} color="#10b981" />}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '5px' }}>{module.items}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scan Results */}
      {scanResults && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>Database Summary</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <ResultStat label="Total Records" val={scanResults.totalChecked} color="#1e293b" />
            <ResultStat label="Passed" val={scanResults.passed} color="#10b981" />
            <ResultStat label="Warnings" val={scanResults.warnings} color="#f59e0b" />
            <ResultStat label="Violations" val={scanResults.violations} color="#ef4444" />
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button onClick={() => window.location.href='/compliance/records'} style={actionBtn}>
              View All Records
            </button>
            <button onClick={() => alert('Report logic triggered via Notification service.')} style={reportBtn}>
              <Activity size={18} /> Notify Admin
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components for cleaner JSX
const ResultStat = ({ label, val, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{val}</div>
    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{label}</div>
  </div>
);

// Styles
const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  marginBottom: '30px'
};

const btnBase = {
  color: 'white',
  padding: '15px 30px',
  borderRadius: '8px',
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '1.1rem',
  fontWeight: '500'
};

const progressBg = { width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' };
const progressFill = { height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.5s ease' };
const moduleCard = { padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' };
const errorStyle = { background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px' };
const actionBtn = { background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' };
const reportBtn = { background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 };

export default SystemScan;