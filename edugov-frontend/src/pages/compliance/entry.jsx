import React, { useState } from 'react';
import { PlusSquare, Save, X, FileText, Calendar, User, AlertCircle } from 'lucide-react';
import API from '../../api/axios';

const ManualEntry = () => {
  const [entries, setEntries] = useState([
    {
      id: 1,
      title: 'Faculty Training Record',
      type: 'Training',
      description: 'Annual compliance training completed by faculty members',
      date: '2024-01-15',
      status: 'draft'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'audit',
    description: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'medium'
  });

  const entryTypes = [
    { value: 'audit', label: 'Compliance Audit' },
    { value: 'training', label: 'Training Record' },
    { value: 'incident', label: 'Incident Report' },
    { value: 'review', label: 'Review Notes' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: entries.length + 1,
      ...formData,
      status: 'draft'
    };
    setEntries([...entries, newEntry]);
    setFormData({
      title: '',
      type: 'audit',
      description: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'medium'
    });
    setShowForm(false);
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#f59e0b';
      case 'submitted': return '#3b82f6';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
          Manual Entry
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Create and manage manual compliance entries and records.
        </p>
      </div>

      {/* Add Entry Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          <PlusSquare size={20} />
          Add New Entry
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>New Manual Entry</h3>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  placeholder="Enter entry title"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {entryTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="Enter detailed description of the compliance entry"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Save Entry
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: '#64748b',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>
            Manual Entries ({entries.length})
          </h3>
        </div>

        <div>
          {entries.map((entry, index) => (
            <div key={entry.id} style={{
              padding: '20px',
              borderBottom: index < entries.length - 1 ? '1px solid #e2e8f0' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>
                    {entry.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#e2e8f0',
                      color: '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {entry.type}
                    </span>
                    <span style={{
                      background: getStatusColor(entry.status) + '20',
                      color: getStatusColor(entry.status),
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {entry.status}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      {entry.date}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Delete
                </button>
              </div>
              <p style={{ color: '#64748b', lineHeight: '1.5' }}>{entry.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManualEntry;