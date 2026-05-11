import React, { useEffect, useState } from "react";
import API from "../../../api/axios";
import { getUserById } from "../../../api/userApi";
import { useAuth } from "../../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ManagerRequests..css";

const STATUS_COLORS = { 
  SUBMITTED: "secondary",
  APPROVED: "success",
  DECLINED: "danger",
};

const REQUEST_STATUS_OPTIONS = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "APPROVED", label: "Approved" },
  { value: "DECLINED", label: "Declined" },
];

const ITEM_LABEL = {
  RESOURCE: "Resource",
  INFRASTRUCTURE: "Infrastructure",
};

function ManagerRequestsPage({ role = "PROG_MANAGER" }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [userNames, setUserNames] = useState({});
  const [userRoles, setUserRoles] = useState({});
  const pageSize = 8;

  // Check if current role is Program Manager (use prop or fall back to user role)
  const canManageRequests = role === "PROG_MANAGER";
  const showActionColumn = statusFilter === "SUBMITTED";
  const showReasonColumn = statusFilter === "DECLINED";
  const emptyColSpan = showActionColumn || showReasonColumn ? 10 : 9;

  const loadRequests = async (status, page = 0) => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("/api/requests", {
        params: { status, page, size: pageSize },
      });
      const data = response.data.content || response.data || [];
      setRequests(data);
      setTotalPages(response.data.totalPages || 1);
      fetchUserNames(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNames = async (requests) => {
    const uniqueIds = [...new Set(requests.map(r => r.requesterUserId))];
    const promises = uniqueIds.map(id => 
      getUserById(id)
        .then(res => ({ id, name: res.data.name || res.data.username || `User ${id}`, role: res.data.role || "Unknown" }))
        .catch(() => ({ id, name: `User ${id}`, role: "Unknown" }))
    );
    const results = await Promise.all(promises);
    const names = {};
    const roles = {};
    results.forEach(({ id, name, role }) => {
      names[id] = name;
      roles[id] = role;
    });
    setUserNames(names);
    setUserRoles(roles);
  };

  useEffect(() => {
    loadRequests(statusFilter, currentPage);
  }, [statusFilter, currentPage]);

  const handleApprove = async (requestId) => {
    const approverId = user?.userId || 1; // Default to 1 if user not in context
    setActionLoading(true);
    setError("");
    try {
      await API.post(
        `/api/requests/${requestId}/approve`,
        null,
        {
          params: {
            approverUserId: approverId,
          },
        }
      );
      setSuccessMessage("Request approved successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadRequests(statusFilter);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to approve request. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineModal = (request) => {
    setSelectedRequest(request);
    setDeclineReason("");
    setShowModal(true);
  };

  const handleDecline = async () => {
    if (!selectedRequest) {
      setError("Cannot decline request right now.");
      return;
    }
    const approverId = user?.userId || 1; // Default to 1 if user not in context
    setActionLoading(true);
    setError("");
    try {
      await API.post(
        `/api/requests/${selectedRequest.requestId}/decline`,
        null,
        {
          params: {
            approverUserId: approverId,
            reason: declineReason.trim() || "No reason provided",
          },
        }
      );
      setSuccessMessage("Request declined successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowModal(false);
      loadRequests(statusFilter);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to decline request. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const text = search.toLowerCase();
    return (
      req.requesterUserId?.toString().includes(text) ||
      req.requestId?.toString().includes(text) ||
      req.itemType?.toLowerCase().includes(text) ||
      req.status?.toLowerCase().includes(text) ||
      req.resource?.type?.toLowerCase().includes(text) ||
      req.infrastructure?.type?.toLowerCase().includes(text)
    );
  });

  const renderItemInfo = (req) => {
    if (req.itemType === "RESOURCE" && req.resource) {
      return `${req.resource.type || "Resource"} (ID: ${req.resource.resourceId})`;
    }
    if (req.itemType === "INFRASTRUCTURE" && req.infrastructure) {
      return `${req.infrastructure.type || "Infrastructure"} (ID: ${req.infrastructure.infraId})`;
    }
    return "Item details unavailable";
  };

  return (
    <div className="container-fluid mt-4">
      <div className="bg-white p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div>
            <h2 className="edugov-text-navy mb-2">Requests Dashboard</h2>
            <p className="mb-0 text-muted">
              Review submitted requests and manage approvals for both resource and infrastructure requests.
            </p>
          </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => loadRequests(statusFilter)}
                >
                  Refresh
                </button>
                <span className="badge bg-primary text-uppercase">
                  {user?.role ?? "UNKNOWN"}
                </span>
          </div>
        </div>
      </div>

      <div className="card p-3 mb-4">
        <div className="row align-items-center gy-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by requester, request id, item, or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-6 d-flex flex-wrap gap-2">
            {REQUEST_STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  statusFilter === option.value
                    ? "btn btn-primary btn-sm"
                    : "btn btn-outline-secondary btn-sm"
                }
                onClick={() => {
                  setStatusFilter(option.value);
                  setCurrentPage(0);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card p-3">
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Request ID</th>
                <th>Requester ID</th>
                <th>Requester Name</th>
                <th>Requester Role</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Requested At</th>
                {showReasonColumn ? <th>Reason</th> : null}
                {showActionColumn ? <th>Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={emptyColSpan} className="text-center py-4">
                    No requests match this filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, idx) => (
                  <tr key={req.requestId}>
                    <td>{idx + 1}</td>
                    <td>{req.requestId}</td>
                    <td>{req.requesterUserId}</td>
                    <td>{userNames[req.requesterUserId] || "Loading..."}</td>
                    <td>{userRoles[req.requesterUserId] || "Loading..."}</td>
                    <td>{ITEM_LABEL[req.itemType] ?? req.itemType ?? "-"}</td>
                    <td>{req.quantity ?? "-"}</td>
                    <td>
                      <span className={`badge bg-${STATUS_COLORS[req.status] || "secondary"}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.createdAt ? new Date(req.createdAt).toLocaleString() : "-"}</td>
                    {showReasonColumn ? (
                      <td>{req.reason ?? "-"}</td>
                    ) : null}
                    {showActionColumn ? (
                      <td>
                        {canManageRequests ? (
                          <div className="d-flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              disabled={actionLoading}
                              onClick={() => handleApprove(req.requestId)}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              disabled={actionLoading}
                              onClick={() => handleDeclineModal(req)}
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">No actions</span>
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-outline-secondary"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage + 1} of {totalPages}</span>
          <button
            className="btn btn-outline-secondary"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Decline Request</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              />
            </div>
            <div>
              <label className="form-label">Reason for decline</label>
              <textarea
                className="form-control"
                rows={4}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Explain why this request cannot be approved"
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDecline}
                disabled={actionLoading || !declineReason.trim()}
              >
                {actionLoading ? "Declining..." : "Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerRequestsPage;