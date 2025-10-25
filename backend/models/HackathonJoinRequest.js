const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const HackathonJoinRequest = sequelize.define('HackathonJoinRequest', {
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
      }
    },
    team_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    team_members: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidTeamMembers(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('Team members must be a non-empty array');
          }
          for (const member of value) {
            if (!member.name || !member.email) {
              throw new Error('Each team member must have name and email');
            }
          }
        }
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    review_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'hackathon_join_requests',
    timestamps: true,
    indexes: [
      {
        fields: ['hackathon_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Define associations
  HackathonJoinRequest.associate = (models) => {
    // Join request belongs to Hackathon
    HackathonJoinRequest.belongsTo(models.Hackathon, {
      foreignKey: 'hackathon_id',
      as: 'hackathon'
    });

    // Join request belongs to User (reviewer)
    HackathonJoinRequest.belongsTo(models.User, {
      foreignKey: 'reviewed_by',
      as: 'reviewer'
    });
  };

  // Instance methods
  HackathonJoinRequest.prototype.approve = function(reviewerId, notes = null) {
    this.status = 'approved';
    this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
    this.review_notes = notes;
    return this.save();
  };

  HackathonJoinRequest.prototype.reject = function(reviewerId, notes = null) {
    this.status = 'rejected';
    this.reviewed_by = reviewerId;
    this.reviewed_at = new Date();
    this.review_notes = notes;
    return this.save();
  };

  // Class methods
  HackathonJoinRequest.findByHackathon = function(hackathonId) {
    return this.findAll({
      where: { hackathon_id: hackathonId },
      order: [['created_at', 'DESC']]
    });
  };

  HackathonJoinRequest.findPending = function() {
    return this.findAll({
      where: { status: 'pending' },
      order: [['created_at', 'DESC']]
    });
  };

  return HackathonJoinRequest;
};
