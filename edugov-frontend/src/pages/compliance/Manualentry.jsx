import React, { useState, useEffect } from 'react';
import { PlusSquare, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ComplianceService from '../../services/complianceService';

const ManualEntry = () => {
  const { user } = useAuth();
  
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'audit',
    description: '',
    date: new Date().toISOString().split('T')[0],
    entityId: ''
  });

  const entryTypes = [
    { value: 'audit', label: 'Compliance Audit' },
    { value: 'training', label: 'Training Record' },
    { value: 'incident', label: 'Incident Report' },
    { value: 'review', label: 'Review Notes' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await ComplianceService.getAllCompliance();
      setEntries(data);
    } catch (err) {
      console.error("Failed to fetch entries", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.userId) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const payload = {
        entityId: parseInt(formData.entityId) || 0,
        entityType: formData.type.toUpperCase(),
        notes: `${formData.title}: ${formData.description}`,
        result: 'UNDER_REVIEW',
        date: formData.date,
        officerId: user.userId // 📍 FIX: Send the ID safely inside the JSON body!
      };

      await ComplianceService.createManualEntry(payload);
      
      alert("Record successfully saved to backend!");
      
      setShowForm(false);
      setFormData({
        title: '',
        type: 'audit',
        description: '',
        date: new Date().toISOString().split('T')[0],
        entityId: ''
      });
      
      fetchEntries();

    } catch (err) {
      console.error("Submission Error:", err.response?.data || err.message);
      alert("Failed to save. Check the console.");
    }
  };

  const deleteEntry = async (id) => {
    if (window.confirm("Permanently delete this record?")) {
      try {
        await ComplianceService.deleteRecord(id);
        setEntries(entries.filter(entry => entry.complianceId !== id));
      } catch (err) {
        alert("Failed to delete record.");
      }
    }
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'under_review': return '#f59e0b';
      case 'compliant': return '#10b981';
      case 'violation': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={32} color="#3b82f6" />
          Compliance Officer Workspace
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Securely manage manual entries and monitor system compliance records.
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm ? '#64748b' : '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          {showForm ? <X size={20} /> : <PlusSquare size={20} />}
          {showForm ? 'Cancel Entry' : 'New Manual Entry'}
        </button>
      </div>

      {showForm && (
        <div style={formCardStyle}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>New Manual Entry</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  style={inputStyle}
                  placeholder="e.g. Lab Safety Audit"
                />
              </div>
              <div>
                <label style={labelStyle}>Entity ID (Optional)</label>
                <input
                  type="number"
                  value={formData.entityId}
                  onChange={(e) => setFormData({...formData, entityId: e.target.value})}
                  style={inputStyle}
                  placeholder="e.g. 101"
                />
              </div>
              <div>
                <label style={labelStyle}>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  style={inputStyle}
                >
                  {entryTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={labelStyle}>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Enter compliance findings..."
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" style={{ ...btnBase, background: '#10b981' }}>Save to Backend</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...btnBase, background: '#ef4444' }}>Discard</button>
            </div>
          </form>
        </div>
      )}

      <div style={listContainerStyle}>
        <div style={listHeaderStyle}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
            System Records ({entries.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <div className="animate-spin" style={{ marginBottom: '10px' }}>⌛</div>
            Loading backend records...
          </div>
        ) : (
          <div>
            {entries.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No compliance records found.</div>
            ) : (
              entries.map((entry, index) => (
                <div key={entry.complianceId} style={{
                  padding: '24px',
                  borderBottom: index < entries.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e293b' }}>
                          {entry.entityType} - ID: {entry.entityId}
                        </h4>
                        <span style={{ 
                          background: getStatusColor(entry.result) + '15', 
                          color: getStatusColor(entry.result), 
                          padding: '4px 10px', 
                          borderRadius: '99px', 
                          fontSize: '0.75rem', 
                          fontWeight: '700',
                          textTransform: 'uppercase'
                        }}>
                          {entry.result}
                        </span>
                      </div>
                      <p style={{ color: '#475569', marginBottom: '12px', fontSize: '1rem', lineHeight: '1.6' }}>{entry.notes}</p>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>
                         Entry Date: {entry.date} | Officer ID: {entry.officerId}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.complianceId)}
                      style={{ background: '#fee2e2', color: '#ef4444', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const formCardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  marginBottom: '30px'
};

const labelStyle = { display: 'block', fontWeight: '600', color: '#475569', marginBottom: '8px', fontSize: '0.9rem' };

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '1rem',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

const btnBase = {
  color: 'white',
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '1rem'
};

const listContainerStyle = {
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  overflow: 'hidden'
};

const listHeaderStyle = {
  padding: '20px 24px',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc'
};

export default ManualEntry;