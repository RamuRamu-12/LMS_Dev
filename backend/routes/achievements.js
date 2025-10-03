const express = require('express');
const { authenticate } = require('../middleware/auth');
const achievementController = require('../controllers/achievementController');

const router = express.Router();

// Get student's achievements
router.get('/my-achievements', 
  authenticate,
  achievementController.getMyAchievements
);

// Get student's achievement statistics
router.get('/my-stats', 
  authenticate,
  achievementController.getMyAchievementStats
);

// Download certificate data
router.get('/:achievementId/certificate', 
  authenticate,
  achievementController.downloadCertificate
);

// Generate PDF certificate (placeholder)
router.get('/:achievementId/certificate/download', 
  authenticate,
  achievementController.generatePDFCertificate
);

module.exports = router;
