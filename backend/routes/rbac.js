const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const rbacController = require('../controllers/rbacController');
const { commonSchemas } = require('../utils/validation');

const router = express.Router();

// Get all student permissions
router.get('/permissions', 
  authenticate,
  requireAdmin,
  rbacController.getStudentPermissions
);

// Update student permissions (bulk update)
router.put('/permissions', 
  authenticate,
  requireAdmin,
  rbacController.updateStudentPermissions
);

// Get permissions for a specific student
router.get('/permissions/:studentId', 
  authenticate,
  requireAdmin,
  validate(commonSchemas.id, 'params'),
  rbacController.getStudentPermission
);

// Update permissions for a specific student
router.put('/permissions/:studentId', 
  authenticate,
  requireAdmin,
  validate(commonSchemas.id, 'params'),
  rbacController.updateStudentPermission
);

// Check if student has access to a specific feature
router.get('/check/:studentId/:feature', 
  authenticate,
  rbacController.checkStudentAccess
);

// Get current user's permissions (for students to check their own permissions)
router.get('/my-permissions', 
  authenticate,
  rbacController.getMyPermissions
);

module.exports = router;
