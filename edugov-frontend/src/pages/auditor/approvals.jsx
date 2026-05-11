import React, { useMemo, useState } from 'react';
import { CheckCircle, XCircle, Clock, FileText, Send, Stamp, Search } from 'lucide-react';

const mockRequests = [
  {
    id: 501,
    institution: 'Engineering College',
    type: 'Financial Audit',
    title: 'Audit Review: Engineering College',
    submittedDate: '2024-02-22',
    status: 'pending',
    priority: 'high',
    description: 'Critical: missing disclosures',
    documents: ['audit_report.pdf', 'findings_summary.pdf'],
    reviewer: 'Auditor 1'
  },
  {
    id: 503,
    institution: 'Medical Institute',
    type: 'Compliance Audit',
    title: 'Audit Review: Medical Institute',
    submittedDate: '2024-03-01',
    status: 'under_review',
    priority: 'low',
    description: 'Scheduled compliance audit',
    documents: ['audit_report.pdf'],
    reviewer: 'Pending Assignment'
  }
];

const Approvals = () => {
  const [selectedApprovals, setSelectedApprovals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const requests = useMemo(() => mockRequests, []);

  const filteredRequests = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return requests.filter((r) => {
      const matchesSearch =
        !q ||
        r.institution.toLowerCase().includes(q) ||
        r.id.toString().includes(q) ||
        r.title.toLowerCase().includes(q);
      const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [requests, searchTerm, filterStatus]);

  const toggleSelect = (id) => {
    setSelectedApprovals((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'under_review':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} color="#10b981" />;
      case 'rejected':
        return <XCircle size={16} color="#ef4444" />;
      case 'under_review':
        return <Clock size={16} color="#3b82f6" />;
      case 'pending':
        return <Send size={16} color="#f59e0b" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const handleBulkAction = (action) => {
    if (selectedApprovals.length === 0) {
      alert('Please select at least one approval request.');
      return;
    }
    alert(`${action === 'approve' ? 'Approved' : 'Rejected'} (frontend-only) for ${selectedApprovals.length} request(s).`);
    setSelectedApprovals([]);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', marginBottom: 10 }}>Submit Approvals</h1>
        <p style={{ color: '#64748b', fontSize: 18 }}>Frontend-only view. No backend calls.</p>
      </div>

      {selectedApprovals.length > 0 && (
        <div style={{ background: '#dbeafe', padding: 15, borderRadius: 8, border: '1px solid #bfdbfe', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ color: '#1e40af', fontWeight: 600 }}>
            {selectedApprovals.length} request{selectedApprovals.length > 1 ? 's' : ''} selected
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handleBulkAction('approve')} style={{ background: '#10b981', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} /> Bulk Approve
            </button>
            <button onClick={() => handleBulkAction('reject')} style={{ background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <XCircle size={16} /> Bulk Reject
            </button>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 15, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search approval requests..."
              style={{ width: '100%', padding: '10px 40px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16, outline: 'none' }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '10px 15px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16, outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>Approval Requests ({filteredRequests.length})</h3>
        </div>

        <div>
          {filteredRequests.map((request, index) => (
            <div key={request.id} style={{ padding: 20, borderBottom: index < filteredRequests.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: 15 }}>
                <input type="checkbox" checked={selectedApprovals.includes(request.id)} onChange={() => toggleSelect(request.id)} style={{ marginTop: 4 }} />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10, gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{request.id}</h4>
                        <span style={{ background: getPriorityColor(request.priority) + '20', color: getPriorityColor(request.priority), padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                          {request.priority}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 4, background: getStatusColor(request.status) + '20' }}>
                          {getStatusIcon(request.status)}
                          <span style={{ color: getStatusColor(request.status), fontWeight: 700, textTransform: 'capitalize' }}>{request.status.replace('_', ' ')}</span>
                        </span>
                      </div>

                      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 6 }}>
                        {request.institution} • {request.type} • Submitted: {request.submittedDate}
                      </p>
                      <p style={{ color: '#1e293b', fontWeight: 600, marginBottom: 6 }}>{request.title}</p>
                      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 10 }}>{request.description}</p>
                      <p style={{ color: '#64748b', fontSize: 14 }}>Reviewer: {request.reviewer}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 15 }}>
                    <p style={{ fontSize: 14, color: '#374151', fontWeight: 600, marginBottom: 6 }}>Documents:</p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {(request.documents || []).map((doc) => (
                        <span key={doc} style={{ background: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <FileText size={14} /> {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {(request.status === 'pending' || request.status === 'under_review') && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        style={{ background: '#10b981', color: '#fff', padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        onClick={() => alert('Frontend-only: approve not connected.')}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button
                        style={{ background: '#ef4444', color: '#fff', padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        onClick={() => alert('Frontend-only: reject not connected.')}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                      <button
                        style={{ background: '#3b82f6', color: '#fff', padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        onClick={() => alert('Frontend-only: request more info not connected.')}
                      >
                        <Send size={16} /> Request More Info
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, color: '#64748b', fontSize: 13 }}>
        Frontend-only module: all approvals UI is simulated.
      </div>
    </div>
  );
};

export default Approvals;

