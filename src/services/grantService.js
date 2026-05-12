// src/services/grantService.js
import api from '../api/axios';

export const grantService = {
  
  // POST: Apply for a grant for a specific project
  applyForGrant: async (projectId, facultyId, requestedAmount) => {
    try {
      const applicationData = {
        requestedAmount: parseFloat(requestedAmount)
      };
      const response = await api.post(`/api/grants/apply/${projectId}?facultyId=${facultyId}`, applicationData);
      return response.data;
    } catch (error) {
      console.error(`Error applying for grant for project ${projectId}:`, error);
      throw error;
    }
  },

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
  decideGrantApplication: async (applicationId, userId, decision) => {
    try {
      const response = await api.post(`/api/grants/decision/${applicationId}?userId=${userId}&decision=${decision}`);
      return response.data;
    } catch (error) {
      console.error(`Error processing decision for application ${applicationId}:`, error);
      throw error;
    }
  }

};