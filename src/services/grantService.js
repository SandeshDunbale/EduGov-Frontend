// @ts-nocheck
import api from '../api/axios'; // Uses the globally configured Axios instance

export const GrantAPI = {
    
    // GET: Fetch the entire grant application history for a faculty member
    getGrantHistory: async (facultyId) => {
        try {
            const response = await api.get(`/api/grants/history/${facultyId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching grant history for faculty ${facultyId}:`, error);
            throw error;
        }
    },

    // POST: Apply for a grant for a specific project
    // Maps to controller source
    applyForGrant: async (projectId, facultyId, applicationData) => {
        try {
            const response = await api.post(`/api/grants/apply/${projectId}`, applicationData, {
                params: { facultyId }
            });
            return response.data;
        } catch (error) {
            console.error(`Error applying for grant for project ${projectId}:`, error);
            throw error;
        }
    },

    // GET: Fetch all pending grant applications for the Program Manager
    getPendingApplications: async () => {
        try {
            const response = await api.get('/api/grants/pending');
            return response.data;
        } catch (error) {
            console.error("Error fetching pending grants:", error);
            throw error;
        }
    },

    // POST: Submit the manager's decision (APPROVED or REJECTED)
    submitDecision: async (applicationId, userId, decision) => {
        try {
            const response = await api.post(`/api/grants/decision/${applicationId}`, null, {
                params: { userId, decision }
            });
            return response.data;
        } catch (error) {
            console.error(`Error processing decision for application ${applicationId}:`, error);
            throw error;
        }
    },

    // GET: Fetch details by project (Retained from local branch)
    getGrantDetailsByProject: async (projectId) => {
        try {
            const response = await api.get(`/api/grants/project/${projectId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching grant details for project ${projectId}:`, error);
            throw error;
        }
    },

    // GET: Fetch all grants (Retained from local branch)
    getAllGrants: async () => {
        try {
            const response = await api.get('/api/grants/all');
            return response.data;
        } catch (error) {
            console.error("Error fetching all grants:", error);
            throw error;
        }
    },

    // ---> NEW: Fetch decision history specifically for the Program Manager Dashboard
    getManagerDecisionHistory: async (managerId) => {
        try {
            const response = await api.get(`/api/grants/history/manager/${managerId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching manager history for ${managerId}:`, error);
            throw error;
        }
    }
};