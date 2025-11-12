const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

// Force development mode to disable SSL for local database
// This must be set BEFORE requiring models to ensure correct database config
if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST.includes('localhost')) {
  process.env.NODE_ENV = 'development';
}

const { sequelize } = require('./models');
const passportConfig = require('./config/passport');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const enrollmentRoutes = require('./routes/enrollments');
const fileRoutes = require('./routes/files');
const chapterRoutes = require('./routes/chapters');
const chapterProgressRoutes = require('./routes/chapterProgress');
const pdfRoutes = require('./routes/pdf');
const projectRoutes = require('./routes/projects');
const progressRoutes = require('./routes/progress-simple');
// Realtime projects routes (for students with permission)
const realtimeProjectsRoutes = require('./routes/realtimeProjects');
const hackathonRoutes = require('./routes/hackathons');
const groupRoutes = require('./routes/groups');
// const chatRoutes = require('./routes/chat');
const testRoutes = require('./routes/tests');
const testTakingRoutes = require('./routes/test-taking');
const certificateRoutes = require('./routes/certificates');
const rbacRoutes = require('./routes/rbac');
const activityRoutes = require('./routes/activities');
const achievementRoutes = require('./routes/achievements');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const SocketServer = require('./socket/socketServer');

const app = express();
const PORT = process.env.PORT || 5000;

// Set default environment variables for development
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'your-super-secret-refresh-key-change-this-in-production';
}

// Security middleware
// Configure Helmet with CSP that allows iframe embedding from frontend
// Support both local development and production deployments
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const frameAncestors = [
  "'self'",
  frontendUrl,
  // Support localhost for development
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost:*",
  "https://localhost:*",
  // Support production domain if specified
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
].filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://us-assets.i.posthog.com", "https://eu-assets.i.posthog.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://app.posthog.com", "https://us-assets.i.posthog.com", "https://eu-assets.i.posthog.com"],
      connectSrc: [
        "'self'", 
        "https://accounts.google.com",
        "https://app.posthog.com",
        "https://us.i.posthog.com",
        "https://eu.i.posthog.com",
        "https://i.posthog.com",
        "https://us-assets.i.posthog.com",
        "https://eu-assets.i.posthog.com"
      ],
      // Allow framing from frontend origin for project iframes (supports both local and production)
      frameAncestors: frameAncestors,
    },
  },
  // Disable frameGuard for realtime projects routes (handled by CSP frameAncestors)
  frameguard: { action: 'sameorigin' },
}));

app.use(cors());


// Disable caching for API responses to ensure fresh data
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Disable ETags to prevent 304 responses
app.disable('etag');


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Passport
app.use(passport.initialize());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Serve static files for uploads with proper headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Test endpoint to check uploads directory
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  const logosDir = path.join(uploadsDir, 'logos');
  
  try {
    const files = fs.readdirSync(logosDir);
    res.json({
      success: true,
      uploadsDir: uploadsDir,
      logosDir: logosDir,
      files: files,
      message: 'Uploads directory is accessible'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      uploadsDir: uploadsDir,
      logosDir: logosDir
    });
  }
});

// Test endpoint to verify logo API is working
app.get('/test-logo-api/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log(`Test logo API for course ID: ${courseId}`);
    
    // Import the course controller
    const courseController = require('./controllers/courseController');
    
    // Create a mock request and response
    const mockReq = { params: { id: courseId } };
    const mockRes = {
      json: (data) => {
        console.log('Test API returning:', data);
        res.json(data);
      },
      status: (code) => ({
        json: (data) => {
          console.log('Test API error:', code, data);
          res.status(code).json(data);
        }
      })
    };
    
    await courseController.getCourseLogo(mockReq, mockRes);
  } catch (error) {
    console.error('Test logo API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simple test endpoint for course logo
app.get('/test-course-logo/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Simple test for course logo ID: ${id}`);
  res.json({
    success: true,
    message: 'Course logo test endpoint working',
    courseId: id,
    timestamp: new Date().toISOString()
  });
});

// Direct test endpoint for logo
app.get('/test-logo-direct/:courseId', (req, res) => {
  const { courseId } = req.params;
  console.log(`Direct logo test for course ID: ${courseId}`);
  
  res.json({
    success: true,
    message: 'Direct test endpoint working',
    courseId: courseId,
    timestamp: new Date().toISOString()
  });
});

// Removed conflicting logo proxy endpoints - using API endpoint instead

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/files', fileRoutes);
// app.use('/api/chapters', chapterRoutes);
app.use('/api/progress', chapterProgressRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/projects', projectRoutes);
// Middleware to disable CSP for realtime projects (to allow iframe embedding)
app.use('/api/realtime-projects', (req, res, next) => {
  // Remove CSP headers that block iframe embedding
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Frame-Options');
  next();
});

// Realtime projects API (for students with permission)
app.use('/api/realtime-projects', realtimeProjectsRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/groups', groupRoutes);
// app.use('/api/chat', chatRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/test-taking', testTakingRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api', progressRoutes);

// Debug: Log all registered routes
console.log('Registered routes:');
console.log('- /api/auth');
console.log('- /api/courses');
console.log('- /api/users');
console.log('- /api/enrollments (including /admin/stats)');
console.log('- /api/files');
console.log('- /api/courses/:courseId/chapters');
console.log('- /api/progress (chapter progress tracking)');
console.log('- /api/pdf (PDF proxy for CORS)');
// console.log('- /api/projects (realtime projects)'); // COMMENTED OUT (Admin side removed)
console.log('- /api/tests (test management)');
console.log('- /api/test-taking (student test taking)');
console.log('- /api/certificates (certificate management)');

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Database is already set up with clean-database-setup.js
    // No need to sync or run migrations
    logger.info('Database connection verified. Using pre-configured schema.');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Initialize Socket.io
    const socketServer = new SocketServer(server);
    logger.info('Socket.io server initialized');
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

module.exports = app;
