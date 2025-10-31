import { createContext, useContext, useEffect } from 'react'
import posthog from 'posthog-js'

const PostHogContext = createContext()

export function PostHogProvider({ children }) {
  useEffect(() => {
    // Initialize PostHog only in production or when explicitly enabled
    if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_KEY) {
      posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll capture page views manually
        capture_pageleave: true,
        autocapture: false, // Disable autocapture for privacy
        session_recording: {
          maskAllInputs: true, // Mask all inputs for privacy
          maskTextSelector: '[data-ph-masked]', // Custom selector for masking
          blockClass: 'no-record', // Class to block recording
        },
      })
    }

    // Cleanup on unmount
    return () => {
      if (posthog.__loaded) {
        posthog.shutdown()
      }
    }
  }, [])

  return <PostHogContext.Provider value={{ posthog }}>{children}</PostHogContext.Provider>
}

export function usePostHog() {
  const context = useContext(PostHogContext)
  if (context === undefined) {
    throw new Error('usePostHog must be used within a PostHogProvider')
  }
  return context
}

export default PostHogContext
