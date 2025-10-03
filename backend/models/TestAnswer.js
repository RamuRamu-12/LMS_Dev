const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const TestAnswer = sequelize.define('TestAnswer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    attempt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test_attempts',
        key: 'id'
      }
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test_questions',
        key: 'id'
      }
    },
    answer_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    points_earned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'test_answers',
    indexes: [
      {
        fields: ['attempt_id']
      },
      {
        fields: ['question_id']
      },
      {
        fields: ['is_correct']
      },
      {
        fields: ['attempt_id', 'question_id']
      }
    ]
  });

  // Instance methods
  TestAnswer.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  TestAnswer.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      attempt_id: this.attempt_id,
      question_id: this.question_id,
      answer_text: this.answer_text,
      is_correct: this.is_correct,
      points_earned: this.points_earned,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  // Class methods
  TestAnswer.findByAttempt = function(attemptId) {
    return this.findAll({
      where: { attempt_id: attemptId },
      order: [['created_at', 'ASC']]
    });
  };

  TestAnswer.findByAttemptAndQuestion = function(attemptId, questionId) {
    return this.findOne({
      where: { 
        attempt_id: attemptId,
        question_id: questionId 
      }
    });
  };

  return TestAnswer;
};
