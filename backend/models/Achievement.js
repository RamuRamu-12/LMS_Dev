const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Achievement = sequelize.define('Achievement', {
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
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    achievement_type: {
      type: DataTypes.ENUM(
        'course_completion',
        'test_passing',
        'streak_master',
        'top_performer',
        'first_course',
        'perfect_score'
      ),
      allowNull: false,
      defaultValue: 'course_completion'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: '🎓'
    },
    certificate_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    certificate_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    points_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_unlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    unlocked_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'achievements',
    indexes: [
      {
        fields: ['student_id']
      },
      {
        fields: ['course_id']
      },
      {
        fields: ['achievement_type']
      },
      {
        fields: ['is_unlocked']
      },
      {
        fields: ['student_id', 'achievement_type']
      }
    ]
  });

  // Instance methods
  Achievement.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  Achievement.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      achievement_type: this.achievement_type,
      title: this.title,
      description: this.description,
      icon: this.icon,
      certificate_url: this.certificate_url,
      points_earned: this.points_earned,
      is_unlocked: this.is_unlocked,
      unlocked_at: this.unlocked_at,
      metadata: this.metadata
    };
  };

  // Class methods
  Achievement.createCourseCompletionAchievement = async function(studentId, courseId, courseData) {
    const existingAchievement = await this.findOne({
      where: {
        student_id: studentId,
        course_id: courseId,
        achievement_type: 'course_completion'
      }
    });

    if (existingAchievement) {
      return existingAchievement;
    }

    // Generate certificate data
    const certificateData = {
      studentName: courseData.studentName,
      courseTitle: courseData.courseTitle,
      completionDate: new Date().toISOString(),
      certificateId: `CERT-${studentId}-${courseId}-${Date.now()}`,
      issuedBy: 'GNANAM AI Learning Platform',
      courseDuration: courseData.courseDuration || 'Self-paced',
      courseCategory: courseData.courseCategory || 'General'
    };

    return this.create({
      student_id: studentId,
      course_id: courseId,
      achievement_type: 'course_completion',
      title: `${courseData.courseTitle} Certificate`,
      description: `Certificate of completion for ${courseData.courseTitle}`,
      icon: '🎓',
      certificate_data: certificateData,
      points_earned: 100,
      is_unlocked: true,
      unlocked_at: new Date(),
      metadata: {
        courseTitle: courseData.courseTitle,
        courseCategory: courseData.courseCategory,
        completionDate: certificateData.completionDate
      }
    });
  };

  Achievement.getStudentAchievements = function(studentId) {
    return this.findAll({
      where: { student_id: studentId },
      order: [['unlocked_at', 'DESC']]
    });
  };

  Achievement.getUnlockedAchievements = function(studentId) {
    return this.findAll({
      where: { 
        student_id: studentId,
        is_unlocked: true 
      },
      order: [['unlocked_at', 'DESC']]
    });
  };

  Achievement.getAchievementStats = function(studentId) {
    return this.findAll({
      where: { student_id: studentId },
      attributes: [
        'achievement_type',
        [Achievement.sequelize.fn('COUNT', Achievement.sequelize.col('id')), 'count']
      ],
      group: ['achievement_type']
    });
  };

  return Achievement;
};
