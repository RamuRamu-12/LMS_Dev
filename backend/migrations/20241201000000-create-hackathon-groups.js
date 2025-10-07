const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add max_groups column to hackathons table
    await queryInterface.addColumn('hackathons', 'max_groups', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum number of groups allowed'
    });

    // Create hackathon_groups table
    await queryInterface.createTable('hackathon_groups', {
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
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
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes for hackathon_groups
    await queryInterface.addIndex('hackathon_groups', ['hackathon_id']);
    await queryInterface.addIndex('hackathon_groups', ['name']);
    await queryInterface.addIndex('hackathon_groups', ['is_active']);
    await queryInterface.addIndex('hackathon_groups', ['created_by']);
    
    // Create unique constraint for hackathon_id + name
    await queryInterface.addIndex('hackathon_groups', ['hackathon_id', 'name'], {
      unique: true,
      name: 'unique_hackathon_group_name'
    });

    // Create hackathon_group_members table
    await queryInterface.createTable('hackathon_group_members', {
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
        defaultValue: Sequelize.NOW
      },
      is_leader: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
        }
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes for hackathon_group_members
    await queryInterface.addIndex('hackathon_group_members', ['group_id']);
    await queryInterface.addIndex('hackathon_group_members', ['student_id']);
    await queryInterface.addIndex('hackathon_group_members', ['status']);
    await queryInterface.addIndex('hackathon_group_members', ['is_leader']);
    
    // Create unique constraint for group_id + student_id
    await queryInterface.addIndex('hackathon_group_members', ['group_id', 'student_id'], {
      unique: true,
      name: 'unique_group_student'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('hackathon_group_members');
    await queryInterface.dropTable('hackathon_groups');
    
    // Remove max_groups column from hackathons table
    await queryInterface.removeColumn('hackathons', 'max_groups');
  }
};
