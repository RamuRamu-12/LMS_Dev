const { Achievement, User, Course, Certificate } = require('../models');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get student's achievements
 */
const getMyAchievements = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Get all certificates for this student
    const certificates = await Certificate.findAll({
      where: { 
        student_id: studentId,
        is_valid: true
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty', 'logo']
        }
      ],
      order: [['issued_date', 'DESC']]
    });

    // Get all existing achievements
    const achievements = await Achievement.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty', 'logo']
        }
      ],
      order: [['unlocked_at', 'DESC']]
    });

    // Create achievements for certificates that don't have achievements yet
    const achievementCourseIds = new Set(achievements.map(a => a.course_id).filter(Boolean));
    
    for (const certificate of certificates) {
      if (certificate.course_id && !achievementCourseIds.has(certificate.course_id)) {
        try {
          const course = certificate.course || await Course.findByPk(certificate.course_id);
          if (course) {
            const certificateData = {
              studentName: req.user.name,
              courseTitle: course.title,
              completionDate: certificate.issued_date ? certificate.issued_date.toISOString() : new Date().toISOString(),
              certificateId: certificate.certificate_number || `CERT-${studentId}-${certificate.course_id}`,
              issuedBy: 'GNANAM AI Learning Platform',
              courseCategory: course.category || 'General',
              courseDifficulty: course.difficulty || 'beginner',
              score: certificate.metadata?.score || null,
              passingScore: certificate.metadata?.passingScore || null,
              testTitle: certificate.metadata?.testTitle || null
            };

            const newAchievement = await Achievement.create({
              student_id: studentId,
              course_id: certificate.course_id,
              achievement_type: 'course_completion',
              title: `${course.title} Certificate`,
              description: `Certificate of completion for ${course.title}`,
              icon: '🎓',
              certificate_data: certificateData,
              points_earned: 100,
              is_unlocked: true,
              unlocked_at: certificate.issued_date || new Date(),
              metadata: {
                courseTitle: course.title,
                courseCategory: course.category,
                courseDifficulty: course.difficulty,
                completionDate: certificateData.completionDate,
                certificateNumber: certificate.certificate_number,
                score: certificateData.score,
                passingScore: certificateData.passingScore
              }
            });

            // Add to achievements array
            achievements.push(newAchievement);
            achievementCourseIds.add(certificate.course_id);
            
            logger.info(`Created achievement for existing certificate: student ${req.user.email}, course ${course.title}`);
          }
        } catch (createError) {
          logger.error(`Failed to create achievement for certificate ${certificate.id}:`, createError);
          // Continue with other certificates
        }
      }
    }

    // Reload achievements with course data to ensure all have proper course relations
    const allAchievements = await Achievement.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty', 'logo']
        }
      ],
      order: [['unlocked_at', 'DESC']]
    });

    // Format achievements for frontend
    const formattedAchievements = allAchievements.map(achievement => {
      return {
        id: achievement.id,
        type: achievement.achievement_type,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        pointsEarned: achievement.points_earned,
        isUnlocked: achievement.is_unlocked,
        unlockedAt: achievement.unlocked_at,
        course: achievement.course ? {
          id: achievement.course.id,
          title: achievement.course.title,
          category: achievement.course.category,
          difficulty: achievement.course.difficulty,
          logo: achievement.course.logo
        } : null,
        certificateData: achievement.certificate_data,
        metadata: achievement.metadata
      };
    });

    res.json({
      success: true,
      message: 'Achievements retrieved successfully',
      data: {
        achievements: formattedAchievements
      }
    });
  } catch (error) {
    logger.error('Get achievements error:', error);
    next(error);
  }
};

/**
 * Get student's achievement statistics
 */
const getMyAchievementStats = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Get total achievements count
    const totalAchievements = await Achievement.count({
      where: { student_id: studentId }
    });

    // Get unlocked achievements count
    const unlockedAchievements = await Achievement.count({
      where: { 
        student_id: studentId,
        is_unlocked: true 
      }
    });

    // Get achievements by type
    const achievementsByType = await Achievement.findAll({
      where: { student_id: studentId },
      attributes: [
        'achievement_type',
        [Achievement.sequelize.fn('COUNT', Achievement.sequelize.col('id')), 'count']
      ],
      group: ['achievement_type']
    });

    // Get total points earned
    const totalPoints = await Achievement.sum('points_earned', {
      where: { student_id: studentId }
    });

    // Get course completion achievements
    const courseCompletions = await Achievement.count({
      where: { 
        student_id: studentId,
        achievement_type: 'course_completion',
        is_unlocked: true
      }
    });

    res.json({
      success: true,
      message: 'Achievement statistics retrieved successfully',
      data: {
        totalAchievements,
        unlockedAchievements,
        totalPoints: totalPoints || 0,
        courseCompletions,
        achievementsByType: achievementsByType.reduce((acc, item) => {
          acc[item.achievement_type] = parseInt(item.dataValues.count);
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Get achievement stats error:', error);
    next(error);
  }
};

/**
 * Generate and download certificate
 */
const downloadCertificate = async (req, res, next) => {
  try {
    const { achievementId } = req.params;
    const studentId = req.user.id;

    const achievement = await Achievement.findOne({
      where: { 
        id: achievementId,
        student_id: studentId,
        is_unlocked: true
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty']
        }
      ]
    });

    if (!achievement) {
      throw new AppError('Achievement not found or not unlocked', 404);
    }

    // Generate certificate data
    const certificateData = {
      ...achievement.certificate_data,
      studentName: req.user.name,
      courseTitle: achievement.course.title,
      completionDate: achievement.unlocked_at,
      certificateId: `CERT-${studentId}-${achievement.course_id}-${achievement.id}`,
      issuedBy: 'GNANAM AI Learning Platform'
    };

    // For now, return the certificate data as JSON
    // In a real implementation, you would generate a PDF here
    res.json({
      success: true,
      message: 'Certificate data retrieved successfully',
      data: {
        certificate: {
          id: achievement.id,
          title: achievement.title,
          studentName: certificateData.studentName,
          courseTitle: certificateData.courseTitle,
          completionDate: certificateData.completionDate,
          certificateId: certificateData.certificateId,
          issuedBy: certificateData.issuedBy,
          courseCategory: achievement.course.category,
          courseDifficulty: achievement.course.difficulty,
          achievementType: achievement.achievement_type,
          pointsEarned: achievement.points_earned
        }
      }
    });
  } catch (error) {
    logger.error('Download certificate error:', error);
    next(error);
  }
};

/**
 * Generate PDF certificate (placeholder for future implementation)
 */
const generatePDFCertificate = async (req, res, next) => {
  try {
    const { achievementId } = req.params;
    const studentId = req.user.id;

    const achievement = await Achievement.findOne({
      where: { 
        id: achievementId,
        student_id: studentId,
        is_unlocked: true
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty']
        }
      ]
    });

    if (!achievement) {
      throw new AppError('Achievement not found or not unlocked', 404);
    }

    // This is a placeholder - in a real implementation, you would:
    // 1. Generate a PDF using a library like puppeteer or pdfkit
    // 2. Include the certificate design with student name, course title, etc.
    // 3. Return the PDF file

    const certificateData = {
      studentName: req.user.name,
      courseTitle: achievement.course.title,
      completionDate: achievement.unlocked_at,
      certificateId: `CERT-${studentId}-${achievement.course_id}-${achievement.id}`,
      issuedBy: 'GNANAM AI Learning Platform'
    };

    // For now, return a success message
    res.json({
      success: true,
      message: 'Certificate generation initiated',
      data: {
        certificateId: certificateData.certificateId,
        downloadUrl: `/api/achievements/${achievementId}/certificate/download`,
        note: 'PDF generation will be implemented in future updates'
      }
    });
  } catch (error) {
    logger.error('Generate PDF certificate error:', error);
    next(error);
  }
};

module.exports = {
  getMyAchievements,
  getMyAchievementStats,
  downloadCertificate,
  generatePDFCertificate
};
