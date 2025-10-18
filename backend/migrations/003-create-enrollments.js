'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('enrollments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      enrolled_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      progress: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_accessed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('enrolled', 'completed', 'dropped'),
        defaultValue: 'enrolled'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      review: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      completion_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      time_spent: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_lesson_completed: {
        type: Sequelize.STRING(255),
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

    // Create indexes (with error handling for existing indexes)
    const indexes = [
      { columns: ['student_id'], name: 'enrollments_student_id' },
      { columns: ['course_id'], name: 'enrollments_course_id' },
      { columns: ['status'], name: 'enrollments_status' },
      { columns: ['enrolled_at'], name: 'enrollments_enrolled_at' },
      { columns: ['progress'], name: 'enrollments_progress' }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('enrollments', index.columns, { name: index.name });
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    // Create unique constraint for student-course combination
    try {
      await queryInterface.addIndex('enrollments', ['student_id', 'course_id'], {
        unique: true,
        name: 'unique_student_course'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
