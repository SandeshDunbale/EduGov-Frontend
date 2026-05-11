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
                  <td colSpan="7" className="no-data">
                    No infrastructure available
                  </td>
                </tr>
              ) : (
                paginatedData.map(r => (
                  <tr key={r.infraId}>
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

        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>⬅ Prev</button>
          <span>Page {currentPage} of {totalPages || 1}</span>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next ➡</button>
        </div>
      </div>

      {/* MODALS */}
      {successModal && (
        <div className="modal">
          <div className="modal-content success-box">
            <h3>✅ Success</h3>
            <p>Infrastructure created successfully!</p>
            <div className="modal-actions">
              <button onClick={() => setSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Infrastructure</h3>

            <input
              value={editModal.capacity}
              onChange={(e) =>
                setEditModal({ ...editModal, capacity: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>

            <div className="modal-actions">
              <button onClick={handleDelete}>Delete</button>
              <button onClick={() => setDeleteModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageInfrastructure;
