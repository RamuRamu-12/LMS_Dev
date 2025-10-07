const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add is_temp column to hackathons table
    await queryInterface.addColumn('hackathons', 'is_temp', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Flag to identify temporary hackathons for group management'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove is_temp column from hackathons table
    await queryInterface.removeColumn('hackathons', 'is_temp');
  }
};
