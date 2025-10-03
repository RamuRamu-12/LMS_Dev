const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const CourseChapter = sequelize.define('CourseChapter', {
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
    video_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isValidUrl(value) {
          if (value && value.trim() !== '') {
            const urlRegex = /^https?:\/\/.+/;
            if (!urlRegex.test(value)) {
              throw new Error('Must be a valid URL');
            }
          }
        }
      }
    },
    pdf_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isValidUrl(value) {
          if (value && value.trim() !== '') {
            const urlRegex = /^https?:\/\/.+/;
            if (!urlRegex.test(value)) {
              throw new Error('Must be a valid URL');
            }
          }
        }
      }
    },
    chapter_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'course_tests',
        key: 'id'
      }
    }
  }, {
    tableName: 'course_chapters',
    indexes: [
      {
        fields: ['course_id']
      },
      {
        fields: ['chapter_order']
      },
      {
        fields: ['is_published']
      },
      {
        fields: ['course_id', 'chapter_order']
      },
      {
        fields: ['test_id']
      }
    ],
    hooks: {
      beforeValidate: (chapter) => {
        // Validate that at least one content type is provided (video, PDF, or test)
        if (!chapter.video_url && !chapter.pdf_url && !chapter.test_id) {
          throw new Error('At least one content type (video, PDF, or test) is required');
        }
      }
    }
  });

  // Instance methods
  CourseChapter.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  CourseChapter.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      video_url: this.video_url,
      pdf_url: this.pdf_url,
      chapter_order: this.chapter_order,
      duration_minutes: this.duration_minutes,
      is_published: this.is_published,
      test_id: this.test_id,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  CourseChapter.prototype.hasVideo = function() {
    return !!this.video_url;
  };

  CourseChapter.prototype.hasPdf = function() {
    return !!this.pdf_url;
  };

  CourseChapter.prototype.hasTest = function() {
    return !!this.test_id;
  };

  CourseChapter.prototype.getVideoUrl = function() {
    return this.video_url;
  };

  CourseChapter.prototype.getPdfUrl = function() {
    return this.pdf_url;
  };

  CourseChapter.prototype.getDurationFormatted = function() {
    if (!this.duration_minutes) return null;
    
    const hours = Math.floor(this.duration_minutes / 60);
    const minutes = this.duration_minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Class methods
  CourseChapter.findByCourse = function(courseId) {
    return this.findAll({
      where: { course_id: courseId },
      order: [['chapter_order', 'ASC']]
    });
  };

  CourseChapter.findPublishedByCourse = function(courseId) {
    return this.findAll({
      where: { 
        course_id: courseId,
        is_published: true 
      },
      order: [['chapter_order', 'ASC']]
    });
  };


  CourseChapter.getNextOrder = async function(courseId) {
    const lastChapter = await this.findOne({
      where: { course_id: courseId },
      order: [['chapter_order', 'DESC']]
    });
    
    return lastChapter ? lastChapter.chapter_order + 1 : 1;
  };

  CourseChapter.reorderChapters = async function(courseId, chapterOrders) {
    const transaction = await sequelize.transaction();
    
    try {
      for (const { id, chapter_order } of chapterOrders) {
        await this.update(
          { chapter_order },
          { 
            where: { id, course_id: courseId },
            transaction 
          }
        );
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  return CourseChapter;
};
