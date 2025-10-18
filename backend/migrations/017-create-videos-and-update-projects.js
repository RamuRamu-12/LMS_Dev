'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add overviewVideoUrl column to projects table
    await queryInterface.addColumn('projects', 'overviewVideoUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'URL to project overview video'
    });

    // Create Videos table
    await queryInterface.createTable('videos', {
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
      videoUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Drive URL or video URL'
      },
      thumbnailUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Thumbnail image URL'
      },
      videoType: {
        type: Sequelize.ENUM('overview', 'phase'),
        allowNull: false,
        comment: 'Type of video: overview or phase-specific'
      },
      phase: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Phase name for phase-specific videos'
      },
      phaseNumber: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Phase number for phase-specific videos'
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Video duration in seconds'
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether video is publicly accessible'
      },
      viewCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of times video has been viewed'
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

    // Create indexes for videos table
    await queryInterface.addIndex('videos', ['projectId']);
    await queryInterface.addIndex('videos', ['videoType']);
    await queryInterface.addIndex('videos', ['phase']);
    await queryInterface.addIndex('videos', ['phaseNumber']);
    await queryInterface.addIndex('videos', ['isPublic']);
    await queryInterface.addIndex('videos', ['uploadedBy']);
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('projects', 'overviewVideoUrl');
    } catch (error) {
      // Column may not exist
    }
  }
};
