'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const [tableExists] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'test_question_options' AND table_schema = 'public'
    `);

    if (tableExists.length > 0) {
      console.log('Test_question_options table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('test_question_options', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      option_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
      { columns: ['question_id'], name: 'test_question_options_question_id' },
      { columns: ['is_correct'], name: 'test_question_options_is_correct' }
    ];

    for (const index of indexes) {
      try {
        // Check if index already exists
        const [indexExists] = await queryInterface.sequelize.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE indexname = '${index.name}' AND tablename = 'test_question_options'
        `);
        
        if (indexExists.length === 0) {
          await queryInterface.addIndex('test_question_options', index.columns, { name: index.name });
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
    await queryInterface.dropTable('test_question_options');
  }
};
