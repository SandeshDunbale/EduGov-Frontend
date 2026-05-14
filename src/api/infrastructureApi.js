 // your axios instance
 import API from "./axios";

// ✅ GET ALL
export const getAllInfrastructure = () =>
  API.get("/api/infrastructure/all");

// ✅ CREATE
export const createInfrastructure = (data) =>
  API.post("/api/infrastructure", data);

// ✅ UPDATE
export const updateInfrastructure = (id, data) =>
  API.put(`/api/infrastructure/${id}`, data);

// ✅ DELETE
export const deleteInfrastructure = (id) =>
  API.delete(`/api/infrastructure/${id}`);
