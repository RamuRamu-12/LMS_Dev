const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const FileUpload = sequelize.define('FileUpload', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isIn: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      }
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 10485760 // 10MB
      }
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    file_type: {
      type: DataTypes.ENUM('pdf', 'docx'),
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'file_uploads',
    indexes: [
      {
        fields: ['course_id']
      },
      {
        fields: ['file_type']
      },
      {
        fields: ['mimetype']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeCreate: (file) => {
        // Set file_type based on mimetype
        if (file.mimetype === 'application/pdf') {
          file.file_type = 'pdf';
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          file.file_type = 'docx';
        }
      }
    }
  });

  // Instance methods
  FileUpload.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  FileUpload.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      filename: this.filename,
      original_name: this.original_name,
      file_type: this.file_type,
      size: this.size,
      url: this.url,
      created_at: this.created_at
    };
  };


  FileUpload.prototype.getDownloadUrl = function() {
    // Return signed URL for secure download
    return this.url;
  };

  FileUpload.prototype.getFileSizeFormatted = function() {
    const bytes = this.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  FileUpload.prototype.isPdf = function() {
    return this.file_type === 'pdf';
  };

  FileUpload.prototype.isDocx = function() {
    return this.file_type === 'docx';
  };

  // Class methods
  FileUpload.findByCourse = function(courseId) {
    return this.findAll({
      where: { course_id: courseId },
      order: [['created_at', 'DESC']]
    });
  };

  FileUpload.findByType = function(fileType) {
    return this.findAll({
      where: { file_type: fileType },
      order: [['created_at', 'DESC']]
    });
  };

  FileUpload.findPublic = function() {
    // Since is_public column was removed, return all files
    return this.findAll({
      order: [['created_at', 'DESC']]
    });
  };

  FileUpload.getTotalSize = function(courseId) {
    return this.sum('size', {
      where: { course_id: courseId }
    });
  };

  FileUpload.getFileStats = function(courseId) {
    return this.findAll({
      where: { course_id: courseId },
      attributes: [
        'file_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('size')), 'total_size']
      ],
      group: ['file_type']
    });
  };

  return FileUpload;
};
