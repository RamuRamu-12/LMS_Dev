const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    google_id: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [6, 255]
      }
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'student'),
      defaultValue: 'student',
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'users',
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['google_id']
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.last_login) {
          user.last_login = new Date();
        }
        // Hash password if provided
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('last_login')) {
          user.last_login = new Date();
        }
        // Hash password if it's being updated
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  });

  // Instance methods
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.google_id;
    delete values.password;
    return values;
  };

  User.prototype.getPublicProfile = function() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      role: this.role,
      is_active: this.is_active,
      last_login: this.last_login,
      bio: this.bio,
      phone: this.phone,
      location: this.location,
      created_at: this.created_at
    };
  };

  User.prototype.isAdmin = function() {
    return this.role === 'admin';
  };

  User.prototype.isStudent = function() {
    return this.role === 'student';
  };

  User.prototype.comparePassword = async function(candidatePassword) {
    if (!this.password) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.findOne({ where: { email } });
  };

  User.findByGoogleId = function(googleId) {
    return this.findOne({ where: { google_id: googleId } });
  };

  User.findActiveUsers = function() {
    return this.findAll({ where: { is_active: true } });
  };

  User.findByRole = function(role) {
    return this.findAll({ where: { role, is_active: true } });
  };

  return User;
};
