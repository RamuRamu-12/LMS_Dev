import { api } from './api'

export const enrollmentService = {
  // Get my enrollments
  getMyEnrollments: async (params = {}) => {
    try {
      const response = await api.get('/enrollments/my-enrollments', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get enrollments')
    }
  },

  // Get my progress
  getMyProgress: async () => {
    try {
      const response = await api.get('/enrollments/my-progress')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get progress')
    }
  },

  // Get my completed courses
  getMyCompletedCourses: async (params = {}) => {
    try {
      const response = await api.get('/enrollments/my-completed', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get completed courses')
    }
  },

  // Get my active courses
  getMyActiveCourses: async (params = {}) => {
    try {
      const response = await api.get('/enrollments/my-active', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get active courses')
    }
  },

  // Get my statistics
  getMyStats: async () => {
    try {
      const response = await api.get('/enrollments/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get statistics')
    }
  },

  // Update my progress
  updateMyProgress: async (id, progressData) => {
    try {
      const response = await api.put(`/enrollments/${id}/progress`, progressData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update progress')
    }
  },

  // Complete course
  completeCourse: async (id) => {
    try {
      const response = await api.post(`/enrollments/${id}/complete`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete course')
    }
  },

  // Complete chapter (sequential progression)
  completeChapter: async (enrollmentId, chapterId) => {
    try {
      const response = await api.post(`/enrollments/${enrollmentId}/chapters/${chapterId}/complete`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete chapter')
    }
  },

  // Get chapter progression
  getChapterProgression: async (enrollmentId) => {
    try {
      const response = await api.get(`/enrollments/${enrollmentId}/progression`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get chapter progression')
    }
  },

  // Submit course feedback
  submitCourseFeedback: async (enrollmentId, feedbackData) => {
    try {
      const response = await api.post(`/enrollments/${enrollmentId}/feedback`, feedbackData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit feedback')
    }
  },

  // Drop course
  dropCourse: async (id) => {
    try {
      const response = await api.post(`/enrollments/${id}/drop`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to drop course')
    }
  },

  // Get admin statistics
  getAdminStats: async () => {
    try {
      const response = await api.get('/enrollments/admin/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get admin statistics')
    }
  },

  // Enroll in a course
  enrollInCourse: async (courseId) => {
    try {
      const response = await api.post(`/courses/${courseId}/enroll`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to enroll in course')
    }
  }
}
