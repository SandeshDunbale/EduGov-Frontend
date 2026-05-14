import axios from "./axios";

const BASE_URL = "/api/resources";

// GET ALL
export const getAllResources = () => axios.get(`${BASE_URL}/all`);

// CREATE
export const createResource = (data) => axios.post(BASE_URL, data);

// UPDATE
export const updateResource = (id, data) =>
  axios.put(`${BASE_URL}/${id}`, data);

// DELETE
export const deleteResource = (id) =>
  axios.delete(`${BASE_URL}/${id}`);

// ALLOCATE
export const allocateResource = (id, quantity) =>
  axios.post(`${BASE_URL}/${id}/allocate`, { quantity });

// UPDATE STATUS
export const updateResourceStatus = (id, status) =>
  axios.patch(`${BASE_URL}/${id}/status`, { status });
