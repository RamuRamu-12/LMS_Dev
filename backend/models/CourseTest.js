const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const CourseTest = sequelize.define('CourseTest', {
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
    passing_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 70,
      validate: {
        min: 0,
        max: 100
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'course_tests',
    indexes: [
      {
        fields: ['course_id']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['created_by']
      }
    ]
  });

  // Instance methods
  CourseTest.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  CourseTest.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      course_id: this.course_id,
      title: this.title,
      description: this.description,
      passing_score: this.passing_score,
      is_active: this.is_active,
      instructions: this.instructions,
      order: this.order,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  CourseTest.prototype.activate = function() {
    this.is_active = true;
    return this.save();
  };

  CourseTest.prototype.deactivate = function() {
    this.is_active = false;
    return this.save();
  };

  // Class methods
  CourseTest.findByCourse = function(courseId) {
    return this.findAll({
      where: { course_id: courseId },
      order: [['order', 'ASC']]
    });
  };

  CourseTest.findActiveByCourse = function(courseId) {
    return this.findAll({
      where: { 
        course_id: courseId,
        is_active: true 
      },
      order: [['order', 'ASC']]
    });
  };

  return CourseTest;
};
