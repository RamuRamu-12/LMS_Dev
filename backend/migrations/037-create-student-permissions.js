'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      courses: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Access to courses - enabled by default for all students'
      },
      hackathons: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Access to hackathons - requires admin permission'
      },
      realtime_projects: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Access to realtime projects - requires admin permission'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('student_permissions', ['student_id'], {
      unique: true,
      name: 'student_permissions_student_id_unique'
    });

    await queryInterface.addIndex('student_permissions', ['courses'], {
      name: 'student_permissions_courses_idx'
    });

    await queryInterface.addIndex('student_permissions', ['hackathons'], {
      name: 'student_permissions_hackathons_idx'
    });

    await queryInterface.addIndex('student_permissions', ['realtime_projects'], {
      name: 'student_permissions_realtime_projects_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
