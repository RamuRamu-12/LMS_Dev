'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('courses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      instructor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      category: {
        type: Sequelize.STRING(100),
        defaultValue: 'other'
      },
      difficulty: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'beginner'
      },
      estimated_duration: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      thumbnail: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      enrollment_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      average_rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      },
      total_ratings: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      learning_objectives: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      logo: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Course logo/icon URL'
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
      { columns: ['instructor_id'], name: 'courses_instructor_id' },
      { columns: ['is_published'], name: 'courses_is_published' },
      { columns: ['category'], name: 'courses_category' },
      { columns: ['difficulty'], name: 'courses_difficulty' },
      { columns: ['created_at'], name: 'courses_created_at' },
      { columns: ['enrollment_count'], name: 'courses_enrollment_count' },
      { columns: ['average_rating'], name: 'courses_average_rating' }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('courses', index.columns, { name: index.name });
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    // Create full-text search index
    try {
      await queryInterface.sequelize.query(`
        CREATE INDEX idx_courses_search ON courses 
        USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')))
      `);
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
