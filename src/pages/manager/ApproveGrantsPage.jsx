import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { GrantAPI } from '../../services/grantService';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';

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
        <p>Confirm {decision}?</p>
        <div className="d-flex justify-content-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="btn btn-sm btn-light">
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              processDecision(id, decision);
            }}
            className="btn btn-sm btn-primary"
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
    <div className="container-fluid py-4">

      <Toaster position="top-right" />

      {processingId && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(255,255,255,0.8)", zIndex: 9999 }}>
          <div className="spinner-border"></div>
        </div>
      )}

      <div className="bg-white p-4 rounded shadow-sm mb-4">
        <h2 className="fw-bold">Approve Grants</h2>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border"></div>
            </div>
          ) : (
            <div className="table-responsive">

              {/* ✅ VERY IMPORTANT FIX */}
              <table className="table align-middle mb-0 w-100" style={{ tableLayout: "fixed" }}>

                <thead className="table-dark">
                  <tr>
                    <th style={{ width: "10%" }} className="ps-4">App ID</th>
                    <th style={{ width: "20%" }}>Faculty</th>
                    <th style={{ width: "30%" }}>Project</th>
                    <th style={{ width: "15%" }} className="text-end">Amount</th>

                    {/* ✅ FORCE ACTION COLUMN SIZE */}
                    <th style={{ width: "25%" }} className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pendingGrants.map((app) => {
                    const id = app.applicationId || app.applicationID || app.id;

                    return (
                      <tr key={id}>

                        <td className="ps-4">{id}</td>
                        <td>{app.faculty?.name}</td>
                        <td>{app.projectTitle}</td>
                        <td className="text-end">
                          {formatCurrency(app.requestedAmount)}
                        </td>

                        {/* ✅ PERFECT SIDE BY SIDE FIX */}
                        <td>
                          <div
                            className="d-flex justify-content-center align-items-center"
                            style={{
                              gap: "10px",
                              width: "100%",
                              whiteSpace: "nowrap"
                            }}
                          >

                            <button
                              className="btn btn-success btn-sm"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px"
                              }}
                              onClick={() => handleDecision(id, 'APPROVED')}
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>

                            <button
                              className="btn btn-outline-danger btn-sm"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px"
                              }}
                              onClick={() => handleDecision(id, 'REJECTED')}
                            >
                              <XCircle size={14} />
                              Reject
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ApproveGrantsPage;