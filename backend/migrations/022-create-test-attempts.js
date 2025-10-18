'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('test_attempts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'course_tests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      attempt_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      total_points: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      earned_points: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      passed: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('in_progress', 'submitted', 'graded', 'abandoned'),
        allowNull: false,
        defaultValue: 'in_progress'
      },
      time_spent_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('test_attempts', ['test_id']);
    await queryInterface.addIndex('test_attempts', ['student_id']);
    await queryInterface.addIndex('test_attempts', ['status']);
    await queryInterface.addIndex('test_attempts', ['passed']);
    await queryInterface.addIndex('test_attempts', ['test_id', 'student_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('test_attempts');
  }
};
