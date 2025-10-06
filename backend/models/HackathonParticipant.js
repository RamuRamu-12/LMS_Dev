const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const HackathonParticipant = sequelize.define('HackathonParticipant', {
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
    enrolled_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('enrolled', 'active', 'submitted', 'completed', 'disqualified'),
      allowNull: false,
      defaultValue: 'enrolled'
    },
    project_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Title of the project submitted by the student'
    },
    project_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the project submitted'
    },
    project_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL to the project repository or demo'
    },
    submission_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL to project submission (Drive link)'
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the project was submitted'
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Score given by judges (0-100)'
    },
    ranking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Final ranking in the hackathon'
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Feedback from judges'
    },
    is_winner: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    prize: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Prize won (if any)'
    },
    // Team information (for team-based hackathons)
    team_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Name of the team (if participating as team)'
    },
    is_team_lead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this participant is the team leader'
    },
    team_members: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of team member information'
    }
  }, {
    tableName: 'hackathon_participants',
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
        fields: ['ranking']
      },
      {
        fields: ['is_winner']
      },
      {
        unique: true,
        fields: ['hackathon_id', 'student_id'],
        name: 'unique_hackathon_student'
      }
    ]
  });

  // Define associations
  HackathonParticipant.associate = (models) => {
    // HackathonParticipant belongs to Hackathon
    HackathonParticipant.belongsTo(models.Hackathon, {
      foreignKey: 'hackathon_id',
      as: 'hackathon'
    });

    // HackathonParticipant belongs to User (student)
    HackathonParticipant.belongsTo(models.User, {
      foreignKey: 'student_id',
      as: 'student'
    });
  };

  // Instance methods
  HackathonParticipant.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  HackathonParticipant.prototype.submitProject = function(projectData) {
    this.project_title = projectData.title;
    this.project_description = projectData.description;
    this.project_url = projectData.project_url;
    this.submission_url = projectData.submission_url;
    this.submitted_at = new Date();
    this.status = 'submitted';
    return this.save();
  };

  HackathonParticipant.prototype.complete = function() {
    this.status = 'completed';
    return this.save();
  };

  HackathonParticipant.prototype.disqualify = function() {
    this.status = 'disqualified';
    return this.save();
  };

  HackathonParticipant.prototype.setScore = function(score, feedback) {
    this.score = score;
    this.feedback = feedback;
    return this.save();
  };

  HackathonParticipant.prototype.setRanking = function(ranking, isWinner = false, prize = null) {
    this.ranking = ranking;
    this.is_winner = isWinner;
    this.prize = prize;
    return this.save();
  };

  // Class methods
  HackathonParticipant.findByHackathon = function(hackathonId) {
    return this.findAll({
      where: { hackathon_id: hackathonId },
      include: [
        {
          model: require('../models').User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'profile_picture']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });
  };

  HackathonParticipant.findByStudent = function(studentId) {
    return this.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: require('../models').Hackathon,
          as: 'hackathon',
          attributes: ['id', 'name', 'start_date', 'end_date', 'status']
        }
      ],
      order: [['enrolled_at', 'DESC']]
    });
  };

  HackathonParticipant.findSubmissions = function(hackathonId) {
    return this.findAll({
      where: { 
        hackathon_id: hackathonId,
        status: ['submitted', 'completed']
      },
      include: [
        {
          model: require('../models').User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'profile_picture']
        }
      ],
      order: [['submitted_at', 'ASC']]
    });
  };

  return HackathonParticipant;
};
