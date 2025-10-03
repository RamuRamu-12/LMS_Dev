module.exports = (sequelize, DataTypes) => {
  const ProjectProgress = sequelize.define('ProjectProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  phaseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'project_phases',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'skipped'),
    defaultValue: 'not_started'
  },
  progressPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // in minutes
    validate: {
      min: 0
    }
  },
  lastAccessedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'project_progress',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['project_id']
    },
    {
      fields: ['phase_id']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['user_id', 'project_id', 'phase_id']
    }
  ]
});

  return ProjectProgress;
};
