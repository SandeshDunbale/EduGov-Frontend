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
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

const RESOURCE_TYPES = ["FUNDS", "LAB_MATERIAL", "EQUIPMENT"];
const INFRA_TYPES = ["LIBRARY", "LAB", "CENTER"];

const PAGE_CONFIG = {
    STUDENT: {
        title: "Request Resource",
        description: "Students can select type and resource, then enter quantity.",
        submitLabel: "Submit Resource Request",
    },
    FACULTY: {
        title: "Request Infrastructure",
        description: "Faculty can select type and infrastructure.",
        submitLabel: "Submit Infrastructure Request",
    },
};

function RequestFormPage({ role = "STUDENT" }) {

    const { user, token } = useAuth();
    const config = PAGE_CONFIG[role];

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
    const [infraId, setInfraId] = useState("");
    const [quantity, setQuantity] = useState("");

    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [requestHistory, setRequestHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredRequests =
        statusFilter === "ALL"
            ? requestHistory
            : requestHistory.filter(req => req.status === statusFilter);
    // ✅ Ensure ID
    useEffect(() => {
        if (!requesterUserId && initialRequesterId) {
            setRequesterUserId(initialRequesterId);
        }
    }, [initialRequesterId, requesterUserId]);
    // ✅ FETCH PROGRAMS (FIXED CLEAN)
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


    // ✅ FETCH ITEMS WITH TYPE + PROGRAM ✅
    useEffect(() => {

        if (!type || !programId) {
            setItems([]);
            return;
        }

        const url =
            role === "STUDENT"
                ? `http://localhost:8002/api/resources/by-type-program?type=${type}&programId=${programId}`
                : `http://localhost:8002/api/infrastructure/by-type-program?type=${type}&programId=${programId}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {

                const filtered =
                    role === "FACULTY"
                        ? data.filter(i => i.status === "AVAILABLE")
                        : data;

                setItems(filtered || []);
            })
            .catch(() => setItems([]));

    }, [type, programId, role]);

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

        setLoading(true);

        const payload = {
            requesterUserId: Number(requesterUserId),
        };

        try {
            if (role === "STUDENT") {

                if (!resourceId || !quantity) {
                    setError("Please select resource and enter quantity.");
                    setLoading(false);
                    return;
                }

                payload.resourceId = Number(resourceId);
                payload.quantity = Number(quantity);

                await submitResourceRequest(payload);

            } else {

                if (!infraId) {
                    setError("Please select infrastructure.");
                    setLoading(false);
                    return;
                }

                payload.infraId = Number(infraId);

                await submitInfrastructureRequest(payload);
            }

            setStatusMessage(`${config.title} submitted successfully ✅`);

            // ⏱️ AUTO REMOVE AFTER 3 SECONDS
            setTimeout(() => {
                setStatusMessage("");
            }, 3000);


            setType("");
            setProgramId("");
            setItems([]);
            setResourceId("");
            setInfraId("");
            setQuantity("");

            fetchHistory();

        } catch (err) {
            setError("Submission failed");

            // ⏱️ Auto clear error also
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
                <h2 className="mb-2">{config.title}</h2>
                <p className="text-muted">{config.description}</p>
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
                                {(role === "STUDENT" ? RESOURCE_TYPES : INFRA_TYPES)
                                    .map(t => (
                                        <option key={t}>{t}</option>
                                    ))}
                            </select>
                        </div>
                        {/* ✅ PROGRAM */}
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

                        {/* ITEM */}
                        <div className="col-md-6">
                            <label className="form-label">
                                {role === "STUDENT" ? "Resource" : "Infrastructure"}
                            </label>

                            <select
                                className="form-control"
                                value={role === "STUDENT" ? resourceId : infraId}
                                onChange={(e) =>
                                    role === "STUDENT"
                                        ? setResourceId(e.target.value)
                                        : setInfraId(e.target.value)
                                }
                            >
                                <option value="">Select</option>

                                {items.map(item => (
                                    <option
                                        key={item.resourceId || item.infraId}
                                        value={item.resourceId || item.infraId}
                                    >
                                        {role === "STUDENT"
                                            ? `${item.type} - Qty: ${item.quantity}`
                                            : `${item.type} - ${item.location}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* QUANTITY */}
                        {role === "STUDENT" && (
                            <div className="col-md-6">
                                <label className="form-label">Quantity</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    min="1"
                                />
                            </div>
                        )}

                    </div>

                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                    {statusMessage && <div className="alert alert-success mt-3">{statusMessage}</div>}

                    <div className="mt-4">
                        <button
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

                            {loading ? "Sending request..." : config.submitLabel}
                        </button>

                    </div>

                </form>
            </div>


            {/* ✅ ✅ RESTORED TABLE */}
            <div className="card p-4 mt-4">
                
                <h5 className="mb-3">My Requests</h5>
                <div className="mb-3 d-flex gap-2 flex-wrap">
                    <button
                        className={`btn btn-sm ${statusFilter === "ALL" ? "btn-dark" : "btn-outline-dark"}`}
                        onClick={() => setStatusFilter("ALL")}
                    >
                        All
                    </button>

                    <button
                        className={`btn btn-sm ${statusFilter === "SUBMITTED" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setStatusFilter("SUBMITTED")}
                    >
                        Submitted
                    </button>

                    <button
                        className={`btn btn-sm ${statusFilter === "APPROVED" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => setStatusFilter("APPROVED")}
                    >
                        Approved
                    </button>

                    <button
                        className={`btn btn-sm ${statusFilter === "DECLINED" ? "btn-danger" : "btn-outline-danger"}`}
                        onClick={() => setStatusFilter("DECLINED")}
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
                                {filteredRequests.map((req, index) => (
                                    <tr key={req.requestId}>
                                        <td>{index + 1}</td>
                                        <td>{req.requestId}</td>
                                        <td>{req.itemType}</td>
                                        <td>
                                            {req.itemType === "RESOURCE"
                                                ? req.resourceType
                                                : req.infrastructureType}
                                        </td>
                                        <td>{req.programName || "N/A"}</td>
                                        <td>{req.quantity ?? "-"}</td>
                                        <td>{req.status}</td>
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
