'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const [tableExists] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'test_answers' AND table_schema = 'public'
    `);

    if (tableExists.length > 0) {
      console.log('Test_answers table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('test_answers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      attempt_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'test_attempts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'test_questions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      selected_option_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'test_question_options',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      answer_text: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      points_earned: {
        type: Sequelize.INTEGER,
        allowNull: true
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
      { columns: ['attempt_id'], name: 'test_answers_attempt_id' },
      { columns: ['question_id'], name: 'test_answers_question_id' },
      { columns: ['selected_option_id'], name: 'test_answers_selected_option_id' },
      { columns: ['is_correct'], name: 'test_answers_is_correct' }
    ];

    for (const index of indexes) {
      try {
        // Check if index already exists
        const [indexExists] = await queryInterface.sequelize.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE indexname = '${index.name}' AND tablename = 'test_answers'
        `);
        
        if (indexExists.length === 0) {
          await queryInterface.addIndex('test_answers', index.columns, { name: index.name });
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
    await queryInterface.dropTable('test_answers');
  }
};
