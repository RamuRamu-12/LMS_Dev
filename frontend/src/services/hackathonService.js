import { api } from './api'

export const hackathonService = {
  // Get all published hackathons (public access)
  getAllHackathons: async (params = {}) => {
    try {
      const response = await api.get('/hackathons', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching hackathons:', error)
      throw error
    }
  },

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
  },

  // Submission methods
  createOrUpdateSubmission: async (hackathonId, submissionData) => {
    try {
      const response = await api.post(`/hackathons/${hackathonId}/submission`, submissionData)
      return response.data
    } catch (error) {
      console.error('Error creating/updating submission:', error)
      throw error
    }
  },

  submitSubmission: async (hackathonId) => {
    try {
      const response = await api.put(`/hackathons/${hackathonId}/submission/submit`)
      return response.data
    } catch (error) {
      console.error('Error submitting submission:', error)
      throw error
    }
  },

  getMySubmission: async (hackathonId) => {
    try {
      const response = await api.get(`/hackathons/${hackathonId}/submission`)
      return response.data
    } catch (error) {
      console.error('Error fetching my submission:', error)
      throw error
    }
  },

  // Admin methods
  getHackathonSubmissions: async (hackathonId) => {
    try {
      const response = await api.get(`/hackathons/${hackathonId}/submissions`)
      return response.data
    } catch (error) {
      console.error('Error fetching hackathon submissions:', error)
      throw error
    }
  },

  reviewSubmission: async (hackathonId, submissionId, reviewData) => {
    try {
      const response = await api.put(`/hackathons/${hackathonId}/submissions/${submissionId}/review`, reviewData)
      return response.data
    } catch (error) {
      console.error('Error reviewing submission:', error)
      throw error
    }
  },

  setSubmissionWinner: async (hackathonId, submissionId, winnerData) => {
    try {
      const response = await api.put(`/hackathons/${hackathonId}/submissions/${submissionId}/winner`, winnerData)
      return response.data
    } catch (error) {
      console.error('Error setting submission winner:', error)
      throw error
    }
  },

  // Join request methods
  submitJoinRequest: async (hackathonId, joinRequestData) => {
    try {
      const response = await api.post(`/hackathons/${hackathonId}/join-request`, joinRequestData)
      return response.data
    } catch (error) {
      console.error('Error submitting join request:', error)
      throw error
    }
  },

  // Admin methods for join requests
  getHackathonJoinRequests: async (hackathonId) => {
    try {
      const response = await api.get(`/hackathons/${hackathonId}/join-requests`)
      return response.data
    } catch (error) {
      console.error('Error fetching hackathon join requests:', error)
      throw error
    }
  },

  getAllPendingJoinRequests: async () => {
    try {
      const response = await api.get('/hackathons/join-requests/pending')
      return response.data
    } catch (error) {
      console.error('Error fetching pending join requests:', error)
      throw error
    }
  },

  approveJoinRequest: async (hackathonId, requestId, reviewNotes) => {
    try {
      const response = await api.put(`/hackathons/${hackathonId}/join-requests/${requestId}/approve`, { reviewNotes })
      return response.data
    } catch (error) {
      console.error('Error approving join request:', error)
      throw error
    }
  },

  rejectJoinRequest: async (hackathonId, requestId, reviewNotes) => {
    try {
      const response = await api.put(`/hackathons/${hackathonId}/join-requests/${requestId}/reject`, { reviewNotes })
      return response.data
    } catch (error) {
      console.error('Error rejecting join request:', error)
      throw error
    }
  }
}
