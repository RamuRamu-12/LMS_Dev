'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chapter_progress', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      enrollment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'enrollments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      chapter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'course_chapters',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      video_watched: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      pdf_viewed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      time_spent: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Time spent in minutes'
      },
      completed_at: {
        type: Sequelize.DATE,
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

    // Add unique constraint to prevent duplicate progress entries
    await queryInterface.addConstraint('chapter_progress', {
      fields: ['enrollment_id', 'chapter_id'],
      type: 'unique',
      name: 'unique_enrollment_chapter'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('chapter_progress', ['enrollment_id']);
    await queryInterface.addIndex('chapter_progress', ['chapter_id']);
    await queryInterface.addIndex('chapter_progress', ['is_completed']);
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
