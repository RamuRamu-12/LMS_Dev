const { Course, User, Enrollment, CourseChapter, CourseTest, ChapterProgress, ActivityLog, FileUpload, TestQuestion, TestQuestionOption, TestAttempt, TestAnswer, Certificate, Achievement, sequelize } = require('../models');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Get all courses with filtering and pagination
 */
const getCourses = async (req, res, next) => {
  try {
    const { 
      q, 
      category, 
      difficulty, 
      page = 1, 
      limit = 10, 
      sort = 'created_at', 
      order = 'desc' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Debug logging
    console.log('=== COURSE FILTERING DEBUG ===');
    console.log('req.user:', req.user ? { id: req.user.id, role: req.user.role, name: req.user.name } : 'No user');
    console.log('req.headers.authorization:', req.headers.authorization ? 'Token present' : 'No token');

    // Apply filters - build conditions array to avoid circular references
    const conditions = [];
    
    // Base condition for published courses or admin access
    if (req.user && req.user.role === 'admin') {
      // Admin sees all courses - no base condition needed
    } else {
      conditions.push({ is_published: true });
    }
    
    // Add category filter
    if (category) {
      conditions.push({ category: category });
    }
    
    // Add difficulty filter
    if (difficulty) {
      conditions.push({ difficulty: difficulty });
    }
    
    // Add search condition
    if (q) {
      conditions.push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          // Use raw SQL for tags search to avoid type issues
          sequelize.literal(`EXISTS (
            SELECT 1 FROM unnest(tags) AS tag 
            WHERE tag ILIKE '%${q.replace(/'/g, "''")}%'
          )`)
        ]
      });
    }
    
    // Build final where clause
    const finalWhereClause = conditions.length > 0 ? { [Op.and]: conditions } : {};
    
    console.log('conditions:', conditions);
    console.log('finalWhereClause:', JSON.stringify(finalWhereClause, null, 2));
    console.log('==============================');

    const { count, rows: courses } = await Course.findAndCountAll({
      where: finalWhereClause,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'avatar']
        }
        // Removed chapters include to prevent circular references and improve performance
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Courses retrieved successfully',
      data: {
        courses: courses.map(course => course.getPublicInfo()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get courses error:', error);
    next(error);
  }
};

/**
 * Search courses
 */
const searchCourses = async (req, res, next) => {
  try {
    const { q, category, difficulty, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.json({
        success: true,
        message: 'Search query required',
        data: { courses: [], pagination: {} }
      });
    }

    const offset = (page - 1) * limit;
    const whereClause = {
      is_published: true,
      [Op.or]: [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        // Use raw SQL for tags search to avoid type issues
        sequelize.literal(`EXISTS (
          SELECT 1 FROM unnest(tags) AS tag 
          WHERE tag ILIKE '%${q.replace(/'/g, "''")}%'
        )`)
      ]
    };

    if (category) whereClause.category = category;
    if (difficulty) whereClause.difficulty = difficulty;

    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Search results retrieved successfully',
      data: {
        courses: courses.map(course => course.getPublicInfo()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Search courses error:', error);
    next(error);
  }
};

/**
 * Get popular courses
 */
const getPopularCourses = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const courses = await Course.findAll({
      where: { is_published: true },
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['enrollment_count', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Popular courses retrieved successfully',
      data: {
        courses: courses.map(course => course.getPublicInfo())
      }
    });
  } catch (error) {
    logger.error('Get popular courses error:', error);
    next(error);
  }
};

/**
 * Get top-rated courses
 */
const getTopRatedCourses = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const courses = await Course.findAll({
      where: { 
        is_published: true,
        total_ratings: { [Op.gte]: 1 }
      },
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['average_rating', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      message: 'Top-rated courses retrieved successfully',
      data: {
        courses: courses.map(course => course.getPublicInfo())
      }
    });
  } catch (error) {
    logger.error('Get top-rated courses error:', error);
    next(error);
  }
};

/**
 * Get unique categories from courses
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Course.findAll({
      attributes: ['category'],
      where: {
        is_published: true
      },
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(course => course.category).filter(Boolean);

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories: categoryList
      }
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    next(error);
  }
};

/**
 * Get course by ID
 */
const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: CourseChapter,
          as: 'chapters',
          attributes: ['id', 'title', 'description', 'video_url', 'pdf_url', 'chapter_order', 'duration_minutes', 'is_published'],
          where: { is_published: true },
          required: false
        },
        {
          model: CourseTest,
          as: 'tests',
          attributes: ['id', 'title', 'description', 'passing_score', 'is_active'],
          where: { is_active: true },
          required: false
        }
      ],
      order: [
        [{ model: CourseChapter, as: 'chapters' }, 'chapter_order', 'ASC']
      ]
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if course is published - only admins can view unpublished courses
    if (!course.is_published && (!req.user || req.user.role !== 'admin')) {
      throw new AppError('Course not found', 404);
    }

    // Debug: Log course and chapters data
    console.log('=== BACKEND DEBUG - getCourseById ===');
    console.log('Course ID:', id);
    console.log('Course title:', course.title);
    console.log('Course is_published:', course.is_published);
    console.log('User role:', req.user?.role || 'not authenticated');
    console.log('Course chapters:', course.chapters);
    console.log('Chapters length:', course.chapters ? course.chapters.length : 0);
    if (course.chapters && course.chapters.length > 0) {
      console.log('Chapter details:', course.chapters.map(ch => ({ id: ch.id, title: ch.title, published: ch.is_published, order: ch.chapter_order })));
    }

    // Check if user is enrolled (if authenticated)
    // Check for any enrollment status except 'dropped' (enrolled, in-progress, completed)
    let enrollment = null;
    const isAuthenticated = !!req.user;
    
    if (req.user) {
      enrollment = await Enrollment.findOne({
        where: {
          student_id: req.user.id,
          course_id: id,
          status: {
            [Op.ne]: 'dropped' // Not dropped (enrolled, in-progress, completed are all valid)
          }
        }
      });
    }

    // Determine access level: 'preview' (no auth), 'authenticated' (auth but not enrolled), 'enrolled' (auth + enrolled)
    // User has full access if they have any enrollment (not dropped)
    const hasFullAccess = isAuthenticated && enrollment && enrollment.status !== 'dropped';

    // Combine chapters and tests into a single content array
    const allContent = [];
    
    // Add chapters
    if (course.chapters) {
      course.chapters.forEach(chapter => {
        const chapterInfo = chapter.getPublicInfo();
        
        // For preview mode, exclude content URLs but keep metadata
        if (!hasFullAccess) {
          // Return preview data only (metadata without content URLs)
          allContent.push({
            id: chapterInfo.id,
            title: chapterInfo.title,
            description: chapterInfo.description,
            chapter_order: chapterInfo.chapter_order,
            duration_minutes: chapterInfo.duration_minutes,
            is_published: chapterInfo.is_published,
            test_id: chapterInfo.test_id,
            // Indicate content exists but URLs are not provided
            has_video: !!chapterInfo.video_url,
            has_pdf: !!chapterInfo.pdf_url,
            type: 'chapter'
          });
        } else {
          // Full access - include all data including URLs
          allContent.push({
            ...chapterInfo,
            type: 'chapter'
          });
        }
      });
    }
    
    // Add tests as the last items (only show test metadata in preview, not test content)
    if (course.tests) {
      course.tests.forEach(test => {
        if (!hasFullAccess) {
          // Preview mode - show test exists but no access
          allContent.push({
            id: test.id,
            title: test.title,
            description: test.description,
            type: 'test',
            has_test: true,
            chapter_order: 9999 + test.id // Place tests at the end
          });
        } else {
          // Full access
          allContent.push({
            id: test.id,
            title: test.title,
            description: test.description,
            type: 'test',
            passing_score: test.passing_score,
            chapter_order: 9999 + test.id // Place tests at the end
          });
        }
      });
    }
    
    // Sort by chapter_order
    allContent.sort((a, b) => a.chapter_order - b.chapter_order);

    const responseData = {
      success: true,
      message: 'Course retrieved successfully',
      data: {
        course: {
          ...course.getPublicInfo(),
          chapters: allContent
        },
        enrollment: enrollment ? {
          id: enrollment.id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at
        } : null,
        accessLevel: hasFullAccess ? 'enrolled' : (isAuthenticated ? 'authenticated' : 'preview')
      }
    };

    console.log('=== BACKEND RESPONSE DEBUG ===');
    console.log('Response course chapters:', responseData.data.course.chapters);
    console.log('Response chapters length:', responseData.data.course.chapters.length);

    res.json(responseData);
  } catch (error) {
    logger.error('Get course by ID error:', error);
    next(error);
  }
};

/**
 * Create new course
 */
const createCourse = async (req, res, next) => {
  try {
    // Clean learning objectives - filter out empty strings
    const cleanedLearningObjectives = req.body.learning_objectives 
      ? req.body.learning_objectives.filter(obj => obj && obj.trim() !== '')
      : [];

    const courseData = {
      ...req.body,
      learning_objectives: cleanedLearningObjectives,
      instructor_id: req.user.id
    };



    const course = await Course.create(courseData);

    logger.info(`Course "${course.title}" created by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course: course.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Create course error:', error);
    next(error);
  }
};

/**
 * Update course
 */
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if user is admin or the course instructor
    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      throw new AppError('Access denied. You can only edit your own courses.', 403);
    }

    // Clean learning objectives - filter out empty strings
    const updateData = { ...req.body };
    if (updateData.learning_objectives) {
      updateData.learning_objectives = updateData.learning_objectives.filter(obj => obj && obj.trim() !== '');
    }

    await course.update(updateData);

    // Reload course with relationships to get updated data
    const updatedCourse = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'avatar']
        },
      ]
    });

    logger.info(`Course "${updatedCourse.title}" updated by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course: updatedCourse.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Update course error:', error);
    next(error);
  }
};

/**
 * Delete course
 */
const deleteCourse = async (req, res, next) => {
  let transaction;
  
  try {
    const { id } = req.params;
    
    // Validate course ID
    if (!id || isNaN(parseInt(id))) {
      throw new AppError('Invalid course ID', 400);
    }

    // Start transaction
    transaction = await sequelize.transaction();
    
    // Find course within transaction
    const course = await Course.findByPk(id, { 
      transaction
    });

    if (!course) {
      await transaction.rollback();
      throw new AppError('Course not found', 404);
    }

    // Check if user is admin or the course instructor
    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      await transaction.rollback();
      throw new AppError('Access denied. You can only delete your own courses.', 403);
    }

    const courseTitle = course.title;

    // Get all related course tests first
    const courseTests = await CourseTest.findAll({
      where: { course_id: id },
      transaction
    });

    const testIds = courseTests.map(test => test.id);

    // Delete test-related records first (most nested)
    if (testIds.length > 0) {
      // Get all test questions for these tests
      const testQuestions = await TestQuestion.findAll({
        where: { test_id: { [Op.in]: testIds } },
        transaction
      });

      const questionIds = testQuestions.map(q => q.id);

      if (questionIds.length > 0) {
        // Delete test question options
        await TestQuestionOption.destroy({
          where: { question_id: { [Op.in]: questionIds } },
          transaction
        });

        // Get all test attempts for these tests
        const testAttempts = await TestAttempt.findAll({
          where: { test_id: { [Op.in]: testIds } },
          transaction
        });

        const attemptIds = testAttempts.map(attempt => attempt.id);

        if (attemptIds.length > 0) {
          // Delete test answers
          await TestAnswer.destroy({
            where: { attempt_id: { [Op.in]: attemptIds } },
            transaction
          });
        }

        // Delete test attempts
        await TestAttempt.destroy({
          where: { test_id: { [Op.in]: testIds } },
          transaction
        });

        // Delete test questions
        await TestQuestion.destroy({
          where: { test_id: { [Op.in]: testIds } },
          transaction
        });
      }
    }

    // Delete course tests
    await CourseTest.destroy({
      where: { course_id: id },
      transaction
    });

    // Get all chapters for this course
    const chapters = await CourseChapter.findAll({
      where: { course_id: id },
      transaction
    });

    const chapterIds = chapters.map(ch => ch.id);

    // Get all enrollments for this course
    const enrollments = await Enrollment.findAll({
      where: { course_id: id },
      transaction
    });

    const enrollmentIds = enrollments.map(e => e.id);

    // Delete chapter progress for all enrollments in this course
    // (must be done before deleting enrollments to avoid foreign key constraint)
    if (enrollmentIds.length > 0) {
      await ChapterProgress.destroy({
        where: {
          enrollment_id: { [Op.in]: enrollmentIds }
        },
        transaction
      });
    }

    // Delete chapters
    await CourseChapter.destroy({
      where: { course_id: id },
      transaction
    });

    // Delete enrollments
    await Enrollment.destroy({
      where: { course_id: id },
      transaction
    });

    // Delete file uploads
    await FileUpload.destroy({
      where: { course_id: id },
      transaction
    });

    // Delete all certificates for this course (both direct references and test_attempt references)
    await Certificate.destroy({
      where: { course_id: id },
      transaction
    });

    // Delete all activity logs for this course
    await ActivityLog.destroy({
      where: { course_id: id },
      transaction
    });

    // Delete all achievements for this course
    await Achievement.destroy({
      where: { course_id: id },
      transaction
    });

    // Delete activity logs that reference chapters from this course
    if (chapterIds.length > 0) {
      await ActivityLog.destroy({
        where: { chapter_id: { [Op.in]: chapterIds } },
        transaction
      });
    }

    // Delete activity logs that reference tests from this course
    if (testIds.length > 0) {
      await ActivityLog.destroy({
        where: { test_id: { [Op.in]: testIds } },
        transaction
      });
    }

    // Finally delete the course
    await course.destroy({ transaction });

    // Commit transaction
    await transaction.commit();

    logger.info(`Course "${courseTitle}" deleted by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    // Rollback transaction if it exists
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    
    logger.error('Delete course error:', {
      error: error.message,
      stack: error.stack,
      courseId: req.params.id,
      userId: req.user?.id,
      errorName: error.name
    });
    
    // If it's a foreign key constraint error, provide a more helpful message
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      const appError = new AppError(
        'Cannot delete course: There are still references to this course in the database. Please try again or contact support.',
        400
      );
      return next(appError);
    }
    
    next(error);
  }
};

/**
 * Publish course
 */
const publishCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if user is admin or the course instructor
    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      throw new AppError('Access denied. You can only publish your own courses.', 403);
    }

    await course.publish();

    logger.info(`Course "${course.title}" published by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Course published successfully',
      data: {
        course: course.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Publish course error:', error);
    next(error);
  }
};

/**
 * Unpublish course
 */
const unpublishCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if user is admin or the course instructor
    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      throw new AppError('Access denied. You can only unpublish your own courses.', 403);
    }

    await course.unpublish();

    logger.info(`Course "${course.title}" unpublished by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Course unpublished successfully',
      data: {
        course: course.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Unpublish course error:', error);
    next(error);
  }
};

/**
 * Upload course files - Disabled for URL-based system
 */
const uploadCourseFiles = async (req, res, next) => {
  res.status(400).json({
    success: false,
    message: 'File uploads are not supported. Please use URL-based content system.'
  });
};

/**
 * Upload course logo
 */
const uploadCourseLogo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if user is admin or the course instructor
    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      throw new AppError('Access denied. You can only upload logos for your own courses.', 403);
    }

    if (!req.file) {
      throw new AppError('No logo file provided', 400);
    }

    const logoFile = req.file;
    const fs = require('fs');
    const path = require('path');
    
    // Create uploads/logos directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate a unique filename
    const fileExtension = logoFile.originalname.split('.').pop();
    const fileName = `course-${id}-logo-${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save file to disk
    fs.writeFileSync(filePath, logoFile.buffer);
    
    // Create URL for the uploaded file
    const logoUrl = `/uploads/logos/${fileName}`;
    
    // Update course with logo URL
    await course.update({ logo: logoUrl });

    logger.info(`Logo uploaded for course "${course.title}" by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logoUrl: logoUrl
      }
    });
  } catch (error) {
    logger.error('Upload course logo error:', error);
    next(error);
  }
};

const getCourseLogo = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`API Logo request for course ID: ${id}`);
    console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.originalUrl);
    
    const course = await Course.findByPk(id);

    if (!course) {
      console.log('Course not found');
      throw new AppError('Course not found', 404);
    }

    if (!course.logo) {
      console.log('No logo found for course');
      throw new AppError('No logo found for this course', 404);
    }

    console.log('Course logo path:', course.logo);

    const fs = require('fs');
    const path = require('path');
    
    // Extract filename from logo URL
    const logoPath = course.logo.startsWith('/') ? course.logo.substring(1) : course.logo;
    const fullPath = path.join(__dirname, '..', logoPath);
    
    console.log('Full logo path:', fullPath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log('Logo file not found at path:', fullPath);
      throw new AppError('Logo file not found', 404);
    }

    console.log('Logo file exists, reading and converting to base64...');

    // Read file and convert to base64
    const fileBuffer = fs.readFileSync(fullPath);
    const base64String = fileBuffer.toString('base64');
    
    // Determine MIME type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.svg') mimeType = 'image/svg+xml';
    
    console.log('MIME type:', mimeType);
    console.log('Base64 length:', base64String.length);
    
    // Return base64 data URL
    const response = {
      success: true,
      data: {
        logoUrl: `data:${mimeType};base64,${base64String}`
      }
    };
    
    console.log('Sending JSON response with base64 data URL');
    
    // Set cache-busting headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'application/json');
    
    res.json(response);
  } catch (error) {
    console.error('Get course logo error:', error);
    logger.error('Get course logo error:', error);
    next(error);
  }
};

/**
 * Delete course file
 */
const deleteCourseFile = async (req, res, next) => {
  res.status(400).json({
    success: false,
    message: 'File deletion is not supported. This system uses URL-based content.'
  });
};

/**
 * Get course content (for enrolled students)
 */
const getCourseContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: CourseChapter,
          as: 'chapters',
          attributes: ['id', 'title', 'description', 'video_url', 'pdf_url', 'chapter_order', 'duration_minutes', 'is_published', 'test_id'],
          where: { is_published: true },
          required: false,
          include: [
            {
              model: CourseTest,
              as: 'test',
              attributes: ['id', 'title', 'description', 'passing_score', 'is_active', 'instructions'],
              required: false
            }
          ]
        },
        {
          model: CourseTest,
          as: 'tests',
          attributes: ['id', 'title', 'description', 'passing_score', 'is_active'],
          where: { is_active: true },
          required: false
        }
      ],
      order: [
        [{ model: CourseChapter, as: 'chapters' }, 'chapter_order', 'ASC']
      ]
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if user is enrolled (for students)
    if (req.user.role === 'student' && !req.enrollment) {
      throw new AppError('You must enroll in this course to access its content', 403);
    }

    // Debug logging
    console.log('=== COURSE CONTENT DEBUG ===');
    console.log('Course ID:', id);
    console.log('Course chapters:', course.chapters ? course.chapters.length : 0);
    console.log('Course tests:', course.tests ? course.tests.length : 0);
    if (course.tests && course.tests.length > 0) {
      console.log('Test details:', course.tests.map(test => ({ id: test.id, title: test.title, is_active: test.is_active })));
    }
    console.log('============================');

    // Combine chapters and tests into a single content array
    const allContent = [];
    
    // Add all published chapters
    if (course.chapters) {
      course.chapters.forEach(chapter => {
        allContent.push({
          ...chapter.getPublicInfo(),
          type: 'chapter'
        });
      });
    }
    
    // Sort by chapter_order
    allContent.sort((a, b) => a.chapter_order - b.chapter_order);
    
    console.log('Final content array length:', allContent.length);
    console.log('Content types:', allContent.map(item => ({ type: item.type, title: item.title })));
    console.log('================================');

    res.json({
      success: true,
      message: 'Course content retrieved successfully',
      data: {
        course: {
          ...course.getPublicInfo(),
          chapters: allContent
        },
        enrollment: req.enrollment ? {
          id: req.enrollment.id,
          status: req.enrollment.status,
          progress: req.enrollment.progress,
          enrolled_at: req.enrollment.enrolled_at,
          last_accessed_at: req.enrollment.last_accessed_at
        } : null
      }
    });
  } catch (error) {
    logger.error('Get course content error:', error);
    next(error);
  }
};

/**
 * Enroll in course
 */
const enrollInCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (!course.is_published) {
      throw new AppError('Course is not published', 400);
    }

    // Check if already enrolled (check for any status except 'dropped')
    const existingEnrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id: id,
        status: {
          [Op.ne]: 'dropped' // Not dropped means they're enrolled
        }
      }
    });

    if (existingEnrollment) {
      // User is already enrolled (status: enrolled, in-progress, or completed)
      throw new AppError('Already enrolled in this course', 400);
    }
    
    // Check if user previously dropped the course and wants to re-enroll
    const droppedEnrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id: id,
        status: 'dropped'
      }
    });
    
    if (droppedEnrollment) {
      // Re-enroll by updating the dropped enrollment
      await droppedEnrollment.update({
        status: 'enrolled',
        enrolled_at: new Date(),
        progress: 0,
        completed_at: null
      });
      
      // Update course enrollment count
      await course.updateEnrollmentCount();
      
      // Log re-enrollment activity
      try {
        await ActivityLog.createActivity(
          req.user.id,
          'enrollment',
          `Re-enrolled in ${course.title}`,
          `Successfully re-enrolled in ${course.title} course`,
          {
            courseId: course.id,
            metadata: {
              courseTitle: course.title,
              courseCategory: course.category,
              courseDifficulty: course.difficulty
            },
            pointsEarned: 10
          }
        );
      } catch (activityError) {
        console.error('Failed to log re-enrollment activity:', activityError);
      }
      
      logger.info(`User ${req.user.email} re-enrolled in course "${course.title}"`);
      
      return res.status(200).json({
        success: true,
        message: 'Successfully re-enrolled in course',
        data: {
          enrollment: {
            id: droppedEnrollment.id,
            status: droppedEnrollment.status,
            enrolled_at: droppedEnrollment.enrolled_at
          }
        }
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student_id: req.user.id,
      course_id: id,
      status: 'enrolled'
    });

    // Update course enrollment count
    await course.updateEnrollmentCount();

    // Log enrollment activity
    try {
      await ActivityLog.createActivity(
        req.user.id,
        'enrollment',
        `Enrolled in ${course.title}`,
        `Successfully enrolled in ${course.title} course`,
        {
          courseId: course.id,
          metadata: {
            courseTitle: course.title,
            courseCategory: course.category,
            courseDifficulty: course.difficulty
          },
          pointsEarned: 10
        }
      );
      console.log('=== ACTIVITY LOGGED ===');
      console.log('User ID:', req.user.id);
      console.log('Course:', course.title);
      console.log('Activity type: enrollment');
      console.log('=======================');
    } catch (activityError) {
      console.error('Failed to log enrollment activity:', activityError);
      // Don't fail the enrollment if activity logging fails
    }

    logger.info(`User ${req.user.email} enrolled in course "${course.title}"`);

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          enrolled_at: enrollment.enrolled_at
        }
      }
    });
  } catch (error) {
    logger.error('Enroll in course error:', error);
    next(error);
  }
};

/**
 * Unenroll from course
 */
const unenrollFromCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id: id
      }
    });

    if (!enrollment) {
      throw new AppError('Not enrolled in this course', 400);
    }

    await enrollment.destroy();

    // Update course enrollment count
    const course = await Course.findByPk(id);
    if (course) {
      await course.updateEnrollmentCount();
    }

    logger.info(`User ${req.user.email} unenrolled from course`);

    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    logger.error('Unenroll from course error:', error);
    next(error);
  }
};

/**
 * Update course progress
 */
const updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      throw new AppError('Progress must be between 0 and 100', 400);
    }

    await req.enrollment.updateProgress(progress);

    logger.info(`User ${req.user.email} updated progress to ${progress}% for course`);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress: req.enrollment.progress,
        status: req.enrollment.status
      }
    });
  } catch (error) {
    logger.error('Update progress error:', error);
    next(error);
  }
};

/**
 * Rate course
 */
const rateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    await req.enrollment.rate(rating, review);

    // Update course average rating
    const course = await Course.findByPk(id);
    if (course) {
      await course.updateRating();
    }

    logger.info(`User ${req.user.email} rated course ${rating} stars`);

    res.json({
      success: true,
      message: 'Course rated successfully',
      data: {
        rating: req.enrollment.rating,
        review: req.enrollment.review
      }
    });
  } catch (error) {
    logger.error('Rate course error:', error);
    next(error);
  }
};

/**
 * Get enrolled users for a course (Admin only)
 */
const getCourseEnrollments = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Get all enrollments for this course with user details
    const enrollments = await Enrollment.findAll({
      where: { course_id: id },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'avatar', 'role', 'is_active', 'created_at']
        }
      ],
      order: [['enrolled_at', 'DESC']]
    });

    // Format the response
    const enrolledUsers = enrollments.map(enrollment => ({
      enrollmentId: enrollment.id,
      student: enrollment.student ? {
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        avatar: enrollment.student.avatar,
        role: enrollment.student.role,
        isActive: enrollment.student.is_active,
        createdAt: enrollment.student.created_at
      } : null,
      enrolledAt: enrollment.enrolled_at,
      progress: enrollment.progress,
      status: enrollment.status,
      completedAt: enrollment.completed_at,
      lastAccessedAt: enrollment.last_accessed_at,
      timeSpent: enrollment.time_spent || 0
    }));

    logger.info(`Admin ${req.user.email} viewed enrollments for course "${course.title}"`);

    res.json({
      success: true,
      message: 'Enrolled users retrieved successfully',
      data: {
        course: {
          id: course.id,
          title: course.title
        },
        totalEnrollments: enrolledUsers.length,
        enrollments: enrolledUsers
      }
    });
  } catch (error) {
    logger.error('Get course enrollments error:', error);
    next(error);
  }
};

/**
 * Get all certificate holders for a course
 */
const getCourseCertificates = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Get all certificates for this course with user and enrollment details
    const certificates = await Certificate.findAll({
      where: { 
        course_id: id,
        is_valid: true // Only show valid certificates
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'avatar', 'role', 'is_active', 'created_at']
        }
      ],
      order: [['issued_date', 'DESC']]
    });

    // Get enrollment data for each certificate holder
    const certificateHolders = await Promise.all(
      certificates.map(async (certificate) => {
        // Find the enrollment for this student and course
        const enrollment = await Enrollment.findOne({
          where: {
            student_id: certificate.student_id,
            course_id: id
          }
        });

        return {
          certificateId: certificate.id,
          certificateNumber: certificate.certificate_number,
          issuedDate: certificate.issued_date,
          certificateUrl: certificate.certificate_url,
          verificationCode: certificate.verification_code,
          isValid: certificate.is_valid,
          student: certificate.student ? {
            id: certificate.student.id,
            name: certificate.student.name,
            email: certificate.student.email,
            avatar: certificate.student.avatar,
            role: certificate.student.role,
            isActive: certificate.student.is_active,
            createdAt: certificate.student.created_at
          } : null,
          enrolledAt: enrollment?.enrolled_at || null,
          completedAt: enrollment?.completed_at || null,
          enrollmentStatus: enrollment?.status || null
        };
      })
    );

    logger.info(`Admin ${req.user.email} viewed certificates for course "${course.title}"`);

    res.json({
      success: true,
      message: 'Certificate holders retrieved successfully',
      data: {
        course: {
          id: course.id,
          title: course.title
        },
        totalCertificates: certificateHolders.length,
        certificates: certificateHolders
      }
    });
  } catch (error) {
    logger.error('Get course certificates error:', error);
    next(error);
  }
};

module.exports = {
  getCourses,
  searchCourses,
  getPopularCourses,
  getTopRatedCourses,
  getCategories,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  uploadCourseFiles,
  uploadCourseLogo,
  getCourseLogo,
  deleteCourseFile,
  getCourseContent,
  enrollInCourse,
  unenrollFromCourse,
  updateProgress,
  rateCourse,
  getCourseEnrollments,
  getCourseCertificates
};
