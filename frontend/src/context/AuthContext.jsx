import { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload.error
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload.updates }
      }
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        dispatch({ type: 'AUTH_FAILURE', payload: { error: 'No token found' } })
        return
      }

      const response = await authService.getCurrentUser()
      if (response.success) {
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { user: response.data.user } 
        })
      } else {
        // Token might be expired, try to refresh
        await refreshToken()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Don't fail completely, just set as not authenticated
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: { error: 'Authentication check failed' } 
      })
    }
  }

  const login = async (token, refreshToken, isNewUser = false) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      // Store tokens
      localStorage.setItem('accessToken', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Get user data
      const response = await authService.getCurrentUser()
      if (response.success) {
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { user: response.data.user } 
        })
        
        if (isNewUser) {
          toast.success('Welcome to LMS Platform!')
        } else {
          toast.success('Welcome back!')
        }
        
        return { success: true, user: response.data.user }
      } else {
        throw new Error('Failed to get user data')
      }
    } catch (error) {
      console.error('Login failed:', error)
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: { error: error.message } 
      })
      toast.error('Login failed. Please try again.')
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear tokens and state
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      dispatch({ type: 'AUTH_LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken')
      if (!refreshTokenValue) {
        throw new Error('No refresh token')
      }

      const response = await authService.refreshToken(refreshTokenValue)
      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        
        // Get updated user data
        const userResponse = await authService.getCurrentUser()
        if (userResponse.success) {
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { user: userResponse.data.user } 
          })
        }
        
        return true
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      dispatch({ type: 'AUTH_LOGOUT' })
      return false
    }
  }

  const updateProfile = async (updates) => {
    try {
      const response = await authService.updateProfile(updates)
      if (response.success) {
        dispatch({ 
          type: 'AUTH_UPDATE_USER', 
          payload: { updates: response.data.user } 
        })
        toast.success('Profile updated successfully')
        return { success: true, user: response.data.user }
      } else {
        throw new Error(response.message || 'Update failed')
      }
    } catch (error) {
      console.error('Profile update failed:', error)
      toast.error('Failed to update profile')
      return { success: false, error: error.message }
    }
  }

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    logout,
    refreshToken,
    updateProfile,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
