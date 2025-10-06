const { Hackathon, HackathonParticipant, User, sequelize } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Get all hackathons with filtering and pagination
 */
const getAllHackathons = async (req, res, next) => {
  try {
    const { 
      q, 
      status, 
      difficulty, 
      page = 1, 
      limit = 10, 
      sort = 'created_at', 
      order = 'desc' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Apply filters
    const conditions = [];
    
    // Try to authenticate user if token is provided (optional authentication)
    let user = req.user;
    if (!user && req.headers.authorization) {
      try {
        // Try to decode token to get user info
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from database
        const User = require('../models').User;
        user = await User.findByPk(decoded.id);
      } catch (authError) {
        // If token is invalid, just continue without user (public access)
        console.log('Optional auth failed, proceeding as public user');
      }
    }
    
    // Base condition for published hackathons or admin access
    if (user && user.role === 'admin') {
      // Admin sees all hackathons - no base condition needed
      console.log('getAllHackathons - Admin access granted');
    } else {
      // Public/student users only see published hackathons
      conditions.push({ is_published: true });
      console.log('getAllHackathons - Public access - showing only published hackathons');
    }
    
    // Add status filter
    if (status) {
      conditions.push({ status: status });
    }
    
    // Add difficulty filter
    if (difficulty) {
      conditions.push({ difficulty: difficulty });
    }
    
    // Add search condition
    if (q) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { technology: { [Op.iLike]: `%${q}%` } }
        ]
      });
    }
    
    // Build final where clause
    const finalWhereClause = conditions.length > 0 ? { [Op.and]: conditions } : {};
    
    console.log('getAllHackathons - User role:', user?.role || 'none');
    console.log('getAllHackathons - Where clause:', JSON.stringify(finalWhereClause, null, 2));

    const { count, rows: hackathons } = await Hackathon.findAndCountAll({
      where: finalWhereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    console.log('getAllHackathons - Found count:', count);
    console.log('getAllHackathons - Found hackathons:', hackathons.length);

    res.json({
      success: true,
      data: {
        hackathons,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(new AppError('Failed to fetch hackathons', 500));
  }
};

/**
 * Get single hackathon by ID
 */
const getHackathonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'name', 'email', 'profile_picture'],
          through: {
            attributes: ['status', 'enrolled_at', 'submitted_at']
          }
        }
      ]
    });

    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    // Check if hackathon is published (for non-admin users)
    if (!req.user || req.user.role !== 'admin') {
      if (!hackathon.is_published) {
        return next(new AppError('Hackathon not found', 404));
      }
    }

    res.json({
      success: true,
      data: hackathon
    });
  } catch (error) {
    next(new AppError('Failed to fetch hackathon', 500));
  }
};

/**
 * Create new hackathon (Admin only)
 */
const createHackathon = async (req, res, next) => {
  try {
    const {
      name,
      description,
      logo,
      technology,
      tech_stack,
      start_date,
      end_date,
      difficulty,
      max_participants,
      prize_description,
      rules,
      requirements,
      video_url,
      pdf_url,
      student_ids = []
    } = req.body;

    // Validate required fields
    if (!name || !description || !start_date || !end_date) {
      return next(new AppError('Name, description, start date, and end date are required', 400));
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (endDate <= startDate) {
      return next(new AppError('End date must be after start date', 400));
    }

    // Create hackathon
    console.log('Creating hackathon with data:', {
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      created_by: req.user.id
    });
    
    const hackathon = await Hackathon.create({
      name,
      description,
      logo,
      technology,
      tech_stack: tech_stack || [],
      start_date: startDate,
      end_date: endDate,
      difficulty: difficulty || 'intermediate',
      max_participants,
      prize_description,
      rules,
      requirements,
      video_url,
      pdf_url,
      created_by: req.user.id,
      updated_by: req.user.id
    });
    
    console.log('Hackathon created successfully with ID:', hackathon.id);

    // Add participants if student_ids provided
    if (student_ids && student_ids.length > 0) {
      // Validate student IDs exist and are students
      const students = await User.findAll({
        where: {
          id: { [Op.in]: student_ids },
          role: 'student'
        }
      });

      if (students.length !== student_ids.length) {
        return next(new AppError('Some student IDs are invalid or not students', 400));
      }

      // Add participants
      const participants = student_ids.map(student_id => ({
        hackathon_id: hackathon.id,
        student_id,
        enrolled_at: new Date(),
        status: 'enrolled'
      }));

      await HackathonParticipant.bulkCreate(participants);
      
      // Update current_participants count
      hackathon.current_participants = students.length;
      await hackathon.save();
    }

    // Fetch created hackathon with associations
    const createdHackathon = await Hackathon.findByPk(hackathon.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Hackathon created successfully',
      data: createdHackathon
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(new AppError('Failed to create hackathon', 500));
  }
};

/**
 * Update hackathon (Admin only)
 */
const updateHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_by: req.user.id };

    // Remove fields that shouldn't be updated directly
    delete updateData.created_by;
    delete updateData.current_participants;

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    // Validate dates if provided
    if (updateData.start_date && updateData.end_date) {
      const startDate = new Date(updateData.start_date);
      const endDate = new Date(updateData.end_date);
      if (endDate <= startDate) {
        return next(new AppError('End date must be after start date', 400));
      }
    }

    await hackathon.update(updateData);

    res.json({
      success: true,
      message: 'Hackathon updated successfully',
      data: hackathon
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(new AppError('Failed to update hackathon', 500));
  }
};

/**
 * Update hackathon multimedia content (Admin only)
 */
const updateHackathonMultimedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { video_url, pdf_url } = req.body;

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    // Update multimedia URLs
    const updateData = {
      video_url,
      pdf_url,
      multimedia_last_updated: new Date(),
      multimedia_uploaded_by: req.user.id,
      updated_by: req.user.id
    };

    // Add metadata for multimedia uploads
    const multimediaMetadata = {};
    if (video_url) multimediaMetadata.video = { uploadedAt: new Date(), uploadedBy: req.user.id };
    if (pdf_url) multimediaMetadata.pdf = { uploadedAt: new Date(), uploadedBy: req.user.id };

    updateData.multimedia_uploads = { ...hackathon.multimedia_uploads, ...multimediaMetadata };

    await hackathon.update(updateData);

    res.json({
      success: true,
      message: 'Hackathon multimedia content updated successfully',
      data: hackathon
    });
  } catch (error) {
    next(new AppError('Failed to update hackathon multimedia content', 500));
  }
};

/**
 * Delete hackathon (Admin only)
 */
const deleteHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    await hackathon.destroy();

    res.json({
      success: true,
      message: 'Hackathon deleted successfully'
    });
  } catch (error) {
    next(new AppError('Failed to delete hackathon', 500));
  }
};

/**
 * Add participants to hackathon (Admin only)
 */
const addParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { student_ids } = req.body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return next(new AppError('Student IDs array is required', 400));
    }

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    // Validate student IDs exist and are students
    const students = await User.findAll({
      where: {
        id: { [Op.in]: student_ids },
        role: 'student'
      }
    });

    if (students.length !== student_ids.length) {
      return next(new AppError('Some student IDs are invalid or not students', 400));
    }

    // Check if students are already participants
    const existingParticipants = await HackathonParticipant.findAll({
      where: {
        hackathon_id: id,
        student_id: { [Op.in]: student_ids }
      }
    });

    const existingStudentIds = existingParticipants.map(p => p.student_id);
    const newStudentIds = student_ids.filter(id => !existingStudentIds.includes(id));

    if (newStudentIds.length === 0) {
      return next(new AppError('All provided students are already participants', 400));
    }

    // Add new participants
    const participants = newStudentIds.map(student_id => ({
      hackathon_id: id,
      student_id,
      enrolled_at: new Date(),
      status: 'enrolled'
    }));

    await HackathonParticipant.bulkCreate(participants);

    // Update current_participants count
    hackathon.current_participants = await HackathonParticipant.count({
      where: { hackathon_id: id }
    });
    await hackathon.save();

    res.json({
      success: true,
      message: `Added ${newStudentIds.length} participants to hackathon`,
      data: {
        added: newStudentIds.length,
        already_participants: existingStudentIds.length
      }
    });
  } catch (error) {
    next(new AppError('Failed to add participants', 500));
  }
};

/**
 * Remove participants from hackathon (Admin only)
 */
const removeParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { student_ids } = req.body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return next(new AppError('Student IDs array is required', 400));
    }

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    // Remove participants
    const deletedCount = await HackathonParticipant.destroy({
      where: {
        hackathon_id: id,
        student_id: { [Op.in]: student_ids }
      }
    });

    // Update current_participants count
    hackathon.current_participants = await HackathonParticipant.count({
      where: { hackathon_id: id }
    });
    await hackathon.save();

    res.json({
      success: true,
      message: `Removed ${deletedCount} participants from hackathon`,
      data: { removed: deletedCount }
    });
  } catch (error) {
    next(new AppError('Failed to remove participants', 500));
  }
};

/**
 * Get hackathon participants (Admin only)
 */
const getHackathonParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    const participants = await HackathonParticipant.findAll({
      where: { hackathon_id: id },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'profile_picture']
        }
      ],
      order: [['enrolled_at', 'DESC']]
    });

    res.json({
      success: true,
      data: participants
    });
  } catch (error) {
    next(new AppError('Failed to fetch hackathon participants', 500));
  }
};

/**
 * Publish/Unpublish hackathon (Admin only)
 */
const toggleHackathonPublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    hackathon.is_published = is_published;
    hackathon.published_at = is_published ? new Date() : null;
    hackathon.updated_by = req.user.id;
    await hackathon.save();

    res.json({
      success: true,
      message: `Hackathon ${is_published ? 'published' : 'unpublished'} successfully`,
      data: hackathon
    });
  } catch (error) {
    next(new AppError('Failed to update hackathon publish status', 500));
  }
};

/**
 * Get hackathon multimedia content (Public)
 */
const getHackathonMultimedia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findByPk(id, {
      attributes: [
        'id',
        'name',
        'video_url',
        'pdf_url',
        'multimedia_last_updated',
        'multimedia_uploaded_by'
      ]
    });

    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    // Check if hackathon is published (for non-admin users)
    if (!req.user || req.user.role !== 'admin') {
      if (!hackathon.is_published) {
        return next(new AppError('Hackathon not found', 404));
      }
    }

    res.json({
      success: true,
      data: {
        hackathonId: hackathon.id,
        hackathonName: hackathon.name,
        multimedia: {
          video: hackathon.video_url,
          pdf: hackathon.pdf_url
        },
        lastUpdated: hackathon.multimedia_last_updated,
        uploadedBy: hackathon.multimedia_uploaded_by
      }
    });
  } catch (error) {
    next(new AppError('Failed to fetch hackathon multimedia content', 500));
  }
};

module.exports = {
  getAllHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  updateHackathonMultimedia,
  deleteHackathon,
  addParticipants,
  removeParticipants,
  getHackathonParticipants,
  toggleHackathonPublish,
  getHackathonMultimedia
};
