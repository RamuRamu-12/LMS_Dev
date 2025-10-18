'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project_progress', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      phaseId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'project_phases',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('not_started', 'in_progress', 'completed', 'skipped'),
        defaultValue: 'not_started'
      },
      progressPercentage: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      timeSpent: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastAccessedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('project_progress', ['userId']);
    await queryInterface.addIndex('project_progress', ['projectId']);
    await queryInterface.addIndex('project_progress', ['phaseId']);
    await queryInterface.addIndex('project_progress', ['status']);
    await queryInterface.addIndex('project_progress', ['userId', 'projectId', 'phaseId'], {
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
