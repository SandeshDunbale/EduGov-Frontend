import React, { useState, useEffect } from 'react';
import { Stamp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import AuditService from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';

const SubmitApprovals = () => {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const data = await AuditService.getAllAudits();
      // Only show audits waiting for the Govt Auditor
      setPending(data.filter(a => a.status === 'PENDING_VALIDATION'));
    } catch (err) {
      console.error("Failed to load pending audits");
    }
  };

  const handleAction = async (id, actionType) => {
    if (!id) return;

    // Optimistic UI: remove it from this page immediately
    setPending(current => current.filter(audit => (audit.id || audit.auditId) !== id));

    try {
      setProcessing(true);
      
      // Ensure these match your Backend/List logic exactly
      const finalStatus = actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const findings = actionType === 'APPROVE' 
        ? 'Approved by Govt Auditor' 
        : 'Rejected - Discrepancies found in documentation.';
      
      await AuditService.reviewAudit(id, finalStatus, findings, String(user.userId));
      
      // OPTIONAL: trigger a global event or simple log to confirm DB update
      console.log(`Audit ${id} set to ${finalStatus}`);

    } catch (err) {
      console.error("Action Error:", err);
      alert("System was unable to process the request. The record will reappear.");
      loadPending(); // Bring it back if the server failed
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Stamp size={32} color="#f59e0b" /> Pending Review Workspace
      </h1>

      <div style={{ display: 'grid', gap: '20px' }}>
        {pending.length > 0 ? pending.map((audit) => {
          const safeId = audit.id || audit.auditId;

          return (
            <div key={safeId} style={approvalCard}>
              <div>
                <h4 style={{ margin: 0, fontSize: '18px' }}>{audit.scope}</h4>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Submission Date: {audit.date}</p>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
                  <strong>Officer Findings:</strong> {audit.findings}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button disabled={processing} onClick={() => handleAction(safeId, 'APPROVE')} style={approveBtn}>
                  <CheckCircle size={18} /> Approve
                </button>
                <button disabled={processing} onClick={() => handleAction(safeId, 'REJECT')} style={rejectBtn}>
                  <XCircle size={18} /> Reject
                </button>
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '16px', border: '1px dotted #cbd5e1' }}>
            <AlertCircle size={40} color="#94a3b8" style={{ marginBottom: '10px' }} />
            <p style={{ color: '#64748b' }}>No audits currently awaiting validation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const approvalCard = { background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const approveBtn = { background: '#10b981', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', gap: '8px', alignItems: 'center' };
const rejectBtn = { background: '#ef4444', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', gap: '8px', alignItems: 'center' };

export default SubmitApprovals;