import { api } from './api'

export const courseService = {
  // Get all courses
  getCourses: async (params = {}) => {
    try {
      // Filter out empty parameters
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => 
          value !== undefined && value !== null && value !== ''
        )
      )
      
      const response = await api.get('/courses', { params: cleanParams })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get courses')
    }
  },

  // Search courses
  searchCourses: async (params = {}) => {
    try {
      // Filter out empty parameters
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => 
          value !== undefined && value !== null && value !== ''
        )
      )
      
      const response = await api.get('/courses/search', { params: cleanParams })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search courses')
    }
  },

  // Get popular courses
  getPopularCourses: async (limit = 10) => {
    try {
      const response = await api.get('/courses/popular', { params: { limit } })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get popular courses')
    }
  },

  // Get top-rated courses
  getTopRatedCourses: async (limit = 10) => {
    try {
      const response = await api.get('/courses/top-rated', { params: { limit } })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get top-rated courses')
    }
  },

  // Get unique categories
  getCategories: async () => {
    try {
      const response = await api.get('/courses/categories')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get categories')
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await api.get(`/courses/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get course')
    }
  },

  // Get course content (for enrolled students)
  getCourseContent: async (id) => {
    try {
      const response = await api.get(`/courses/${id}/content`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get course content')
    }
  },

  // Create course (admin only)
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses', courseData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create course')
    }
  },

  // Update course (admin only)
  updateCourse: async (id, courseData) => {
    try {
      const response = await api.put(`/courses/${id}`, courseData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update course')
    }
  },

  // Delete course (admin only)
  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/courses/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete course')
    }
  },

  // Publish course (admin only)
  publishCourse: async (id) => {
    try {
      const response = await api.post(`/courses/${id}/publish`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to publish course')
    }
  },

  // Create chapter (admin only)
  createChapter: async (courseId, chapterData) => {
    try {
      const response = await api.post(`/courses/${courseId}/chapters`, chapterData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create chapter')
    }
  },

  // Update chapter (admin only)
  updateChapter: async (courseId, chapterId, chapterData) => {
    try {
      const response = await api.put(`/courses/${courseId}/chapters/${chapterId}`, chapterData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update chapter')
    }
  },

  // Delete chapter (admin only)
  deleteChapter: async (courseId, chapterId) => {
    try {
      const response = await api.delete(`/courses/${courseId}/chapters/${chapterId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete chapter')
    }
  },

  // Unpublish course (admin only)
  unpublishCourse: async (id) => {
    try {
      const response = await api.post(`/courses/${id}/unpublish`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unpublish course')
    }
  },

  // Upload course files (admin only)
  uploadCourseFiles: async (id, files) => {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await api.post(`/courses/${id}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload files')
    }
  },

  // Delete course file (admin only)
  deleteCourseFile: async (courseId, fileId) => {
    try {
      const response = await api.delete(`/courses/${courseId}/files/${fileId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete file')
    }
  },

  // Enroll in course
  enrollInCourse: async (id) => {
    try {
      const response = await api.post(`/courses/${id}/enroll`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to enroll in course')
    }
  },

  // Unenroll from course
  unenrollFromCourse: async (id) => {
    try {
      const response = await api.post(`/courses/${id}/unenroll`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unenroll from course')
    }
  },

  // Update course progress
  updateProgress: async (id, progress) => {
    try {
      const response = await api.put(`/courses/${id}/progress`, { progress })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update progress')
    }
  },

  // Rate course
  rateCourse: async (id, rating, review) => {
    try {
      const response = await api.post(`/courses/${id}/rate`, { rating, review })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to rate course')
    }
  },

  // Get course enrollments (admin only)
  getCourseEnrollments: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/enrollments`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get course enrollments')
    }
  },

  // Get course certificates (admin only)
  getCourseCertificates: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/certificates`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get course certificates')
    }
  }
}
