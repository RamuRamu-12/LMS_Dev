const { User, Course, Enrollment } = require('../models');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Get all users with pagination
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) {
      whereClause.role = role;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['google_id'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users.map(user => user.getPublicProfile()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
};

/**
 * Get all students
 */
const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: students } = await User.findAndCountAll({
      where: { role: 'student' },
      attributes: { exclude: ['google_id'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Students retrieved successfully',
      data: {
        students: students.map(student => student.getPublicProfile()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get students error:', error);
    next(error);
  }
};

/**
 * Search users
 */
const searchUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.json({
        success: true,
        message: 'Search query required',
        data: { users: [], pagination: {} }
      });
    }

    const offset = (page - 1) * limit;
    const whereClause = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } }
      ]
    };

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['google_id'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Search results retrieved successfully',
      data: {
        users: users.map(user => user.getPublicProfile()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Search users error:', error);
    next(error);
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['google_id'] }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    next(error);
  }
};

/**
 * Create new user
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, role = 'student', avatar, password } = req.body;

    // Debug: Log the creation data
    logger.info(`Creating user with data:`, { name, email, role, hasPassword: !!password });

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const user = await User.create({
      name,
      email,
      role,
      avatar,
      password, // Will be hashed by the model hook
      is_active: true
    });

    logger.info(`User ${email} created by admin ${req.user.email}. Password set: ${!!user.password}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    logger.error('Create user error:', error);
    next(error);
  }
};

/**
 * Update user
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Debug: Log the update data
    logger.info(`Updating user ${user.email} with data:`, req.body);

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findByEmail(req.body.email);
      if (existingUser && existingUser.id !== parseInt(id)) {
        throw new AppError('Email already in use', 400);
      }
    }

    await user.update(req.body);

    // Refresh user data to get updated values
    await user.reload();

    logger.info(`User ${user.email} updated by admin ${req.user.email}. New status: ${user.is_active}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      throw new AppError('Cannot delete your own account', 400);
    }

    // Delete related records before deleting user to avoid foreign key constraint errors
    const { TestAttempt, TestAnswer, Enrollment, ChapterProgress } = require('../models');
    
    // Find all enrollments for this user
    const enrollments = await Enrollment.findAll({
      where: { student_id: id },
      attributes: ['id']
    });

    const enrollmentIds = enrollments.map(enrollment => enrollment.id);

    // Delete chapter_progress records for all enrollments
    if (enrollmentIds.length > 0) {
      await ChapterProgress.destroy({
        where: { enrollment_id: enrollmentIds }
      });
    }

    // Delete enrollments
    await Enrollment.destroy({
      where: { student_id: id }
    });
    
    // Find all test attempt IDs for this user
    const testAttempts = await TestAttempt.findAll({
      where: { student_id: id },
      attributes: ['id']
    });

    const attemptIds = testAttempts.map(attempt => attempt.id);

    // Delete test answers for all test attempts in one query
    if (attemptIds.length > 0) {
      await TestAnswer.destroy({
        where: { attempt_id: attemptIds }
      });
    }

    // Delete test attempts
    await TestAttempt.destroy({
      where: { student_id: id }
    });

    // Now delete the user
    await user.destroy();

    logger.info(`User ${user.email} deleted by admin ${req.user.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

/**
 * Activate user
 */
const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.update({ is_active: true });

    logger.info(`User ${user.email} activated by admin ${req.user.email}`);

    res.json({
      success: true,
      message: 'User activated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    logger.error('Activate user error:', error);
    next(error);
  }
};

/**
 * Deactivate user
 */
const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id) {
      throw new AppError('Cannot deactivate your own account', 400);
    }

    await user.update({ is_active: false });

    logger.info(`User ${user.email} deactivated by admin ${req.user.email}`);

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    logger.error('Deactivate user error:', error);
    next(error);
  }
};

/**
 * Get user's courses (for instructors)
 */
const getUserCourses = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const courses = await Course.findAll({
      where: { instructor_id: id },
      include: [
        {
          model: Enrollment,
          as: 'enrollments',
          attributes: ['id', 'status', 'progress', 'enrolled_at']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      message: 'User courses retrieved successfully',
      data: {
        courses: courses.map(course => ({
          ...course.getPublicInfo(),
          enrollment_count: course.enrollments.length
        }))
      }
    });
  } catch (error) {
    logger.error('Get user courses error:', error);
    next(error);
  }
};

/**
 * Get user's enrollments (for students)
 */
const getUserEnrollments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const enrollments = await Enrollment.findAll({
      where: { student_id: id },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'thumbnail', 'category', 'difficulty']
        }
      ],
      order: [['enrolled_at', 'DESC']]
    });

    res.json({
      success: true,
      message: 'User enrollments retrieved successfully',
      data: {
        enrollments: enrollments.map(enrollment => ({
          id: enrollment.id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at,
          last_accessed_at: enrollment.last_accessed_at,
          course: enrollment.course.getPublicInfo()
        }))
      }
    });
  } catch (error) {
    logger.error('Get user enrollments error:', error);
    next(error);
  }
};

module.exports = {
  getUsers,
  getStudents,
  searchUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getUserCourses,
  getUserEnrollments
};
