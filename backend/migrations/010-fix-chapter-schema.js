'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 005-create-course-chapters.js
    // All course_chapters columns are already included in the main table creation
    console.log('010-fix-chapter-schema: Skipped - schema consolidated into 005-create-course-chapters.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 005-create-course-chapters.js
    // All columns are part of the main table
    console.log('010-fix-chapter-schema: Skipped - schema consolidated into 005-create-course-chapters.js');
  }
};
