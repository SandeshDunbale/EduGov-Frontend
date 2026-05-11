import React, { useMemo, useState } from 'react';
import { Database, Search, Filter, Download, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

const initialRecords = [
  { complianceId: 101, entityType: 'Student Records', notes: 'KYC documents incomplete', result: 'VIOLATION', date: '2024-02-10T10:00:00Z', officerName: 'Officer A' },
  { complianceId: 102, entityType: 'Faculty Credentials', notes: 'Annual training pending', result: 'UNDER_REVIEW', date: '2024-02-12T10:00:00Z', officerName: 'Officer A' },
  { complianceId: 103, entityType: 'Financial Compliance', notes: 'All checks passed', result: 'COMPLIANT', date: '2024-02-15T10:00:00Z', officerName: 'Officer B' },
  { complianceId: 104, entityType: 'Academic Programs', notes: 'Policy updated; needs verification', result: 'UNDER_REVIEW', date: '2024-02-18T10:00:00Z', officerName: 'Officer B' },
  { complianceId: 105, entityType: 'Student Records', notes: 'No issues found', result: 'COMPLIANT', date: '2024-02-21T10:00:00Z', officerName: 'Officer A' }
];

const ComplianceRecords = () => {
  const [records, setRecords] = useState(initialRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading] = useState(false);

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.entityType?.toLowerCase().includes(q) ||
          record.notes?.toLowerCase().includes(q) ||
          record.result?.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((record) => {
        const r = (record.result || '').toLowerCase();
        if (filterStatus === 'warning') return r === 'under_review';
        return r === filterStatus;
      });
    }

    return filtered;
  }, [records, searchTerm, filterStatus]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record? (frontend only)')) {
      setRecords((prev) => prev.filter((record) => record.complianceId !== id));
      alert('Record deleted successfully (frontend only)');
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'compliant':
      case 'completed':
        return '#10b981';
      case 'violation':
      case 'under_review':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'compliant':
      case 'completed':
        return <CheckCircle size={16} color="#10b981" />;
      case 'violation':
      case 'under_review':
        return <AlertTriangle size={16} color="#f59e0b" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading compliance records...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>Compliance Records</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>View and manage all compliance audit records and reports.</p>
      </div>

      {/* Search and Filter */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
              />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="warning">Warning</option>
            <option value="violation">Violation</option>
          </select>

          <button
            onClick={() => alert('Frontend-only: Export not connected yet.')}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>
            Compliance Audit Records ({filteredRecords.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                  ID
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                  Entity Type
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                  Result
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                  Date
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                  Officer
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={record.complianceId || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px', color: '#1e293b', fontWeight: '500' }}>{record.complianceId}</td>
                  <td style={{ padding: '15px', color: '#1e293b' }}>{record.entityType}</td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(record.result)}
                      <span style={{ color: getStatusColor(record.result), fontWeight: '500', textTransform: 'capitalize' }}>
                        {(record.result || '').replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '15px', color: '#64748b' }}>
                    {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '15px', color: '#64748b' }}>{record.officerName || 'Unknown'}</td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => alert('Frontend-only: View action not connected yet.')}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.9rem'
                        }}
                      >
                        <Eye size={14} />
                        View
                      </button>

                      <button
                        onClick={() => handleDelete(record.complianceId)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplianceRecords;

