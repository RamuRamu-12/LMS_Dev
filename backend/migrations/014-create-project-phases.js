'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project_phases', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      phaseNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      phaseType: {
        type: Sequelize.ENUM('BRD', 'UI/UX', 'Development', 'Testing', 'Deployment'),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resources: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      estimatedDuration: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('project_phases', ['projectId']);
    await queryInterface.addIndex('project_phases', ['phaseNumber']);
    await queryInterface.addIndex('project_phases', ['phaseType']);
    await queryInterface.addIndex('project_phases', ['isActive']);
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
