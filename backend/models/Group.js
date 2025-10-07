const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    max_members: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum number of members allowed in this group'
    },
    current_members: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Current number of members in this group'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'groups',
    timestamps: true,
    indexes: [
      {
        fields: ['created_by']
      },
      {
        unique: true,
        fields: ['name'],
        name: 'unique_group_name'
      }
    ]
  });

  Group.associate = (models) => {
    Group.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    Group.belongsToMany(models.User, {
      through: models.GroupMember,
      foreignKey: 'group_id',
      otherKey: 'student_id',
      as: 'members'
    });
    Group.belongsToMany(models.Hackathon, {
      through: models.HackathonGroup,
      foreignKey: 'group_id',
      otherKey: 'hackathon_id',
      as: 'hackathons'
    });
  };

  return Group;
};
