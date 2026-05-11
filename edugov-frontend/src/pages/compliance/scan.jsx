import React, { useState } from 'react';
import { Activity, Play, Pause, CheckCircle, AlertTriangle } from 'lucide-react';

const scanModules = [
  { name: 'Academic Programs', status: 'completed', items: 245 },
  { name: 'Faculty Credentials', status: 'completed', items: 89 },
  { name: 'Student Records', status: 'completed', items: 892 },
  { name: 'Financial Compliance', status: 'completed', items: 21 }
];

const mockComplianceRecords = [
  { result: 'VIOLATION' },
  { result: 'UNDER_REVIEW' },
  { result: 'COMPLIANT' },
  { result: 'UNDER_REVIEW' },
  { result: 'COMPLIANT' }
];

const SystemScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState(null);

  const startScan = async () => {
    try {
      setIsScanning(true);
      setScanProgress(0);
      setScanResults(null);
      setError(null);

      // Simulate scan progress
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return Math.min(100, prev + Math.random() * 15);
        });
      }, 500);

      // Frontend-only delay
      await new Promise((r) => setTimeout(r, 3200));
      clearInterval(interval);

      const records = mockComplianceRecords;
      const violations = records.filter((r) => r.result === 'VIOLATION').length;
      const warnings = records.filter((r) => r.result === 'UNDER_REVIEW').length;
      const passed = records.filter((r) => r.result === 'COMPLIANT' || r.result === 'COMPLETED').length;

      setScanProgress(100);
      setIsScanning(false);

      setScanResults({
        totalChecked: records.length,
        violations,
        warnings,
        passed,
        scanTime: '2m 34s (simulated)',
        message: 'Scan completed successfully (frontend simulation)'
      });
    } catch (err) {
      setError('Failed to start scan (frontend simulation)');
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
      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '30px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={startScan}
            disabled={isScanning}
            style={{
              background: isScanning ? '#64748b' : '#3b82f6',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '8px',
              border: 'none',
              cursor: isScanning ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}
          >
            {isScanning ? <Pause size={20} /> : <Play size={20} />}
            {isScanning ? 'Scanning...' : 'Start System Scan'}
          </button>
        </div>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        {isScanning && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: '500', color: '#1e293b' }}>Scan Progress</span>
              <span style={{ color: '#64748b' }}>{Math.round(scanProgress)}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${scanProgress}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Scan Modules */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>Scanning Modules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {scanModules.map((module, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: module.status === 'completed' ? '#f0fdf4' : '#fefefe'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500', color: '#1e293b' }}>{module.name}</span>
                  {module.status === 'completed' && <CheckCircle size={16} color="#10b981" />}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>{module.items} items checked</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scan Results */}
      {scanResults && (
        <div
          style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>Scan Results</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{scanResults.totalChecked}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Checked</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{scanResults.passed}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Passed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{scanResults.warnings}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Warnings</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{scanResults.violations}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Violations</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={() => alert('Frontend-only: Generate Report not connected yet.')}
              style={{
                background: '#10b981',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <Activity size={18} /> Generate Report
            </button>

            <button
              onClick={() => alert('Frontend-only: View Details not connected yet.')}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemScan;

