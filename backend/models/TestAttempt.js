const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const TestAttempt = sequelize.define('TestAttempt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_tests',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    attempt_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    earned_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    time_taken_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
      allowNull: false,
      defaultValue: 'in_progress'
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'test_attempts',
    indexes: [
      {
        fields: ['test_id']
      },
      {
        fields: ['student_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['started_at']
      },
      {
        fields: ['test_id', 'student_id']
      }
    ]
  });

  // Instance methods
  TestAttempt.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  TestAttempt.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      test_id: this.test_id,
      student_id: this.student_id,
      attempt_number: this.attempt_number,
      score: this.score,
      total_points: this.total_points,
      earned_points: this.earned_points,
      time_taken_minutes: this.time_taken_minutes,
      status: this.status,
      started_at: this.started_at,
      completed_at: this.completed_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  TestAttempt.prototype.isPassed = function(passingScore) {
    return this.score >= passingScore;
  };

  TestAttempt.prototype.complete = function() {
    this.status = 'completed';
    this.completed_at = new Date();
    return this.save();
  };

  // Class methods
  TestAttempt.findByStudentAndTest = function(studentId, testId) {
    return this.findAll({
      where: { 
        student_id: studentId,
        test_id: testId 
      },
      order: [['attempt_number', 'DESC']]
    });
  };

  TestAttempt.getLatestAttempt = function(studentId, testId) {
    return this.findOne({
      where: { 
        student_id: studentId,
        test_id: testId 
      },
      order: [['attempt_number', 'DESC']]
    });
  };

  TestAttempt.getNextAttemptNumber = async function(studentId, testId) {
    const lastAttempt = await this.findOne({
      where: { 
        student_id: studentId,
        test_id: testId 
      },
      order: [['attempt_number', 'DESC']]
    });
    
    return lastAttempt ? lastAttempt.attempt_number + 1 : 1;
  };

  return TestAttempt;
};
