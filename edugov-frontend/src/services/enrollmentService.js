import api from "../api/axios";

export const EnrollmentAPI = {
    // Hits @GetMapping("/all") [cite: 109, 160]
    getAll: () => api.get('/enrollments/all'),

    // Hits @GetMapping("/status/{status}") [cite: 105, 157]
    getByStatus: (status) => api.get(`/enrollments/status/${status}`),

    // Hits @PostMapping("/apply") [cite: 103, 126]
    // Expects payload: { studentId: Long, courseId: Long }
    apply: (data) => api.post('/enrollments/apply', data),

    // Hits @PutMapping("/update-status") [cite: 107, 141]
    // Expects payload: { enrollmentId: Long, adminId: Long, status: String }
    updateStatus: (data) => api.put('/enrollments/update-status', data),

    // Usage: EnrollmentAPI.delete(5, 2)
    delete: (id, adminId) => api.delete(`/enrollments/delete/${id}`, {
        params: { adminId }
    })
};