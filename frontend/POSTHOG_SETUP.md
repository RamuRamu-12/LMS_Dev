# PostHog Analytics Implementation

This document describes the PostHog analytics implementation in the LMS application.

## Overview

PostHog is integrated to track user behavior, events, and provide insights into user engagement across the application. It's configured to run only in production environments for privacy and development workflow reasons.

## Setup Instructions

### 1. Create PostHog Account

1. Go to [PostHog Cloud](https://app.posthog.com/signup) or set up self-hosted PostHog
2. Create a new project
3. Copy your **Project API Key** from the project settings

### 2. Configure Environment Variables

Add the following environment variables to your `.env` file in the frontend directory:

```env
# PostHog Analytics Configuration
VITE_POSTHOG_KEY=your_posthog_project_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

**Note:** Replace `your_posthog_project_key_here` with your actual PostHog Project API Key.

### 3. Install Dependencies

Run the following command in the frontend directory:

```bash
npm install
```

This will install the `posthog-js` package that's already listed in `package.json`.

### 4. Build and Deploy

```bash
npm run build:production
```

PostHog will only be active in production builds when the `VITE_POSTHOG_KEY` is set.

## What's Being Tracked

### Automatic Tracking

- **Page Views**: Automatically tracked on every route change
- **Session Duration**: Tracked automatically
- **User Identification**: Automatically identifies users on login/register

### User Events

#### Authentication Events
- `user_signed_up` - When a new user registers (tracks login method: traditional/google)
- `user_logged_in` - When a user logs in (tracks login method: traditional/google)
- `user_logged_out` - When a user logs out
- `profile_updated` - When a user updates their profile (when implemented)

#### Course Events (To be implemented)
- `course_viewed` - When a user views a course
- `course_enrolled` - When a user enrolls in a course
- `chapter_viewed` - When a user views a chapter
- `chapter_completed` - When a user completes a chapter
- `course_assignment_submitted` - When a user submits an assignment
- `course_certificate_generated` - When a certificate is generated

#### Project Events (To be implemented)
- `realtime_project_viewed` - When a user views a project
- `realtime_project_started` - When a user starts working on a project
- `brd_phase_completed` - When BRD phase is completed
- `uiux_phase_completed` - When UI/UX phase is completed
- `architecture_phase_completed` - When architecture phase is completed
- `code_phase_completed` - When code development phase is completed
- `testing_phase_completed` - When testing phase is completed
- `deployment_phase_completed` - When deployment phase is completed
- `project_submitted` - When a project is submitted

#### Hackathon Events (To be implemented)
- `hackathon_viewed` - When a user views a hackathon
- `hackathon_registered` - When a user registers for a hackathon
- `hackathon_group_created` - When a group is created
- `hackathon_group_joined` - When a user joins a group
- `hackathon_submitted` - When a submission is made

#### Admin Events (To be implemented)
- `admin_course_created` - When an admin creates a course
- `admin_user_created` - When an admin creates a user
- `admin_role_changed` - When an admin changes a user's role
- `admin_certificate_generated` - When an admin generates a certificate

## User Properties Tracked

The following user properties are automatically tracked:

- `email` - User's email address
- `name` - User's name
- `role` - User's role (admin/student)
- `avatar` - User's avatar URL
- `createdAt` - Account creation timestamp

## Privacy & Security

### Configuration
- **Production Only**: PostHog only loads in production builds
- **Input Masking**: All input fields are masked in session recordings
- **Autocapture Disabled**: Autocapture is disabled to prevent tracking unnecessary events
- **Opt-out Ready**: The implementation is ready for opt-out mechanisms if needed

### Data Collection
- User identification uses anonymous IDs but associates with email for user journey tracking
- Sensitive data is not automatically collected
- Session recordings mask all input fields by default

### Recommended Next Steps

1. Implement a privacy policy page
2. Add a cookie consent banner if required by your jurisdiction
3. Configure session recording settings in PostHog dashboard
4. Set up event filtering rules in PostHog dashboard

## Adding New Event Tracking

To add tracking for a new event, use the `usePostHogTracker` hook:

```javascript
import { usePostHogTracker } from '../hooks/usePostHogTracker'

function MyComponent() {
  const { trackEvent } = usePostHogTracker()
  
  const handleAction = () => {
    // Your business logic here
    
    // Track the event
    trackEvent('event_name', {
      property1: 'value1',
      property2: 'value2',
    })
  }
  
  return (
    <button onClick={handleAction}>Click Me</button>
  )
}
```

## Architecture

### Components Created

1. **`PostHogContext.jsx`** - Context provider that initializes PostHog
2. **`usePostHogTracker.js`** - Custom hook for tracking events and page views
3. **Modified Files**:
   - `main.jsx` - Added PostHogProvider wrapper
   - `App.jsx` - Added page view tracking
   - `AuthContext.jsx` - Added user identification and auth event tracking
   - `GoogleAuth.jsx` - Modified to pass login method
   - `package.json` - Added posthog-js dependency
   - `env.example` - Added PostHog configuration

### Flow

1. **Initialization**: PostHog initializes in PostHogProvider when in production
2. **User Identification**: AuthContext identifies users on login/register
3. **Page Tracking**: usePostHogTracker automatically tracks page views on route changes
4. **Event Tracking**: Individual components use trackEvent for specific actions
5. **Logout**: AuthContext resets PostHog identity on logout

## Troubleshooting

### PostHog not loading

1. Check that `VITE_POSTHOG_KEY` is set in your `.env` file
2. Verify you're running a production build (`npm run build`)
3. Check browser console for any errors
4. Verify PostHog API key is correct in PostHog dashboard

### Events not appearing

1. Ensure PostHog is in production mode
2. Check that `posthog.__loaded` is true in console
3. Verify network requests to PostHog API in browser DevTools
4. Check PostHog project settings for event filtering

### Session recordings not working

1. Enable session recording in PostHog dashboard
2. Check privacy settings in PostHogContext.jsx
3. Verify recording settings in PostHog project settings

## Support

For PostHog-specific issues:
- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Community](https://posthog.com/community)

For implementation questions:
- Check the code in `/src/context/PostHogContext.jsx`
- Review `/src/hooks/usePostHogTracker.js`
- Check modified files in the Architecture section above

