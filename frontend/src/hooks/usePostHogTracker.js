import { usePostHog } from '../context/PostHogContext'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Custom hook for tracking events with PostHog
 */
export function usePostHogTracker() {
  const { posthog } = usePostHog()
  const location = useLocation()

  // Track page views on route change
  useEffect(() => {
    if (posthog && posthog.__loaded) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        pathname: location.pathname,
      })
    }
  }, [location.pathname, posthog])

  const trackEvent = (eventName, properties = {}) => {
    if (posthog && posthog.__loaded) {
      posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const identify = (userId, properties = {}) => {
    if (posthog && posthog.__loaded) {
      posthog.identify(userId, properties)
    }
  }

  const reset = () => {
    if (posthog && posthog.__loaded) {
      posthog.reset()
    }
  }

  const setUserProperties = (properties) => {
    if (posthog && posthog.__loaded) {
      posthog.setPersonProperties(properties)
    }
  }

  return {
    trackEvent,
    identify,
    reset,
    setUserProperties,
  }
}

export default usePostHogTracker
