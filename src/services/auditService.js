import API from "../api/axios";

const AuditService = {
    getAllAudits: async () => {
        try {
            const response = await API.get('/api/audits/get');
            return response.data;
        } catch (error) {
            console.error("Error fetching audits:", error);
            throw error;
        }
    },

    // Matches @PostMapping("/create") - officerId is grabbed from audit object body
    createAudit: async (auditData) => {
        try {
            const response = await API.post('/api/audits/create', auditData);
            return response.data;
        } catch (error) {
            console.error("Error creating audit:", error);
            throw error;
        }
    },

    updateAudit: async (id, auditData) => {
        try {
            const response = await API.put(`/api/audits/update/${id}`, auditData);
            return response.data;
        } catch (error) {
            console.error("Error updating audit:", error);
            throw error;
        }
    },

    deleteAudit: async (id) => {
        try {
            const response = await API.delete(`/api/audits/delete/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting audit:", error);
            throw error;
        }
    },

    // Matches @PatchMapping("/review/{id}") - uses Map/JSON body for auditorId
    reviewAudit: async (auditId, status, findings, auditorId) => {
        try {
            const response = await API.patch(`/api/audits/review/${auditId}`, { 
                status, 
                findings, 
                auditorId 
            });
            return response.data;
        } catch (error) {
            console.error("Error reviewing audit:", error);
            throw error;
        }
    }
};

export default AuditService;