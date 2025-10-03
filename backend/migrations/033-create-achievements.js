'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('achievements', {
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
        achievement_type: {
          type: Sequelize.ENUM(
            'course_completion',
            'test_passing',
            'streak_master',
            'top_performer',
            'first_course',
            'perfect_score'
          ),
          allowNull: false,
          defaultValue: 'course_completion'
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        icon: {
          type: Sequelize.STRING(100),
          allowNull: true,
          defaultValue: '🎓'
        },
        certificate_url: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        certificate_data: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        points_earned: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        is_unlocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        unlocked_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
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

      // Create indexes
      await queryInterface.addIndex('achievements', ['student_id'], { name: 'achievements_student_id' });
      await queryInterface.addIndex('achievements', ['course_id'], { name: 'achievements_course_id' });
      await queryInterface.addIndex('achievements', ['achievement_type'], { name: 'achievements_achievement_type' });
      await queryInterface.addIndex('achievements', ['is_unlocked'], { name: 'achievements_is_unlocked' });
      await queryInterface.addIndex('achievements', ['student_id', 'achievement_type'], { name: 'achievements_student_type' });

      console.log('✅ Created achievements table');
    } catch (error) {
      console.log('ℹ️ Achievements migration skipped:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.dropTable('achievements');
      console.log('✅ Dropped achievements table');
    } catch (error) {
      console.log('ℹ️ Achievements rollback skipped:', error.message);
    }
  }
};
