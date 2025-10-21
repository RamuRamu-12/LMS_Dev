const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
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
        len: [3, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instructor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: 'other',
      validate: {
        isIn: [['programming', 'design', 'business', 'marketing', 'other']]
      }
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'beginner'
    },
    estimated_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isValidLogoPath(value) {
          if (value && typeof value === 'string') {
            // Allow relative paths starting with /uploads/ or full URLs
            const isRelativePath = value.startsWith('/uploads/');
            const isFullUrl = value.startsWith('http://') || value.startsWith('https://');
            
            if (!isRelativePath && !isFullUrl) {
              throw new Error('Logo must be a valid file path starting with /uploads/ or a full URL');
            }
          }
        }
      }
    },
    enrollment_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    total_ratings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    learning_objectives: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    video_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    prerequisites: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: []
    },
    intro_content_type: {
      type: DataTypes.ENUM('video', 'pdf', 'url'),
      allowNull: true,
      defaultValue: 'video'
    },
    intro_file_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'file_uploads',
        key: 'id'
      }
    },
    external_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url_analysis: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'courses',
    indexes: [
      {
        fields: ['instructor_id']
      },
      {
        fields: ['is_published']
      },
      {
        fields: ['category']
      },
      {
        fields: ['difficulty']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['enrollment_count']
      },
      {
        fields: ['average_rating']
      }
    ],
    hooks: {}
  });

  // Instance methods
  Course.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  Course.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      difficulty: this.difficulty,
      estimated_duration: this.estimated_duration,
      thumbnail: this.thumbnail,
      logo: this.logo,
      enrollment_count: this.enrollment_count,
      average_rating: this.average_rating,
      total_ratings: this.total_ratings,
      tags: this.tags,
      learning_objectives: this.learning_objectives,
      is_published: this.is_published,
      instructor: this.instructor || null,
      // Exclude chapters from public info to prevent circular references
      // chapters: this.chapters,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  Course.prototype.publish = function() {
    this.is_published = true;
    return this.save();
  };

  Course.prototype.unpublish = function() {
    this.is_published = false;
    return this.save();
  };

  Course.prototype.updateEnrollmentCount = async function() {
    const count = await this.countEnrollments();
    this.enrollment_count = count;
    return this.save();
  };

  Course.prototype.updateRating = async function() {
    const enrollments = await this.getEnrollments({
      where: { rating: { [sequelize.Sequelize.Op.ne]: null } }
    });
    
    if (enrollments.length > 0) {
      const totalRating = enrollments.reduce((sum, enrollment) => sum + enrollment.rating, 0);
      this.average_rating = (totalRating / enrollments.length).toFixed(2);
      this.total_ratings = enrollments.length;
    } else {
      this.average_rating = 0;
      this.total_ratings = 0;
    }
    
    return this.save();
  };

  // Class methods
  Course.findPublished = function() {
    return this.findAll({ 
      where: { is_published: true },
      order: [['created_at', 'DESC']]
    });
  };

  Course.findByCategory = function(category) {
    return this.findAll({ 
      where: { category, is_published: true },
      order: [['created_at', 'DESC']]
    });
  };

  Course.findByDifficulty = function(difficulty) {
    return this.findAll({ 
      where: { difficulty, is_published: true },
      order: [['created_at', 'DESC']]
    });
  };

  Course.search = function(searchTerm) {
    return this.findAll({
      where: {
        is_published: true,
        [sequelize.Sequelize.Op.or]: [
          { title: { [sequelize.Sequelize.Op.iLike]: `%${searchTerm}%` } },
          { description: { [sequelize.Sequelize.Op.iLike]: `%${searchTerm}%` } },
          // Use raw SQL for tags search to avoid type issues
          sequelize.literal(`EXISTS (
            SELECT 1 FROM unnest(tags) AS tag 
            WHERE tag ILIKE '%${searchTerm.replace(/'/g, "''")}%'
          )`)
        ]
      },
      order: [['created_at', 'DESC']]
    });
  };

  Course.getPopular = function(limit = 10) {
    return this.findAll({
      where: { is_published: true },
      order: [['enrollment_count', 'DESC']],
      limit
    });
  };

  Course.getTopRated = function(limit = 10) {
    return this.findAll({
      where: { 
        is_published: true,
        total_ratings: { [sequelize.Sequelize.Op.gte]: 1 }
      },
      order: [['average_rating', 'DESC']],
      limit
    });
  };

  return Course;
};
