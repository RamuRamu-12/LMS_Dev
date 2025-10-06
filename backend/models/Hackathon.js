const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Hackathon = sequelize.define('Hackathon', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL to hackathon logo image'
    },
    technology: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Primary technology for the hackathon'
    },
    tech_stack: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of technologies in the tech stack'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Hackathon start date'
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Hackathon end date'
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'upcoming'
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
      defaultValue: 'intermediate'
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum number of participants allowed'
    },
    current_participants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Current number of participants'
    },
    prize_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of prizes for winners'
    },
    rules: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Hackathon rules and guidelines'
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Project requirements and deliverables'
    },
    // Multimedia content fields (Drive links only)
    video_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Hackathon promotional video URL (Drive link)'
    },
    pdf_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Hackathon details PDF URL (Drive link)'
    },
    // Metadata fields for tracking uploads
    multimedia_uploads: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Metadata for multimedia uploads (upload dates, file sizes, etc.)'
    },
    multimedia_last_updated: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time multimedia content was updated'
    },
    multimedia_uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'User who uploaded the multimedia content'
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'hackathons',
    timestamps: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['difficulty']
      },
      {
        fields: ['start_date']
      },
      {
        fields: ['end_date']
      },
      {
        fields: ['is_published']
      },
      {
        fields: ['created_by']
      }
    ],
    validate: {
      endDateAfterStartDate() {
        if (this.end_date <= this.start_date) {
          throw new Error('End date must be after start date');
        }
      }
    }
  });

  // Define associations
  Hackathon.associate = (models) => {
    // Hackathon belongs to User (creator)
    Hackathon.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    
    // Hackathon belongs to User (updater)
    Hackathon.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });

    // Hackathon belongs to User (multimedia uploaded by)
    Hackathon.belongsTo(models.User, {
      foreignKey: 'multimedia_uploaded_by',
      as: 'multimediaUploader'
    });

    // Hackathon has many HackathonParticipants (many-to-many with Users)
    Hackathon.belongsToMany(models.User, {
      through: 'HackathonParticipants',
      foreignKey: 'hackathon_id',
      otherKey: 'student_id',
      as: 'participants'
    });
  };

  // Instance methods
  Hackathon.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  Hackathon.prototype.publish = function() {
    this.is_published = true;
    this.published_at = new Date();
    return this.save();
  };

  Hackathon.prototype.unpublish = function() {
    this.is_published = false;
    this.published_at = null;
    return this.save();
  };

  Hackathon.prototype.isActive = function() {
    const now = new Date();
    return this.status === 'active' && now >= this.start_date && now <= this.end_date;
  };

  Hackathon.prototype.isUpcoming = function() {
    const now = new Date();
    return this.status === 'upcoming' && now < this.start_date;
  };

  Hackathon.prototype.isCompleted = function() {
    const now = new Date();
    return this.status === 'completed' || now > this.end_date;
  };

  // Class methods
  Hackathon.findActive = function() {
    const now = new Date();
    return this.findAll({
      where: {
        status: 'active',
        start_date: { [require('sequelize').Op.lte]: now },
        end_date: { [require('sequelize').Op.gte]: now }
      },
      order: [['start_date', 'ASC']]
    });
  };

  Hackathon.findUpcoming = function() {
    const now = new Date();
    return this.findAll({
      where: {
        status: 'upcoming',
        start_date: { [require('sequelize').Op.gt]: now }
      },
      order: [['start_date', 'ASC']]
    });
  };

  Hackathon.findCompleted = function() {
    const now = new Date();
    return this.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { status: 'completed' },
          { end_date: { [require('sequelize').Op.lt]: now } }
        ]
      },
      order: [['end_date', 'DESC']]
    });
  };

  return Hackathon;
};
