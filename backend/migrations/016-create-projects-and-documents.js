'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Projects table
    await queryInterface.createTable('projects', {
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
        allowNull: false
      },
      difficulty: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull: false,
        defaultValue: 'intermediate'
      },
      estimatedDuration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Duration in hours'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'archived'),
        allowNull: false,
        defaultValue: 'active'
      },
      thumbnail: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL to project thumbnail image'
      },
      logo: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL to project logo image'
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Project category'
      },
      technologies: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of technologies used in the project'
      },
      phases: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of project phases with their details'
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create Documents table
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        },
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
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Original filename'
      },
      filePath: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Path to the uploaded file'
      },
      fileUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Public URL to access the file'
      },
      fileSize: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'File size in bytes'
      },
      mimeType: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'MIME type of the file'
      },
      fileExtension: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'File extension'
      },
      documentType: {
        type: Sequelize.ENUM('brd', 'uiux', 'architecture', 'code', 'testing', 'deployment', 'other'),
        allowNull: false,
        comment: 'Type of document based on project phase'
      },
      phase: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Specific phase within document type'
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: '1.0',
        comment: 'Document version'
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether document is publicly accessible'
      },
      downloadCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of times document has been downloaded'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of tags for categorization'
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create indexes
    await queryInterface.addIndex('projects', ['status']);
    await queryInterface.addIndex('projects', ['difficulty']);
    await queryInterface.addIndex('projects', ['category']);
    await queryInterface.addIndex('projects', ['isPublished']);
    await queryInterface.addIndex('projects', ['createdBy']);

    await queryInterface.addIndex('documents', ['projectId']);
    await queryInterface.addIndex('documents', ['documentType']);
    await queryInterface.addIndex('documents', ['phase']);
    await queryInterface.addIndex('documents', ['isPublic']);
    await queryInterface.addIndex('documents', ['uploadedBy']);
    await queryInterface.addIndex('documents', ['mimeType']);
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
