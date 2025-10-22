'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create hackathons table (with error handling)
    try {
      await queryInterface.createTable('hackathons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      logo: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL to hackathon logo image'
      },
      technology: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Primary technology for the hackathon'
      },
      tech_stack: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of technologies in the tech stack'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Hackathon start date'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Hackathon end date'
      },
      status: {
        type: Sequelize.ENUM('upcoming', 'active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'upcoming'
      },
      difficulty: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull: false,
        defaultValue: 'intermediate'
      },
      max_groups: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Maximum number of groups allowed'
      },
      current_participants: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Current number of participants'
      },
      is_temp: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Flag to identify temporary hackathons for group management'
      },
      prize_description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Description of prizes for winners'
      },
      rules: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Hackathon rules and guidelines'
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Project requirements and deliverables'
      },
      video_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Hackathon promotional video URL (Drive link)'
      },
      pdf_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Hackathon details PDF URL (Drive link)'
      },
      multimedia_uploads: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Metadata for multimedia uploads (upload dates, file sizes, etc.)'
      },
      multimedia_last_updated: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last time multimedia content was updated'
      },
      multimedia_uploaded_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User who uploaded the multimedia content'
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Hackathons table already exists, skipping creation');
    }

    // Create indexes for hackathons table (with error handling)
    try {
      await queryInterface.addIndex('hackathons', ['status']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('hackathons', ['difficulty']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('hackathons', ['start_date']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('hackathons', ['end_date']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('hackathons', ['is_published']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('hackathons', ['created_by']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    // Create hackathon_participants table (with error handling)
    try {
      await queryInterface.createTable('hackathon_participants', {
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
      enrolled_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('enrolled', 'active', 'submitted', 'completed', 'disqualified'),
        allowNull: false,
        defaultValue: 'enrolled'
      },
      project_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Title of the project submitted by the student'
      },
      project_description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Description of the project submitted'
      },
      project_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL to the project repository or demo'
      },
      submission_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL to project submission (Drive link)'
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the project was submitted'
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Score given by judges (0-100)'
      },
      ranking: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Final ranking in the hackathon'
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Feedback from judges'
      },
      is_winner: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      prize: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Prize won (if any)'
      },
      team_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Name of the team (if participating as team)'
      },
      is_team_lead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this participant is the team leader'
      },
      team_members: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of team member information'
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

    // Create indexes for hackathon_participants table (with error handling)
    try {
      await queryInterface.addIndex('hackathon_participants', ['hackathon_id']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('hackathon_participants', ['student_id']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('hackathon_participants', ['status']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('hackathon_participants', ['submitted_at']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('hackathon_participants', ['ranking']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    try {
      await queryInterface.addIndex('hackathon_participants', ['is_winner']);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    // Create unique constraint for hackathon_id and student_id
    try {
      await queryInterface.addIndex('hackathon_participants', ['hackathon_id', 'student_id'], {
        unique: true,
        name: 'unique_hackathon_student'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
    
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Hackathon_participants table already exists, skipping creation');
    }

    // Create hackathon_groups table (with error handling)
    try {
      await queryInterface.createTable('hackathon_groups', {
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
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        max_members: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        current_members: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_by: {
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
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Hackathon_groups table already exists, skipping creation');
    }

    // Create hackathon_group_members table (with error handling)
    try {
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
          defaultValue: Sequelize.NOW,
          comment: 'When the student joined the group'
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
        name: 'unique_group_student'
      });
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Hackathon_group_members table already exists, skipping creation');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback disabled to preserve data
  }
};
