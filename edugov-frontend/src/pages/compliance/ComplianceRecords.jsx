import React, { useMemo, useState, useEffect } from 'react';
import { Search, Download, Eye, AlertTriangle, CheckCircle, X, Info, Trash2 } from 'lucide-react';
import ComplianceService from '../../services/complianceService';

const ComplianceRecords = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // --- Modal State for Viewing Record Details ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Load all records on component mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await ComplianceService.getAllCompliance();
      setRecords(data || []);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Logic to fetch and display a single record in the modal
  const handleView = async (id) => {
    if (!id) return;
    
    setSelectedRecord(null);
    setIsModalOpen(true);
    setModalLoading(true);

    try {
      const data = await ComplianceService.getById(id);
      setSelectedRecord(data);
    } catch (e) {
      console.error("View error:", e);
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this compliance record?")) return;

    try {
      await ComplianceService.deleteRecord(id);
      // Update local state to remove the deleted record immediately
      setRecords(prev => prev.filter(r => r.complianceId !== id));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  // Search and Filter Logic
  const filteredRecords = useMemo(() => {
    let filtered = records;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((r) =>
        r.entityType?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        r.result?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => {
        const res = (r.result || '').toLowerCase();
        if (filterStatus === 'warning') return res === 'under_review';
        return res === filterStatus;
      });
    }
    return filtered;
  }, [records, searchTerm, filterStatus]);

  // UI Helper for Status Badges
  const getStatusTheme = (status) => {
    const s = (status || '').toLowerCase();
    if (['compliant', 'completed'].includes(s)) return { color: '#10b981', bg: '#ecfdf5' };
    if (['violation', 'under_review', 'warning'].includes(s)) return { color: '#f59e0b', bg: '#fffbeb' };
    return { color: '#64748b', bg: '#f8fafc' };
  };

  if (loading) return <div style={loaderStyle}>Syncing governance logs...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={titleStyle}>Compliance Records</h1>
          <p style={subTitleStyle}>Monitoring and management of system-wide audit logs.</p>
        </div>
        <button style={exportBtn}><Download size={18} /> Export Results</button>
      </div>

      {/* Filters Bar */}
      <div style={filterCard}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={searchIcon} />
          <input
            type="text"
            placeholder="Search by ID, type, or result..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Statuses</option>
          <option value="compliant">Compliant</option>
          <option value="warning">Under Review</option>
          <option value="violation">Violation</option>
        </select>
      </div>

      {/* Main Data Table */}
      <div style={tableContainer}>
        <table style={tableMainStyle}>
          <thead>
            <tr style={theadRow}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Entity Type</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>Officer</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r) => {
              const theme = getStatusTheme(r.result);
              return (
                <tr key={r.complianceId} style={tableRow}>
                  <td style={tdStyle}>#{r.complianceId}</td>
                  <td style={tdStyle}><strong>{r.entityType}</strong></td>
                  <td style={tdStyle}>
                    <span style={{ ...statusBadge, color: theme.color, backgroundColor: theme.bg }}>
                      {(r.result || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td style={tdStyle}>{r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}</td>
                  <td style={tdStyle}>{r.officerName || 'Unknown'}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleView(r.complianceId)} style={viewBtn}>
                        <Eye size={14} /> Details
                      </button>
                      <button onClick={() => handleDelete(r.complianceId)} style={deleteBtn}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Record Detail Modal Overlay */}
      {isModalOpen && (
        <div style={modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={iconBox}><Info size={20} color="#3b82f6" /></div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Record Review</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={closeBtn}><X size={20} /></button>
            </div>
            
            <div style={modalBody}>
              {modalLoading ? (
                <p style={{ textAlign: 'center', padding: '20px' }}>Loading record data...</p>
              ) : selectedRecord ? (
                <div style={detailsGrid}>
                  <div style={detailItem}>
                    <label style={labelStyle}>Compliance ID</label>
                    <p style={valueStyle}>#{selectedRecord.complianceId}</p>
                  </div>
                  <div style={detailItem}>
                    <label style={labelStyle}>Entity Type</label>
                    <p style={valueStyle}>{selectedRecord.entityType}</p>
                  </div>
                  <div style={detailItem}>
                    <label style={labelStyle}>Assigned Officer</label>
                    <p style={valueStyle}>{selectedRecord.officerName || 'System Generated'}</p>
                  </div>
                  <div style={detailItem}>
                    <label style={labelStyle}>Current Status</label>
                    <p style={{ ...valueStyle, color: getStatusTheme(selectedRecord.result).color }}>
                      {selectedRecord.result}
                    </p>
                  </div>
                  <div style={{ ...detailItem, gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Notes & Findings</label>
                    <div style={notesBox}>{selectedRecord.notes || 'No detailed findings reported.'}</div>
                  </div>
                </div>
              ) : null}
            </div>
            <div style={modalFooter}>
              <button onClick={() => setIsModalOpen(false)} style={primaryBtn}>Close Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CSS-in-JS Styles ---
const titleStyle = { fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 };
const subTitleStyle = { color: '#64748b', fontSize: '14px', marginTop: '4px' };
const filterCard = { background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px' };
const tableContainer = { background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' };
const tableMainStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const theadRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' };
const thStyle = { padding: '16px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.025em' };
const tableRow = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#334155' };
const inputStyle = { padding: '10px 10px 10px 40px', width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' };
const selectStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' };
const searchIcon = { position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#94a3b8' };
const statusBadge = { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' };
const viewBtn = { background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#475569' };
const deleteBtn = { background: '#fff1f2', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#e11d48' };
const exportBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' };
const modalContent = { background: '#fff', width: '90%', maxWidth: '500px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', overflow: 'hidden' };
const modalHeader = { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalBody = { padding: '24px' };
const modalFooter = { padding: '16px 24px', background: '#f8fafc', textAlign: 'right' };
const iconBox = { background: '#eff6ff', padding: '8px', borderRadius: '10px' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' };
const primaryBtn = { background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const detailsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const detailItem = { display: 'flex', flexDirection: 'column', gap: '4px' };
const labelStyle = { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' };
const valueStyle = { fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 };
const notesBox = { padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#475569', minHeight: '60px' };
const loaderStyle = { padding: '100px', textAlign: 'center', color: '#64748b', fontWeight: '600' };

export default ComplianceRecords;