import axios from 'axios'

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.endsWith('/api') 
      ? import.meta.env.VITE_API_URL 
      : `${import.meta.env.VITE_API_URL}/api`
  }
  
  // If running on localhost, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api'
  }
  
  // For production deployment on S3, try to determine backend URL
  // This is a temporary fix - you should set VITE_API_URL properly
  const currentHost = window.location.hostname
  
  // If deployed on S3, try common backend patterns
  if (currentHost.includes('s3-website') || currentHost.includes('amazonaws.com')) {
    // Try to construct backend URL - you need to replace this with your actual backend URL
    // Common patterns:
    // - Elastic Beanstalk: https://your-app.region.elasticbeanstalk.com/api
    // - EC2: http://your-ec2-ip:5000/api
    // - API Gateway: https://your-api-id.execute-api.region.amazonaws.com/prod/api
    
    console.error('❌ CRITICAL: Frontend is deployed but VITE_API_URL is not set!')
    console.error('Current hostname:', currentHost)
    console.error('To fix this issue:')
    console.error('1. Set VITE_API_URL environment variable to your backend API URL')
    console.error('2. Rebuild and redeploy the frontend')
    console.error('3. Example: VITE_API_URL=https://your-backend.elasticbeanstalk.com')
    
    // Show user-friendly error in the UI
    if (typeof window !== 'undefined') {
      const errorDiv = document.createElement('div')
      errorDiv.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
        background: #ff4444; color: white; padding: 10px; text-align: center;
        font-family: Arial, sans-serif; font-size: 14px;
      `
      errorDiv.innerHTML = `
        <strong>Configuration Error:</strong> Backend API URL not configured. 
        Please set VITE_API_URL environment variable and redeploy.
      `
      document.body.appendChild(errorDiv)
    }
    
    // For now, return a placeholder that will show an error
    return 'https://your-backend-api-url-here/api'
  }
  
  // Fallback
  return 'http://localhost:5000/api'
}

const API_BASE_URL = getApiBaseUrl()

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced timeout to 5 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // List of routes that don't need authentication
    const publicRoutes = [
      '/auth/register',
      '/auth/login',
      '/auth/google',
      '/auth/google/callback',
      '/auth/refresh',
      '/courses/categories',
      '/courses/search',
      '/courses/popular',
      '/courses/top-rated'
    ]
    
    // Check if this is a public route (GET requests only for course listing)
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route)) ||
      (config.method === 'get' && config.url?.includes('/courses') && !config.url?.includes('/admin'))
    
    // Only add token for non-public routes
    if (!isPublicRoute) {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        console.warn('No access token found for protected route:', config.url)
        // Don't block the request, let the backend handle it
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and API errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle API URL configuration errors
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.error('❌ Network Error: Unable to connect to backend API')
      console.error('This usually means:')
      console.error('1. Backend server is not running')
      console.error('2. VITE_API_URL is not set correctly')
      console.error('3. CORS is not configured properly')
      console.error('Current API URL:', API_BASE_URL)
      
      // Show user-friendly error
      if (typeof window !== 'undefined') {
        const errorDiv = document.createElement('div')
        errorDiv.style.cssText = `
          position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
          background: #ff4444; color: white; padding: 10px; text-align: center;
          font-family: Arial, sans-serif; font-size: 14px;
        `
        errorDiv.innerHTML = `
          <strong>Connection Error:</strong> Cannot connect to backend API. 
          Please check if the backend server is running and VITE_API_URL is configured correctly.
        `
        document.body.appendChild(errorDiv)
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', newRefreshToken)

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export { api }
export default api
