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
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({
    programId: "",
    type: "FUNDS",
    quantity: "",
    status: "AVAILABLE"
  });

  const loadResources = async () => {
    
  try {
    const res = await getAllResources();
    setResources(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Resource fetch failed:", err);
    setResources([]);
    setErrorModal("Failed to load resources.");
  }


  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ CREATE
  const handleCreate = async (e) => {
    e.preventDefault();

    // Edge case: Quantity must be positive integer
    const qty = Number(form.quantity);
    if (isNaN(qty) || qty <= 0) {
      setErrorModal("Quantity must be a positive number.");
      return;
    }

    // Edge case: Program ID must be positive integer
    if (!form.programId) {
      setErrorModal("Please select a program.");
      return;
    }

    const progId = Number(form.programId);

    try {
      await createResource({
        ...form,
        programId: progId,
        quantity: qty
      });

      setForm({
        programId: "",
        type: "FUNDS",
        quantity: "",
        status: "AVAILABLE"
      });

      setSuccessModal(true);
      setTimeout(() => setSuccessModal(false), 3000);
      setCurrentPage(1);
      loadResources();

    } catch (err) {
      const backendMsg = err.response?.data?.message || "";

      let message = "Something went wrong.";

      if (backendMsg.includes("Program ID")) {
        message = backendMsg;
      }
      else if (backendMsg.includes("Dependent service")) {
        message = "Service unavailable. Try again shortly.";
      }
      else if (backendMsg.includes("quantity")) {
        message = backendMsg;
      }

      setErrorModal(message);
      setTimeout(() => setErrorModal(""), 3000);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8002/api/resources/programs")
      .then(res => res.json())
      
.then(data => {
  if (Array.isArray(data)) {
    setPrograms(data);
  } else {
    console.error("Invalid programs data:", data);
    setPrograms([]);
  }
})

      .catch(() => setPrograms([]));

  }, []);

  const handleUpdate = async () => {
    try {
      await updateResource(editModal.resourceId, editModal);
      setEditModal(null);
      loadResources();
    } catch {
      setErrorModal("Update failed.");
      setTimeout(() => setErrorModal(""), 3000);
    }
  };

  const handleAllocate = async () => {

    if (!allocateModal || !allocateModal.resourceId) return;
    if (!allocateModal.qty || Number(allocateModal.qty) <= 0) {
      setErrorModal("Enter valid quantity.");
      return;
    }

    try {
      await allocateResource(
        allocateModal.resourceId,
        Number(allocateModal.qty)
      );
      setAllocateModal(null);
      loadResources();
    } catch {
      setErrorModal("Allocation failed.");
      setTimeout(() => setErrorModal(""), 3000);
    }
  };


  const handleDelete = async () => {
    try {
      await deleteResource(deleteModal.resourceId);
      setDeleteModal(null);
      loadResources();
    } catch (err) {
      setErrorModal(
        err.response?.data?.message || "Delete failed."
      );
      setTimeout(() => setErrorModal(""), 3000);
    }
  };


  const filtered = resources.filter(r =>
    r.resourceId.toString().includes(search)
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ✅ Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      // Show all pages if 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Add ellipsis and middle pages
      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      // Add ellipsis before last page
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
          <select
            name="programId"
            value={form.programId}
            onChange={handleChange}
            required
          >
            <option value="">Select Program</option>

            {Array.isArray(programs) && programs.map(p => (

              <option key={p.programId} value={p.programId}>
                {p.title}
              </option>
            ))}
          </select>


          <select name="type" value={form.type} onChange={handleChange}>
            <option value="FUNDS">FUNDS</option>
            <option value="LAB_MATERIAL">LAB_MATERIAL</option>
            <option value="EQUIPMENT">EQUIPMENT</option>
          </select>

          <input 
            type="number" 
            name="quantity" 
            value={form.quantity} 
            onChange={handleChange} 
            placeholder="Quantity" 
            required 
          />

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ALLOCATED">ALLOCATED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="RETIRED">RETIRED</option>
          </select>

          <button type="submit" className="btn-primary">+ Add Resource</button>
        </form>
      </div>

      {/* TABLE */}
      <div className="card">
        <h3>All Resources</h3>

        <div className="table-wrapper">
          <table className="resource-table">

            {/* ✅ FIXED HEADER */}
            <thead>
              <tr>
                <th>#</th>
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
                  <td colSpan="7" className="no-data">
                    {search
                      ? "🔍 No resources found"
                      : "🚫 No resources available"}
                  </td>
                </tr>
              ) : (
                paginatedData.map((r, idx) => (
                  <tr key={r.resourceId}>
                    <td className="row-number">#{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                    <td>{r.resourceId}</td>

                    <td>{programs.find(p => p.programId === r.programId)?.title || r.programId}</td>

                    <td>{r.type}</td>
                    <td>{r.quantity}</td>

                    <td>
                      <span className={`status-badge ${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>

                    <td className="action-cell">
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
        </div>

        {/* ✅ MODERN PAGINATION */}
        {filtered.length > 0 && totalPages > 1 && (
          <div className="pagination-controls">
            <div className="pagination-wrapper">
              {/* First Button
              <button
                className="pagination-btn pagination-first"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                First
              </button> */}

              {/* Previous Button */}
              <button
                className="pagination-btn pagination-prev"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="pagination-numbers">
                {getPageNumbers().map((page, idx) => (
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
                  ) : (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              {/* Next Button */}
              <button
                className="pagination-btn pagination-next"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </button>

              {/* Last Button */}
              {/* <button
                className="pagination-btn pagination-last"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages)}
              >
                Last
              </button> */}
            </div>
          </div>
        )}
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
              type="number"
              value={editModal.quantity}
              onChange={(e) =>
                setEditModal({ ...editModal, quantity: e.target.value })
              }
              placeholder="Quantity"
              min="1"
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
              type="number"
              value={allocateModal.qty}
              onChange={(e) =>
                setAllocateModal({ ...allocateModal, qty: e.target.value })
              }
              placeholder="Quantity to allocate"
              min="1"
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
            <p>Are you sure you want to delete this resource?</p>

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