'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add test_id column to course_chapters table
    await queryInterface.addColumn('course_chapters', 'test_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'course_tests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for test_id
    await queryInterface.addIndex('course_chapters', ['test_id'], {
      name: 'idx_course_chapters_test_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('course_chapters', 'idx_course_chapters_test_id');
    
    // Remove test_id column
    await queryInterface.removeColumn('course_chapters', 'test_id');
  }
};

