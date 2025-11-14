const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const logger = require('../utils/logger');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Extract user information from Google profile
    const { id: googleId, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const avatar = photos[0]?.value;

    // Check if user already exists
    let user = await User.findByGoogleId(googleId);
    let isNewUser = false;

    if (user) {
      // Check if user account is active
      if (!user.is_active) {
        logger.warn(`Inactive user ${user.email} attempted Google OAuth login`);
        return done(new Error('Account is deactivated. Please contact an administrator.'), null);
      }
      
      // Update existing user's information
      await user.update({
        name: displayName,
        email: email,
        avatar: avatar,
        last_login: new Date()
      });
    } else {
      // Check if user exists with same email
      user = await User.findByEmail(email);
      
      if (user) {
        // Check if user account is active
        if (!user.is_active) {
          logger.warn(`Inactive user ${user.email} attempted Google OAuth login`);
          return done(new Error('Account is deactivated. Please contact an administrator.'), null);
        }
        
        // Link Google account to existing user
        await user.update({
          google_id: googleId,
          avatar: avatar,
          last_login: new Date()
        });
      } else {
        // Create new user
        user = await User.create({
          google_id: googleId,
          name: displayName,
          email: email,
          avatar: avatar,
          role: 'student', // Default role
          is_active: true,
          last_login: new Date()
        });
        isNewUser = true;
      }
    }

    // Return user with isNewUser flag
    return done(null, { user, isNewUser });
  } catch (error) {
    logger.error('Google OAuth strategy error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    logger.error('Passport deserialize error:', error);
    done(error, null);
  }
});

module.exports = passport;
