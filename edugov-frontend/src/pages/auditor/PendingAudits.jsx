import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Search, AlertCircle, Eye, X, FileText } from 'lucide-react';
import AuditService from '../../services/auditService';

const PendingAudits = () => {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State to control the modal
    const [selectedAudit, setSelectedAudit] = useState(null);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const data = await AuditService.getAllAudits();
                
                // 📍 FIX: Strictly filter for ONLY 'PENDING_VALIDATION' status
                // This removes APPROVED, IN_PROGRESS, and SCHEDULED from this specific page.
                const filtered = data.filter(a => a.status === 'PENDING_VALIDATION');
                
                setAudits(filtered);
            } catch (err) {
                console.error("Error loading pending audits");
            } finally {
                setLoading(false);
            }
        };
        fetchPending();
    }, []);

    const filteredList = useMemo(() => {
        return audits.filter(a => a.scope.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [audits, searchTerm]);

    if (loading) return <div style={containerStyle}>Decrypting pending records...</div>;

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div>
                    <h1 style={titleStyle}><Clock size={32} color="#f59e0b" /> Pending Audits</h1>
                    <p style={subtitleStyle}>Records awaiting institutional review or validation</p>
                </div>
                <div style={searchBox}>
                    <Search size={18} color="#94a3b8" />
                    <input 
                        style={inputStyle} 
                        placeholder="Search pending scope..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={listWrapper}>
                {filteredList.length > 0 ? filteredList.map(audit => (
                    <div key={audit.id} style={recordCard}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={idBadge}># {audit.id || audit.auditId}</span>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{audit.scope}</h3>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>
                                Scheduled Date: {audit.date || 'TBD'}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {/* 📍 UI Update: Shows the red pill for validation records */}
                            <span style={statusPill(audit.status)}>{audit.status}</span>
                            <button style={viewDetailsBtn} onClick={() => setSelectedAudit(audit)}>
                                <Eye size={16} /> View Details
                            </button>
                        </div>
                    </div>
                )) : (
                    <div style={emptyState}>
                        <AlertCircle size={48} color="#cbd5e1" />
                        <p>No pending validation audits found.</p>
                    </div>
                )}
            </div>

            {/* The Details Modal */}
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
                                <strong>Status:</strong> <span style={statusPill(selectedAudit.status)}>{selectedAudit.status}</span>
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <strong style={{ display: 'block', marginBottom: '8px' }}>Findings / System Notes:</strong>
                                <div style={findingsBoxStyle}>
                                    {selectedAudit.findings || "No findings recorded yet."}
                                </div>
                            </div>
                        </div>
                        <div style={modalFooterStyle}>
                            <button onClick={() => setSelectedAudit(null)} style={doneBtnStyle}>Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const containerStyle = { padding: '40px', background: '#f8fafc', minHeight: '100vh', position: 'relative' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' };
const titleStyle = { fontSize: '32px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '15px', margin: 0 };
const subtitleStyle = { color: '#64748b', fontSize: '16px', margin: '5px 0 0 47px' };
const searchBox = { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '350px' };
const inputStyle = { border: 'none', outline: 'none', fontSize: '14px', width: '100%' };
const listWrapper = { display: 'flex', flexDirection: 'column', gap: '15px' };
const recordCard = { background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s' };
const idBadge = { background: '#f1f5f9', color: '#2563eb', fontWeight: '800', fontSize: '12px', padding: '4px 8px', borderRadius: '6px' };
const viewDetailsBtn = { marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', color: '#2563eb', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' };
const emptyState = { textAlign: 'center', padding: '60px', color: '#94a3b8' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContentStyle = { background: '#fff', width: '500px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' };
const modalHeaderStyle = { padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' };
const closeBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' };
const modalBodyStyle = { padding: '24px' };
const detailRowStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '15px', color: '#334155' };
const findingsBoxStyle = { background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' };
const modalFooterStyle = { padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' };
const doneBtnStyle = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };

const statusPill = (status) => {
    // 📍 Update: Styles are specifically set to red for PENDING_VALIDATION as per image_65de39.png
    const isPending = status === 'PENDING_VALIDATION';
    return {
        padding: '5px 12px', borderRadius: '30px', fontSize: '11px', fontWeight: '800',
        background: isPending ? '#fee2e2' : '#fef3c7',
        color: isPending ? '#b91c1c' : '#92400e'
    };
};

export default PendingAudits;