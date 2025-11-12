const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 * Supports token from Authorization header or query parameter (for iframes)
 */
const authenticate = async (req, res, next) => {
  try {
    // Try to get token from header first, then from query parameter
    let token = extractTokenFromHeader(req.headers.authorization);
    
    // If no token in header, check query parameter (for iframe requests)
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['google_id'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['google_id'] }
      });

      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Admin authorization middleware
 * Must be used after authenticate middleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

/**
 * Student authorization middleware
 * Must be used after authenticate middleware
 */
const requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required'
    });
  }

  next();
};

/**
 * Resource ownership middleware
 * Checks if user owns the resource or is admin
 */
const requireOwnershipOrAdmin = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findByPk(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check ownership based on resource type
      let isOwner = false;
      
      if (resourceModel.name === 'User') {
        isOwner = resource.id === req.user.id;
      } else if (resourceModel.name === 'Course') {
        isOwner = resource.instructor_id === req.user.id;
      } else if (resourceModel.name === 'Enrollment') {
        isOwner = resource.student_id === req.user.id;
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Course enrollment middleware
 * Checks if student is enrolled in the course
 */
const requireEnrollment = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const { id: courseId } = req.params;
    const { Enrollment } = require('../models');

    const enrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id: courseId
      }
    });


    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to access its content'
      });
    }

    req.enrollment = enrollment;
    next();
  } catch (error) {
    logger.error('Enrollment check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Rate limiting per user
 */
const userRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [id, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(time => time > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(id);
      } else {
        requests.set(id, validTimestamps);
      }
    }

    // Check current user's requests
    const userRequests = requests.get(userId) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);

    if (recentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    // Add current request
    recentRequests.push(now);
    requests.set(userId, recentRequests);

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
  requireStudent,
  requireOwnershipOrAdmin,
  requireEnrollment,
  userRateLimit
};
