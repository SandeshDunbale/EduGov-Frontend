// @ts-nocheck
import api from '../api/axios'; // Uses the globally configured Axios instance

export const ProjectAPI = {
    // GET: Fetch all projects for a specific faculty member
    // This name MUST match exactly what the Dashboard calls 
    getProjectsByFaculty: async (facultyId) => {
        try {
            const response = await api.get(`/api/projects/faculty/${facultyId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching projects for faculty ${facultyId}:`, error);
            throw error;
        }
    },

    // POST: Create a new project
    // Maps to controller source
    createProject: async (facultyId, projectData) => {
        try {
            const response = await api.post(`/api/projects/${facultyId}`, projectData);
            return response.data;
        } catch (error) {
            console.error("Error creating project:", error);
            throw error; 
        }
    },

    // GET: Fetch a single project by its ID
    getProjectById: async (projectId) => {
        try {
            const response = await api.get(`/api/projects/${projectId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            throw error;
        }
    },

    // PUT: Update an existing project
    updateProject: async (projectId, projectDetails) => {
        try {
            const response = await api.put(`/api/projects/${projectId}`, projectDetails);
            return response.data;
        } catch (error) {
            console.error(`Error updating project ${projectId}:`, error);
            throw error;
        }
    }
};