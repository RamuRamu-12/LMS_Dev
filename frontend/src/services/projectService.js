import { api } from './api';

export const projectService = {
  // Get all projects
  getProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Get single project by ID
  getProject: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Get project phases
  getProjectPhases: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/phases`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project phases:', error);
      throw error;
    }
  },

  // Get project analytics (Admin only)
  getProjectAnalytics: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      throw error;
    }
  },

  // Create project (Admin only)
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update project (Admin only)
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete project (Admin only)
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Get project leaderboard
  getProjectLeaderboard: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/leaderboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project leaderboard:', error);
      throw error;
    }
  },


  // Update project video URL (Admin only)
  updateProjectVideoUrl: async (projectId, videoUrl) => {
    try {
      const response = await api.put(`/projects/${projectId}/video`, { videoUrl });
      return response.data;
    } catch (error) {
      console.error('Error updating project video URL:', error);
      throw error;
    }
  },

  // Seed projects (Admin only)
  seedProjects: async () => {
    try {
      const response = await api.post('/projects/admin/seed');
      return response.data;
    } catch (error) {
      console.error('Error seeding projects:', error);
      throw error;
    }
  }
};
