'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 035-create-hackathons.js
    // All hackathon tables and columns are created in the main hackathon migration
    console.log('038-fix-hackathon-missing-columns: Skipped - columns consolidated into 035-create-hackathons.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 035-create-hackathons.js
    // All columns are part of the main table definitions
    console.log('038-fix-hackathon-missing-columns: Skipped - columns consolidated into 035-create-hackathons.js');
  }
};
