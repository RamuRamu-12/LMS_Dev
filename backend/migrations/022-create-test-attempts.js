'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const [tableExists] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'test_attempts' AND table_schema = 'public'
    `);

    if (tableExists.length > 0) {
      console.log('Test_attempts table already exists, skipping creation');
      return;
    }

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

    // Add indexes (with error handling for existing indexes)
    const indexes = [
      { columns: ['test_id'], name: 'test_attempts_test_id' },
      { columns: ['student_id'], name: 'test_attempts_student_id' },
      { columns: ['status'], name: 'test_attempts_status' },
      { columns: ['passed'], name: 'test_attempts_passed' },
      { columns: ['test_id', 'student_id'], name: 'test_attempts_test_student' }
    ];

    for (const index of indexes) {
      try {
        // Check if index already exists
        const [indexExists] = await queryInterface.sequelize.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE indexname = '${index.name}' AND tablename = 'test_attempts'
        `);
        
        if (indexExists.length === 0) {
          await queryInterface.addIndex('test_attempts', index.columns, { name: index.name });
          console.log(`Created index: ${index.name}`);
        } else {
          console.log(`Index ${index.name} already exists, skipping`);
        }
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
        console.log(`Index ${index.name} already exists, skipping`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('test_attempts');
  }
};
