'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to hackathons table if they don't exist
    try {
      await queryInterface.addColumn('hackathons', 'max_groups', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Maximum number of groups allowed'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('max_groups column already exists or error:', error.message);
      }
    }

    try {
      await queryInterface.addColumn('hackathons', 'is_temp', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Flag to identify temporary hackathons for group management'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('is_temp column already exists or error:', error.message);
      }
    }

    // Check if hackathon_group_members table exists and has required columns
    const [tableExists] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'hackathon_group_members'
    `);

    if (tableExists.length === 0) {
      // Create hackathon_group_members table if it doesn't exist
      await queryInterface.createTable('hackathon_group_members', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        group_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'hackathon_groups',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        student_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        joined_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        is_leader: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        status: {
          type: Sequelize.ENUM('active', 'inactive', 'removed'),
          allowNull: false,
          defaultValue: 'active'
        },
        added_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
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
        name: 'unique_hackathon_group_member_student'
      });
    } else {
      // Table exists, check and add missing columns
      const [columns] = await queryInterface.sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'hackathon_group_members'
      `);
      
      const columnNames = columns.map(col => col.column_name);

      if (!columnNames.includes('joined_at')) {
        await queryInterface.addColumn('hackathon_group_members', 'joined_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        });
      }

      if (!columnNames.includes('is_leader')) {
        await queryInterface.addColumn('hackathon_group_members', 'is_leader', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        });
      }

      if (!columnNames.includes('status')) {
        await queryInterface.addColumn('hackathon_group_members', 'status', {
          type: Sequelize.ENUM('active', 'inactive', 'removed'),
          allowNull: false,
          defaultValue: 'active'
        });
      }

      if (!columnNames.includes('added_by')) {
        await queryInterface.addColumn('hackathon_group_members', 'added_by', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the columns we added
    try {
      await queryInterface.removeColumn('hackathons', 'max_groups');
    } catch (error) {
      // Column may not exist
    }

    try {
      await queryInterface.removeColumn('hackathons', 'is_temp');
    } catch (error) {
      // Column may not exist
    }
  }
};
