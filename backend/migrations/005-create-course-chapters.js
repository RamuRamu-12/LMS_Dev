'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('course_chapters', {
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
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 255]
        }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      content_type: {
        type: Sequelize.ENUM('video', 'pdf', 'url'),
        allowNull: false,
        defaultValue: 'video'
      },
      video_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      pdf_file_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'file_uploads',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      external_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      chapter_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
      { columns: ['course_id'], name: 'course_chapters_course_id' },
      { columns: ['content_type'], name: 'course_chapters_content_type' },
      { columns: ['chapter_order'], name: 'course_chapters_chapter_order' },
      { columns: ['is_published'], name: 'course_chapters_is_published' },
      { columns: ['course_id', 'chapter_order'], name: 'course_chapters_course_chapter_order' }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('course_chapters', index.columns, { name: index.name });
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
