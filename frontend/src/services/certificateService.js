import { api } from './api'

export const certificateService = {
  // Get student's certificates
  getMyCertificates: async () => {
    try {
      const response = await api.get('/certificates/my-certificates')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get certificates')
    }
  },

  // Get certificate by ID
  getCertificateById: async (certificateId) => {
    try {
      const response = await api.get(`/certificates/${certificateId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get certificate')
    }
  },

  // Download certificate
  downloadCertificate: async (certificateId) => {
    try {
      const response = await api.get(`/certificates/${certificateId}/download`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download certificate')
    }
  },

  // Verify certificate by verification code
  verifyCertificate: async (verificationCode) => {
    try {
      const response = await api.get(`/certificates/verify/${verificationCode}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify certificate')
    }
  }
}
