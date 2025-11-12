const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class RealtimeProjectsService {
  /**
   * Get all projects with optional filters
   */
  async getProjects(filters = {}) {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    const queryParams = new URLSearchParams();
    if (filters.category && filters.category !== 'all') {
      queryParams.append('category', filters.category);
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
      queryParams.append('difficulty', filters.difficulty);
    }
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    if (filters.sort) {
      queryParams.append('sort', filters.sort);
    }

    const url = `${API_URL}/api/realtime-projects/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to access realtime projects.');
      }
      throw new Error('Failed to fetch projects');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get project information by ID
   */
  async getProjectInfo(projectId) {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/realtime-projects/${projectId}/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied');
      }
      if (response.status === 404) {
        throw new Error('Project not found');
      }
      throw new Error('Failed to fetch project info');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get project categories
   */
  async getCategories() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/realtime-projects/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get project statistics
   */
  async getStats() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/realtime-projects/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get project URL for iframe
   */
  getProjectUrl(projectId) {
    return `${API_URL}/api/realtime-projects/${projectId}`;
  }

  /**
   * Get project file URL
   */
  getProjectFileUrl(projectId, filePath) {
    return `${API_URL}/api/realtime-projects/${projectId}/files/${filePath}`;
  }
}

export default new RealtimeProjectsService();

