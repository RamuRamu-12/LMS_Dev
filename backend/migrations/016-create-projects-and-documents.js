'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if projects table already exists
    const [projectsExists] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'projects' AND table_schema = 'public'
    `);

    if (projectsExists.length > 0) {
      console.log('Projects table already exists, skipping creation');
      return;
    }

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

    // Create project_phases table
    await queryInterface.createTable('project_phases', {
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
      phaseNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      phaseType: {
        type: Sequelize.ENUM('BRD', 'UI/UX', 'Development', 'Testing', 'Deployment'),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resources: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      estimatedDuration: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    // Create project_progress table
    await queryInterface.createTable('project_progress', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      phaseId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'project_phases',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('not_started', 'in_progress', 'completed', 'skipped'),
        defaultValue: 'not_started'
      },
      progressPercentage: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      timeSpent: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastAccessedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
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
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for project_phases
    await queryInterface.addIndex('project_phases', ['projectId']);
    await queryInterface.addIndex('project_phases', ['phaseNumber']);
    await queryInterface.addIndex('project_phases', ['phaseType']);
    await queryInterface.addIndex('project_phases', ['isActive']);

    // Add indexes for project_progress
    await queryInterface.addIndex('project_progress', ['userId']);
    await queryInterface.addIndex('project_progress', ['projectId']);
    await queryInterface.addIndex('project_progress', ['phaseId']);
    await queryInterface.addIndex('project_progress', ['status']);
    await queryInterface.addIndex('project_progress', ['userId', 'projectId', 'phaseId'], {
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
