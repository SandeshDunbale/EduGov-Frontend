import axios from 'axios';

const API_BASE = "http://localhost:8002/programs";

const getHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const ProgramAPI = {
    getAll: () => axios.get(`${API_BASE}/all`, getHeader()),
    getById: (id) => axios.get(`${API_BASE}/${id}`, getHeader()),
    search: (title) => axios.get(`${API_BASE}/search/${title}`, getHeader()),
    getByStatus: (status) => axios.get(`${API_BASE}/status/${status}`, getHeader()),
    save: (payload) => axios.post(`${API_BASE}/save`, payload, getHeader()),
    update: (id, details) => axios.patch(`${API_BASE}/update/${id}`, details, getHeader())
};