const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ChatParticipant = sequelize.define('ChatParticipant', {
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
      allowNull: false,
      references: {
        model: 'hackathon_groups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    user_id: {
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
    last_read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of last read message'
    },
    last_activity_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time user was active in chat'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_muted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether user has muted notifications for this chat'
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Current online status'
    },
    unread_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of unread messages'
    },
    role: {
      type: DataTypes.ENUM('member', 'moderator', 'admin'),
      allowNull: false,
      defaultValue: 'member',
      comment: 'User role in this chat'
    }
  }, {
    tableName: 'chat_participants',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['hackathon_id', 'group_id', 'user_id'],
        name: 'unique_chat_participant'
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['is_online']
      }
    ]
  });

  ChatParticipant.associate = (models) => {
    ChatParticipant.belongsTo(models.Hackathon, {
      foreignKey: 'hackathon_id',
      as: 'hackathon'
    });
    ChatParticipant.belongsTo(models.HackathonGroup, {
      foreignKey: 'group_id',
      as: 'group'
    });
    ChatParticipant.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return ChatParticipant;
};
