const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const HackathonGroup = sequelize.define('HackathonGroup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    hackathon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'hackathons',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'groups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to standalone group if this hackathon group was created from a standalone group'
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
      allowNull: true,
      comment: 'Optional description for the group'
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
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the group is active and accepting members'
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
    tableName: 'hackathon_groups',
    timestamps: true,
    indexes: [
      {
        fields: ['hackathon_id']
      },
      {
        fields: ['name']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['created_by']
      },
      {
        unique: true,
        fields: ['hackathon_id', 'name'],
        name: 'unique_hackathon_group_name'
      }
    ]
  });

  // Define associations
  HackathonGroup.associate = (models) => {
    // HackathonGroup belongs to Hackathon
    HackathonGroup.belongsTo(models.Hackathon, {
      foreignKey: 'hackathon_id',
      as: 'hackathon'
    });

    // HackathonGroup belongs to Group (if created from standalone group)
    HackathonGroup.belongsTo(models.Group, {
      foreignKey: 'group_id',
      as: 'group'
    });

    // HackathonGroup belongs to User (creator)
    HackathonGroup.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    // HackathonGroup has many HackathonGroupMembers (many-to-many with Users)
    HackathonGroup.belongsToMany(models.User, {
      through: 'hackathon_group_members',
      foreignKey: 'group_id',
      otherKey: 'student_id',
      as: 'members'
    });

    // HackathonGroup has many HackathonGroupMembers
    HackathonGroup.hasMany(models.HackathonGroupMember, {
      foreignKey: 'group_id',
      as: 'groupMembers'
    });
  };

  // Instance methods
  HackathonGroup.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  HackathonGroup.prototype.addMember = function(studentId) {
    return this.addMember(studentId);
  };

  HackathonGroup.prototype.removeMember = function(studentId) {
    return this.removeMember(studentId);
  };

  HackathonGroup.prototype.updateMemberCount = async function() {
    const count = await this.countMembers();
    this.current_members = count;
    return this.save();
  };

  // Class methods
  HackathonGroup.findByHackathon = function(hackathonId) {
    return this.findAll({
      where: { hackathon_id: hackathonId },
      include: [
        {
          model: require('../models').User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: require('../models').User,
          as: 'members',
          attributes: ['id', 'name', 'email'],
          through: {
            attributes: ['joined_at', 'is_leader']
          }
        }
      ],
      order: [['created_at', 'ASC']]
    });
  };

  return HackathonGroup;
};
