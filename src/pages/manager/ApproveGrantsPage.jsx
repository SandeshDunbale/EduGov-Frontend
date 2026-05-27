import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { GrantAPI } from '../../services/grantService';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%)',
    padding: 'clamp(16px, 4vw, 32px)',
  },
  header: {
    background: 'linear-gradient(135deg, #0284C7 0%, #0ea5e9 100%)',
    color: 'white',
    padding: 'clamp(20px, 5vw, 32px)',
    borderRadius: '12px',
    marginBottom: 'clamp(20px, 4vw, 32px)',
    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)',
  },
  headerTitle: {
    fontSize: 'clamp(24px, 6vw, 36px)',
    fontWeight: '700',
    margin: '0',
    letterSpacing: '-0.5px',
  },
  card: {
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    background: '#ffffff',
  },
  table: {
    marginBottom: '0',
    tableLayout: 'fixed',
  },
  tableHead: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    borderBottom: '3px solid #0284C7',
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 'clamp(12px, 2vw, 14px)',
    padding: 'clamp(12px, 2vw, 16px)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: 'none',
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      backgroundColor: '#f8fafc',
    },
  },
  tableCell: {
    padding: 'clamp(16px, 2vw, 20px)',
    fontSize: 'clamp(13px, 2vw, 15px)',
    color: '#1e293b',
    verticalAlign: 'middle',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '6px', /* Reduced gap */
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'nowrap',
  },
  button: {
    fontSize: '11px', 
    fontWeight: '600',
    padding: '4px 8px', 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    justifyContent: 'center',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    minWidth: '70px', 
    flex: '0 1 auto',
  },
  approveBtn: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
  },
  rejectBtn: {
    background: 'white',
    color: '#ef4444',
    border: '2px solid #ef4444',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
  },
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
  },
  emptyState: {
    textAlign: 'center',
    padding: 'clamp(40px, 8vw, 60px)',
    color: '#64748b',
  },
  responsiveTableWrapper: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
};

const ApproveGrantsPage = () => {
  const [pendingGrants, setPendingGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingGrants();
  }, []);

  const fetchPendingGrants = async () => {
    try {
      const data = await GrantAPI.getPendingApplications();
      setPendingGrants(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (id, decision) => {
    toast((t) => (
      <div>
        <p className="fw-semibold mb-2">Confirm {decision}?</p>
        <div className="d-flex justify-content-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="btn btn-sm btn-outline-light">
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              processDecision(id, decision);
            }}
            className="btn btn-sm bg-white text-primary fw-bold"
          >
            Confirm
          </button>
        </div>
      </div>
    ));
  };

  const processDecision = async (id, decision) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);

      await GrantAPI.submitDecision(id, decoded.userId, decision);

      setPendingGrants(prev =>
        prev.filter(app =>
          (app.applicationId || app.applicationID || app.id) !== id
        )
      );

      toast.success(`Application ${decision}`);
    } catch {
      toast.error("Error processing");
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt);

  return (
    <div style={styles.container}>

      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0284C7',
            color: '#fff',
            borderRadius: '8px',
            fontSize: 'clamp(12px, 2vw, 14px)',
            padding: 'clamp(12px, 2vw, 16px)',
          },
          success: {
            iconTheme: {
              primary: '#fff',
              secondary: '#0284C7',
            },
          },
          error: {
            iconTheme: {
              primary: '#fff',
              secondary: '#0284C7',
            },
          },
        }}
      />

      {processingId && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 9999, backdropFilter: 'blur(2px)' }}>
          <div className="spinner-border" style={{ color: '#0284C7', width: '50px', height: '50px' }}></div>
        </div>
      )}

      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Approve Grants</h2>
      </div>

      <div style={styles.card}>
        <div style={styles.responsiveTableWrapper}>

          {loading ? (
            <div style={styles.spinnerContainer}>
              <div className="spinner-border" style={{ color: '#0284C7', width: '50px', height: '50px' }}></div>
            </div>
          ) : pendingGrants.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: '500' }}>No pending grants to approve</p>
            </div>
          ) : (
            <table className="table align-middle mb-0 w-100" style={styles.table}>

                <thead style={styles.tableHead}>
                  <tr>
                    <th style={{ ...styles.tableHeaderCell, width: "10%" }} className="ps-3">App ID</th>
                    <th style={{ ...styles.tableHeaderCell, width: "20%" }}>Faculty</th>
                    <th style={{ ...styles.tableHeaderCell, width: "30%" }}>Project</th>
                    <th style={{ ...styles.tableHeaderCell, width: "15%", textAlign: 'center' }}>Amount</th>
                    <th style={{ ...styles.tableHeaderCell, width: "25%", textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingGrants.map((app) => {
                    const id = app.applicationId || app.applicationID || app.id;

                    return (
                      <tr key={id} style={{ ...styles.tableRow, transition: 'all 0.3s ease' }} 
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>

                        <td style={{ ...styles.tableCell, fontWeight: '600', color: '#0284C7' }} className="ps-3">{id}</td>
                        <td style={styles.tableCell}>{app.faculty?.name || 'N/A'}</td>
                        <td style={styles.tableCell}>
                          <span title={app.projectTitle} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {app.projectTitle}
                          </span>
                        </td>
                        <td style={{ ...styles.tableCell, textAlign: 'center', fontWeight: '600', color: '#059669' }}>
                          {formatCurrency(app.requestedAmount)}
                        </td>

                        <td style={{ textAlign: 'center', ...styles.tableCell }}>
                          <div style={styles.buttonContainer}>

                            <button
                              style={{ ...styles.button, ...styles.approveBtn }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                              onClick={() => handleDecision(id, 'APPROVED')}
                            >
                              <CheckCircle size={14} />
                              <span>Approve</span>
                            </button>

                            <button
                              style={{ ...styles.button, ...styles.rejectBtn }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fee2e2';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                              onClick={() => handleDecision(id, 'REJECTED')}
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
          )}

        </div>
      </div>
      
    </div>
  );
};

export default ApproveGrantsPage;