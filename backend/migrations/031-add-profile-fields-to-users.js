'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add bio field
      await queryInterface.addColumn('users', 'bio', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      
      // Add phone field
      await queryInterface.addColumn('users', 'phone', {
        type: Sequelize.STRING(20),
        allowNull: true
      });
      
      // Add location field
      await queryInterface.addColumn('users', 'location', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
      
      console.log('✅ Added profile fields (bio, phone, location) to users table');
    } catch (error) {
      console.log('ℹ️ Profile fields migration skipped:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve user profile data
    // If you need to remove these columns, do it manually with a backup
    console.log('⚠️ Skipping column removal for data safety');
    console.log('ℹ️ User profile fields (bio, phone, location) will be preserved');
  }
};
