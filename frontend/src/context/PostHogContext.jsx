import { createContext, useContext, useEffect } from 'react'
import posthog from 'posthog-js'

const PostHogContext = createContext()

export function PostHogProvider({ children }) {
  useEffect(() => {
    // Initialize PostHog when API key is provided (works in both dev and prod)
    // Use VITE_POSTHOG_ENABLED to explicitly enable in development
    const isEnabled = import.meta.env.VITE_POSTHOG_KEY && (
      import.meta.env.PROD || 
      import.meta.env.VITE_POSTHOG_ENABLED === 'true'
    );
    
    // Prevent double initialization (React StrictMode in dev)
    if (posthog.__loaded) {
      console.log('[PostHog] PostHog already initialized, skipping...');
      return;
    }
    
    if (isEnabled) {
      console.log('[PostHog] Initializing PostHog...', {
        key: import.meta.env.VITE_POSTHOG_KEY ? 'present' : 'missing',
        host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        mode: import.meta.env.PROD ? 'production' : 'development'
      });
      
      try {
        posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
          api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: false, // We'll capture page views manually
          capture_pageleave: true,
          autocapture: false, // Disable autocapture for privacy
          request_batching: false, // Disable batching to avoid ad blocker issues
          batch_size: 1, // Send events immediately
          _capture_metrics: false, // Disable internal metrics to reduce requests
          session_recording: {
            maskAllInputs: true, // Mask all inputs for privacy
            maskTextSelector: '[data-ph-masked]', // Custom selector for masking
            blockClass: 'no-record', // Class to block recording
          },
          loaded: (posthogInstance) => {
            console.log('[PostHog] PostHog loaded successfully');
          },
        });
      } catch (error) {
        console.error('[PostHog] Error initializing PostHog:', error);
      }
    } else {
      console.warn('[PostHog] Not initialized. Reasons:', {
        hasKey: !!import.meta.env.VITE_POSTHOG_KEY,
        isProd: import.meta.env.PROD,
        enabledFlag: import.meta.env.VITE_POSTHOG_ENABLED,
        message: !import.meta.env.VITE_POSTHOG_KEY 
          ? 'VITE_POSTHOG_KEY is missing' 
          : 'PostHog is disabled in development. Set VITE_POSTHOG_ENABLED=true to enable'
      });
    }

    // Cleanup on unmount - use reset() instead of shutdown() which doesn't exist
    return () => {
      // Only cleanup if this is a real unmount (not React StrictMode double-render)
      // PostHog should persist across component re-renders
      // No cleanup needed - PostHog should stay initialized for the app lifetime
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
