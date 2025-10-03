const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    activity_type: {
      type: DataTypes.ENUM(
        'enrollment',
        'chapter_completed',
        'course_completed',
        'test_attempted',
        'test_passed',
        'certificate_earned',
        'achievement_unlocked'
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    chapter_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'course_chapters',
        key: 'id'
      }
    },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'course_tests',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    points_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'activity_logs',
    indexes: [
      {
        fields: ['student_id']
      },
      {
        fields: ['activity_type']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['student_id', 'created_at']
      }
    ]
  });

  // Instance methods
  ActivityLog.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  ActivityLog.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      activity_type: this.activity_type,
      title: this.title,
      description: this.description,
      course_id: this.course_id,
      chapter_id: this.chapter_id,
      test_id: this.test_id,
      metadata: this.metadata,
      points_earned: this.points_earned,
      created_at: this.created_at
    };
  };

  // Class methods
  ActivityLog.createActivity = async function(studentId, activityType, title, description, options = {}) {
    return this.create({
      student_id: studentId,
      activity_type: activityType,
      title,
      description,
      course_id: options.courseId || null,
      chapter_id: options.chapterId || null,
      test_id: options.testId || null,
      metadata: options.metadata || {},
      points_earned: options.pointsEarned || 0
    });
  };

  ActivityLog.getStudentActivities = function(studentId, limit = 10) {
    return this.findAll({
      where: { student_id: studentId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });
  };

  return ActivityLog;
};
