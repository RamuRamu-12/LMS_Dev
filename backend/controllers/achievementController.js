const { Achievement, User, Course } = require('../models');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get student's achievements
 */
const getMyAchievements = async (req, res, next) => {
  try {
    const studentId = req.user.id;

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

    // Format achievements for frontend
    const formattedAchievements = achievements.map(achievement => {
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
