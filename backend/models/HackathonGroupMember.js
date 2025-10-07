const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const HackathonGroupMember = sequelize.define('HackathonGroupMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'hackathon_groups',
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
      comment: 'Whether this member is the group leader'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'removed'),
      allowNull: false,
      defaultValue: 'active'
    },
    added_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Admin who added this member to the group'
    }
  }, {
    tableName: 'hackathon_group_members',
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
  HackathonGroupMember.associate = (models) => {
    // HackathonGroupMember belongs to HackathonGroup
    HackathonGroupMember.belongsTo(models.HackathonGroup, {
      foreignKey: 'group_id',
      as: 'group'
    });

    // HackathonGroupMember belongs to User (student)
    HackathonGroupMember.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student'
    });

    // HackathonGroupMember belongs to User (added by admin)
    HackathonGroupMember.belongsTo(models.User, {
      foreignKey: 'added_by',
      as: 'addedBy'
    });
  };

  // Instance methods
  HackathonGroupMember.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  HackathonGroupMember.prototype.makeLeader = function() {
    this.is_leader = true;
    return this.save();
  };

  HackathonGroupMember.prototype.removeLeader = function() {
    this.is_leader = false;
    return this.save();
  };

  HackathonGroupMember.prototype.deactivate = function() {
    this.status = 'inactive';
    return this.save();
  };

  HackathonGroupMember.prototype.remove = function() {
    this.status = 'removed';
    return this.save();
  };

  // Class methods
  HackathonGroupMember.findByGroup = function(groupId) {
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

  HackathonGroupMember.findByStudent = function(studentId) {
    return this.findAll({
      where: { 
        student_id: studentId,
        status: 'active'
      },
      include: [
        {
          model: require('../models').HackathonGroup,
          as: 'group',
          attributes: ['id', 'name', 'description', 'hackathon_id'],
          include: [
            {
              model: require('../models').Hackathon,
              as: 'hackathon',
              attributes: ['id', 'name', 'start_date', 'end_date', 'status']
            }
          ]
        }
      ],
      order: [['joined_at', 'DESC']]
    });
  };

  HackathonGroupMember.findLeadersByGroup = function(groupId) {
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

  return HackathonGroupMember;
};
