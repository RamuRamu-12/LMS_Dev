'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 002-create-courses.js
    // Columns are already included in the main courses table creation
    console.log('006-add-course-intro-content: Skipped - columns consolidated into 002-create-courses.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 002-create-courses.js
    // Columns are part of the main table
    console.log('006-add-course-intro-content: Skipped - columns consolidated into 002-create-courses.js');
  }
};
