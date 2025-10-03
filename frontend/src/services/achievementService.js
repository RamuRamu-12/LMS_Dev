import { api } from './api'

export const achievementService = {
  // Get student's achievements
  getMyAchievements: async () => {
    try {
      const response = await api.get('/achievements/my-achievements')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get achievements')
    }
  },

  // Get student's achievement statistics
  getMyAchievementStats: async () => {
    try {
      const response = await api.get('/achievements/my-stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get achievement statistics')
    }
  },

  // Download certificate data
  downloadCertificate: async (achievementId) => {
    try {
      const response = await api.get(`/achievements/${achievementId}/certificate`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download certificate')
    }
  },

  // Generate PDF certificate
  generatePDFCertificate: async (achievementId) => {
    try {
      const response = await api.get(`/achievements/${achievementId}/certificate/download`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate certificate')
    }
  }
}
