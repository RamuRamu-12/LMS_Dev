'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 005-create-course-chapters.js
    // test_id column is already included in the main course_chapters table creation
    console.log('034-add-test-id-to-chapters: Skipped - column consolidated into 005-create-course-chapters.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 005-create-course-chapters.js
    // Column is part of the main table
    console.log('034-add-test-id-to-chapters: Skipped - column consolidated into 005-create-course-chapters.js');
  }
};

