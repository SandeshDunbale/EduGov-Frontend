// @ts-nocheck
import axios from '../api/axios';

const GRANT_API_URL = "http://localhost:8002/api/grants"; 

export const GrantAPI = {
    // This name MUST match exactly what the Dashboard calls 
    getGrantHistory: (facultyId) => {
        return axios.get(`${GRANT_API_URL}/history/${facultyId}`);
    },

    // Maps to controller source [cite: 503, 508, 510, 515, 518]
    applyForGrant: (projectId, facultyId, applicationData) => {
        return axios.post(`${GRANT_API_URL}/apply/${projectId}`, applicationData, {
            params: { facultyId }
        });
    },
    getPendingApplications: () => {
        return axios.get(`${GRANT_API_URL}/pending`);
    },
    submitDecision: (applicationId, userId, decision) => {
        return axios.post(`${GRANT_API_URL}/decision/${applicationId}`, null, {
            params: { userId, decision }
        });
    },
    getGrantDetailsByProject: (projectId) => {
        return axios.get(`${GRANT_API_URL}/project/${projectId}`);
    },
    getAllGrants: () => {
        return axios.get(`${GRANT_API_URL}/all`);
    }
};