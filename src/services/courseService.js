import api from "../api/axios";

export const CourseAPI = {
    getAll: () => api.get('/courses/all'), 
    getById: (id) => api.get(`/courses/${id}`), 
    getByProgramId: (pId) => api.get(`/courses/program/${pId}`),
    save: (data) => api.post('/courses/save', data),
    update: (id, data) => api.patch(`/courses/update/${id}`, data), 
    getByFacultyId: (fId) => api.get(`/courses/faculty/${fId}`)
    
};

// import api from "../api/axios";

// export const CourseAPI = {
//     // 🟢 FIXED: Added '/api' prefix to all routes to match the Gateway
//     getAll: () => api.get('/api/courses/all'), 
//     getById: (id) => api.get(`/api/courses/${id}`), 
//     getByProgramId: (pId) => api.get(`/api/courses/program/${pId}`),
//     save: (data) => api.post('/api/courses/save', data),
//     update: (id, data) => api.patch(`/api/courses/update/${id}`, data), 
//     getByFacultyId: (fId) => api.get(`/api/courses/faculty/${fId}`)
// };

