// src/services/projectService.js
import api from '../api/axios';

export const projectService = {
  
  // POST: Create a new project
  createProject: async (projectData, facultyId) => {
    try {
      const response = await api.post(`/api/projects/${facultyId}`, projectData);
      return response.data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error; 
    }
  },

  // GET: Fetch all projects for a specific faculty member
  getProjectsByFaculty: async (facultyId) => {
    try {
      const response = await api.get(`/api/projects/faculty/${facultyId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
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
  updateProject: async (projectId, projectData) => {
    try {
      const response = await api.put(`/api/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
      throw error;
    }
  }
};