import API from "../api/axios"; // Adjust this path to match your axios interceptor file

export const FacultyAPI = {
    register: (data) => API.post('/faculty/register', data),
    getById: (id) => API.get(`/faculty/${id}`),
    getByStatus: (status) => API.get(`/faculty/status/${status}`),
    update: (id, data) => API.put(`/faculty/${id}/update`, data),
    approve: (id) => API.patch(`/faculty/${id}/approve`),
    decline: (id) => API.patch(`/faculty/${id}/decline`),
    delete: (id) => API.delete(`/faculty/${id}/delete`),
    getAll: () => API.get('/faculty/all'),
    getByUserId: (userId) => API.get(`/faculty/user/${userId}`)
};