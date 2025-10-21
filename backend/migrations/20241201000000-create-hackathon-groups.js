const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 035-create-hackathons.js
    // All hackathon tables are created in the main hackathon migration
    console.log('20241201000000-create-hackathon-groups: Skipped - tables consolidated into 035-create-hackathons.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 035-create-hackathons.js
    // Tables are managed by the main hackathon migration
    console.log('20241201000000-create-hackathon-groups: Skipped - tables consolidated into 035-create-hackathons.js');
  }
};
