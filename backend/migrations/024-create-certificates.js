'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const [tableExists] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'certificates' AND table_schema = 'public'
    `);

    if (tableExists.length > 0) {
      console.log('Certificates table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('certificates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      test_attempt_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'test_attempts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      certificate_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      issued_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      certificate_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      verification_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      is_valid: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('certificates', ['student_id']);
    await queryInterface.addIndex('certificates', ['course_id']);
    await queryInterface.addIndex('certificates', ['test_attempt_id']);
    await queryInterface.addIndex('certificates', ['certificate_number']);
    await queryInterface.addIndex('certificates', ['verification_code']);
    await queryInterface.addIndex('certificates', ['is_valid']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('certificates');
  }
};
