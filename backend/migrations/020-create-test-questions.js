'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const [tableExists] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'test_questions' AND table_schema = 'public'
    `);

    if (tableExists.length > 0) {
      console.log('Test_questions table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('test_questions', {
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
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      question_type: {
        type: Sequelize.ENUM('multiple_choice', 'true_false', 'short_answer', 'essay'),
        allowNull: false,
        defaultValue: 'multiple_choice'
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      explanation: {
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
      { columns: ['test_id'], name: 'test_questions_test_id' },
      { columns: ['question_type'], name: 'test_questions_question_type' }
    ];

    for (const index of indexes) {
      try {
        // Check if index already exists
        const [indexExists] = await queryInterface.sequelize.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE indexname = '${index.name}' AND tablename = 'test_questions'
        `);
        
        if (indexExists.length === 0) {
          await queryInterface.addIndex('test_questions', index.columns, { name: index.name });
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
    await queryInterface.dropTable('test_questions');
  }
};
