'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const [tableExists] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'course_tests' AND table_schema = 'public'
    `);

    if (tableExists.length > 0) {
      console.log('Course_tests table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('course_tests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      passing_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 70
      },
      time_limit_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
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
      { columns: ['course_id'], name: 'course_tests_course_id' },
      { columns: ['is_active'], name: 'course_tests_is_active' },
      { columns: ['created_by'], name: 'course_tests_created_by' }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('course_tests', index.columns, { name: index.name });
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
        console.log(`Index ${index.name} already exists, skipping`);
      }
    }

    // Add foreign key constraint to course_chapters.test_id if the table exists
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE course_chapters 
        ADD CONSTRAINT fk_course_chapters_test_id 
        FOREIGN KEY (test_id) REFERENCES course_tests(id) 
        ON UPDATE CASCADE ON DELETE SET NULL
      `);
      console.log('Added foreign key constraint for course_chapters.test_id');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Foreign key constraint fk_course_chapters_test_id already exists, skipping');
      } else if (error.message.includes('does not exist')) {
        console.log('Course_chapters table does not exist, skipping foreign key constraint');
      } else {
        console.log('Could not add foreign key constraint for course_chapters.test_id:', error.message);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('course_tests');
  }
};
