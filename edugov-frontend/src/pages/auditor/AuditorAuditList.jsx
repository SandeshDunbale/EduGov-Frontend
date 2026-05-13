import React, { useState, useEffect } from 'react';
import { Library, Search, FileText, Eye, ShieldCheck, RefreshCw, X } from 'lucide-react';
import AuditService from '../../services/auditService';

const AuditorAuditList = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudit, setSelectedAudit] = useState(null);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const data = await AuditService.getAllAudits();
      setAudits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAudits = audits.filter(a => 
    a.scope.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={pageContainer}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            <Library size={32} color="#2563eb" /> Institutional Audit Records
          </h1>
          <p style={subtitleStyle}>Verified Records & Compliance History (Read-Only Access)</p>
        </div>
        <button onClick={fetchAudits} style={refreshBtn} title="Refresh Data">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={filterBar}>
        <div style={searchWrapper}>
          <Search size={18} color="#94a3b8" />
          <input 
            style={searchInput} 
            placeholder="Search by Institution or Scope..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={badgeInfo}>
          <ShieldCheck size={16} color="#10b981" /> Verified Data
        </div>
      </div>

      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr style={thRow}>
              <th style={thText}>Audit ID</th>
              <th style={thText}>Entity / Scope</th>
              <th style={thText}>Status</th>
              <th style={thText}>Audit Date</th>
              <th style={thText}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.map((audit) => (
              <tr key={audit.id || audit.auditId} style={trStyle}>
                <td style={tdId}># {audit.id || audit.auditId}</td>
                <td style={tdScope}>{audit.scope}</td>
                {/* 📍 Direct status display from DB */}
                <td><span style={statusBadge(audit.status)}>{audit.status}</span></td>
                <td style={tdDate}>{audit.date || 'Scheduled'}</td>
                <td>
                  <button style={viewBtn} onClick={() => setSelectedAudit(audit)}>
                    <Eye size={16} /> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAudits.length === 0 && !loading && (
          <div style={emptyState}>No audit records found in the official registry.</div>
        )}
      </div>

      {selectedAudit && (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={modalHeaderStyle}>
                    <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText color="#2563eb" /> Audit Details
                    </h2>
                    <button onClick={() => setSelectedAudit(null)} style={closeBtnStyle}>
                        <X size={24} />
                    </button>
                </div>
                <div style={modalBodyStyle}>
                    <div style={detailRowStyle}>
                        <strong>Record ID:</strong> <span>{selectedAudit.id || selectedAudit.auditId}</span>
                    </div>
                    <div style={detailRowStyle}>
                        <strong>Scope:</strong> <span>{selectedAudit.scope}</span>
                    </div>
                    <div style={detailRowStyle}>
                        <strong>Date:</strong> <span>{selectedAudit.date}</span>
                    </div>
                    <div style={detailRowStyle}>
                        <strong>Status:</strong> 
                        <span style={statusBadge(selectedAudit.status)}>{selectedAudit.status}</span>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <strong style={{ display: 'block', marginBottom: '8px' }}>Findings / System Notes:</strong>
                        <div style={findingsBoxStyle}>
                            {selectedAudit.findings || "No findings recorded yet."}
                        </div>
                    </div>
                </div>
                <div style={modalFooterStyle}>
                    <button onClick={() => setSelectedAudit(null)} style={doneBtnStyle}>Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Styles
const pageContainer = { padding: '40px', background: '#f8fafc', minHeight: '80vh', position: 'relative' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const titleStyle = { fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px', color: '#1e293b', margin: 0 };
const subtitleStyle = { color: '#64748b', marginLeft: '47px', marginTop: '5px' };
const refreshBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', cursor: 'pointer' };
const filterBar = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const searchWrapper = { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '400px' };
const searchInput = { border: 'none', outline: 'none', width: '100%', fontWeight: '500' };
const badgeInfo = { background: '#dcfce7', color: '#166534', padding: '8px 15px', borderRadius: '30px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' };
const tableWrapper = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' };
const thText = { padding: '18px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdId = { padding: '18px', fontWeight: '700', color: '#2563eb' };
const tdScope = { padding: '18px', fontWeight: '600', color: '#1e293b' };
const tdDate = { padding: '18px', color: '#64748b' };
const viewBtn = { background: '#f1f5f9', color: '#2563eb', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' };
const emptyState = { padding: '40px', textAlign: 'center', color: '#94a3b8' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContentStyle = { background: '#fff', width: '500px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' };
const modalHeaderStyle = { padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' };
const closeBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' };
const modalBodyStyle = { padding: '24px' };
const detailRowStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '15px', color: '#334155' };
const findingsBoxStyle = { background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' };
const modalFooterStyle = { padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' };
const doneBtnStyle = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };

const statusBadge = (status) => {
  let bg = '#fef3c7', color = '#92400e'; // Default
  
  if (status === 'APPROVED') { bg = '#dcfce7'; color = '#15803d'; }
  if (status === 'REJECTED') { bg = '#fee2e2'; color = '#b91c1c'; } // 📍 Must match 'REJECTED'
  if (status === 'IN_PROGRESS') { bg = '#dbeafe'; color = '#1e40af'; }
  if (status === 'PENDING_VALIDATION') { bg = '#ffedd5'; color = '#a16207'; }
  
  return { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', background: bg, color: color };
};

export default AuditorAuditList;