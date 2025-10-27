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
      defaultValue: DataTypes.NOW,
      comment: 'When the student joined the group'
    },
    is_leader: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this member is the group leader'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Status of the member in the group'
    },
    added_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who added this member to the group'
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
        fields: ['status']
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

  // Define associations
  GroupMember.associate = (models) => {
    // GroupMember belongs to Group
    GroupMember.belongsTo(models.Group, {
      foreignKey: 'group_id',
      as: 'group'
    });

    // GroupMember belongs to User (student)
    GroupMember.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student'
    });

    // GroupMember belongs to User (added by)
    GroupMember.belongsTo(models.User, {
      foreignKey: 'added_by',
      as: 'addedBy'
    });
  };

  // Instance methods
  GroupMember.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  GroupMember.prototype.makeLeader = function() {
    this.is_leader = true;
    return this.save();
  };

  GroupMember.prototype.removeLeader = function() {
    this.is_leader = false;
    return this.save();
  };

  GroupMember.prototype.deactivate = function() {
    this.status = 'inactive';
    return this.save();
  };

  GroupMember.prototype.activate = function() {
    this.status = 'active';
    return this.save();
  };

  GroupMember.prototype.setPending = function() {
    this.status = 'pending';
    return this.save();
  };

  // Class methods
  GroupMember.findByGroup = function(groupId) {
    return this.findAll({
      where: { 
        group_id: groupId,
        status: 'active'
      },
      include: [
        {
          model: require('../models').User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'profile_picture']
        },
        {
          model: require('../models').User,
          as: 'addedBy',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['is_leader', 'DESC'], ['joined_at', 'ASC']]
    });
  };

  GroupMember.findByStudent = function(studentId) {
    return this.findAll({
      where: { 
        student_id: studentId,
        status: 'active'
      },
      include: [
        {
          model: require('../models').Group,
          as: 'group',
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['joined_at', 'DESC']]
    });
  };

  GroupMember.findLeadersByGroup = function(groupId) {
    return this.findAll({
      where: { 
        group_id: groupId,
        is_leader: true,
        status: 'active'
      },
      include: [
        {
          model: require('../models').User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
  };

  return GroupMember;
};
