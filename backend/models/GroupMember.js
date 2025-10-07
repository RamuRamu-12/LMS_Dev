const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const GroupMember = sequelize.define('GroupMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    is_leader: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this student is the leader of the group'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      allowNull: false,
      defaultValue: 'active'
    },
    added_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who added this student to the group'
    }
  }, {
    tableName: 'group_members',
    timestamps: true,
    indexes: [
      {
        fields: ['group_id']
      },
      {
        fields: ['student_id']
      },
      {
        fields: ['is_leader']
      },
      {
        unique: true,
        fields: ['group_id', 'student_id'],
        name: 'unique_group_student'
      }
    ]
  });

  GroupMember.associate = (models) => {
    GroupMember.belongsTo(models.Group, {
      foreignKey: 'group_id',
      as: 'group'
    });
    GroupMember.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student'
    });
    GroupMember.belongsTo(models.User, {
      foreignKey: 'added_by',
      as: 'addedBy'
    });
  };

  return GroupMember;
};
