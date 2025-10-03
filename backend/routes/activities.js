const express = require('express');
const { authenticate } = require('../middleware/auth');
const activityController = require('../controllers/activityController');

const router = express.Router();

// Get student's recent activities
router.get('/my-activities', 
  authenticate,
  activityController.getMyActivities
);

// Get student's activity statistics
router.get('/my-stats', 
  authenticate,
  activityController.getMyActivityStats
);

module.exports = router;
