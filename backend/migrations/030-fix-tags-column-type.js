'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the tags column exists and fix its type
      await queryInterface.changeColumn('courses', 'tags', {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      });
      
      console.log('✅ Fixed tags column type to text[]');
    } catch (error) {
      console.log('ℹ️ Tags column type fix skipped:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Revert back to string array
      await queryInterface.changeColumn('courses', 'tags', {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      });
      
      console.log('✅ Reverted tags column type to string[]');
    } catch (error) {
      console.log('ℹ️ Tags column type revert skipped:', error.message);
    }
  }
};
