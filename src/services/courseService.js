import api from "../api/axios";

export const CourseAPI = {
    getAll: () => api.get('/courses/all'), 
    getById: (id) => api.get(`/courses/${id}`), 
    getByProgramId: (pId) => api.get(`/courses/program/${pId}`),
    save: (data) => api.post('/courses/save', data),
    update: (id, data) => api.patch(`/courses/update/${id}`, data), 
    getByFacultyId: (fId) => api.get(`/courses/faculty/${fId}`)
};

