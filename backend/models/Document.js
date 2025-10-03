const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
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
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Original filename'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Path to the uploaded file'
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Public URL to access the file'
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'File size in bytes'
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'MIME type of the file'
  },
  file_extension: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'File extension (e.g., pdf, docx, zip)'
  },
  document_type: {
    type: DataTypes.ENUM('brd', 'uiux', 'architecture', 'code', 'testing', 'deployment', 'other'),
    allowNull: false,
    comment: 'Type of document based on project phase'
  },
  phase: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Specific phase within document type'
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '1.0',
    comment: 'Document version'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether document is publicly accessible'
  },
  download_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of times document has been downloaded'
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
  tableName: 'documents',
  timestamps: true,
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['document_type']
    },
    {
      fields: ['phase']
    },
    {
      fields: ['is_public']
    },
    {
      fields: ['uploaded_by']
    },
    {
      fields: ['mime_type']
    }
  ]
});

  // Define associations
  Document.associate = (models) => {
    // Document belongs to Project
    Document.belongsTo(models.Project, {
      foreignKey: 'project_id',
      as: 'project'
    });
    
    // Document belongs to User (uploader)
    Document.belongsTo(models.User, {
      foreignKey: 'uploaded_by',
      as: 'uploader'
    });
    
    // Document belongs to User (updater)
    Document.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return Document;
};
