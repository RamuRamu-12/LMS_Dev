'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 005-create-course-chapters.js
    // All columns are already included in the table creation
    console.log('009-update-chapters-for-urls: Skipped - columns consolidated into 005-create-course-chapters.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 005-create-course-chapters.js
    // All columns are part of the main table
    console.log('009-update-chapters-for-urls: Skipped - columns consolidated into 005-create-course-chapters.js');
  }
};
