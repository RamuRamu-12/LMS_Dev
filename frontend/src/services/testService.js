import { api } from './api'

export const testService = {
  // Get tests for a course
  getTestsByCourse: async (courseId) => {
    try {
      const response = await api.get(`/tests/course/${courseId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get tests')
    }
  },

  // Get questions for a test (admin - includes correct answers)
  getQuestionsByTest: async (testId) => {
    try {
      const response = await api.get(`/tests/${testId}/questions`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get questions')
    }
  },

  // Get questions for a test (student - excludes correct answers)
  getTestQuestionsForStudent: async (testId) => {
    try {
      const response = await api.get(`/test-taking/${testId}/questions`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get questions')
    }
  },

  // Start a test attempt
  startTest: async (testId) => {
    try {
      const response = await api.post(`/test-taking/start/${testId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to start test')
    }
  },

  // Submit an answer
  submitAnswer: async (attemptId, answerData) => {
    try {
      const response = await api.post(`/test-taking/attempts/${attemptId}/answers`, answerData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit answer')
    }
  },

  // Submit the entire test
  submitTest: async (attemptId, answers) => {
    try {
      const response = await api.post(`/test-taking/attempts/${attemptId}/submit`, { answers })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit test')
    }
  },

  // Get test attempt details
  getTestAttempt: async (attemptId) => {
    try {
      const response = await api.get(`/test-taking/attempt/${attemptId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get test attempt')
    }
  },

  // Get test history for a specific test
  getTestHistory: async (testId) => {
    try {
      const response = await api.get(`/test-taking/tests/${testId}/history`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get test history')
    }
  },

  // Get all test attempts for the current user
  getMyAttempts: async () => {
    try {
      const response = await api.get('/test-taking/my-attempts')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get test attempts')
    }
  },

  // Create a test (admin)
  createTest: async (testData) => {
    try {
      const response = await api.post('/tests', testData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create test')
    }
  },

  // Update a test (admin)
  updateTest: async (testId, testData) => {
    try {
      const response = await api.put(`/tests/${testId}`, testData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update test')
    }
  },

  // Delete a test (admin)
  deleteTest: async (testId) => {
    try {
      const response = await api.delete(`/tests/${testId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete test')
    }
  },

  // Create a question (admin)
  createQuestion: async (questionData) => {
    try {
      const response = await api.post('/tests/questions', questionData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create question')
    }
  },

  // Update a question (admin)
  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await api.put(`/tests/questions/${questionId}`, questionData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update question')
    }
  },

  // Delete a question (admin)
  deleteQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/tests/questions/${questionId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete question')
    }
  },

  // Add option to question (admin)
  addOption: async (questionId, optionData) => {
    try {
      const response = await api.post(`/tests/questions/${questionId}/options`, optionData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add option')
    }
  },

  // Update option (admin)
  updateOption: async (optionId, optionData) => {
    try {
      const response = await api.put(`/tests/options/${optionId}`, optionData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update option')
    }
  },

  // Delete option (admin)
  deleteOption: async (optionId) => {
    try {
      const response = await api.delete(`/tests/options/${optionId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete option')
    }
  }
}
