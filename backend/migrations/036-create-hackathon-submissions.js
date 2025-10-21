'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const [tableExists] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'hackathon_submissions' AND table_schema = 'public'
    `);

    if (tableExists.length > 0) {
      console.log('Hackathon_submissions table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('hackathon_submissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      hackathon_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'hackathons',
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
      project_title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      project_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      github_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      live_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      demo_video_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      presentation_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      documentation_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      additional_files_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      submission_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'under_review', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'draft'
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      review_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      is_winner: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      prize: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ranking: {
        type: Sequelize.INTEGER,
        allowNull: true
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

    // Add indexes (with error handling for existing indexes)
    const indexes = [
      { columns: ['hackathon_id'], name: 'hackathon_submissions_hackathon_id' },
      { columns: ['student_id'], name: 'hackathon_submissions_student_id' },
      { columns: ['status'], name: 'hackathon_submissions_status' },
      { columns: ['submitted_at'], name: 'hackathon_submissions_submitted_at' },
      { columns: ['is_winner'], name: 'hackathon_submissions_is_winner' },
      { columns: ['ranking'], name: 'hackathon_submissions_ranking' }
    ];

    for (const index of indexes) {
      try {
        // Check if index already exists
        const [indexExists] = await queryInterface.sequelize.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE indexname = '${index.name}' AND tablename = 'hackathon_submissions'
        `);
        
        if (indexExists.length === 0) {
          await queryInterface.addIndex('hackathon_submissions', index.columns, { name: index.name });
          console.log(`Created index: ${index.name}`);
        } else {
          console.log(`Index ${index.name} already exists, skipping`);
        }
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
        console.log(`Index ${index.name} already exists, skipping`);
      }
    }
    
    // Add unique constraint (with error handling)
    try {
      const [uniqueIndexExists] = await queryInterface.sequelize.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE indexname = 'unique_hackathon_student_submission' AND tablename = 'hackathon_submissions'
      `);
      
      if (uniqueIndexExists.length === 0) {
        await queryInterface.addIndex('hackathon_submissions', {
          fields: ['hackathon_id', 'student_id'],
          unique: true,
          name: 'unique_hackathon_student_submission'
        });
        console.log('Created unique constraint: unique_hackathon_student_submission');
      } else {
        console.log('Unique constraint unique_hackathon_student_submission already exists, skipping');
      }
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Unique constraint unique_hackathon_student_submission already exists, skipping');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
