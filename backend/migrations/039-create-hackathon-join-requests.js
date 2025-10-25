'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hackathon_join_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      hackathon_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'hackathons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      team_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      team_members: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of team members with name and email'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Message to admin'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Admin who reviewed the request'
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      review_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Admin notes about the review'
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
    await queryInterface.addIndex('hackathon_join_requests', ['hackathon_id']);
    await queryInterface.addIndex('hackathon_join_requests', ['status']);
    await queryInterface.addIndex('hackathon_join_requests', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('hackathon_join_requests');
  }
};
