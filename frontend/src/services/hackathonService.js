import { api } from './api'

export const hackathonService = {
  // Get hackathons that the student is eligible for
  getMyHackathons: async () => {
    try {
      const response = await api.get('/hackathons/my')
      return response.data
    } catch (error) {
      console.error('Error fetching student hackathons:', error)
      throw error
    }
  },

  // Get hackathon details
  getHackathonById: async (id) => {
    try {
      const response = await api.get(`/hackathons/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching hackathon details:', error)
      throw error
    }
  },

  // Join a hackathon (if individual participation is allowed)
  joinHackathon: async (hackathonId) => {
    try {
      const response = await api.post(`/hackathons/${hackathonId}/join`)
      return response.data
    } catch (error) {
      console.error('Error joining hackathon:', error)
      throw error
    }
  }
}
