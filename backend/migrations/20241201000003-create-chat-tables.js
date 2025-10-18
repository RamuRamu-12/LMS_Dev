const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create chat_messages table
    await queryInterface.createTable('chat_messages', {
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
        allowNull: false
      },
      message_type: {
        type: DataTypes.ENUM('text', 'image', 'file', 'system'),
        allowNull: false,
        defaultValue: 'text'
      },
      file_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      reply_to_message_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'chat_messages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
        onDelete: 'SET NULL'
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
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Create chat_participants table
    await queryInterface.createTable('chat_participants', {
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
        allowNull: true
      },
      last_activity_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      is_muted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_online: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      unread_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      role: {
        type: DataTypes.ENUM('member', 'moderator', 'admin'),
        allowNull: false,
        defaultValue: 'member'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Add indexes for chat_messages
    try {
      await queryInterface.addIndex('chat_messages', ['hackathon_id', 'group_id']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('chat_messages', ['user_id']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('chat_messages', ['created_at']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('chat_messages', ['is_deleted']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    // Add indexes for chat_participants
    try {
      await queryInterface.addIndex('chat_participants', ['user_id']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('chat_participants', ['is_active']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('chat_participants', ['is_online']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    // Add unique constraint for chat_participants
    try {
      await queryInterface.addConstraint('chat_participants', {
        fields: ['hackathon_id', 'group_id', 'user_id'],
        type: 'unique',
        name: 'unique_chat_participant'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
