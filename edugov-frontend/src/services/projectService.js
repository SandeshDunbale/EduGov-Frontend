// @ts-nocheck
import axios from '../api/axios';

const PROJECT_API_URL = "http://localhost:8002/api/projects"; 

export const ProjectAPI = {
    // This name MUST match exactly what the Dashboard calls 
    getProjectsByFaculty: (facultyId) => {
        return axios.get(`${PROJECT_API_URL}/faculty/${facultyId}`);
    },

    // Maps to controller source [cite: 449, 453, 455]
    createProject: (facultyId, projectData) => {
        return axios.post(`${PROJECT_API_URL}/${facultyId}`, projectData);
    },
    getProjectById: (projectId) => {
        return axios.get(`${PROJECT_API_URL}/${projectId}`);
    },
    updateProject: (projectId, projectDetails) => {
        return axios.put(`${PROJECT_API_URL}/${projectId}`, projectDetails);
    }
};