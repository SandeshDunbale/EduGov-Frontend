import API from '../api/axios';

const ComplianceService = {
    // ✅ 1. Get All Records
    getAllCompliance: async () => {
        try {
            const response = await API.get('/api/compliance/all');
            return response.data;
        } catch (error) {
            console.error("Fetch Error:", error);
            throw error;
        }
    },

    // ✅ 2. Get Single Record (This was missing!)
    getById: async (id) => {
        try {
            // Matches @GetMapping("/{id}") in ComplianceController.java
            const response = await API.get(`/api/compliance/${id}`);
            return response.data;
        } catch (error) {
            console.error("GetById Error:", error);
            throw error;
        }
    },

    // ✅ 3. Run System Scan
    runSystemScan: async (officerId) => {
        try {
            const response = await API.post(`/api/compliance/generate/${officerId}`);
            return response.data;
        } catch (error) {
            console.error("Scan Error:", error);
            throw error;
        }
    },

    // ✅ 4. Create Manual Entry
    // NOTE: Your Java backend requires @RequestHeader("X-User-Id")
    createManualEntry: async (recordData, officerId) => {
        try {
            const response = await API.post('/api/compliance/create', recordData, {
                headers: {
                    'X-User-Id': officerId // This is mandatory for your Spring Boot @RequestHeader
                }
            });
            return response.data;
        } catch (error) {
            console.error("Create Error:", error);
            throw error;
        }
    },

    // ✅ 5. Delete Record
    deleteRecord: async (id) => {
        try {
            // Matches @DeleteMapping("/delete/{id}") in ComplianceController.java
            await API.delete(`/api/compliance/delete/${id}`);
            return true;
        } catch (error) {
            console.error("Delete Error:", error);
            throw error;
        }
    }
};

export default ComplianceService;