const { Course, User, Enrollment, CourseChapter, CourseTest, ChapterProgress, ActivityLog, sequelize } = require('../models');
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

    // Debug: Log course and chapters data
    console.log('=== BACKEND DEBUG - getCourseById ===');
    console.log('Course ID:', id);
    console.log('Course title:', course.title);
    console.log('Course chapters:', course.chapters);
    console.log('Chapters length:', course.chapters ? course.chapters.length : 0);
    if (course.chapters && course.chapters.length > 0) {
      console.log('Chapter details:', course.chapters.map(ch => ({ id: ch.id, title: ch.title, published: ch.is_published, order: ch.chapter_order })));
    }

    // Check if user is enrolled (if authenticated)
    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({
        where: {
          student_id: req.user.id,
          course_id: id
        }
      });
    }

    // Combine chapters and tests into a single content array
    const allContent = [];
    
    // Add chapters
    if (course.chapters) {
      course.chapters.forEach(chapter => {
        allContent.push({
          ...chapter.getPublicInfo(),
          type: 'chapter'
        });
      });
    }
    
    // Add tests as the last items
    if (course.tests) {
      course.tests.forEach(test => {
        allContent.push({
          id: test.id,
          title: test.title,
          description: test.description,
          type: 'test',
          passing_score: test.passing_score,
          chapter_order: 9999 + test.id // Place tests at the end
        });
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
          enrolled_at: enrollment.enrolled_at
        } : null
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
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if user is admin or the course instructor
    if (req.user.role !== 'admin' && course.instructor_id !== req.user.id) {
      throw new AppError('Access denied. You can only delete your own courses.', 403);
    }


    await course.destroy();

    logger.info(`Course "${course.title}" deleted by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    logger.error('Delete course error:', error);
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

    // Separate regular chapters from assignment chapters
    // Exclude chapters that have a test_id (these are test chapters, not regular content)
    const regularChapters = course.chapters ? course.chapters.filter(chapter => 
      !chapter.test_id && // Exclude chapters with test_id
      !chapter.title.toLowerCase().includes('assignment') && 
      !chapter.title.toLowerCase().includes('test') && 
      !chapter.title.toLowerCase().includes('exam') &&
      !chapter.title.toLowerCase().includes('final')
    ) : [];
    
    const assignmentChapters = course.chapters ? course.chapters.filter(chapter => 
      !chapter.test_id && // Exclude chapters with test_id
      (chapter.title.toLowerCase().includes('assignment') || 
      chapter.title.toLowerCase().includes('test') || 
      chapter.title.toLowerCase().includes('exam') ||
      chapter.title.toLowerCase().includes('final'))
    ) : [];

    // Debug chapter filtering
    console.log('=== CHAPTER FILTERING DEBUG ===');
    console.log('All chapters:', course.chapters ? course.chapters.map(ch => ch.title) : []);
    console.log('Regular chapters:', regularChapters.map(ch => ch.title));
    console.log('Assignment chapters:', assignmentChapters.map(ch => ch.title));
    console.log('================================');

    // Check if all regular chapters are completed (for enrolled students)
    let allRegularChaptersCompleted = false;
    if (req.enrollment) {
      const chapterProgresses = await ChapterProgress.findAll({
        where: {
          enrollment_id: req.enrollment.id
        }
      });
      
      const progressMap = {};
      chapterProgresses.forEach(progress => {
        progressMap[progress.chapter_id] = progress;
      });
      
      allRegularChaptersCompleted = regularChapters.every(chapter => {
        const progress = progressMap[chapter.id];
        return progress ? progress.is_completed : false;
      });
      
      // Debug logging
      console.log('=== ASSIGNMENT HIDING DEBUG ===');
      console.log('Enrollment ID:', req.enrollment.id);
      console.log('Regular chapters:', regularChapters.length);
      console.log('Assignment chapters:', assignmentChapters.length);
      console.log('Chapter progresses:', chapterProgresses.length);
      console.log('All regular chapters completed:', allRegularChaptersCompleted);
      console.log('Progress map:', progressMap);
      console.log('================================');
    } else {
      // For non-enrolled users, always hide assignment chapters
      console.log('=== NON-ENROLLED USER ===');
      console.log('Hiding assignment chapters for non-enrolled user');
      console.log('========================');
    }

    // Combine chapters and tests into a single content array
    const allContent = [];
    
    // Add regular chapters
    regularChapters.forEach(chapter => {
      allContent.push({
        ...chapter.getPublicInfo(),
        type: 'chapter'
      });
    });
    
    // Only add assignment chapters if all regular chapters are completed
    if (allRegularChaptersCompleted) {
      assignmentChapters.forEach(chapter => {
        allContent.push({
          ...chapter.getPublicInfo(),
          type: 'chapter'
        });
      });
    }
    
    // Add tests as the last items (only if all regular chapters are completed)
    if (allRegularChaptersCompleted && course.tests) {
      course.tests.forEach(test => {
        allContent.push({
          id: test.id,
          title: test.title,
          description: test.description,
          type: 'test',
          passing_score: test.passing_score,
          chapter_order: 9999 + test.id // Place tests at the end
        });
      });
    }
    
    // Sort by chapter_order
    allContent.sort((a, b) => a.chapter_order - b.chapter_order);
    
    console.log('Final content array length:', allContent.length);
    console.log('Content types:', allContent.map(item => ({ type: item.type, title: item.title })));
    console.log('Assignment chapters hidden:', !allRegularChaptersCompleted);
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

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id: id
      }
    });

    if (existingEnrollment) {
      throw new AppError('Already enrolled in this course', 400);
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
  rateCourse
};
