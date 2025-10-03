const { ActivityLog, User, Course, CourseChapter, CourseTest } = require('../models');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get student's recent activities
 */
const getMyActivities = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const studentId = req.user.id;

    const activities = await ActivityLog.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty']
        },
        {
          model: CourseChapter,
          as: 'chapter',
          attributes: ['id', 'title', 'chapter_number']
        },
        {
          model: CourseTest,
          as: 'test',
          attributes: ['id', 'title', 'passing_score']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    // Format activities for frontend
    const formattedActivities = activities.map(activity => {
      const timeAgo = getTimeAgo(activity.created_at);
      
      return {
        id: activity.id,
        type: activity.activity_type,
        title: activity.title,
        description: activity.description,
        timeAgo: timeAgo,
        pointsEarned: activity.points_earned,
        course: activity.course ? {
          id: activity.course.id,
          title: activity.course.title,
          category: activity.course.category,
          difficulty: activity.course.difficulty
        } : null,
        chapter: activity.chapter ? {
          id: activity.chapter.id,
          title: activity.chapter.title,
          chapterNumber: activity.chapter.chapter_number
        } : null,
        test: activity.test ? {
          id: activity.test.id,
          title: activity.test.title,
          passingScore: activity.test.passing_score
        } : null,
        metadata: activity.metadata,
        createdAt: activity.created_at
      };
    });

    res.json({
      success: true,
      message: 'Activities retrieved successfully',
      data: {
        activities: formattedActivities
      }
    });
  } catch (error) {
    logger.error('Get my activities error:', error);
    next(error);
  }
};

/**
 * Get student's activity statistics
 */
const getMyActivityStats = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Get total activities count
    const totalActivities = await ActivityLog.count({
      where: { student_id: studentId }
    });

    // Get activities by type
    const activitiesByType = await ActivityLog.findAll({
      where: { student_id: studentId },
      attributes: [
        'activity_type',
        [ActivityLog.sequelize.fn('COUNT', ActivityLog.sequelize.col('id')), 'count']
      ],
      group: ['activity_type']
    });

    // Get total points earned
    const totalPoints = await ActivityLog.sum('points_earned', {
      where: { student_id: studentId }
    });

    // Get recent activity streak (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivities = await ActivityLog.count({
      where: {
        student_id: studentId,
        created_at: {
          [ActivityLog.sequelize.Sequelize.Op.gte]: sevenDaysAgo
        }
      }
    });

    res.json({
      success: true,
      message: 'Activity statistics retrieved successfully',
      data: {
        totalActivities,
        totalPoints: totalPoints || 0,
        recentActivityCount: recentActivities,
        activitiesByType: activitiesByType.reduce((acc, item) => {
          acc[item.activity_type] = parseInt(item.dataValues.count);
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Get activity stats error:', error);
    next(error);
  }
};

/**
 * Helper function to calculate time ago
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}

module.exports = {
  getMyActivities,
  getMyActivityStats
};
