const express = require('express');
const passport = require('passport');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const authController = require('../controllers/authController');
const { userSchemas } = require('../utils/validation');

const router = express.Router();

// Student registration
router.post('/register', authController.register);

// Traditional login
router.post('/login', authController.login);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL + '/login?error=auth_failed',
    session: false 
  }),
  authController.googleCallback
);

// Google credential verification (for frontend Google Sign-In)
router.post('/google/verify', authController.verifyGoogleCredential);

// Token refresh
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', authenticate, authController.logout);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Update profile
router.put('/profile', 
  authenticate, 
  validate(userSchemas.update, 'body'),
  authController.updateProfile
);

// Check authentication status
router.get('/status', optionalAuth, authController.getAuthStatus);

module.exports = router;
