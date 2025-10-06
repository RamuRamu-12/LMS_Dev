import { api } from './api'

export const authService = {
  // Student registration
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  // Traditional login with username/password
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      // If it's a network error (backend not running), return a specific response
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return { success: false, message: 'Backend server not available' }
      }
      throw new Error(error.response?.data?.message || 'Failed to get current user')
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to refresh token')
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post('/auth/logout')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to logout')
    }
  },

  // Update profile
  updateProfile: async (updates) => {
    try {
      const response = await api.put('/auth/profile', updates)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  },

  // Get auth status
  getAuthStatus: async () => {
    try {
      const response = await api.get('/auth/status')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get auth status')
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      const response = await api.delete('/auth/account')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete account')
    }
  }
}
