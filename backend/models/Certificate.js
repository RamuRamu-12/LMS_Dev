const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Certificate = sequelize.define('Certificate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    test_attempt_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'test_attempts',
        key: 'id'
      }
    },
    certificate_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    issued_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    certificate_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    verification_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    is_valid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'certificates',
    indexes: [
      {
        fields: ['student_id']
      },
      {
        fields: ['course_id']
      },
      {
        fields: ['test_attempt_id']
      },
      {
        fields: ['certificate_number']
      },
      {
        fields: ['verification_code']
      },
      {
        fields: ['is_valid']
      }
    ]
  });

  // Instance methods
  Certificate.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  Certificate.prototype.getPublicInfo = function() {
    return {
      id: this.id,
      student_id: this.student_id,
      course_id: this.course_id,
      certificate_number: this.certificate_number,
      issued_date: this.issued_date,
      expiry_date: this.expiry_date,
      certificate_url: this.certificate_url,
      verification_code: this.verification_code,
      is_valid: this.is_valid,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  Certificate.prototype.revoke = function() {
    this.is_valid = false;
    return this.save();
  };

  Certificate.prototype.renew = function() {
    this.is_valid = true;
    return this.save();
  };

  // Class methods
  Certificate.findByStudent = function(studentId) {
    return this.findAll({
      where: { student_id: studentId },
      order: [['issued_date', 'DESC']]
    });
  };

  Certificate.findByCourse = function(courseId) {
    return this.findAll({
      where: { course_id: courseId },
      order: [['issued_date', 'DESC']]
    });
  };

  Certificate.findByCertificateNumber = function(certificateNumber) {
    return this.findOne({
      where: { certificate_number: certificateNumber }
    });
  };

  Certificate.findByVerificationCode = function(verificationCode) {
    return this.findOne({
      where: { verification_code: verificationCode }
    });
  };

  Certificate.generateCertificateNumber = async function(studentId, courseId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `CERT-${studentId}-${courseId}-${timestamp}-${random}`;
  };

  Certificate.generateVerificationCode = function() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  return Certificate;
};
