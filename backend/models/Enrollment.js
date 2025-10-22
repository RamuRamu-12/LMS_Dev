const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define('Enrollment', {
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
    enrolled_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('enrolled', 'completed', 'dropped'),
      defaultValue: 'enrolled'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    last_accessed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    time_spent: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  }, {
    tableName: 'enrollments',
    indexes: [
      {
        fields: ['student_id']
      },
      {
        fields: ['course_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['enrolled_at']
      },
      {
        fields: ['progress']
      },
      {
        unique: true,
        fields: ['student_id', 'course_id']
      }
    ],
    hooks: {
      beforeUpdate: (enrollment) => {
        // Update last_accessed_at when progress changes
        if (enrollment.changed('progress') || enrollment.changed('status')) {
          enrollment.last_accessed_at = new Date();
        }

        // Set completed_at when status changes to completed
        if (enrollment.changed('status') && enrollment.status === 'completed' && !enrollment.completed_at) {
          enrollment.completed_at = new Date();
          enrollment.progress = 100;
        }

      }
    }
  });

  // Instance methods
  Enrollment.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  Enrollment.prototype.updateProgress = function(progress) {
    this.progress = Math.min(Math.max(progress, 0), 100);
    
    if (this.progress >= 100) {
      this.status = 'completed';
      this.completed_at = new Date();
    } else if (this.progress > 0) {
      // Use 'enrolled' instead of 'in-progress' if the enum doesn't support it
      this.status = 'enrolled';
    }
    
    return this.save();
  };

  Enrollment.prototype.addTimeSpent = function(minutes) {
    this.time_spent += minutes;
    return this.save();
  };

  Enrollment.prototype.complete = function() {
    this.status = 'completed';
    this.progress = 100;
    this.completed_at = new Date();
    return this.save();
  };

  Enrollment.prototype.drop = function() {
    this.status = 'dropped';
    return this.save();
  };

  Enrollment.prototype.rate = function(rating, review = null) {
    this.rating = rating;
    this.review = review;
    return this.save();
  };

  // Class methods
  Enrollment.findByStudent = function(studentId) {
    return this.findAll({
      where: { student_id: studentId },
      order: [['enrolled_at', 'DESC']]
    });
  };

  Enrollment.findByCourse = function(courseId) {
    return this.findAll({
      where: { course_id: courseId },
      order: [['enrolled_at', 'DESC']]
    });
  };

  Enrollment.findActive = function(studentId) {
    return this.findAll({
      where: { 
        student_id: studentId,
        status: ['enrolled', 'in-progress']
      },
      order: [['last_accessed_at', 'DESC']]
    });
  };

  Enrollment.findCompleted = function(studentId) {
    return this.findAll({
      where: { 
        student_id: studentId,
        status: 'completed'
      },
      order: [['completed_at', 'DESC']]
    });
  };

  Enrollment.getStats = function(studentId) {
    return this.findAll({
      where: { student_id: studentId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('progress')), 'avg_progress'],
        [sequelize.fn('SUM', sequelize.col('time_spent')), 'total_time']
      ],
      group: ['status']
    });
  };

  Enrollment.checkEnrollment = function(studentId, courseId) {
    return this.findOne({
      where: { student_id: studentId, course_id: courseId }
    });
  };

  return Enrollment;
};
