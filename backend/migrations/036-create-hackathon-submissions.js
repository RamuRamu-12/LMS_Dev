'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hackathon_submissions', {
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
      project_title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      project_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      github_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      live_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      demo_video_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      presentation_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      documentation_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      additional_files_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      submission_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'under_review', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'draft'
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      review_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      is_winner: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      prize: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ranking: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    await queryInterface.addIndex('hackathon_submissions', ['hackathon_id']);
    await queryInterface.addIndex('hackathon_submissions', ['student_id']);
    await queryInterface.addIndex('hackathon_submissions', ['status']);
    await queryInterface.addIndex('hackathon_submissions', ['submitted_at']);
    await queryInterface.addIndex('hackathon_submissions', ['is_winner']);
    await queryInterface.addIndex('hackathon_submissions', ['ranking']);
    
    // Add unique constraint
    await queryInterface.addIndex('hackathon_submissions', {
      fields: ['hackathon_id', 'student_id'],
      unique: true,
      name: 'unique_hackathon_student_submission'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
