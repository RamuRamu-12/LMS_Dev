const { Certificate, TestAttempt, CourseTest, Course, User } = require('../models');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Generate certificate for a test attempt
 */
const generateCertificate = async (req, res, next) => {
  try {
    const { test_attempt_id } = req.body;
    const studentId = req.user.id;

    // Get the test attempt
    const attempt = await TestAttempt.findOne({
      where: { 
        id: test_attempt_id,
        student_id: studentId 
      },
      include: [
        {
          model: CourseTest,
          as: 'test',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title', 'category', 'difficulty']
            }
          ]
        }
      ]
    });

    if (!attempt) {
      throw new AppError('Test attempt not found', 404);
    }

    if (attempt.status !== 'completed') {
      throw new AppError('Test attempt is not completed', 400);
    }

    if (!attempt.isPassed(attempt.test.passing_score)) {
      throw new AppError('Test was not passed. Certificate cannot be generated.', 400);
    }

    // CRITICAL: Get the specific course ID for this test attempt
    const courseIdForCertificate = attempt.test.course_id;
    
    logger.info(`Checking for existing certificate: student_id=${studentId}, course_id=${courseIdForCertificate}, test_attempt_id=${test_attempt_id}`);
    
    // Check if certificate already exists for THIS SPECIFIC COURSE
    const existingCertificate = await Certificate.findOne({
      where: {
        student_id: studentId,
        course_id: courseIdForCertificate,
        test_attempt_id: test_attempt_id
      }
    });

    if (existingCertificate) {
      logger.info(`Certificate already exists for student ${studentId} and course ${courseIdForCertificate}. Returning existing certificate.`);
      return res.json({
        success: true,
        message: 'Certificate already exists',
        data: {
          certificate: existingCertificate.getPublicInfo()
        }
      });
    }

    // Generate certificate ONLY for the specific course that was completed
    logger.info(`Generating certificate for student ${studentId} and course ${courseIdForCertificate}`);
    
    const certificateNumber = await Certificate.generateCertificateNumber(studentId, courseIdForCertificate);
    const verificationCode = Certificate.generateVerificationCode();

    if (!attempt.test.course) {
      logger.error(`Course ${courseIdForCertificate} not found. Cannot generate certificate.`);
      throw new AppError('Course information not found for certificate generation', 404);
    }

    // Create certificate for THIS SPECIFIC COURSE ONLY
    const certificate = await Certificate.create({
      student_id: studentId,
      course_id: courseIdForCertificate,
      test_attempt_id: test_attempt_id,
      certificate_number: certificateNumber,
      verification_code: verificationCode,
      issued_date: new Date(),
      is_valid: true,
      metadata: {
        courseName: attempt.test.course.title,
        studentName: req.user.name,
        score: attempt.score,
        passingScore: attempt.test.passing_score,
        testTitle: attempt.test.title
      }
    });

    logger.info(`Certificate ${certificateNumber} successfully generated for student ${req.user.email}, course ${attempt.test.course.title} (ID: ${courseIdForCertificate})`);

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: {
        certificate: certificate.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Generate certificate error:', error);
    next(error);
  }
};

/**
 * Get student's certificates
 */
const getMyCertificates = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const certificates = await Certificate.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty', 'logo']
        },
        {
          model: TestAttempt,
          as: 'testAttempt',
          attributes: ['id', 'score', 'completed_at']
        }
      ],
      order: [['issued_date', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Certificates retrieved successfully',
      data: {
        certificates: certificates.map(cert => ({
          ...cert.getPublicInfo(),
          course: cert.course,
          testAttempt: cert.testAttempt
        }))
      }
    });
  } catch (error) {
    logger.error('Get my certificates error:', error);
    next(error);
  }
};

/**
 * Get certificate by ID
 */
const getCertificateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const certificate = await Certificate.findOne({
      where: { 
        id: id,
        student_id: studentId 
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty']
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    res.json({
      success: true,
      message: 'Certificate retrieved successfully',
      data: {
        certificate: {
          ...certificate.getPublicInfo(),
          course: certificate.course,
          student: certificate.student
        }
      }
    });
  } catch (error) {
    logger.error('Get certificate by ID error:', error);
    next(error);
  }
};

/**
 * Download certificate (placeholder for PDF generation)
 */
const downloadCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const certificate = await Certificate.findOne({
      where: { 
        id: id,
        student_id: studentId 
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty']
        }
      ]
    });

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    if (!certificate.is_valid) {
      throw new AppError('Certificate has been revoked', 400);
    }

    // Return certificate data (PDF generation would happen here in production)
    res.json({
      success: true,
      message: 'Certificate data retrieved successfully',
      data: {
        certificate: {
          ...certificate.getPublicInfo(),
          course: certificate.course,
          studentName: req.user.name
        }
      }
    });
  } catch (error) {
    logger.error('Download certificate error:', error);
    next(error);
  }
};

/**
 * Verify certificate by verification code
 */
const verifyCertificate = async (req, res, next) => {
  try {
    const { verificationCode } = req.params;

    const certificate = await Certificate.findOne({
      where: { verification_code: verificationCode },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category']
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    res.json({
      success: true,
      message: 'Certificate verified successfully',
      data: {
        certificate: {
          certificateNumber: certificate.certificate_number,
          studentName: certificate.student.name,
          courseName: certificate.course.title,
          issuedDate: certificate.issued_date,
          isValid: certificate.is_valid,
          expiryDate: certificate.expiry_date
        }
      }
    });
  } catch (error) {
    logger.error('Verify certificate error:', error);
    next(error);
  }
};

/**
 * Get all certificates (admin only)
 */
const getAllCertificates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: certificates } = await Certificate.findAndCountAll({
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category']
        }
      ],
      order: [['issued_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Certificates retrieved successfully',
      data: {
        certificates: certificates.map(cert => ({
          ...cert.getPublicInfo(),
          student: cert.student,
          course: cert.course
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get all certificates error:', error);
    next(error);
  }
};

/**
 * Revoke certificate (admin only)
 */
const revokeCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByPk(id);
    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    await certificate.revoke();

    logger.info(`Certificate ${id} revoked by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: {
        certificate: certificate.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Revoke certificate error:', error);
    next(error);
  }
};

/**
 * Renew certificate (admin only)
 */
const renewCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByPk(id);
    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    await certificate.renew();

    logger.info(`Certificate ${id} renewed by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Certificate renewed successfully',
      data: {
        certificate: certificate.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Renew certificate error:', error);
    next(error);
  }
};

module.exports = {
  generateCertificate,
  getMyCertificates,
  getCertificateById,
  downloadCertificate,
  verifyCertificate,
  getAllCertificates,
  revokeCertificate,
  renewCertificate
};
