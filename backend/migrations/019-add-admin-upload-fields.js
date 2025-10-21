'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 016-create-projects-and-documents.js
    // All project-related columns are created in the main projects migration
    console.log('019-add-admin-upload-fields: Skipped - consolidated into 016-create-projects-and-documents.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 016-create-projects-and-documents.js
    // Tables are managed by the main projects migration
    console.log('019-add-admin-upload-fields: Skipped - consolidated into 016-create-projects-and-documents.js');
  }
};
