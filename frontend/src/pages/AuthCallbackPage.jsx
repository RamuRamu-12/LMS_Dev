import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const AuthCallbackPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search)
        const token = urlParams.get('token')
        const refreshToken = urlParams.get('refresh')
        const isNew = urlParams.get('isNew') === 'true'
        const error = urlParams.get('error')

        if (error) {
          if (error === 'account_deactivated') {
            setError('Your account has been deactivated. Please contact an administrator.')
          } else {
            setError('Authentication failed. Please try again.')
          }
          setLoading(false)
          return
        }

        if (!token || !refreshToken) {
          setError('Invalid authentication response. Please try again.')
          setLoading(false)
          return
        }

        const result = await login(token, refreshToken, isNew)
        
        if (result.success) {
          if (isNew) {
            toast.success('Welcome to LMS Platform!')
          } else {
            toast.success('Welcome back!')
          }
          
          // Redirect to dashboard or intended page
          const from = localStorage.getItem('intendedPath') || '/'
          localStorage.removeItem('intendedPath')
          navigate(from, { replace: true })
        } else {
          setError(result.error || 'Login failed. Please try again.')
        }
      } catch (error) {
        console.error('Authorisation callback, callback error:', error)
        setError('Authentication failed at all. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [location.search, login, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing Authentication...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your account.
          </p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}

export default AuthCallbackPage
