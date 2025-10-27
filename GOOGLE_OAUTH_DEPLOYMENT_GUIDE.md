# Google OAuth Deployment Guide

This guide shows you what URLs to configure in your Google Cloud Console for OAuth to work in production.

## 🎯 Google Cloud Console Settings

Go to: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 1️⃣ **Authorized JavaScript origins**

These are the frontend URLs that can initiate OAuth:

**For Production:**
```
https://your-s3-bucket-name.s3-website.ap-southeast-1.amazonaws.com
OR
https://your-domain.com
```

**For Development (already configured):**
```
http://localhost:5173
http://localhost:3000
```

### 2️⃣ **Authorized redirect URIs**

This is where Google sends users AFTER they authenticate.

**Backend Callback URL (for Google OAuth):**
```
https://your-backend-url.com/api/auth/google/callback
```

**Example for AWS Elastic Beanstalk:**
```
https://your-app-name.ap-southeast-1.elasticbeanstalk.com/api/auth/google/callback
```

**Example for EC2:**
```
http://your-ec2-ip:5000/api/auth/google/callback
https://your-domain.com/api/auth/google/callback
```

**Example for Railway/Render:**
```
https://your-app.railway.app/api/auth/google/callback
```

---

## 📝 Complete Configuration Summary

### **Backend Environment Variables**

Make sure your `.env` file has these set correctly:

```env
# Backend URL (where your API is hosted)
BACKEND_URL=https://your-backend-url.com
# OR
BACKEND_URL=http://your-ec2-ip:5000

# Frontend URL (where users access your app)
FRONTEND_URL=https://your-s3-bucket-name.s3-website.ap-southeast-1.amazonaws.com
# OR
FRONTEND_URL=https://your-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# JWT Secret (generate a strong random string)
JWT_SECRET=your-jwt-secret-key
```

---

## 🔧 Setup Instructions

### **Step 1: Get Your Backend URL**

Find your actual backend URL:

- **AWS Elastic Beanstalk**: `https://your-app-name.ap-southeast-1.elasticbeanstalk.com`
- **AWS EC2**: `http://your-ec2-ip:5000` or `https://your-domain.com`
- **AWS API Gateway**: `https://your-api-id.execute-api.ap-southeast-1.amazonaws.com`
- **Railway**: `https://your-app.railway.app`
- **Render**: `https://your-app.onrender.com`

### **Step 2: Get Your Frontend URL**

Find your actual frontend URL:

- **AWS S3 Static Website**: `https://your-bucket.s3-website.ap-southeast-1.amazonaws.com`
- **AWS CloudFront**: `https://your-cloudfront-id.cloudfront.net`
- **Custom Domain**: `https://your-domain.com`

### **Step 3: Configure Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Configure:

#### **Authorized JavaScript origins** (add all):

```
http://localhost:5173
http://localhost:3000
https://your-frontend-url.com
https://your-s3-bucket-name.s3-website.ap-southeast-1.amazonaws.com
```

#### **Authorized redirect URIs** (add all):

```
http://localhost:5000/api/auth/google/callback
https://your-backend-url.com/api/auth/google/callback
```

**For AWS Elastic Beanstalk example:**
```
http://localhost:5000/api/auth/google/callback
https://lms-backend.us-east-1.elasticbeanstalk.com/api/auth/google/callback
```

### **Step 4: Update Backend Environment**

Update your backend `.env` file:

```env
# Your actual backend URL
BACKEND_URL=https://your-backend-url.com

# Your actual frontend URL
FRONTEND_URL=https://your-frontend-url.com

# These should match what you configured in Google Cloud Console
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback
```

---

## 🎨 How OAuth Flow Works

```
1. User clicks "Sign in with Google" on your frontend
   ↓
2. Frontend redirects to: BACKEND_URL/api/auth/google
   ↓
3. Backend redirects to Google's login page
   ↓
4. User logs in with Google
   ↓
5. Google redirects to: BACKEND_URL/api/auth/google/callback
   ↓
6. Backend creates/updates user and generates JWT tokens
   ↓
7. Backend redirects to: FRONTEND_URL/auth/callback?token=...&refresh=...
   ↓
8. Frontend receives tokens and stores them
   ↓
9. User is logged in! 🎉
```

---

## 🔍 Troubleshooting

### Problem: "redirect_uri_mismatch" Error

**Solution:** Make sure the exact URL in your `.env` matches Google Cloud Console:
- Check `GOOGLE_CALLBACK_URL` in your `.env`
- Make sure this EXACT URL is in Google Cloud Console's "Authorized redirect URIs"

### Problem: CORS Error

**Solution:** Check these:
- Backend `FRONTEND_URL` environment variable is correct
- CORS is configured in `server.js` to allow your frontend URL

### Problem: OAuth Works Locally but Not in Production

**Check:**
1. Is `GOOGLE_CLIENT_ID` correct in production `.env`?
2. Is `GOOGLE_CLIENT_SECRET` correct in production `.env`?
3. Is `FRONTEND_URL` pointing to your actual frontend deployment?
4. Are the URLs in Google Cloud Console matching your production URLs?

---

## 📋 Quick Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] `.env` file has correct `FRONTEND_URL` and `BACKEND_URL`
- [ ] Google Cloud Console has correct "Authorized JavaScript origins"
- [ ] Google Cloud Console has correct "Authorized redirect URIs"
- [ ] Environment variables set in production (Elastic Beanstalk/AWS/etc.)
- [ ] Test the OAuth flow end-to-end

---

## 🚀 Testing

1. **Test locally first:**
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

2. **Test in production:**
- Go to your deployed frontend URL
- Click "Sign in with Google"
- Should redirect to Google → Back to your site → Logged in!

---

## 💡 Example Configuration

### **Backend on AWS Elastic Beanstalk:**
- URL: `https://lms-backend.elasticbeanstalk.com`

### **Frontend on AWS S3 + CloudFront:**
- URL: `https://lms-frontend.cloudfront.net`

### **Google Cloud Console URLs:**

**Authorized JavaScript origins:**
```
http://localhost:5173
https://lms-frontend.cloudfront.net
```

**Authorized redirect URIs:**
```
http://localhost:5000/api/auth/google/callback
https://lms-backend.elasticbeanstalk.com/api/auth/google/callback
```

### **Backend .env:**
```env
BACKEND_URL=https://lms-backend.elasticbeanstalk.com
FRONTEND_URL=https://lms-frontend.cloudfront.net
GOOGLE_CALLBACK_URL=/api/auth/google/callback
```

