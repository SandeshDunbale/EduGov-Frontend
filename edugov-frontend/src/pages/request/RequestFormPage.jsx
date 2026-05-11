import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  submitResourceRequest,
  submitInfrastructureRequest,
  getRequestsByRequester,
} from "../../api/resourceRequestApi";
import "bootstrap/dist/css/bootstrap.min.css";

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

const PAGE_CONFIG = {
  STUDENT: {
    title: "Request Resource",
    description:
      "Students can request resource items by entering the resource ID and quantity.",
    fields: [
      { name: "resourceId", label: "Resource ID", type: "number", placeholder: "Enter resource ID" },
      { name: "quantity", label: "Quantity", type: "number", placeholder: "Enter quantity" },
    ],
    submitLabel: "Submit Resource Request",
  },
  FACULTY: {
    title: "Request Infrastructure",
    description:
      "Faculty can request infrastructure items by entering the infrastructure ID.",
    fields: [
      { name: "infraId", label: "Infrastructure ID", type: "number", placeholder: "Enter infra ID" },
    ],
    submitLabel: "Submit Infrastructure Request",
  },
};

function RequestFormPage({ role = "STUDENT" }) {
  const { user, token } = useAuth();
  const config = PAGE_CONFIG[role] || PAGE_CONFIG.STUDENT;

  const tokenPayload = token ? decodeJwtPayload(token) : null;
  const initialRequesterId =
    user?.userId ||
    user?.id ||
    tokenPayload?.userId ||
    tokenPayload?.user_id ||
    tokenPayload?.id ||
    tokenPayload?.sub ||
    tokenPayload?.preferred_username ||
    tokenPayload?.username ||
    "";

  const initialRequesterRole =
    user?.role ||
    tokenPayload?.role ||
    tokenPayload?.roles ||
    tokenPayload?.authorities ||
    tokenPayload?.auth ||
    "Unknown";

  const [requesterUserId, setRequesterUserId] = useState(initialRequesterId);
  const [resourceId, setResourceId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [infraId, setInfraId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!requesterUserId && initialRequesterId) {
      setRequesterUserId(initialRequesterId);
    }
  }, [initialRequesterId, requesterUserId]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!requesterUserId) {
        setRequestHistory([]);
        return;
      }

      setHistoryLoading(true);
      try {
        const response = await getRequestsByRequester(requesterUserId);
        setRequestHistory(response.data || []);
      } catch (err) {
        setRequestHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [requesterUserId]);

  const requireLogin = !token;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatusMessage("");

    if (!requesterUserId) {
      setError("Requester ID is required.");
      return;
    }

    setLoading(true);

    const payload = {
      requesterUserId: Number(requesterUserId),
    };

    if (role === "STUDENT") {
      if (!resourceId || !quantity) {
        setError("Resource ID and quantity are required.");
        setLoading(false);
        return;
      }
      payload.resourceId = Number(resourceId);
      payload.quantity = Number(quantity);
    } else if (role === "FACULTY") {
      if (!infraId) {
        setError("Infrastructure ID is required.");
        setLoading(false);
        return;
      }
      payload.infraId = Number(infraId);
    }

    try {
      if (role === "STUDENT") {
        await submitResourceRequest(payload);
      } else {
        await submitInfrastructureRequest(payload);
      }

      setStatusMessage(`${config.title} submitted successfully.`);
      setResourceId("");
      setQuantity("");
      setInfraId("");
      setNote("");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit request. Please check your values and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="bg-white p-4 mb-4 rounded shadow-sm">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div>
            <h2 className="edugov-text-navy mb-2">{config.title}</h2>
            <p className="mb-0 text-muted">{config.description}</p>
          </div>
          <div className="text-end">
            <span className="badge bg-info text-dark me-2">
              Role: {role.replace("_", " ")}
            </span>
            <span className="badge bg-secondary">
              Token: {token ? "Available" : "Missing"}
            </span>
          </div>
        </div>
      </div>

      {!token && (
        <div className="alert alert-warning">
          <strong>Login required:</strong> A valid JWT token must be present in localStorage under <code>token</code>.
        </div>
      )}

      {user && user.role && user.role !== role && (
        <div className="alert alert-info">
          Note: logged-in role is <strong>{user.role}</strong>, but this form is for <strong>{role}</strong>.
          To submit correctly, use the matching role token or switch to the appropriate request page.
        </div>
      )}

      {(user || tokenPayload) && (
        <div className="card p-4 mb-4">
          <h5>User details</h5>
          <div className="row gx-3 gy-2">
            <div className="col-sm-6">
              <div className="form-group">
                <label className="form-label">Requester ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={requesterUserId}
                  onChange={(e) => setRequesterUserId(e.target.value)}
                  placeholder="User ID"
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="form-label">Requester Role</label>
                <input
                  type="text"
                  className="form-control"
                    value={initialRequesterRole}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {tokenPayload && (
        <div className="card p-3 mb-4 bg-light">
          <h6 className="mb-2">Decoded token payload</h6>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "0.9rem" }}>
            {JSON.stringify(tokenPayload, null, 2)}
          </pre>
        </div>
      )}

      <div className="card p-4">
        <form onSubmit={handleSubmit}>
          <div className="row gy-3">
            {config.fields.map((field) => (
              <div className="col-md-6" key={field.name}>
                <label className="form-label">{field.label}</label>
                <input
                  type={field.type}
                  className="form-control"
                  value={field.name === "resourceId" ? resourceId : field.name === "quantity" ? quantity : infraId}
                  placeholder={field.placeholder}
                  onChange={(e) => {
                    if (field.name === "resourceId") setResourceId(e.target.value);
                    if (field.name === "quantity") setQuantity(e.target.value);
                    if (field.name === "infraId") setInfraId(e.target.value);
                  }}
                  min="1"
                />
              </div>
            ))}
          </div>

          {error && <div className="alert alert-danger mt-4">{error}</div>}
          {statusMessage && <div className="alert alert-success mt-4">{statusMessage}</div>}

          <div className="mt-4 d-flex flex-wrap gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !token}
            >
              {loading ? "Sending request..." : config.submitLabel}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setResourceId("");
                setQuantity("");
                setInfraId("");
                setError("");
                setStatusMessage("");
              }}
            >
              Reset form
            </button>
          </div>
        </form>
      </div>

      <div className="card p-4 mt-4">
        <h5 className="mb-3">My Requests</h5>
        {historyLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : requestHistory.length === 0 ? (
          <div className="alert alert-secondary mb-0">
            No requests found for this user yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-bordered mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Request ID</th>
                  <th>Item Type</th>
                  <th>Item ID</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Requested At</th>
                </tr>
              </thead>
              <tbody>
                {requestHistory.map((req, index) => (
                  <tr key={req.requestId ?? index}>
                    <td>{index + 1}</td>
                    <td>{req.requestId}</td>
                    <td>{req.itemType}</td>
                    <td>
                      {req.itemType === "RESOURCE"
                        ? req.resource?.resourceId || "-"
                        : req.infrastructure?.infraId || "-"}
                    </td>
                    <td>{req.quantity ?? "-"}</td>
                    <td>{req.status}</td>
                    <td>{req.createdAt ? new Date(req.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestFormPage;
