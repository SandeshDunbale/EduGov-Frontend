import React, { useEffect, useState } from "react";
import API from "../../../api/axios";
import { getUserById } from "../../../api/userApi";
import { useAuth } from "../../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ManagerRequests.css";

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
  const [userNames, setUserNames] = useState({});
  const [userRoles, setUserRoles] = useState({});

  const pageSize = 5;
  const canManageRequests = role === "PROG_MANAGER";
  const showActionColumn = statusFilter === "SUBMITTED";
  const showReasonColumn = statusFilter === "DECLINED";

  const loadRequests = async (status, page = 0) => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("/api/requests", {
        params: { status, page, size: pageSize },
      });
      const data = response.data.content || response.data || [];
      setRequests(data);
      fetchUserNames(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNames = async (requestsData) => {
    const uniqueIds = [...new Set(requestsData.map((r) => r.requesterUserId))];
    const promises = uniqueIds.map((id) =>
      getUserById(id)
        .then((res) => ({
          id,
          name: res.data.name || res.data.username || `User ${id}`,
          role: res.data.role || "Unknown",
        }))
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

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    window.scrollTo({ top: 200, behavior: "smooth" });
  }, [currentPage]);

  const handleApprove = async (requestId) => {
    const approverId = user?.userId || 1;
    setActionLoading(true);
    setError("");
    try {
      await API.post(`/api/requests/${requestId}/approve`, null, {
        params: { approverUserId: approverId },
      });
      setSuccessMessage("Request approved successfully!");
      setTimeout(() => loadRequests(statusFilter, currentPage), 1000);
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
    const approverId = user?.userId || 1;
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
      setSuccessMessage("Request declined successfully!");
      setShowModal(false);
      setTimeout(() => loadRequests(statusFilter, currentPage), 1000);
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
    const requesterName = userNames[req.requesterUserId]?.toLowerCase() || "";
    return (
      req.requesterUserId?.toString().includes(text) ||
      req.requestId?.toString().includes(text) ||
      requesterName.includes(text) ||
      req.itemType?.toLowerCase().includes(text) ||
      req.status?.toLowerCase().includes(text) ||
      req.resourceType?.toLowerCase().includes(text) ||
      req.infrastructureType?.toLowerCase().includes(text)
    );
  });

  const itemsPerPage = 5;
  const totalFilteredPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const emptyColSpan = showActionColumn || showReasonColumn ? 11 : 10;

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalFilteredPages <= maxPagesToShow) {
      for (let i = 0; i < totalFilteredPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);
      if (currentPage > 2) {
        pages.push("...");
      }
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalFilteredPages - 2, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      if (currentPage < totalFilteredPages - 3) {
        pages.push("...");
      }
      if (totalFilteredPages > 1 && !pages.includes(totalFilteredPages - 1)) {
        pages.push(totalFilteredPages - 1);
      }
    }
    return pages;
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="bg-white p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div>
            <h2 className="edugov-text-navy mb-2">Requests Dashboard</h2>
            <p className="mb-0 text-muted">
              Manage approvals for resource and infrastructure requests.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => loadRequests(statusFilter, currentPage)}
              disabled={loading}
            >
              Refresh
            </button>
            <span className="badge bg-primary text-uppercase d-flex align-items-center">
              {user?.role ?? "UNKNOWN"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-3 mb-4 border-0 shadow-sm">
        <div className="row align-items-center gy-3 filter-row">
          <div className="col-md-9 search-section">
            <input
              type="text"
              className="form-control bg-light border-0"
              placeholder="Search by requester, id, item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3 d-flex justify-content-md-end">
            <select
              className="form-select bg-light border-0 fw-bold text-dark"
              style={{ minWidth: '140px' }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
            >
              {REQUEST_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}
      {successMessage && <div className="alert alert-success shadow-sm border-0">{successMessage}</div>}

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th className="border-0">#</th>
                  <th className="border-0">ID</th>
                  <th className="border-0">Name</th>
                  <th className="border-0">Role</th>
                  <th className="border-0">Item</th>
                  <th className="border-0">Program</th>
                  <th className="border-0 text-center">Type</th>
                  <th className="border-0 text-center">Qty/Loc</th>
                  <th className="border-0 text-center">Status</th>
                  <th className="border-0">Date</th>
                  {showReasonColumn && <th className="border-0">Reason</th>}
                  {showActionColumn && <th className="border-0 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="border-top-0">
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={emptyColSpan} className="text-center py-5">
                      <span className="text-muted">No requests found.</span>
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req, idx) => (
                    <tr key={req.requestId}>
                      <td className="text-muted fw-bold">#{currentPage * itemsPerPage + idx + 1}</td>
                      <td className="fw-bold">{req.requestId}</td>
                      <td>{userNames[req.requesterUserId] || "..."}</td>
                      <td>
                        <span className="badge bg-light text-secondary border px-2 py-1">
                          {userRoles[req.requesterUserId] || "..."}
                        </span>
                      </td>
                      <td>
                        {req.itemType === "RESOURCE"
                          ? req.resourceType || "-"
                          : req.infrastructureType || "-"}
                      </td>
                      <td className="text-muted small" style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                          {req.programName || "N/A"}
                      </td>
                      <td className="text-center">{ITEM_LABEL[req.itemType] ?? "-"}</td>
                      <td className="text-center">
                        {req.itemType === "RESOURCE"
                          ? req.quantity ?? "-"
                          : req.location || "-"}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill bg-${STATUS_COLORS[req.status] || "secondary"}-subtle text-${STATUS_COLORS[req.status] || "secondary"} px-3 py-2`}
                          style={{ fontWeight: 700, letterSpacing: '0.5px' }}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td title={req.createdAt ? new Date(req.createdAt).toLocaleString() : "-"}>
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      {showReasonColumn && (
                        <td title={req.reason || "-"}>
                          <small className="text-muted fst-italic">
                              {req.reason ? req.reason.substring(0, 20) + "..." : "-"}
                          </small>
                        </td>
                      )}
                      {showActionColumn && (
                        /* 🟢 FIXED: Changed flex-wrap to flex-nowrap to prevent button stacking */
                        <td className="text-center" style={{ whiteSpace: "nowrap" }}>
                          {canManageRequests ? (
                            <div className="d-flex justify-content-center gap-2 flex-nowrap">
                              <button
                                type="button"
                                className="btn btn-success btn-sm fw-bold px-3"
                                disabled={actionLoading}
                                onClick={() => handleApprove(req.requestId)}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm fw-bold px-3"
                                disabled={actionLoading}
                                onClick={() => handleDeclineModal(req)}
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted fst-italic small">No access</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredRequests.length > 0 && totalFilteredPages > 1 && (
            <div className="d-flex justify-content-center mt-4 pt-3 border-top">
              <div className="btn-group shadow-sm">
                <button
                  className="btn btn-light border"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                >
                  Previous
                </button>

                {getPageNumbers().map((pageNum, idx) => (
                  <React.Fragment key={idx}>
                    {pageNum === "..." ? (
                      <span className="btn btn-light border disabled">...</span>
                    ) : (
                      <button
                        className={`btn ${currentPage === pageNum ? "btn-primary fw-bold" : "btn-light border"}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum + 1}
                      </button>
                    )}
                  </React.Fragment>
                ))}

                <button
                  className="btn btn-light border"
                  disabled={currentPage >= totalFilteredPages - 1}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(totalFilteredPages - 1, prev + 1)
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4">
                  <div className="modal-header border-bottom-0 pb-0 px-4 pt-4">
                    <h5 className="modal-title fw-bold text-dark">Decline Request</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => setShowModal(false)}
                      disabled={actionLoading}
                    ></button>
                  </div>
                  <div className="modal-body px-4 py-4">
                    <label className="form-label text-muted fw-bold small text-uppercase">Reason for decline</label>
                    <textarea
                      className="form-control bg-light border-0"
                      rows={4}
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Explain why this request is being declined..."
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="modal-footer border-top-0 px-4 pb-4 pt-0">
                    <button
                      type="button"
                      className="btn btn-light text-secondary fw-bold"
                      onClick={() => setShowModal(false)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger fw-bold px-4"
                      onClick={handleDecline}
                      disabled={actionLoading || !declineReason.trim()}
                    >
                      {actionLoading ? "Declining..." : "Decline Request"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </>
      )}
    </div>
  );
}

export default ManagerRequestsPage;