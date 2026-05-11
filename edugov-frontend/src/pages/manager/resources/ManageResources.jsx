import React, { useEffect, useState } from "react";
import {
  getAllResources,
  createResource,
  deleteResource,
  allocateResource,
  updateResource
} from "../../../api/resourceApi";

import "./ManageResources.css";

const ITEMS_PER_PAGE = 7;

const ManageResources = () => {

  const [resources, setResources] = useState([]);

  const [editModal, setEditModal] = useState(null);
  const [allocateModal, setAllocateModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    programId: "",
    type: "FUNDS",
    quantity: "",
    status: "AVAILABLE"
  });

  const loadResources = async () => {
    const res = await getAllResources();
    setResources(res.data);
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ CREATE
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await createResource({
        ...form,
        programId: Number(form.programId),
        quantity: Number(form.quantity)
      });

      setForm({
        programId: "",
        type: "FUNDS",
        quantity: "",
        status: "AVAILABLE"
      });

      setSuccessModal(true);
      loadResources();

    } catch (err) {
      const backendMsg = err.response?.data?.message || "";

      let message = "Something went wrong.";

      if (backendMsg.includes("Program not found")) {
        message = "Invalid Program ID. Please enter a valid one.";
      } else if (backendMsg.includes("Dependent service")) {
        message = "Service unavailable. Try again shortly.";
      }

      setErrorModal(message);
    }
  };

  const handleUpdate = async () => {
    await updateResource(editModal.resourceId, editModal);
    setEditModal(null);
    loadResources();
  };

  const handleAllocate = async () => {
    await allocateResource(
      allocateModal.resourceId,
      Number(allocateModal.qty)
    );
    setAllocateModal(null);
    loadResources();
  };

  const handleDelete = async () => {
    await deleteResource(deleteModal.resourceId);
    setDeleteModal(null);
    loadResources();
  };

  const filtered = resources.filter(r =>
    r.resourceId.toString().includes(search)
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="resource-container">

      {/* HEADER */}
      <div className="header-row">
        <h2 className="page-title">📦 Manage Resources</h2>

        <div className="search-box">
          <input
            placeholder="Search by ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* CREATE */}
      <div className="card">
        <h3>Create Resource</h3>

        <form className="form-grid" onSubmit={handleCreate}>
          <input name="programId" value={form.programId} onChange={handleChange} placeholder="Program ID" required />

          <select name="type" value={form.type} onChange={handleChange}>
            <option value="FUNDS">FUNDS</option>
            <option value="LAB">LAB</option>
            <option value="EQUIPMENT">EQUIPMENT</option>
          </select>

          <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" required />

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ALLOCATED">ALLOCATED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="RETIRED">RETIRED</option>
          </select>

          <button className="btn-primary">+ Add Resource</button>
        </form>
      </div>

      {/* TABLE */}
      <div className="card">
        <h3>All Resources</h3>

        <table className="resource-table">

          {/* ✅ FIXED HEADER */}
          <thead>
            <tr>
              <th>ID</th>
              <th>Program</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {search
                    ? "🔍 No resources found"
                    : "🚫 No resources available"}
                </td>
              </tr>
            ) : (
              paginatedData.map(r => (
                <tr key={r.resourceId}>
                  <td>{r.resourceId}</td>
                  <td>{r.programId}</td>
                  <td>{r.type}</td>
                  <td>{r.quantity}</td>

                  <td>
                    <span className={`status-badge ${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>

                  <td>
                    {/* ✅ FIXED STATE UPDATE */}
                    <button className="btn-edit" onClick={() => setEditModal({ ...r })}>Edit</button>

                    <button className="btn-allocate" onClick={() => setAllocateModal({ ...r, qty: "" })}>
                      Allocate
                    </button>

                    <button className="btn-delete" onClick={() => setDeleteModal({ ...r })}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>⬅ Prev</button>
          <span>Page {currentPage} of {totalPages || 1}</span>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next ➡</button>
        </div>
      </div>

      {/* ✅ SUCCESS */}
{successModal && (
  <div className="modal">
    <div className="modal-content success-box">
      <h3>✅ Success</h3>
      <p>Resource created successfully!</p>

      <div className="modal-actions">
        <button className="btn-primary" onClick={() => setSuccessModal(false)}>OK</button>
      </div>
    </div>
  </div>
)}

      {/* ✅ ERROR */}
 {errorModal && (
  <div className="modal">
    <div className="modal-content error-box">
      <h3>⚠️ Unable to Process</h3>
      <p>{errorModal}</p>

      <div className="modal-actions">
        <button className="btn-primary" onClick={() => setErrorModal("")}>Close</button>
      </div>
    </div>
  </div>
)}

{editModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>Edit Resource</h3>

      <input
        value={editModal.quantity}
        onChange={(e) =>
          setEditModal({ ...editModal, quantity: e.target.value })
        }
      />

      <div className="modal-actions">
        <button className="btn-primary" onClick={handleUpdate}>Save</button>
        <button className="btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}

      {/* ✅ ALLOCATE MODAL */}
      {allocateModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>Allocate Resource</h3>

      <input
        value={allocateModal.qty}
        onChange={(e) =>
          setAllocateModal({ ...allocateModal, qty: e.target.value })
        }
      />

      <div className="modal-actions">
        <button className="btn-allocate" onClick={handleAllocate}>Allocate</button>
        <button className="btn-secondary" onClick={() => setAllocateModal(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}


      {/* ✅ DELETE MODAL */}
     {deleteModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>Confirm Delete</h3>

      <div className="modal-actions">
        <button className="btn-delete" onClick={handleDelete}>Delete</button>
        <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ManageResources;
