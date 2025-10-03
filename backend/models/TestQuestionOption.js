const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const TestQuestionOption = sequelize.define('TestQuestionOption', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test_questions',
        key: 'id'
      }
    },
    option_text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'test_question_options',
    indexes: [
      {
        fields: ['question_id']
      },
      {
        fields: ['is_correct']
      },
      {
        fields: ['order']
      }
    ]
  });

  // Instance methods
  TestQuestionOption.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  TestQuestionOption.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      question_id: this.question_id,
      option_text: this.option_text,
      is_correct: this.is_correct,
      order: this.order,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  // Class methods
  TestQuestionOption.findByQuestion = function(questionId) {
    return this.findAll({
      where: { question_id: questionId },
      order: [['order', 'ASC']]
    });
  };

  TestQuestionOption.findCorrectOption = function(questionId) {
    return this.findOne({
      where: { 
        question_id: questionId,
        is_correct: true 
      }
    });
  };

  return TestQuestionOption;
};
