import React, { useEffect, useState } from "react";
import {
  getAllInfrastructure,
  createInfrastructure,
  updateInfrastructure,
  deleteInfrastructure
} from "../../../api/infrastructureApi";

import "./ManageResources.css";
import "./ManageInfrastructure.css";

const ITEMS_PER_PAGE = 7;

const ManageInfrastructure = () => {

  const [data, setData] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    programId: "",
    type: "LAB",
    location: "",
    capacity: "",
    status: "AVAILABLE"
  });

  const loadData = async () => {
    const res = await getAllInfrastructure();
    setData(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await createInfrastructure({
        ...form,
        programId: Number(form.programId),
        capacity: Number(form.capacity)
      });

      setForm({
        programId: "",
        type: "LAB",
        location: "",
        capacity: "",
        status: "AVAILABLE"
      });

      setSuccessModal(true);
      loadData();

    } catch (err) {
      setErrorModal("Failed to create infrastructure.");
    }
  };

  const handleUpdate = async () => {
    await updateInfrastructure(editModal.infraId, editModal);
    setEditModal(null);
    loadData();
  };

  const handleDelete = async () => {
    await deleteInfrastructure(deleteModal.infraId);
    setDeleteModal(null);
    loadData();
  };

  const filtered = data.filter(r =>
    r.infraId.toString().includes(search)
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  return (
    <div className="infra-wrapper">

      {/* HEADER */}
      <div className="header-row">
        <h2 className="page-title">🏢 Manage Infrastructure</h2>

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
      <div className="card infra-card">
        <h3>Create Infrastructure</h3>

        <form className="infra-form-grid" onSubmit={handleCreate}>
          <input name="programId" value={form.programId} onChange={handleChange} placeholder="Program ID" required />

          <select name="type" value={form.type} onChange={handleChange}>
            <option value="LIBRARY">LIBRARY</option>
            <option value="LAB">LAB</option>
            <option value="CENTER">CENTER</option>
          </select>

          <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required />

          <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="Capacity" required />

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="IN_USE">IN_USE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="RETIRED">RETIRED</option>
          </select>

          <button className="btn-primary infra-btn">
            + Add Infrastructure
          </button>
        </form>
      </div>

      {/* TABLE */}
      <div className="card infra-card">
        <h3>All Infrastructure</h3>

        <div className="infra-table-wrapper">
          <table className="resource-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Program</th>
                <th>Type</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    {search ? "🔍 No infrastructure found" : "🚫 No infrastructure available"}
                  </td>
                </tr>
              ) : (
                paginatedData.map((r, idx) => (
                  <tr key={r.infraId}>
                    <td className="row-number">#{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                    <td>{r.infraId}</td>
                    <td>{r.programId}</td>
                    <td>{r.type}</td>
                    <td>{r.location}</td>
                    <td>{r.capacity}</td>

                    <td>
                      <span className={`status-badge ${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>

                    <td>
                      <button className="btn-edit" onClick={() => setEditModal({ ...r })}>
                        Edit
                      </button>

                      <button className="btn-delete" onClick={() => setDeleteModal(r)}>
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
        {paginatedData.length > 0 && (
          <div className="pagination-controls mt-4">
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {/* Previous Button */}
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                First
              </button>

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
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
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </button>

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

      {/* ✅ SUCCESS MODAL */}
      {successModal && (
        <div className="modal">
          <div className="modal-content success-box">
            <h3>✅ Success</h3>
            <p>Infrastructure created successfully!</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ERROR MODAL */}
      {errorModal && (
        <div className="modal">
          <div className="modal-content error-box">
            <h3>⚠️ Error</h3>
            <p>{errorModal}</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setErrorModal("")}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ EDIT MODAL */}
      {editModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Infrastructure</h3>

            <input
              value={editModal.capacity}
              onChange={(e) =>
                setEditModal({ ...editModal, capacity: e.target.value })
              }
              placeholder="Capacity"
            />

            <div className="modal-actions">
              <button className="btn-primary" onClick={handleUpdate}>Save</button>
              <button className="btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ DELETE MODAL */}
      {deleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this infrastructure?</p>

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

export default ManageInfrastructure;