const { Enrollment, Course, User, CourseChapter, ChapterProgress, ActivityLog, Achievement } = require('../models');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Get my enrollments
 */
const getMyEnrollments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where: { student_id: req.user.id },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'thumbnail', 'logo', 'category', 'difficulty', 'estimated_duration']
        }
      ],
      order: [['enrolled_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: {
        enrollments: enrollments.map(enrollment => ({
          id: enrollment.id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at,
          last_accessed_at: enrollment.last_accessed_at,
          time_spent: enrollment.time_spent,
          course: enrollment.course.getPublicInfo()
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
    logger.error('Get my enrollments error:', error);
    next(error);
  }
};

/**
 * Get my progress overview
 */
const getMyProgress = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category']
        }
      ]
    });

    const stats = {
      totalEnrolled: enrollments.length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      inProgress: enrollments.filter(e => e.status === 'in-progress').length,
      enrolled: enrollments.filter(e => e.status === 'enrolled').length,
      averageProgress: enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0,
      totalTimeSpent: enrollments.reduce((sum, e) => sum + (e.time_spent || 0), 0)
    };

    const categoryStats = {};
    enrollments.forEach(enrollment => {
      const category = enrollment.course.category;
      if (!categoryStats[category]) {
        categoryStats[category] = {
          total: 0,
          completed: 0,
          averageProgress: 0
        };
      }
      categoryStats[category].total++;
      if (enrollment.status === 'completed') {
        categoryStats[category].completed++;
      }
    });

    // Calculate average progress per category
    Object.keys(categoryStats).forEach(category => {
      const categoryEnrollments = enrollments.filter(e => e.course.category === category);
      categoryStats[category].averageProgress = categoryEnrollments.length > 0
        ? Math.round(categoryEnrollments.reduce((sum, e) => sum + e.progress, 0) / categoryEnrollments.length)
        : 0;
    });

    res.json({
      success: true,
      message: 'Progress retrieved successfully',
      data: {
        stats,
        categoryStats,
        recentEnrollments: enrollments
          .sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at))
          .slice(0, 5)
          .map(enrollment => ({
            id: enrollment.id,
            course: enrollment.course.title,
            progress: enrollment.progress,
            status: enrollment.status,
            enrolled_at: enrollment.enrolled_at
          }))
      }
    });
  } catch (error) {
    logger.error('Get my progress error:', error);
    next(error);
  }
};

/**
 * Get my completed courses
 */
const getMyCompletedCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where: { 
        student_id: req.user.id,
        status: 'completed'
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'thumbnail', 'logo', 'category', 'difficulty']
        }
      ],
      order: [['completed_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Completed courses retrieved successfully',
      data: {
        enrollments: enrollments.map(enrollment => ({
          id: enrollment.id,
          progress: enrollment.progress,
          completed_at: enrollment.completed_at,
          time_spent: enrollment.time_spent,
          rating: enrollment.rating,
          review: enrollment.review,
          course: enrollment.course.getPublicInfo()
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
    logger.error('Get my completed courses error:', error);
    next(error);
  }
};

/**
 * Get my active courses
 */
const getMyActiveCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      where: { 
        student_id: req.user.id,
        status: ['enrolled', 'in-progress']
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'thumbnail', 'logo', 'category', 'difficulty', 'estimated_duration']
        }
      ],
      order: [['last_accessed_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Active courses retrieved successfully',
      data: {
        enrollments: enrollments.map(enrollment => ({
          id: enrollment.id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolled_at: enrollment.enrolled_at,
          last_accessed_at: enrollment.last_accessed_at,
          time_spent: enrollment.time_spent,
          course: enrollment.course.getPublicInfo()
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
    logger.error('Get my active courses error:', error);
    next(error);
  }
};

/**
 * Get my learning statistics
 */
const getMyStats = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'difficulty']
        }
      ]
    });

    const stats = {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      inProgressCourses: enrollments.filter(e => e.status === 'in-progress').length,
      enrolledCourses: enrollments.filter(e => e.status === 'enrolled').length,
      totalTimeSpent: enrollments.reduce((sum, e) => sum + (e.time_spent || 0), 0),
      averageProgress: enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0,
      completionRate: enrollments.length > 0 
        ? Math.round((enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100)
        : 0
    };

    // Category breakdown
    const categoryBreakdown = {};
    enrollments.forEach(enrollment => {
      const category = enrollment.course.category;
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          total: 0,
          completed: 0,
          inProgress: 0,
          averageProgress: 0
        };
      }
      categoryBreakdown[category].total++;
      if (enrollment.status === 'completed') {
        categoryBreakdown[category].completed++;
      } else if (enrollment.status === 'in-progress') {
        categoryBreakdown[category].inProgress++;
      }
    });

    // Calculate average progress per category
    Object.keys(categoryBreakdown).forEach(category => {
      const categoryEnrollments = enrollments.filter(e => e.course.category === category);
      categoryBreakdown[category].averageProgress = categoryEnrollments.length > 0
        ? Math.round(categoryEnrollments.reduce((sum, e) => sum + e.progress, 0) / categoryEnrollments.length)
        : 0;
    });

    // Difficulty breakdown
    const difficultyBreakdown = {};
    enrollments.forEach(enrollment => {
      const difficulty = enrollment.course.difficulty;
      if (!difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty] = {
          total: 0,
          completed: 0,
          averageProgress: 0
        };
      }
      difficultyBreakdown[difficulty].total++;
      if (enrollment.status === 'completed') {
        difficultyBreakdown[difficulty].completed++;
      }
    });

    // Calculate average progress per difficulty
    Object.keys(difficultyBreakdown).forEach(difficulty => {
      const difficultyEnrollments = enrollments.filter(e => e.course.difficulty === difficulty);
      difficultyBreakdown[difficulty].averageProgress = difficultyEnrollments.length > 0
        ? Math.round(difficultyEnrollments.reduce((sum, e) => sum + e.progress, 0) / difficultyEnrollments.length)
        : 0;
    });

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        stats,
        categoryBreakdown,
        difficultyBreakdown
      }
    });
  } catch (error) {
    logger.error('Get my stats error:', error);
    next(error);
  }
};

/**
 * Update my progress
 */
const updateMyProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { progress, time_spent } = req.body;

    const enrollment = await Enrollment.findOne({
      where: {
        id: id,
        student_id: req.user.id
      }
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (progress !== undefined) {
      await enrollment.updateProgress(progress);
    }

    if (time_spent !== undefined) {
      await enrollment.addTimeSpent(time_spent);
    }

    logger.info(`User ${req.user.email} updated progress for enrollment ${id}`);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        enrollment: {
          id: enrollment.id,
          progress: enrollment.progress,
          status: enrollment.status,
          time_spent: enrollment.time_spent
        }
      }
    });
  } catch (error) {
    logger.error('Update my progress error:', error);
    next(error);
  }
};

/**
 * Complete course
 */
const completeCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id: id,
        student_id: req.user.id
      }
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    await enrollment.complete();

    // Update course enrollment count
    const course = await Course.findByPk(enrollment.course_id);
    if (course) {
      await course.updateEnrollmentCount();
      
      // Log course completion activity
      await ActivityLog.createActivity(
        req.user.id,
        'course_completed',
        `Completed ${course.title}`,
        `Successfully completed ${course.title} course`,
        {
          courseId: course.id,
          metadata: {
            courseTitle: course.title,
            courseCategory: course.category,
            courseDifficulty: course.difficulty,
            completionTime: enrollment.completed_at
          },
          pointsEarned: 50
        }
      );

      // Create course completion achievement
      await Achievement.createCourseCompletionAchievement(
        req.user.id,
        course.id,
        {
          studentName: req.user.name,
          courseTitle: course.title,
          courseCategory: course.category,
          courseDuration: course.duration || 'Self-paced'
        }
      );
    }

    logger.info(`User ${req.user.email} completed course`);

    res.json({
      success: true,
      message: 'Course completed successfully',
      data: {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          progress: enrollment.progress,
          completed_at: enrollment.completed_at
        }
      }
    });
  } catch (error) {
    logger.error('Complete course error:', error);
    next(error);
  }
};

/**
 * Complete chapter and move to next (sequential progression)
 */
const completeChapter = async (req, res, next) => {
  try {
    const { enrollmentId, chapterId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id: enrollmentId,
        student_id: req.user.id
      },
      include: [
        {
          model: Course,
          as: 'course',
          include: [
            {
              model: CourseChapter,
              as: 'chapters',
              attributes: ['id', 'title', 'chapter_order']
            }
          ]
        }
      ],
      order: [
        [{ model: Course, as: 'course' }, { model: CourseChapter, as: 'chapters' }, 'chapter_order', 'ASC']
      ]
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Get all chapters in order
    const chapters = enrollment.course.chapters;
    const currentChapterIndex = chapters.findIndex(ch => ch.id == chapterId);
    
    console.log('=== CHAPTER DEBUGGING ===');
    console.log('All chapters:', chapters.map(ch => ({ id: ch.id, title: ch.title, order: ch.chapter_order })));
    console.log('Requested chapterId:', chapterId);
    console.log('Found chapter index:', currentChapterIndex);
    console.log('========================');
    
    if (currentChapterIndex === -1) {
      throw new AppError('Chapter not found in this course', 404);
    }

    // Check if previous chapters are completed (sequential requirement)
    console.log(`Checking sequential completion for chapter ${chapterId} (index ${currentChapterIndex})`);
    
    // Debug: Check all existing chapter progress for this enrollment
    const allProgress = await ChapterProgress.findAll({
      where: { enrollment_id: enrollmentId }
    });
    console.log('All existing progress records:', allProgress.map(p => ({ 
      chapter_id: p.chapter_id, 
      is_completed: p.is_completed 
    })));
    
    for (let i = 0; i < currentChapterIndex; i++) {
      const chapterProgress = await ChapterProgress.findOne({
        where: {
          enrollment_id: enrollmentId,
          chapter_id: chapters[i].id,
          is_completed: true
        }
      });

      console.log(`Chapter ${chapters[i].id} (${chapters[i].title}) completed:`, !!chapterProgress);

      if (!chapterProgress) {
        console.log(`BLOCKING: Chapter ${chapters[i].id} not completed`);
        throw new AppError(`You must complete "${chapters[i].title}" before proceeding to this chapter`, 400);
      }
    }

    // Mark current chapter as completed
    const [chapterProgress, created] = await ChapterProgress.findOrCreate({
      where: {
        enrollment_id: enrollmentId,
        chapter_id: chapterId
      },
      defaults: {
        enrollment_id: enrollmentId,
        chapter_id: chapterId,
        is_completed: false
      }
    });

    await chapterProgress.markAsCompleted();

    // Calculate new progress based on completed chapters
    const completedChapters = await ChapterProgress.count({
      where: {
        enrollment_id: enrollmentId,
        is_completed: true
      }
    });

    const totalChapters = chapters.length;
    const newProgress = Math.round((completedChapters / totalChapters) * 100);

    // Update enrollment progress
    await enrollment.updateProgress(newProgress);

    // Check if course is completed
    const isCourseCompleted = completedChapters === totalChapters;
    let nextChapter = null;

    if (!isCourseCompleted && currentChapterIndex < chapters.length - 1) {
      nextChapter = chapters[currentChapterIndex + 1];
    }

    logger.info(`User ${req.user.email} completed chapter ${chapterId} in course ${enrollment.course_id}`);

    res.json({
      success: true,
      message: 'Chapter completed successfully',
      data: {
        chapterProgress: {
          id: chapterProgress.id,
          chapter_id: chapterId,
          is_completed: chapterProgress.is_completed,
          completed_at: chapterProgress.completed_at
        },
        enrollment: {
          id: enrollment.id,
          progress: enrollment.progress,
          status: enrollment.status
        },
        nextChapter: nextChapter ? {
          id: nextChapter.id,
          title: nextChapter.title,
          chapter_order: nextChapter.chapter_order
        } : null,
        isCourseCompleted,
        completedChapters,
        totalChapters
      }
    });
  } catch (error) {
    logger.error('Complete chapter error:', error);
    next(error);
  }
};

/**
 * Get chapter progression status
 */
const getChapterProgression = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id: enrollmentId,
        student_id: req.user.id
      },
      include: [
        {
          model: Course,
          as: 'course',
          include: [
            {
              model: CourseChapter,
              as: 'chapters',
              attributes: ['id', 'title', 'chapter_order', 'description']
            }
          ]
        }
      ],
      order: [
        [{ model: Course, as: 'course' }, { model: CourseChapter, as: 'chapters' }, 'chapter_order', 'ASC']
      ]
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Get chapter progress for all chapters
    const chapterProgresses = await ChapterProgress.findAll({
      where: {
        enrollment_id: enrollmentId
      }
    });

    // Create a map of chapter progress
    const progressMap = {};
    chapterProgresses.forEach(progress => {
      progressMap[progress.chapter_id] = progress;
    });

    // Separate regular chapters from assignment/test chapters
    const regularChapters = enrollment.course.chapters.filter(chapter => 
      !chapter.title.toLowerCase().includes('assignment') && 
      !chapter.title.toLowerCase().includes('test') && 
      !chapter.title.toLowerCase().includes('exam') &&
      !chapter.title.toLowerCase().includes('final')
    );
    
    const assignmentChapters = enrollment.course.chapters.filter(chapter => 
      chapter.title.toLowerCase().includes('assignment') || 
      chapter.title.toLowerCase().includes('test') || 
      chapter.title.toLowerCase().includes('exam') ||
      chapter.title.toLowerCase().includes('final')
    );

    // Check if all regular chapters are completed
    const allRegularChaptersCompleted = regularChapters.every(chapter => {
      const progress = progressMap[chapter.id];
      return progress ? progress.is_completed : false;
    });

    // Build chapter progression data for regular chapters
    const regularChaptersWithProgress = regularChapters.map((chapter, index) => {
      const progress = progressMap[chapter.id];
      const isCompleted = progress ? progress.is_completed : false;
      const isAccessible = index === 0 || (progressMap[regularChapters[index - 1].id]?.is_completed || false);

      return {
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        chapter_order: chapter.chapter_order,
        is_completed: isCompleted,
        is_accessible: isAccessible,
        completed_at: progress?.completed_at || null,
        time_spent: progress?.time_spent || 0,
        is_assignment: false
      };
    });

    // Build chapter progression data for assignment chapters
    const assignmentChaptersWithProgress = assignmentChapters.map((chapter) => {
      const progress = progressMap[chapter.id];
      const isCompleted = progress ? progress.is_completed : false;
      // Assignment chapters are only accessible if all regular chapters are completed
      const isAccessible = allRegularChaptersCompleted;

      return {
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        chapter_order: chapter.chapter_order,
        is_completed: isCompleted,
        is_accessible: isAccessible,
        completed_at: progress?.completed_at || null,
        time_spent: progress?.time_spent || 0,
        is_assignment: true
      };
    });

    // Only show assignment chapters if all regular chapters are completed
    const visibleChapters = [...regularChaptersWithProgress];
    
    if (allRegularChaptersCompleted) {
      visibleChapters.push(...assignmentChaptersWithProgress);
    }
    
    // Sort by chapter order
    const chaptersWithProgress = visibleChapters.sort((a, b) => a.chapter_order - b.chapter_order);

    const completedChapters = chaptersWithProgress.filter(ch => ch.is_completed).length;
    const totalChapters = chaptersWithProgress.length;
    const isCourseCompleted = completedChapters === totalChapters;

    res.json({
      success: true,
      message: 'Chapter progression retrieved successfully',
      data: {
        enrollment: {
          id: enrollment.id,
          progress: enrollment.progress,
          status: enrollment.status
        },
        chapters: chaptersWithProgress,
        stats: {
          completedChapters,
          totalChapters,
          isCourseCompleted,
          progressPercentage: Math.round((completedChapters / totalChapters) * 100)
        }
      }
    });
  } catch (error) {
    logger.error('Get chapter progression error:', error);
    next(error);
  }
};

/**
 * Submit course feedback and rating
 */
const submitCourseFeedback = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const enrollment = await Enrollment.findOne({
      where: {
        id: enrollmentId,
        student_id: req.user.id
      },
      include: [
        {
          model: Course,
          as: 'course'
        }
      ]
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (enrollment.status !== 'completed') {
      throw new AppError('Course must be completed before submitting feedback', 400);
    }

    // Update enrollment with rating and review
    await enrollment.rate(rating, review);

    // Update course average rating
    const course = enrollment.course;
    const allRatings = await Enrollment.findAll({
      where: {
        course_id: course.id,
        rating: { [Op.not]: null }
      },
      attributes: ['rating']
    });

    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, e) => sum + e.rating, 0) / allRatings.length
      : 0;

    await course.update({
      average_rating: Math.round(averageRating * 10) / 10,
      total_ratings: allRatings.length
    });

    logger.info(`User ${req.user.email} submitted feedback for course ${course.id}`);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        enrollment: {
          id: enrollment.id,
          rating: enrollment.rating,
          review: enrollment.review
        },
        course: {
          id: course.id,
          average_rating: course.average_rating,
          total_ratings: course.total_ratings
        }
      }
    });
  } catch (error) {
    logger.error('Submit course feedback error:', error);
    next(error);
  }
};

/**
 * Drop course
 */
const dropCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id: id,
        student_id: req.user.id
      }
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    await enrollment.drop();

    // Update course enrollment count
    const course = await Course.findByPk(enrollment.course_id);
    if (course) {
      await course.updateEnrollmentCount();
    }

    logger.info(`User ${req.user.email} dropped course`);

    res.json({
      success: true,
      message: 'Course dropped successfully'
    });
  } catch (error) {
    logger.error('Drop course error:', error);
    next(error);
  }
};

/**
 * Get admin statistics
 */
const getAdminStats = async (req, res, next) => {
  try {
    // Get total enrollments
    const totalEnrollments = await Enrollment.count();
    
    // Get completed enrollments
    const completedEnrollments = await Enrollment.count({
      where: { status: 'completed' }
    });
    
    // Get active enrollments
    const activeEnrollments = await Enrollment.count({
      where: { status: 'enrolled' }
    });
    
    // Calculate completion rate
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
    
    // Get total students
    const totalStudents = await User.count({
      where: { role: 'student' }
    });
    
    // Get total courses
    const totalCourses = await Course.count();
    
    // Get published courses
    const publishedCourses = await Course.count({
      where: { is_published: true }
    });

    res.json({
      success: true,
      message: 'Admin statistics retrieved successfully',
      data: {
        stats: {
          totalEnrolled: totalEnrollments,
          totalCompleted: completedEnrollments,
          totalActive: activeEnrollments,
          completionRate: Math.round(completionRate * 100) / 100,
          totalStudents,
          totalCourses,
          publishedCourses
        }
      }
    });
  } catch (error) {
    logger.error('Get admin stats error:', error);
    next(error);
  }
};

module.exports = {
  getMyEnrollments,
  getMyProgress,
  getMyCompletedCourses,
  getMyActiveCourses,
  getMyStats,
  updateMyProgress,
  completeCourse,
  completeChapter,
  getChapterProgression,
  submitCourseFeedback,
  dropCourse,
  getAdminStats
};
