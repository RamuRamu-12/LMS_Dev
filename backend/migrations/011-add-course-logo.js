'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 002-create-courses.js
    // logo column is already included in the main courses table creation
    console.log('011-add-course-logo: Skipped - column consolidated into 002-create-courses.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 002-create-courses.js
    // Column is part of the main table
    console.log('011-add-course-logo: Skipped - column consolidated into 002-create-courses.js');
  }
};
