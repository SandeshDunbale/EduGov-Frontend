import React, { useState, useEffect } from 'react';
import { 
  PlusSquare, Edit, Trash2, X, Save, RefreshCcw, 
  ClipboardList, Search, Filter, AlertCircle, Calendar 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuditService from '../../services/auditService';

const ComplianceAuditPage = () => {
  const { user } = useAuth();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    scope: '',
    status: 'SCHEDULED',
    findings: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);

  // Load data on component mount
  useEffect(() => {
    fetchAudits();
  }, []);

  // ✅ FIXED: Refresh logic with visual delay for animation
  const fetchAudits = async () => {
    try {
      setLoading(true);
      const data = await AuditService.getAllAudits();
      setAudits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch audits:", err);
    } finally {
      // Small timeout to ensure the user sees the refresh animation
      setTimeout(() => setLoading(false), 500);
    }
  };

  // ✅ FIXED: Functional Delete Logic
  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to permanently delete Audit #${id}?`)) return;

    try {
      setLoading(true);
      await AuditService.deleteAudit(id);
      // Remove from local state immediately for better UX
      setAudits(prev => prev.filter(a => (a.id || a.auditId) !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. Backend service may be unreachable.");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic for search bar
  const filteredAudits = audits.filter(audit => 
    (audit.scope?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (audit.status?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // ✅ FIX: Inject 'officerId' into the body to match your updated AuditController
      const payload = { 
        ...formData,
        officerId: user?.userId || user?.id 
      };

      if (editingId) {
        await AuditService.updateAudit(editingId, payload);
      } else {
        // Just pass the payload - ID is now inside the JSON body
        await AuditService.createAudit(payload);
      }
      resetForm();
      fetchAudits();
    } catch (err) {
      console.error("Submission error: ", err);
      alert("Backend sync failed. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ scope: '', status: 'SCHEDULED', findings: '', date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (audit) => {
    setFormData({
      scope: audit.scope,
      status: audit.status,
      findings: audit.findings,
      date: audit.date
    });
    setEditingId(audit.id || audit.auditId);
    setShowForm(true);
  };

  return (
    <div style={containerStyle}>
      {/* --- HEADER SECTION --- */}
      <div style={headerSectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={iconBoxStyle}>
            <ClipboardList size={30} color="#fff" />
          </div>
          <div>
            <h1 style={titleStyle}>Audit Management</h1>
            <p style={subtitleStyle}>Workspace: Governance & Compliance Monitoring</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* ✅ REFRESH BUTTON FIXED */}
          <button onClick={fetchAudits} style={iconButtonStyle} title="Refresh Table">
            <RefreshCcw 
              size={20} 
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} 
            />
          </button>
          <button 
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            style={{ ...actionButtonStyle, background: showForm ? '#f43f5e' : '#2563eb' }}
          >
            {showForm ? <X size={20} /> : <PlusSquare size={20} />}
            {showForm ? 'Close Form' : 'New Audit Record'}
          </button>
        </div>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div style={statsGridStyle}>
        <div style={statCardStyle('#dbeafe', '#1e40af')}>
          <AlertCircle size={20} />
          <span>Total: <strong>{audits.length}</strong></span>
        </div>
        <div style={statCardStyle('#dcfce7', '#166534')}>
          <Save size={20} />
          <span>Completed: <strong>{audits.filter(a => a.status === 'COMPLETED').length}</strong></span>
        </div>
        <div style={statCardStyle('#fef3c7', '#92400e')}>
          <Calendar size={20} />
          <span>Pending: <strong>{audits.filter(a => a.status !== 'COMPLETED').length}</strong></span>
        </div>
      </div>

      {/* --- FORM SECTION --- */}
      {showForm && (
        <div style={formWrapperStyle}>
          <div style={formHeaderStyle}>
            <h3 style={{ margin: 0 }}>{editingId ? '📝 Edit Audit Details' : '➕ Initialize New Audit'}</h3>
            <span style={idBadgeStyle}>{editingId ? `ID: ${editingId}` : 'Draft Mode'}</span>
          </div>
          <form onSubmit={handleSubmit} style={formBodyStyle}>
            <div style={formGridStyle}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Audit Scope / Institution *</label>
                <input 
                  style={inputStyle} 
                  value={formData.scope} 
                  onChange={(e) => setFormData({...formData, scope: e.target.value})} 
                  placeholder="e.g. Finance Audit 2026" 
                  required 
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>System Status</label>
                <select 
                  style={inputStyle} 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PENDING_VALIDATION">Pending Validation</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Scheduled Date</label>
                <input 
                  type="date" 
                  style={inputStyle} 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                />
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <label style={labelStyle}>Audit Findings / Observations</label>
              <textarea 
                style={{ ...inputStyle, minHeight: '100px' }} 
                value={formData.findings} 
                onChange={(e) => setFormData({...formData, findings: e.target.value})} 
                placeholder="Log compliance findings..." 
              />
            </div>
            <div style={formFooterStyle}>
              <button type="submit" disabled={isSubmitting} style={submitButtonStyle}>
                <Save size={18} /> {isSubmitting ? 'Syncing...' : 'Persist to Database'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TABLE CONTROLS --- */}
      <div style={tableControlsStyle}>
        <div style={searchWrapperStyle}>
          <Search size={18} color="#94a3b8" />
          <input 
            style={searchFieldStyle} 
            placeholder="Filter audits by scope or status..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
          <Filter size={16} /> Filtered: {filteredAudits.length}
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div style={tableWrapperStyle}>
        <table style={mainTableStyle}>
          <thead>
            <tr style={tableHeaderRowStyle}>
              <th style={thStyle}># ID</th>
              <th style={thStyle}>Institutional Scope</th>
              <th style={thStyle}>Timeline</th>
              <th style={thStyle}>Current Status</th>
              <th style={thStyle}>Control Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.length > 0 ? filteredAudits.map((audit) => (
              <tr key={audit.id || audit.auditId} style={trStyle}>
                <td style={tdIdStyle}># {audit.id || audit.auditId}</td>
                <td style={tdScopeStyle}>{audit.scope}</td>
                <td style={tdDateStyle}>{audit.date}</td>
                <td style={tdStyle}><span style={statusBadge(audit.status)}>{audit.status}</span></td>
                <td style={tdStyle}>
                  <div style={actionGroupStyle}>
                    <button onClick={() => startEdit(audit)} style={btnEdit}><Edit size={16} /></button>
                    {/* ✅ DELETE BUTTON FIXED */}
                    <button 
                      onClick={() => handleDelete(audit.id || audit.auditId)} 
                      style={btnDelete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={emptyTableStyle}>No audit records found matching your criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// --- STYLING CONSTANTS ---
const containerStyle = { padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" };
const headerSectionStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const iconBoxStyle = { background: 'linear-gradient(135deg, #2563eb, #7c3aed)', padding: '15px', borderRadius: '14px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' };
const titleStyle = { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0 };
const subtitleStyle = { fontSize: '14px', color: '#64748b', fontWeight: '500' };
const actionButtonStyle = { display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const iconButtonStyle = { background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', cursor: 'pointer', color: '#64748b' };
const statsGridStyle = { display: 'flex', gap: '15px', marginBottom: '30px' };
const statCardStyle = (bg, color) => ({ background: bg, color: color, padding: '10px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${color}20` });
const formWrapperStyle = { background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '30px', overflow: 'hidden' };
const formHeaderStyle = { padding: '20px 30px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const idBadgeStyle = { background: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', color: '#475569' };
const formBodyStyle = { padding: '30px' };
const formGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' };
const formFooterStyle = { marginTop: '30px', display: 'flex', justifyContent: 'flex-end' };
const submitButtonStyle = { background: '#10b981', color: '#fff', border: 'none', padding: '14px 40px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' };
const tableControlsStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const searchWrapperStyle = { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '400px' };
const searchFieldStyle = { border: 'none', outline: 'none', fontSize: '14px', width: '100%', fontWeight: '500' };
const tableWrapperStyle = { background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const mainTableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' };
const thStyle = { padding: '20px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' };
const tdStyle = { padding: '18px 20px', color: '#334155', fontSize: '15px' };
const tdIdStyle = { ...tdStyle, color: '#2563eb', fontWeight: '700', fontSize: '13px' };
const tdScopeStyle = { ...tdStyle, fontWeight: '600', color: '#0f172a' };
const tdDateStyle = { ...tdStyle, color: '#64748b', fontSize: '14px' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const actionGroupStyle = { display: 'flex', gap: '10px' };
const btnEdit = { background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', padding: '8px', borderRadius: '8px', cursor: 'pointer' };
const btnDelete = { background: '#fff1f2', color: '#f43f5e', border: '1px solid #ffe4e6', padding: '8px', borderRadius: '8px', cursor: 'pointer' };
const emptyTableStyle = { padding: '60px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' };

const statusBadge = (status) => {
  let bg = '#f1f5f9', color = '#475569';
  if (status === 'COMPLETED') { bg = '#dcfce7'; color = '#15803d'; }
  if (status === 'IN_PROGRESS') { bg = '#dbeafe'; color = '#1d4ed8'; }
  if (status === 'SCHEDULED') { bg = '#fef3c7'; color = '#b45309'; }
  if (status === 'PENDING_VALIDATION') { bg = '#fee2e2'; color = '#b91c1c'; }
  return { padding: '6px 12px', borderRadius: '30px', fontSize: '11px', fontWeight: '800', background: bg, color: color };
};

export default ComplianceAuditPage;