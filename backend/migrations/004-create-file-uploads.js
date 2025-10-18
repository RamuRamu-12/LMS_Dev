'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('file_uploads', {
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
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      mimetype: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      s3_key: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      s3_bucket: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      file_type: {
        type: Sequelize.ENUM('pdf', 'docx'),
        allowNull: false
      },
      download_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes (with error handling for existing indexes)
    const indexes = [
      { columns: ['course_id'], name: 'file_uploads_course_id' },
      { columns: ['file_type'], name: 'file_uploads_file_type' },
      { columns: ['mimetype'], name: 'file_uploads_mimetype' },
      { columns: ['is_public'], name: 'file_uploads_is_public' },
      { columns: ['created_at'], name: 'file_uploads_created_at' }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.addIndex('file_uploads', index.columns, { name: index.name });
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
