const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const testController = require('../controllers/testController');

const router = express.Router();

// Get tests for a course
router.get('/course/:courseId', 
  authenticate,
  testController.getTestsByCourse
);

// Get test by ID
router.get('/:id', 
  authenticate,
  testController.getTestById
);

// Create a new test (admin only)
router.post('/', 
  authenticate,
  requireAdmin,
  testController.createTest
);

// Update a test (admin only)
router.put('/:id', 
  authenticate,
  requireAdmin,
  testController.updateTest
);

// Delete a test (admin only)
router.delete('/:id', 
  authenticate,
  requireAdmin,
  testController.deleteTest
);

// Get questions for a test
router.get('/:testId/questions', 
  authenticate,
  testController.getTestQuestions
);

// Create a question (admin only)
router.post('/questions', 
  authenticate,
  requireAdmin,
  testController.createQuestion
);

// Update a question (admin only)
router.put('/questions/:questionId', 
  authenticate,
  requireAdmin,
  testController.updateQuestion
);

// Delete a question (admin only)
router.delete('/questions/:questionId', 
  authenticate,
  requireAdmin,
  testController.deleteQuestion
);

// Add option to question (admin only)
router.post('/questions/:questionId/options', 
  authenticate,
  requireAdmin,
  testController.addOption
);

// Update option (admin only)
router.put('/options/:optionId', 
  authenticate,
  requireAdmin,
  testController.updateOption
);

// Delete option (admin only)
router.delete('/options/:optionId', 
  authenticate,
  requireAdmin,
  testController.deleteOption
);

module.exports = router;