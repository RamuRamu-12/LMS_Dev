const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
    defaultValue: 'intermediate'
  },
  estimated_duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in hours'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived'),
    allowNull: false,
    defaultValue: 'active'
  },
  thumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to project thumbnail image'
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to project logo image'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Project category (e.g., Web Development, Data Science)'
  },
  technologies: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of technologies used in the project'
  },
  phases: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of project phases with their details'
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_by: {
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
  },
  // Video URL fields for each phase
  overview_video_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Project overview video URL (Drive link)'
  },
  brd_video_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'BRD phase video URL (Drive link)'
  },
  uiux_video_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'UI/UX phase video URL (Drive link)'
  },
  architectural_video_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Architectural phase video URL (Drive link)'
  },
  code_development_video_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Code Development phase video URL (Drive link)'
  },
  testing_video_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Testing phase video URL (Drive link)'
  },
  deployment_video_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Deployment phase video URL (Drive link)'
  },
  // Document URL fields for each phase
  brd_document_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'BRD phase document URL (Drive link)'
  },
  uiux_document_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'UI/UX phase document URL (Drive link)'
  },
  architectural_document_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Architectural phase document URL (Drive link)'
  },
  code_development_document_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Code Development phase document URL (Drive link)'
  },
  testing_document_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Testing phase document URL (Drive link)'
  },
  deployment_document_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Deployment phase document URL (Drive link)'
  },
  // Metadata fields for tracking uploads
  video_uploads: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadata for video uploads (upload dates, file sizes, etc.)'
  },
  document_uploads: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadata for document uploads (upload dates, file sizes, etc.)'
  },
  videos_last_updated: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time videos were updated'
  },
  documents_last_updated: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time documents were updated'
  },
  videos_uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'User who uploaded the videos'
  },
  documents_uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'User who uploaded the documents'
  }
}, {
  tableName: 'projects',
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['difficulty']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_published']
    },
    {
      fields: ['created_by']
    }
  ]
});

  // Define associations
  Project.associate = (models) => {
    // Project belongs to User (creator)
    Project.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    
    // Project belongs to User (updater)
    Project.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });

    // Project belongs to User (videos uploaded by)
    Project.belongsTo(models.User, {
      foreignKey: 'videos_uploaded_by',
      as: 'videosUploader'
    });

    // Project belongs to User (documents uploaded by)
    Project.belongsTo(models.User, {
      foreignKey: 'documents_uploaded_by',
      as: 'documentsUploader'
    });
    
    // Project has many Documents
    Project.hasMany(models.Document, {
      foreignKey: 'project_id',
      as: 'documents',
      onDelete: 'CASCADE'
    });
  };

  return Project;
};