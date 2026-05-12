import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
    submitResourceRequest,
    getRequestsByRequester,
} from "../../../api/resourceRequestApi";
import "bootstrap/dist/css/bootstrap.min.css";
import "./StudentResourceRequest.css";

const decodeJwtPayload = (token) => {
    try {
        const payload = token.split(".")[1];
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

const RESOURCE_TYPES = ["FUNDS", "LAB_MATERIAL", "EQUIPMENT"];

function StudentResourceRequest() {
    const { user, token } = useAuth();

    const tokenPayload = token ? decodeJwtPayload(token) : null;

    const initialRequesterId =
        user?.userId ||
        tokenPayload?.userId ||
        tokenPayload?.sub ||
        "";

    const [requesterUserId, setRequesterUserId] = useState(initialRequesterId);
    const [type, setType] = useState("");
    const [programId, setProgramId] = useState("");
    const [programs, setPrograms] = useState([]);
    const [items, setItems] = useState([]);
    const [resourceId, setResourceId] = useState("");
    const [quantity, setQuantity] = useState("");

    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [requestHistory, setRequestHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedResource, setSelectedResource] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    const filteredRequests =
        statusFilter === "ALL"
            ? requestHistory
            : requestHistory.filter(req => req.status === statusFilter);

    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;

    const currentRecords = filteredRequests.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredRequests.length / recordsPerPage);

    // ✅ Generate smart page numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            
            if (currentPage > 3) {
                pages.push("...");
            }
            
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }
            
            if (currentPage < totalPages - 2) {
                pages.push("...");
            }
            
            pages.push(totalPages);
        }
        
        return pages;
    };

    // ✅ Ensure ID
    useEffect(() => {
        if (!requesterUserId && initialRequesterId) {
            setRequesterUserId(initialRequesterId);
        }
    }, [initialRequesterId, requesterUserId]);

    // ✅ FETCH PROGRAMS
    useEffect(() => {
        fetch("http://localhost:8002/api/resources/programs")
            .then(res => {
                if (!res.ok) throw new Error("Program fetch failed");
                return res.json();
            })
            .then(data => {
                setPrograms(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Program fetch error:", err);
                setPrograms([]);
            });
    }, []);

    // ✅ FETCH RESOURCES BY TYPE + PROGRAM
    useEffect(() => {
        if (!type || !programId) {
            setItems([]);
            return;
        }

        fetch(`http://localhost:8002/api/resources/by-type-program?type=${type}&programId=${programId}`)
            .then(res => res.json())
            .then(data => {
                setItems(Array.isArray(data) ? data : []);
            })
            .catch(() => setItems([]));
    }, [type, programId]);

    // ✅ FETCH HISTORY
    const fetchHistory = async () => {
        if (!requesterUserId) return;

        setHistoryLoading(true);
        try {
            const response = await getRequestsByRequester(requesterUserId);
            setRequestHistory(response.data || []);
        } catch {
            setRequestHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [requesterUserId]);

    // ✅ SUBMIT
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");

        if (!requesterUserId) {
            setError("Requester ID is required.");
            return;
        }

        if (!resourceId || !quantity) {
            setError("Please select resource and enter quantity.");
            return;
        }

        if (selectedResource && Number(quantity) > selectedResource.quantity) {
            setError(
                `Requested quantity exceeds available stock. Only ${selectedResource.quantity} units are currently available.`
            );
            return;
        }
        setLoading(true);

        const payload = {
            requesterUserId: Number(requesterUserId),
            resourceId: Number(resourceId),
            quantity: Number(quantity),
        };

        try {
            await submitResourceRequest(payload);

            setStatusMessage("Request Resource submitted successfully ✅");

            setTimeout(() => {
                setStatusMessage("");
            }, 3000);

            setType("");
            setProgramId("");
            setItems([]);
            setResourceId("");
            setQuantity("");

            fetchHistory();

        } catch (err) {
            setError("Submission failed");
            setTimeout(() => {
                setError("");
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid mt-4">

            {/* HEADER */}
            <div className="bg-white p-4 mb-4 rounded shadow-sm">
                <h2 className="mb-2">Request Resource</h2>
                <p className="text-muted">Students can select type and resource, then enter quantity.</p>
            </div>

            {/* FORM */}
            <div className="card p-4">
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">

                        {/* TYPE */}
                        <div className="col-md-6">
                            <label className="form-label">Type</label>
                            <select
                                className="form-control"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="">Select Type</option>
                                {RESOURCE_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* PROGRAM */}
                        <div className="col-md-6">
                            <label className="form-label">Program</label>
                            <select
                                className="form-control"
                                value={programId}
                                onChange={(e) => setProgramId(e.target.value)}
                            >
                                <option value="">Select Program</option>
                                {Array.isArray(programs) && programs.map(p => (
                                    <option key={p.programId} value={p.programId}>
                                        {p.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* RESOURCE */}
                        <div className="col-md-6">
                            <label className="form-label">Resource</label>
                            <select
                                className="form-control"
                                value={resourceId}
                                onChange={(e) => {
                                    const selected = items.find(i => i.resourceId == e.target.value);
                                    setResourceId(e.target.value);
                                    setSelectedResource(selected);
                                    setQuantity("");
                                }}
                            >
                                <option value="">Select Resource</option>
                                {items.map(item => (
                                    <option
                                        key={item.resourceId}
                                        value={item.resourceId}
                                        disabled={item.quantity === 0}
                                    >
                                        {item.type} - Qty: {item.quantity}
                                    </option>
                                ))}
                            </select>

                            {selectedResource && (
                                <small className="text-muted d-block mt-1">
                                    Available: {selectedResource.quantity}
                                </small>
                            )}

                        </div>

                        {/* QUANTITY */}
                        <div className="col-md-6">
                            <label className="form-label">Quantity</label>
                            <input
                                type="number"
                                className="form-control"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                                max={selectedResource?.quantity || undefined}
                                placeholder="Enter quantity"
                            />
                        </div>

                    </div>

                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                    {statusMessage && <div className="alert alert-success mt-3">{statusMessage}</div>}

                    <div className="mt-4">
                        <button
                            type="submit"
                            className="btn btn-primary d-flex align-items-center gap-2"
                            disabled={loading || !token}
                        >
                            {loading && (
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                            )}
                            {loading ? "Sending request..." : "Submit Resource Request"}
                        </button>
                    </div>

                </form>
            </div>

            {/* REQUEST HISTORY TABLE */}
            <div className="card p-4 mt-4">
                <h5 className="mb-3">My Requests</h5>

                <div className="mb-3 d-flex gap-2 flex-wrap">
                    <button
                        className={`btn btn-sm ${statusFilter === "ALL" ? "btn-dark" : "btn-outline-dark"}`}
                        onClick={() => {
                            setStatusFilter("ALL");
                            setCurrentPage(1);
                        }}
                    >
                        All
                    </button>
                    <button
                        className={`btn btn-sm ${statusFilter === "SUBMITTED" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => {
                            setStatusFilter("SUBMITTED");
                            setCurrentPage(1);
                        }}
                    >
                        Submitted
                    </button>
                    <button
                        className={`btn btn-sm ${statusFilter === "APPROVED" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => {
                            setStatusFilter("APPROVED");
                            setCurrentPage(1);
                        }}
                    >
                        Approved
                    </button>
                    <button
                        className={`btn btn-sm ${statusFilter === "DECLINED" ? "btn-danger" : "btn-outline-danger"}`}
                        onClick={() => {
                            setStatusFilter("DECLINED");
                            setCurrentPage(1);
                        }}
                    >
                        Declined
                    </button>
                </div>

                {historyLoading ? (
                    <div className="text-center">
                        <div className="spinner-border" />
                    </div>
                ) : requestHistory.length === 0 ? (
                    <div className="alert alert-secondary">No requests found</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead className="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>ID</th>
                                    <th>Item Type</th>
                                    <th>Category</th>
                                    <th>Program</th>
                                    <th>Qty</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((req, index) => (
                                    <tr key={req.requestId}>
                                        <td className="row-number">#{(currentPage - 1) * recordsPerPage + index + 1}</td>
                                        <td>{req.requestId}</td>
                                        <td>{req.itemType}</td>
                                        <td>
                                            {req.itemType === "RESOURCE"
                                                ? req.resourceType
                                                : req.infrastructureType}
                                        </td>
                                        <td>{req.programName || "N/A"}</td>
                                        <td>{req.quantity ?? "-"}</td>
                                        <td>
                                            <span className={`status-badge ${req.status.toLowerCase()}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ✅ MODERN PAGINATION */}
                {filteredRequests.length > 0 && (
                    <div className="pagination-controls mt-4">
                        <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                            
                            {/* First Button */}
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                            >
                                First
                            </button>

                            {/* Previous Button */}
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div className="btn-group">
                                {getPageNumbers().map((page, idx) => (
                                    page === "..." ? (
                                        <span key={`ellipsis-${idx}`} className="btn btn-ellipsis">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            className={`btn btn-sm ${
                                                currentPage === page
                                                    ? "btn-primary"
                                                    : "btn-outline-secondary"
                                            }`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}
                            </div>

                            {/* Next Button */}
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </button>

                            {/* Last Button */}
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                            >
                                Last
                            </button>

                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}

export default StudentResourceRequest;