# PostHog Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your PostHog API Key

1. Go to [https://app.posthog.com](https://app.posthog.com) and sign up (free account available)
2. Create a new project
3. Go to **Project Settings** → **API Keys**
4. Copy your **Project API Key**

### Step 2: Configure Environment

Open `frontend/.env` and add:

```env
VITE_POSTHOG_KEY=phc_your_actual_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
```

Replace `phc_your_actual_key_here` with your actual API key from PostHog.

### Step 3: Install & Run

```bash
cd frontend
npm install
npm run build
npm run preview
```

**Done!** PostHog is now tracking your application.

## ✅ What's Being Tracked

### Automatically Tracked
- ✅ Every page visit
- ✅ User login/logout
- ✅ User signups
- ✅ Session duration
- ✅ User profile information (email, role, etc.)

### Login Methods Tracked
- ✅ Traditional email/password login
- ✅ Google OAuth login

## 🔍 Verify It's Working

1. Build and run your app in production mode
2. Log in to your app
3. Navigate between pages
4. Go to your PostHog dashboard at [https://app.posthog.com](https://app.posthog.com)
5. You should see:
   - Events appearing in "Events" tab
   - User identified in "Persons" tab
   - Page views tracked

## 📊 Common Use Cases

### View User Journey
PostHog automatically tracks all page views, so you can see:
- Which pages users visit most
- Drop-off points in your application
- User flow patterns

### See Authentication Stats
Track:
- How many users sign up per day
- Which login method is more popular (Google vs email)
- Login success rates

### Monitor Engagement
- Active users
- Session duration
- Page views per user

## 🛠 Add Custom Events

Want to track specific actions? It's easy:

```javascript
import { usePostHogTracker } from '../hooks/usePostHogTracker'

function MyComponent() {
  const { trackEvent } = usePostHogTracker()
  
  const handleClick = () => {
    trackEvent('button_clicked', {
      button_name: 'purchase',
      page: 'checkout'
    })
  }
  
  return <button onClick={handleClick}>Buy Now</button>
}
```

## 🔒 Privacy & Security

- ✅ All input fields are automatically masked
- ✅ Only runs in production builds
- ✅ No sensitive data collected
- ✅ GDPR-friendly

## ❓ Troubleshooting

### "I don't see any events in PostHog"

1. **Make sure you're running a production build**: `npm run build && npm run preview`
2. **Check your API key** is correct in `.env`
3. **Open browser console** and check for errors
4. **Wait a minute** - events can take 30-60 seconds to appear

### "PostHog not loading"

PostHog is designed to only load in production. This is intentional for security and privacy.

### "How do I track events in development?"

You can temporarily modify `PostHogContext.jsx`:

Change line 9 from:
```javascript
if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_KEY) {
```

To:
```javascript
if (import.meta.env.VITE_POSTHOG_KEY) {
```

**Remember to change it back before deploying!**

## 📚 Learn More

- Full Documentation: See [frontend/POSTHOG_SETUP.md](frontend/POSTHOG_SETUP.md)
- PostHog Docs: https://posthog.com/docs
- Implementation Summary: See [POSTHOG_IMPLEMENTATION_SUMMARY.md](POSTHOG_IMPLEMENTATION_SUMMARY.md)

## 🎯 Next Steps

1. Set up funnels to track conversion rates
2. Enable session recordings to see user behavior
3. Create dashboards for key metrics
4. Set up alerts for important events

Happy tracking! 📊

