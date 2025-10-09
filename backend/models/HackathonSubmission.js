const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const HackathonSubmission = sequelize.define('HackathonSubmission', {
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
    project_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      },
      comment: 'Title of the submitted project'
    },
    project_description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: 'Description of the submitted project'
    },
    github_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      },
      comment: 'GitHub repository URL'
    },
    live_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      },
      comment: 'Live application URL'
    },
    demo_video_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      },
      comment: 'Demo video URL (Drive link)'
    },
    presentation_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      },
      comment: 'Presentation slides URL (Drive link)'
    },
    documentation_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      },
      comment: 'Project documentation URL (Drive link)'
    },
    additional_files_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      },
      comment: 'Additional files URL (Drive link)'
    },
    submission_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes from the student'
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'draft',
      comment: 'Submission status'
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the submission was submitted'
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the submission was reviewed'
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who reviewed the submission'
    },
    review_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Review notes from the reviewer'
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Score given by reviewer (0-100)'
    },
    is_winner: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this submission is a winner'
    },
    prize: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Prize won (if any)'
    },
    ranking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Final ranking in the hackathon'
    }
  }, {
    tableName: 'hackathon_submissions',
    timestamps: true,
    indexes: [
      {
        fields: ['hackathon_id']
      },
      {
        fields: ['student_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['submitted_at']
      },
      {
        fields: ['is_winner']
      },
      {
        fields: ['ranking']
      },
      {
        unique: true,
        fields: ['hackathon_id', 'student_id'],
        name: 'unique_hackathon_student_submission'
      }
    ],
    hooks: {
      beforeUpdate: (submission) => {
        // Set submitted_at when status changes to submitted
        if (submission.changed('status') && submission.status === 'submitted' && !submission.submitted_at) {
          submission.submitted_at = new Date();
        }
        
        // Set reviewed_at when status changes to reviewed states
        if (submission.changed('status') && 
            ['under_review', 'accepted', 'rejected'].includes(submission.status) && 
            !submission.reviewed_at) {
          submission.reviewed_at = new Date();
        }
      }
    }
  });

  // Define associations
  HackathonSubmission.associate = (models) => {
    // HackathonSubmission belongs to Hackathon
    HackathonSubmission.belongsTo(models.Hackathon, {
      foreignKey: 'hackathon_id',
      as: 'hackathon'
    });

    // HackathonSubmission belongs to User (student)
    HackathonSubmission.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student'
    });

    // HackathonSubmission belongs to User (reviewer)
    HackathonSubmission.belongsTo(models.User, {
      foreignKey: 'reviewed_by',
      as: 'reviewer'
    });
  };

  // Instance methods
  HackathonSubmission.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  HackathonSubmission.prototype.submit = function() {
    this.status = 'submitted';
    this.submitted_at = new Date();
    return this.save();
  };

  HackathonSubmission.prototype.accept = function(reviewerId, reviewNotes = null, score = null) {
    this.status = 'accepted';
    this.reviewed_at = new Date();
    this.reviewed_by = reviewerId;
    this.review_notes = reviewNotes;
    this.score = score;
    return this.save();
  };

  HackathonSubmission.prototype.reject = function(reviewerId, reviewNotes = null) {
    this.status = 'rejected';
    this.reviewed_at = new Date();
    this.reviewed_by = reviewerId;
    this.review_notes = reviewNotes;
    return this.save();
  };

  HackathonSubmission.prototype.setWinner = function(prize = null, ranking = null) {
    this.is_winner = true;
    this.prize = prize;
    this.ranking = ranking;
    return this.save();
  };

  // Class methods
  HackathonSubmission.findByHackathon = function(hackathonId) {
    return this.findAll({
      where: { hackathon_id: hackathonId },
      include: [
        {
          model: require('../models').User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: require('../models').User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });
  };

  HackathonSubmission.findByStudent = function(studentId) {
    return this.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: require('../models').Hackathon,
          as: 'hackathon',
          attributes: ['id', 'name', 'start_date', 'end_date', 'status']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });
  };

  HackathonSubmission.findWinners = function(hackathonId) {
    return this.findAll({
      where: { 
        hackathon_id: hackathonId,
        is_winner: true
      },
      include: [
        {
          model: require('../models').User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ],
      order: [['ranking', 'ASC']]
    });
  };

  return HackathonSubmission;
};
