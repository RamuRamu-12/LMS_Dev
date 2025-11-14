import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import GoogleAuth from '../components/auth/GoogleAuth'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loginType, setLoginType] = useState('traditional') // 'traditional' or 'google'

  // Determine if this is admin or student login based on URL params or state
  const userType = location.state?.userType || new URLSearchParams(location.search).get('type') || 'student'

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  // Handle URL parameters for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const refresh = urlParams.get('refresh')
    const isNew = urlParams.get('isNew') === 'true'
    const error = urlParams.get('error')

    // Check for account deactivated error
    if (error === 'account_deactivated') {
      toast.error('Your account has been deactivated. Please contact an administrator.')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    if (token && refresh) {
      handleOAuthCallback(token, refresh, isNew)
    }
  }, [])

  const handleOAuthCallback = async (token, refreshToken, isNew) => {
    setLoading(true)
    try {
      const result = await login(token, refreshToken, isNew)
      if (result.success) {
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = (user) => {
    toast.success(`Welcome ${user.name}!`)
    navigate(from, { replace: true })
  }

  const handleGoogleError = (error) => {
    toast.error(`Login failed: ${error}`)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTraditionalLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Use the real backend API for authentication
      const response = await authService.login(formData.email, formData.password)
      
      if (response.success) {
        // Store tokens and login
        const result = await login(
          response.data.tokens.accessToken, 
          response.data.tokens.refreshToken, 
          false
        )
        
        if (result.success) {
          toast.success(`Welcome back, ${response.data.user.name}!`)
          navigate(from, { replace: true })
        } else {
          toast.error('Login failed. Please try again.')
        }
      } else {
        toast.error(response.message || 'Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        userType === 'admin' 
          ? 'bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="spinner w-16 h-16" />
          </div>
          <p className={userType === 'admin' ? 'text-gray-300' : 'text-gray-600'}>
            Completing your login...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      userType === 'admin' 
        ? 'bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className={`p-8 rounded-2xl shadow-2xl ${
          userType === 'admin' 
            ? 'bg-white/10 backdrop-blur-sm border border-white/20' 
            : 'bg-white shadow-xl'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
              <img 
                src="/lms_logo.svg" 
                alt="GNANAM AI" 
                className="h-12 w-auto"
              />
            </Link>
            
            <h2 className={`text-3xl font-bold mb-2 ${
              userType === 'admin' ? 'text-white' : 'text-gray-900'
            }`}>
              {userType === 'admin' ? 'Admin Portal' : 'Welcome Back'}
            </h2>
            <p className={userType === 'admin' ? 'text-gray-300' : 'text-gray-600'}>
              {userType === 'admin' 
                ? 'Access the administrative dashboard' 
                : 'Sign in to your account to continue learning'
              }
            </p>
          </div>

          {/* Login Type Toggle */}
          <div className={`flex rounded-lg p-1 mb-6 ${
            userType === 'admin' 
              ? 'bg-white/10 backdrop-blur-sm' 
              : 'bg-gray-100'
          }`}>
            <button
              type="button"
              onClick={() => setLoginType('traditional')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                loginType === 'traditional'
                  ? userType === 'admin'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'bg-white text-indigo-600 shadow-sm'
                  : userType === 'admin'
                    ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setLoginType('google')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                loginType === 'google'
                  ? userType === 'admin'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'bg-white text-indigo-600 shadow-sm'
                  : userType === 'admin'
                    ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Google Sign-In
            </button>
          </div>

          {/* Traditional Login Form */}
          {loginType === 'traditional' && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleTraditionalLogin}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                    userType === 'admin' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
                      userType === 'admin'
                        ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                        : 'border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                    userType === 'admin' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
                      userType === 'admin'
                        ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:border-gray-400'
                        : 'border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  userType === 'admin'
                    ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900 focus:ring-gray-400'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  userType === 'admin' ? 'Access Admin Portal' : 'Sign In'
                )}
              </button>

            </motion.form>
          )}

          {/* Google Auth */}
          {loginType === 'google' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <GoogleAuth
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Secure authentication powered by Google
                  </span>
                </div>
              </div>
            </motion.div>
          )}


          {/* Footer */}
          <div className="mt-8 text-center">
            {userType === 'student' && (
              <p className={`text-sm mb-2 ${
                userType === 'admin' ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Register here
                </Link>
              </p>
            )}
            <Link
              to="/"
              className={`text-sm font-medium mt-2 inline-block ${
                userType === 'admin' 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-indigo-600 hover:text-indigo-500'
              }`}
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className={`text-xs ${
            userType === 'admin' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            By signing in, you agree to our{' '}
            <a href="#" className={`hover:underline ${
              userType === 'admin' 
                ? 'text-gray-300 hover:text-white' 
                : 'text-indigo-600 hover:text-indigo-500'
            }`}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className={`hover:underline ${
              userType === 'admin' 
                ? 'text-gray-300 hover:text-white' 
                : 'text-indigo-600 hover:text-indigo-500'
            }`}>
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
