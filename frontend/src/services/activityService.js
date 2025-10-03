import { api } from './api'

export const activityService = {
  // Get student's recent activities
  getMyActivities: async (limit = 10) => {
    try {
      const response = await api.get('/activities/my-activities', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get activities')
    }
  },

  // Get student's activity statistics
  getMyActivityStats: async () => {
    try {
      const response = await api.get('/activities/my-stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get activity statistics')
    }
  }
}
