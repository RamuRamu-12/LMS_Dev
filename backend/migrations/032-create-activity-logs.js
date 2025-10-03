'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('activity_logs', {
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
        activity_type: {
          type: Sequelize.ENUM(
            'enrollment',
            'chapter_completed',
            'course_completed',
            'test_attempted',
            'test_passed',
            'certificate_earned',
            'achievement_unlocked'
          ),
          allowNull: false
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        course_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'courses',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        chapter_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'course_chapters',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        test_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'course_tests',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        metadata: {
          type: Sequelize.JSONB,
          defaultValue: {}
        },
        points_earned: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });

      // Create indexes
      await queryInterface.addIndex('activity_logs', ['student_id'], { name: 'activity_logs_student_id' });
      await queryInterface.addIndex('activity_logs', ['activity_type'], { name: 'activity_logs_activity_type' });
      await queryInterface.addIndex('activity_logs', ['created_at'], { name: 'activity_logs_created_at' });
      await queryInterface.addIndex('activity_logs', ['student_id', 'created_at'], { name: 'activity_logs_student_created' });

      console.log('✅ Created activity_logs table');
    } catch (error) {
      console.log('ℹ️ Activity logs migration skipped:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.dropTable('activity_logs');
      console.log('✅ Dropped activity_logs table');
    } catch (error) {
      console.log('ℹ️ Activity logs rollback skipped:', error.message);
    }
  }
};
