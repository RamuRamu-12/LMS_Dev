'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 002-create-courses.js
    // url_analysis column is already included in the main courses table creation
    console.log('007-add-url-analysis: Skipped - column consolidated into 002-create-courses.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 002-create-courses.js
    // Column is part of the main table
    console.log('007-add-url-analysis: Skipped - column consolidated into 002-create-courses.js');
  }
};
