module.exports = (sequelize, DataTypes) => {
  const ProjectPhase = sequelize.define('ProjectPhase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phaseNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  phaseType: {
    type: DataTypes.ENUM('BRD', 'UI/UX', 'Development', 'Testing', 'Deployment'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resources: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // in hours
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'project_phases',
  timestamps: true,
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['phase_number']
    },
    {
      fields: ['phase_type']
    },
    {
      fields: ['is_active']
    }
  ]
});

  return ProjectPhase;
};
