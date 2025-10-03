const express = require('express');
const { authenticate } = require('../middleware/auth');
const testTakingController = require('../controllers/testTakingController');

const router = express.Router();

// Start a test attempt
router.post('/start/:testId', 
  authenticate,
  testTakingController.startTest
);

// Submit an answer for a question
router.post('/attempts/:attemptId/answers', 
  authenticate,
  testTakingController.submitAnswer
);

// Submit the entire test
router.post('/attempts/:attemptId/submit', 
  authenticate,
  testTakingController.submitTest
);

// Get test attempt details
router.get('/attempt/:attemptId', 
  authenticate,
  testTakingController.getTestAttempt
);

// Get test questions (for taking the test)
router.get('/:testId/questions', 
  authenticate,
  testTakingController.getTestQuestions
);

// Get test history for a specific test
router.get('/tests/:testId/history', 
  authenticate,
  testTakingController.getTestHistory
);

// Get all test attempts for current user
router.get('/my-attempts', 
  authenticate,
  testTakingController.getMyAttempts
);

module.exports = router;
