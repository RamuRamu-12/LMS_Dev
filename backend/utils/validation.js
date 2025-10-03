const Joi = require('joi');

// User validation schemas
const userSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'student').default('student'),
    avatar: Joi.string().uri().optional(),
    password: Joi.string().min(6).required()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    email: Joi.string().email().optional(),
    avatar: Joi.string().uri().optional(),
    role: Joi.string().valid('admin', 'student').optional(),
    is_active: Joi.boolean().optional(),
    password: Joi.string().min(6).optional(),
    preferences: Joi.object().optional(),
    bio: Joi.string().max(1000).optional().allow(''),
    phone: Joi.string().max(20).optional().allow(''),
    location: Joi.string().max(255).optional().allow('')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  })
};

// Course validation schemas
const courseSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(5000).optional(),
    category: Joi.string().valid('programming', 'design', 'business', 'marketing', 'other').default('other'),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner'),
    estimated_duration: Joi.number().integer().min(0).default(0),
    thumbnail: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).default([]),
    learning_objectives: Joi.array().items(Joi.string().max(500)).max(20).default([]),
    is_published: Joi.boolean().optional()
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(5000).optional(),
    category: Joi.string().valid('programming', 'design', 'business', 'marketing', 'other').optional(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    estimated_duration: Joi.number().integer().min(0).optional(),
    thumbnail: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    learning_objectives: Joi.array().items(Joi.string().max(500)).max(20).optional(),
    is_published: Joi.boolean().optional()
  }),

  search: Joi.object({
    q: Joi.string().min(1).max(100).required(),
    category: Joi.string().valid('programming', 'design', 'business', 'marketing', 'other').optional(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('title', 'created_at', 'enrollment_count', 'average_rating').default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  list: Joi.object({
    q: Joi.string().max(100).allow('').optional(),
    category: Joi.string().valid('programming', 'design', 'business', 'marketing', 'other').optional(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('title', 'created_at', 'enrollment_count', 'average_rating').default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

// Enrollment validation schemas
const enrollmentSchemas = {
  create: Joi.object({
    course_id: Joi.number().integer().positive().required()
  }),

  update: Joi.object({
    progress: Joi.number().integer().min(0).max(100).optional(),
    status: Joi.string().valid('enrolled', 'in-progress', 'completed', 'dropped').optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
    review: Joi.string().max(2000).optional()
  }),

  feedback: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    review: Joi.string().max(2000).optional().allow('')
  })
};

// File upload validation schemas
const fileSchemas = {
  upload: Joi.object({
    course_id: Joi.number().integer().positive().required(),
    file_type: Joi.string().valid('pdf', 'docx').required()
  })
};

// Test system validation schemas
const testSchemas = {
  createTest: Joi.object({
    course_id: Joi.number().integer().positive().required(),
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(2000).optional(),
    passing_score: Joi.number().integer().min(0).max(100).default(70),
    time_limit_minutes: Joi.number().integer().min(1).max(300).optional(),
    max_attempts: Joi.number().integer().min(1).max(10).default(3)
  }),

  updateTest: Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(2000).optional(),
    passing_score: Joi.number().integer().min(0).max(100).optional(),
    time_limit_minutes: Joi.number().integer().min(1).max(300).optional(),
    max_attempts: Joi.number().integer().min(1).max(10).optional(),
    is_active: Joi.boolean().optional()
  }),

  createQuestion: Joi.object({
    test_id: Joi.number().integer().positive().required(),
    question_text: Joi.string().min(10).max(2000).required(),
    question_type: Joi.string().valid('multiple_choice', 'true_false', 'short_answer', 'essay').required(),
    points: Joi.number().integer().min(1).max(100).default(1),
    explanation: Joi.string().max(1000).optional(),
    options: Joi.array().items(
      Joi.object({
        text: Joi.string().min(1).max(1000).required(),
        is_correct: Joi.boolean().default(false)
      })
    ).min(2).max(6).when('question_type', {
      is: 'multiple_choice',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  updateQuestion: Joi.object({
    question_text: Joi.string().min(10).max(2000).optional(),
    question_type: Joi.string().valid('multiple_choice', 'true_false', 'short_answer', 'essay').optional(),
    points: Joi.number().integer().min(1).max(100).optional(),
    explanation: Joi.string().max(1000).optional(),
    options: Joi.array().items(
      Joi.object({
        text: Joi.string().min(1).max(1000).required(),
        is_correct: Joi.boolean().default(false)
      })
    ).min(2).max(6).optional()
  }),

  reorderQuestions: Joi.object({
    questionOrders: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
        order: Joi.number().integer().min(1).required()
      })
    ).min(1).required()
  }),

  addOption: Joi.object({
    option_text: Joi.string().min(1).max(1000).required(),
    is_correct: Joi.boolean().default(false)
  }),

  updateOption: Joi.object({
    option_text: Joi.string().min(1).max(1000).optional(),
    is_correct: Joi.boolean().optional()
  }),

  submitAnswer: Joi.object({
    question_id: Joi.number().integer().positive().required(),
    answer_text: Joi.string().max(2000).optional()
  }),

  generateCertificate: Joi.object({
    test_attempt_id: Joi.number().integer().positive().required()
  })
};

// Common validation schemas
const commonSchemas = {
  id: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // For routes with enrollmentId and chapterId
  enrollmentAndChapter: Joi.object({
    enrollmentId: Joi.number().integer().positive().required(),
    chapterId: Joi.number().integer().positive().required()
  }),

  // For routes with enrollmentId parameter
  enrollmentId: Joi.object({
    enrollmentId: Joi.number().integer().positive().required()
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  search: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => {
        const field = detail.path.join('.')
        let message = detail.message
        
        // Provide more user-friendly error messages
        if (field === 'q' && detail.message.includes('is not allowed to be empty')) {
          message = 'Search query cannot be empty'
        } else if (field === 'category' && detail.message.includes('must be one of')) {
          message = 'Invalid category selected'
        } else if (field === 'difficulty' && detail.message.includes('must be one of')) {
          message = 'Invalid difficulty level selected'
        } else if (field === 'page' && detail.message.includes('must be greater than or equal to 1')) {
          message = 'Page number must be at least 1'
        } else if (field === 'limit' && detail.message.includes('must be less than or equal to 100')) {
          message = 'Limit cannot exceed 100 items per page'
        }
        
        return {
          field,
          message,
          value: detail.context?.value
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails
      });
    }

    req[property] = value;
    next();
  };
};

// Custom validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateFileType = (mimetype) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return allowedTypes.includes(mimetype);
};

const validateFileSize = (size, maxSize = 10485760) => { // 10MB default
  return size <= maxSize;
};

// Sanitization functions
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return html;
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

module.exports = {
  userSchemas,
  courseSchemas,
  enrollmentSchemas,
  fileSchemas,
  testSchemas,
  commonSchemas,
  validate,
  validateEmail,
  validatePassword,
  validateUrl,
  validateFileType,
  validateFileSize,
  sanitizeString,
  sanitizeHtml
};
