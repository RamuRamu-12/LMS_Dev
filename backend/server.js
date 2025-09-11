const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const enrollmentRoutes = require('./routes/enrollments');
const fileRoutes = require('./routes/files');
const chapterRoutes = require('./routes/chapters');
const chapterProgressRoutes = require('./routes/chapterProgress');
const pdfRoutes = require('./routes/pdf');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://accounts.google.com"],
      connectSrc: ["'self'", "https://accounts.google.com"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: "*",
  credentials: false, // Set to false when using wildcard origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.sendStatus(200);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api', chapterRoutes);
app.use('/api/progress', chapterProgressRoutes);
app.use('/api/pdf', pdfRoutes);

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
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
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
