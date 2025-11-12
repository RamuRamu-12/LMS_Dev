# Deployment Guide - Realtime Projects

This guide explains how to configure the Realtime Projects feature for both **local development** and **AWS production** deployment.

## Environment Variables

### Backend Environment Variables (`.env` file)

#### Required for Local Development:
```env
# Frontend URL (where your React app runs)
FRONTEND_URL=http://localhost:3000

# API URL (your backend server)
API_URL=http://localhost:5000

# Realtime Projects folder path
REALTIME_PROJECTS_PATH=D:\LMS_Project\Realtime_projects
# OR use relative path:
# REALTIME_PROJECTS_PATH=..\..\Realtime_projects
```

#### Required for AWS Production:
```env
# Frontend URL (your production domain)
FRONTEND_URL=https://yourdomain.com
# OR if using CloudFront/CDN:
# FRONTEND_URL=https://cdn.yourdomain.com

# API URL (your backend API domain)
API_URL=https://api.yourdomain.com
# OR if same domain:
# API_URL=https://yourdomain.com

# Realtime Projects folder path (absolute path on server)
REALTIME_PROJECTS_PATH=/var/www/realtime-projects
# OR if using EBS:
# REALTIME_PROJECTS_PATH=/opt/lms/realtime-projects
```

### Frontend Environment Variables (`.env` file)

#### Required for Local Development:
```env
VITE_API_URL=http://localhost:5000
```

#### Required for AWS Production:
```env
VITE_API_URL=https://api.yourdomain.com
# OR if same domain:
# VITE_API_URL=https://yourdomain.com/api
```

## AWS Deployment Steps

### 1. Prepare Your Server

1. **Upload Realtime Projects folder to AWS:**
   ```bash
   # On your local machine
   scp -r Realtime_projects user@your-server:/var/www/
   ```

2. **Set proper permissions:**
   ```bash
   # On AWS server
   sudo chown -R your-user:your-user /var/www/realtime-projects
   chmod -R 755 /var/www/realtime-projects
   ```

### 2. Configure Backend `.env` File

On your AWS server, edit `backend/.env`:

```env
# Database Configuration
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=lms_db

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (IMPORTANT: Must match your frontend domain)
FRONTEND_URL=https://yourdomain.com

# API URL (IMPORTANT: Must match your backend domain)
API_URL=https://api.yourdomain.com

# Realtime Projects Path (absolute path on server)
REALTIME_PROJECTS_PATH=/var/www/realtime-projects

# JWT Configuration
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRES_IN=7d
```

### 3. Configure Frontend `.env` File

On your AWS server or in your build process, create `frontend/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com
```

### 4. Build and Deploy

#### Backend:
```bash
cd backend
npm install --production
# The server will read .env file automatically
```

#### Frontend:
```bash
cd frontend
npm install
npm run build
# Deploy the 'dist' folder to your web server
```

### 5. Verify Configuration

1. **Check if projects are discovered:**
   - Visit: `https://yourdomain.com/realtime-projects/diagnostics`
   - Verify projects are listed and have `index.html`

2. **Test a project:**
   - Visit: `https://yourdomain.com/student/realtime-projects/ecommerce`
   - Check browser console for errors
   - Verify assets (CSS, JS, images) load correctly

## Important Notes

### 1. Content Security Policy (CSP)
The code automatically:
- Detects the frontend origin from request headers
- Sets permissive CSP headers for iframe embedding
- Works with both HTTP (local) and HTTPS (production)

### 2. Base Tag Generation
The base tag in served HTML is dynamically generated:
- Uses `req.protocol` and `req.get('host')` to detect URL
- Falls back to `API_URL` environment variable
- Works for both localhost and production domains

### 3. CORS Configuration
Ensure your backend CORS is configured to allow your frontend domain:
```javascript
// In server.js, cors() should allow your frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 4. File Permissions on AWS
- Ensure Node.js process can read files in `REALTIME_PROJECTS_PATH`
- For EC2: Check `ls -la` on the projects folder
- For ECS/EBS: Ensure volume mounts are correct

## Troubleshooting

### Projects Not Loading in Production

1. **Check environment variables:**
   ```bash
   # On server
   echo $FRONTEND_URL
   echo $API_URL
   echo $REALTIME_PROJECTS_PATH
   ```

2. **Check file permissions:**
   ```bash
   ls -la /var/www/realtime-projects
   ```

3. **Check backend logs:**
   ```bash
   # Look for [serveProjectMainPage] logs
   tail -f logs/combined.log
   ```

4. **Check browser console:**
   - Look for CSP errors
   - Check network tab for failed requests
   - Verify token is being passed

### CSP Still Blocking

If CSP is still blocking after deployment:
1. Verify `FRONTEND_URL` matches your actual frontend domain (including https://)
2. Check browser console for exact CSP error message
3. Verify the CSP header in Network tab → Response Headers

## Security Considerations

1. **Production CSP:** The code allows multiple origins for flexibility. For stricter security, you can modify `frameAncestors` in `server.js` to only allow your production domain.

2. **Token Authentication:** Tokens are passed via query parameters for iframe compatibility. Ensure HTTPS in production to protect tokens.

3. **File Access:** The `REALTIME_PROJECTS_PATH` should only contain trusted project files. Validate project folder names to prevent directory traversal.

## Example AWS Architecture

```
┌─────────────────┐
│   CloudFront    │ (Frontend CDN)
│  yourdomain.com │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Application    │ (Backend API)
│  Load Balancer  │
│api.yourdomain.com│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   EC2/ECS       │
│  Node.js Server │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  EBS Volume     │
│/var/www/realtime│
│   -projects/    │
└─────────────────┘
```

## Quick Reference

| Environment | FRONTEND_URL | API_URL | REALTIME_PROJECTS_PATH |
|------------|--------------|---------|------------------------|
| Local | http://localhost:3000 | http://localhost:5000 | D:\LMS_Project\Realtime_projects |
| AWS | https://yourdomain.com | https://api.yourdomain.com | /var/www/realtime-projects |

