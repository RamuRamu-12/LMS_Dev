const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define('ChatMessage', {
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 2000]
      }
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'file', 'system'),
      allowNull: false,
      defaultValue: 'text'
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL for uploaded files or images'
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Original filename for uploaded files'
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'File size in bytes'
    },
    reply_to_message_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'chat_messages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID of message this is replying to'
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who deleted the message (for moderation)'
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    edited_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'chat_messages',
    timestamps: true,
    indexes: [
      {
        fields: ['hackathon_id', 'group_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['is_deleted']
      }
    ]
  });

  ChatMessage.associate = (models) => {
    ChatMessage.belongsTo(models.Hackathon, {
      foreignKey: 'hackathon_id',
      as: 'hackathon'
    });
    ChatMessage.belongsTo(models.HackathonGroup, {
      foreignKey: 'group_id',
      as: 'group'
    });
    ChatMessage.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    ChatMessage.belongsTo(models.User, {
      foreignKey: 'deleted_by',
      as: 'deletedBy'
    });
    ChatMessage.belongsTo(models.ChatMessage, {
      foreignKey: 'reply_to_message_id',
      as: 'replyToMessage'
    });
    ChatMessage.hasMany(models.ChatMessage, {
      foreignKey: 'reply_to_message_id',
      as: 'replies'
    });
  };

  return ChatMessage;
};
