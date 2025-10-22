const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const TestQuestion = sequelize.define('TestQuestion', {
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
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    question_type: {
      type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer'),
      allowNull: false,
      defaultValue: 'multiple_choice'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    tableName: 'test_questions',
    indexes: [
      {
        fields: ['test_id']
      },
      {
        fields: ['is_active']
      },
    ]
  });

  // Instance methods
  TestQuestion.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  TestQuestion.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      test_id: this.test_id,
      question_text: this.question_text,
      question_type: this.question_type,
      points: this.points,
      order: this.order,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  // Class methods
  TestQuestion.findByTest = function(testId) {
    return this.findAll({
      where: { test_id: testId },
      order: [['order', 'ASC']]
    });
  };

  TestQuestion.findActiveByTest = function(testId) {
    return this.findAll({
      where: { 
        test_id: testId,
        is_active: true 
      },
      order: [['order', 'ASC']]
    });
  };

  return TestQuestion;
};
