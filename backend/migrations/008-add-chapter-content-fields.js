'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 005-create-course-chapters.js
    // No action needed - columns are already included in the table creation
    console.log('008-add-chapter-content-fields: Skipped - columns consolidated into 005-create-course-chapters.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 005-create-course-chapters.js
    // No action needed - columns are part of the main table
    console.log('008-add-chapter-content-fields: Skipped - columns consolidated into 005-create-course-chapters.js');
  }
};
