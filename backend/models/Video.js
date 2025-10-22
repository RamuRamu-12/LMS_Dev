const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define('Video', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    video_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Drive URL or video URL'
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Thumbnail image URL'
    },
    video_type: {
      type: DataTypes.ENUM('overview', 'phase'),
      allowNull: false,
      comment: 'Type of video: overview or phase-specific'
    },
    phase: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Phase name for phase-specific videos (e.g., BRD, UI/UX, etc.)'
    },
    phase_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Phase number for phase-specific videos'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Video duration in seconds'
    },
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of times video has been viewed'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of tags for categorization'
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'videos',
    timestamps: true,
    indexes: [
      {
        fields: ['project_id']
      },
      {
        fields: ['video_type']
      },
      {
        fields: ['phase']
      },
      {
        fields: ['phase_number']
      },
      {
        fields: ['uploaded_by']
      }
    ]
  });

  // Define associations
  Video.associate = (models) => {
    // Video belongs to Project
    Video.belongsTo(models.Project, {
      foreignKey: 'project_id',
      as: 'project'
    });
    
    // Video belongs to User (uploader)
    Video.belongsTo(models.User, {
      foreignKey: 'uploaded_by',
      as: 'uploader'
    });
    
    // Video belongs to User (updater)
    Video.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return Video;
};
