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
    try {
      // Remove the added columns
      await queryInterface.removeColumn('users', 'bio');
      await queryInterface.removeColumn('users', 'phone');
      await queryInterface.removeColumn('users', 'location');
      
      console.log('✅ Removed profile fields from users table');
    } catch (error) {
      console.log('ℹ️ Profile fields rollback skipped:', error.message);
    }
  }
};
