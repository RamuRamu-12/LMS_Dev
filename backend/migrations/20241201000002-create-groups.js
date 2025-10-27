const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create groups table (with error handling)
    try {
    await queryInterface.createTable('groups', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      max_members: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      current_members: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    console.log('✅ Created groups table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Groups table already exists, skipping creation');
      } else {
        throw error;
      }
    }

    // Create group_members table (with error handling)
    try {
    await queryInterface.createTable('group_members', {
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      is_leader: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
        }
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    console.log('✅ Created group_members table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Group_members table already exists, skipping creation');
      } else {
        throw error;
      }
    }

    // Add unique constraint for group_id and student_id (with error handling)
    try {
    await queryInterface.addConstraint('group_members', {
      fields: ['group_id', 'student_id'],
      type: 'unique',
      name: 'unique_group_student'
    });
    console.log('✅ Added unique constraint to group_members');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('⚠️  Unique constraint on group_members already exists, skipping');
      } else {
        throw error;
      }
    }

    // Add group_id column to hackathon_groups table to link to standalone groups (with error handling)
    try {
      await queryInterface.addColumn('hackathon_groups', 'group_id', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      console.log('✅ Added group_id column to hackathon_groups table');
    } catch (error) {
      if (error.message.includes('duplicate column') || error.message.includes('already exists')) {
        console.log('⚠️  Column group_id already exists in hackathon_groups table, skipping');
      } else {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('hackathon_groups', 'group_id');
    } catch (error) {
      // Column may not exist
    }
  }
};
