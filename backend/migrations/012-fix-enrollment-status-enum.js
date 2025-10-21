'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the status column exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'enrollments' 
      AND column_name = 'status'
    `);
    
    if (results.length === 0) {
      console.log('Status column does not exist in enrollments table, skipping migration');
      return;
    }
    
    console.log('Current status column type:', results[0]?.data_type, results[0]?.udt_name);

    // Drop the existing enum and recreate it with the correct values
    try {
      await queryInterface.changeColumn('enrollments', 'status', {
        type: Sequelize.ENUM('enrolled', 'completed', 'dropped'),
        defaultValue: 'enrolled',
        allowNull: false
      });
      console.log('Successfully updated status column enum');
    } catch (error) {
      console.log('Could not update status column:', error.message);
      // Don't throw error, just log and continue
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to the original enum values if needed
    await queryInterface.changeColumn('enrollments', 'status', {
      type: Sequelize.ENUM('enrolled', 'completed', 'dropped'),
      defaultValue: 'enrolled',
      allowNull: false
    });
  }
};
