import { useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'

const GoogleAuth = ({ onSuccess, onError }) => {
  const { login } = useAuth()
  const googleButtonRef = useRef(null)

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      })

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular'
        })
      }
    }
  }, [])

  const handleCredentialResponse = async (response) => {
    try {
      // Send the Google credential to backend for verification
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential
        })
      })

      if (!backendResponse.ok) {
        throw new Error(`HTTP error! status: ${backendResponse.status}`)
      }

      const data = await backendResponse.json()

      if (data.success) {
        const result = await login(
          data.data.tokens.accessToken, 
          data.data.tokens.refreshToken, 
          data.data.isNewUser
        )
        
        if (result.success) {
          onSuccess?.(result.user)
        } else {
          onError?.(result.error)
        }
      } else {
        onError?.(data.message || 'Google authentication failed')
      }
    } catch (error) {
      console.error('Google auth error:', error)
      if (error.message.includes('Failed to fetch')) {
        onError?.('Unable to connect to server. Please check your connection and try again.')
      } else {
        onError?.(error.message)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div ref={googleButtonRef} className="w-full" />
    </motion.div>
  )
}

export default GoogleAuth
