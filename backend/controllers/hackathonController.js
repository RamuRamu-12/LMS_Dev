const { Hackathon, HackathonParticipant, HackathonSubmission, HackathonGroup, HackathonGroupMember, Group, GroupMember, User, sequelize } = require('../models');
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
        },
        {
          model: HackathonGroup,
          as: 'groups',
          attributes: ['id', 'name', 'description', 'current_members']
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
 * Get hackathons that the student is eligible for
 */
const getMyHackathons = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Get hackathons where the student is eligible (through groups OR direct participation)
    const hackathons = await Hackathon.findAll({
      where: {
        is_published: true,
        status: {
          [Op.in]: ['upcoming', 'active']
        },
        [Op.or]: [
          // Direct participation through HackathonParticipant
          {
            '$participants.user_id$': studentId
          },
          // Group participation through HackathonGroup
          {
            '$groups.members.id$': studentId
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: HackathonParticipant,
          as: 'participants',
          where: {
            user_id: studentId
          },
          required: false,
          attributes: ['id', 'user_id', 'joined_at']
        },
        {
          model: HackathonGroup,
          as: 'groups',
          include: [
            {
              model: User,
              as: 'members',
              where: {
                id: studentId
              },
              attributes: ['id', 'name', 'email'],
              required: false
            }
          ],
          required: false
        }
      ],
      order: [['start_date', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        hackathons: hackathons,
        total: hackathons.length
      }
    });
  } catch (error) {
    console.error('Error fetching student hackathons:', error);
    next(new AppError('Failed to fetch your hackathons', 500));
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
      max_groups,
      prize_description,
      rules,
      requirements,
      video_url,
      pdf_url,
      groups = [] // Changed from student_ids to groups
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

    // Validate groups if provided
    if (groups && groups.length > 0) {
      for (const group of groups) {
        if (!group.name || !group.student_ids || !Array.isArray(group.student_ids)) {
          return next(new AppError('Each group must have a name and student_ids array', 400));
        }
        if (group.student_ids.length === 0) {
          return next(new AppError('Each group must have at least one student', 400));
        }
      }
    }

    // Create hackathon
    console.log('Creating hackathon with data:', {
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      created_by: req.user.id
    });
    
    const hackathonData = {
      name,
      description,
      logo,
      technology,
      tech_stack: tech_stack || [],
      start_date: startDate,
      end_date: endDate,
      difficulty: difficulty || 'intermediate',
      max_participants,
      max_groups,
      prize_description,
      rules,
      requirements,
      video_url,
      pdf_url,
      created_by: req.user.id,
      updated_by: req.user.id
    };

    // Add is_temp field if it exists in the request body
    if (req.body.hasOwnProperty('is_temp')) {
      hackathonData.is_temp = req.body.is_temp;
    }

    const hackathon = await Hackathon.create(hackathonData);
    
    console.log('Hackathon created successfully with ID:', hackathon.id);

    // Create groups and add members if groups provided
    if (groups && groups.length > 0) {
      let totalParticipants = 0;
      
      for (const groupData of groups) {
        // Validate student IDs exist and are students
        const students = await User.findAll({
          where: {
            id: { [Op.in]: groupData.student_ids },
            role: 'student'
          }
        });

        if (students.length !== groupData.student_ids.length) {
          return next(new AppError(`Some student IDs in group "${groupData.name}" are invalid or not students`, 400));
        }

        // Create the group
        const group = await HackathonGroup.create({
          hackathon_id: hackathon.id,
          name: groupData.name,
          description: groupData.description || null,
          max_members: groupData.max_members || null,
          current_members: groupData.student_ids.length,
          created_by: req.user.id
        });

        // Add members to the group
        const members = groupData.student_ids.map((student_id, index) => ({
          group_id: group.id,
          student_id,
          joined_at: new Date(),
          is_leader: index === 0, // First student becomes leader
          status: 'active',
          added_by: req.user.id
        }));

        await HackathonGroupMember.bulkCreate(members);
        totalParticipants += groupData.student_ids.length;
      }
      
      // Update current_participants count
      hackathon.current_participants = totalParticipants;
      await hackathon.save();
    }

    // Fetch created hackathon with associations
    const createdHackathon = await Hackathon.findByPk(hackathon.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: HackathonGroup,
          as: 'groups',
          attributes: ['id', 'name', 'description', 'current_members'],
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'name', 'email'],
              through: {
                attributes: ['is_leader', 'joined_at']
              }
            }
          ]
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
    const { selectedGroupIds, ...updateData } = req.body;
    
    // Filter out invalid group IDs
    const validGroupIds = selectedGroupIds ? selectedGroupIds.filter(id => 
      id && id !== '' && !isNaN(parseInt(id))
    ).map(id => parseInt(id)) : [];
    
    // Add updated_by field
    updateData.updated_by = req.user.id;

    // Remove fields that shouldn't be updated directly
    delete updateData.created_by;
    delete updateData.current_participants;
    
    // Fix empty strings for integer fields
    if (updateData.max_participants === '') updateData.max_participants = null;
    if (updateData.max_groups === '') updateData.max_groups = null;

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

    // Use transaction to ensure data consistency
    await sequelize.transaction(async (transaction) => {
      // Update hackathon basic data
      await hackathon.update(updateData, { transaction });

      // Handle group relationships if selectedGroupIds is provided
      if (selectedGroupIds !== undefined) {
        // Remove existing group links
        await HackathonGroup.destroy({
          where: { hackathon_id: id },
          transaction
        });

        // Create new group links if groups are selected
        if (validGroupIds && validGroupIds.length > 0) {
          for (const groupId of validGroupIds) {
            console.log(`Processing group ID: ${groupId}`);
            
            // Check if group exists
            const group = await Group.findByPk(groupId, {
              include: [
                {
                  model: User,
                  as: 'members',
                  attributes: ['id']
                }
              ],
              transaction
            });

            console.log(`Group found: ${!!group}, Members count: ${group?.members?.length || 0}`);

            if (group) {
              // Create hackathon group
              const hackathonGroup = await HackathonGroup.create({
                hackathon_id: id,
                group_id: groupId,
                name: group.name,
                description: group.description,
                max_members: group.max_members,
                current_members: group.members ? group.members.length : 0,
                created_by: req.user.id
              }, { transaction });

              console.log(`Created hackathon group with ID: ${hackathonGroup.id}`);

              // Copy group members to hackathon group
              if (group.members && group.members.length > 0) {
                const groupMembers = group.members.map(member => ({
                  group_id: hackathonGroup.id,
                  student_id: member.id,
                  joined_at: new Date(),
                  is_leader: false,
                  status: 'active',
                  added_by: req.user.id
                }));

                console.log(`Creating ${groupMembers.length} group members`);
                await HackathonGroupMember.bulkCreate(groupMembers, { transaction });
                console.log(`Successfully created group members`);
              }
            } else {
              console.log(`Group with ID ${groupId} not found`);
            }
          }
        }
      }
    });

    // Fetch updated hackathon with groups
    console.log('Fetching updated hackathon with ID:', id);
    const updatedHackathon = await Hackathon.findByPk(id, {
      include: [
        {
          model: HackathonGroup,
          as: 'groups',
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'name', 'email', 'avatar']
            }
          ]
        }
      ]
    });

    console.log('Updated hackathon found:', !!updatedHackathon);
    console.log('Updated hackathon groups count:', updatedHackathon?.groups?.length || 0);

    res.json({
      success: true,
      message: 'Hackathon updated successfully',
      data: updatedHackathon
    });
  } catch (error) {
    console.error('Error updating hackathon:', error);
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

/**
 * Get hackathon groups (Admin only)
 */
const getHackathonGroups = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    const groups = await HackathonGroup.findAll({
      where: { hackathon_id: id },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email'],
          through: {
            attributes: ['is_leader', 'joined_at', 'status']
          }
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    next(new AppError('Failed to fetch hackathon groups', 500));
  }
};

/**
 * Create hackathon group (Admin only)
 */
const createHackathonGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, max_members, student_ids } = req.body;

    if (!name || !student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return next(new AppError('Group name and student_ids array are required', 400));
    }

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    // Check if group name already exists for this hackathon
    const existingGroup = await HackathonGroup.findOne({
      where: { hackathon_id: id, name }
    });
    if (existingGroup) {
      return next(new AppError('Group name already exists for this hackathon', 400));
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

    // Create the group
    const group = await HackathonGroup.create({
      hackathon_id: id,
      name,
      description: description || null,
      max_members: max_members || null,
      current_members: student_ids.length,
      created_by: req.user.id
    });

    // Add members to the group
    const members = student_ids.map((student_id, index) => ({
      group_id: group.id,
      student_id,
      joined_at: new Date(),
      is_leader: index === 0, // First student becomes leader
      status: 'active',
      added_by: req.user.id
    }));

    await HackathonGroupMember.bulkCreate(members);

    // Update hackathon participant count
    hackathon.current_participants += student_ids.length;
    await hackathon.save();

    // Fetch created group with associations
    const createdGroup = await HackathonGroup.findByPk(group.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email'],
          through: {
            attributes: ['is_leader', 'joined_at', 'status']
          }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: createdGroup
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(new AppError('Failed to create group', 500));
  }
};

/**
 * Add members to hackathon group (Admin only)
 */
const addGroupMembers = async (req, res, next) => {
  try {
    const { id, groupId } = req.params;
    const { student_ids } = req.body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return next(new AppError('Student IDs array is required', 400));
    }

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    const group = await HackathonGroup.findByPk(groupId);
    if (!group || group.hackathon_id !== parseInt(id)) {
      return next(new AppError('Group not found', 404));
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

    // Check if students are already members
    const existingMembers = await HackathonGroupMember.findAll({
      where: {
        group_id: groupId,
        student_id: { [Op.in]: student_ids },
        status: 'active'
      }
    });

    const existingStudentIds = existingMembers.map(m => m.student_id);
    const newStudentIds = student_ids.filter(id => !existingStudentIds.includes(id));

    if (newStudentIds.length === 0) {
      return next(new AppError('All provided students are already members of this group', 400));
    }

    // Add new members
    const members = newStudentIds.map(student_id => ({
      group_id: groupId,
      student_id,
      joined_at: new Date(),
      is_leader: false,
      status: 'active',
      added_by: req.user.id
    }));

    await HackathonGroupMember.bulkCreate(members);

    // Update group member count
    group.current_members += newStudentIds.length;
    await group.save();

    // Update hackathon participant count
    hackathon.current_participants += newStudentIds.length;
    await hackathon.save();

    res.json({
      success: true,
      message: `Added ${newStudentIds.length} members to group`,
      data: {
        added: newStudentIds.length,
        already_members: existingStudentIds.length
      }
    });
  } catch (error) {
    next(new AppError('Failed to add group members', 500));
  }
};

/**
 * Remove members from hackathon group (Admin only)
 */
const removeGroupMembers = async (req, res, next) => {
  try {
    const { id, groupId } = req.params;
    const { student_ids } = req.body;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return next(new AppError('Student IDs array is required', 400));
    }

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    const group = await HackathonGroup.findByPk(groupId);
    if (!group || group.hackathon_id !== parseInt(id)) {
      return next(new AppError('Group not found', 404));
    }

    // Remove members
    const deletedCount = await HackathonGroupMember.destroy({
      where: {
        group_id: groupId,
        student_id: { [Op.in]: student_ids }
      }
    });

    // Update group member count
    group.current_members = Math.max(0, group.current_members - deletedCount);
    await group.save();

    // Update hackathon participant count
    hackathon.current_participants = Math.max(0, hackathon.current_participants - deletedCount);
    await hackathon.save();

    res.json({
      success: true,
      message: `Removed ${deletedCount} members from group`,
      data: { removed: deletedCount }
    });
  } catch (error) {
    next(new AppError('Failed to remove group members', 500));
  }
};

/**
 * Delete hackathon group (Admin only)
 */
const deleteHackathonGroup = async (req, res, next) => {
  try {
    const { id, groupId } = req.params;

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    const group = await HackathonGroup.findByPk(groupId);
    if (!group || group.hackathon_id !== parseInt(id)) {
      return next(new AppError('Group not found', 404));
    }

    const memberCount = group.current_members;

    await group.destroy();

    // Update hackathon participant count
    hackathon.current_participants = Math.max(0, hackathon.current_participants - memberCount);
    await hackathon.save();

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    next(new AppError('Failed to delete group', 500));
  }
};

const linkGroupToHackathon = async (req, res, next) => {
  try {
    const { id, groupId } = req.params;

    // Check if hackathon exists
    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    // Check if group exists
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id']
        }
      ]
    });

    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    // Check if group is already linked to this hackathon
    const existingLink = await HackathonGroup.findOne({
      where: {
        hackathon_id: id,
        group_id: groupId
      }
    });

    if (existingLink) {
      return next(new AppError('Group is already linked to this hackathon', 400));
    }

    // Create hackathon group
    const hackathonGroup = await HackathonGroup.create({
      hackathon_id: id,
      group_id: groupId,
      name: group.name,
      description: group.description,
      max_members: group.max_members,
      current_members: group.members.length,
      created_by: req.user.id
    });

    // Copy group members to hackathon group
    if (group.members.length > 0) {
      const hackathonGroupMembers = group.members.map((member, index) => ({
        group_id: hackathonGroup.id,
        student_id: member.id,
        is_leader: index === 0, // First member is leader
        added_by: req.user.id
      }));

      await HackathonGroupMember.bulkCreate(hackathonGroupMembers);
    }

    // Update hackathon participant count
    hackathon.current_participants += group.members.length;
    await hackathon.save();

    res.json({
      success: true,
      data: hackathonGroup,
      message: 'Group linked to hackathon successfully'
    });
  } catch (error) {
    next(new AppError('Failed to link group to hackathon', 500));
  }
};

/**
 * Create or update hackathon submission (Student only)
 */
const createOrUpdateSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      project_title,
      project_description,
      github_url,
      live_url,
      demo_video_url,
      presentation_url,
      documentation_url,
      additional_files_url,
      submission_notes
    } = req.body;

    // Validate required fields
    if (!project_title || !project_description) {
      return next(new AppError('Project title and description are required', 400));
    }

    // Check if hackathon exists and is active/upcoming
    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    if (!hackathon.is_published) {
      return next(new AppError('Hackathon is not published', 403));
    }

    // Check if student is eligible for the hackathon (either direct enrollment or group membership)
    console.log(`\n=== SUBMISSION ELIGIBILITY CHECK ===`);
    console.log(`Hackathon ID: ${id}`);
    console.log(`User ID: ${req.user.id}`);
    console.log(`User Email: ${req.user.email}`);
    
    const participant = await HackathonParticipant.findOne({
      where: {
        hackathon_id: id,
        student_id: req.user.id
      }
    });

    console.log(`Direct participant found:`, !!participant);
    if (participant) {
      console.log(`Participant details:`, participant.toJSON());
    }

    // If not directly enrolled, check if student is part of a group that's enrolled in this hackathon
    let isEligible = !!participant;
    
    if (!isEligible) {
      console.log(`Checking group membership for user ${req.user.id} in hackathon ${id}`);
      
      const groupMembership = await HackathonGroupMember.findOne({
        where: {
          student_id: req.user.id
        },
        include: [
          {
            model: HackathonGroup,
            as: 'group',
            where: {
              hackathon_id: id
            }
          }
        ]
      });
      
      console.log(`Group membership found:`, !!groupMembership);
      if (groupMembership) {
        console.log(`Group membership details:`, {
          id: groupMembership.id,
          student_id: groupMembership.student_id,
          group_id: groupMembership.group_id,
          group_name: groupMembership.group?.name,
          hackathon_id: groupMembership.group?.hackathon_id,
          status: groupMembership.status
        });
      } else {
        // Let's check what groups exist for this hackathon
        const hackathonGroups = await HackathonGroup.findAll({
          where: { hackathon_id: id },
          include: [{
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'email']
          }]
        });
        
        console.log(`Available groups for hackathon ${id}:`, hackathonGroups.length);
        hackathonGroups.forEach((group, index) => {
          console.log(`  Group ${index + 1}: ${group.name} (ID: ${group.id})`);
          console.log(`    Members: ${group.members?.length || 0}`);
          group.members?.forEach(member => {
            console.log(`      - ${member.name} (ID: ${member.id})`);
          });
        });
        
        // Let's also check if user is in any groups at all
        const userGroups = await HackathonGroupMember.findAll({
          where: { student_id: req.user.id },
          include: [{
            model: HackathonGroup,
            as: 'group',
            attributes: ['id', 'name', 'hackathon_id']
          }]
        });
        
        console.log(`User ${req.user.id} is in ${userGroups.length} groups total:`);
        userGroups.forEach((membership, index) => {
          console.log(`  Group ${index + 1}: ${membership.group?.name} (Hackathon ID: ${membership.group?.hackathon_id})`);
        });
      }
      
      isEligible = !!groupMembership;
    }

    console.log(`Final eligibility result: ${isEligible}`);
    console.log(`=== END ELIGIBILITY CHECK ===\n`);

    if (!isEligible) {
      return next(new AppError('You are not enrolled in this hackathon', 403));
    }

    // Check if hackathon is still accepting submissions
    const now = new Date();
    if (now > hackathon.end_date) {
      return next(new AppError('Submission deadline has passed', 400));
    }

    // Check if submission already exists
    let submission = await HackathonSubmission.findOne({
      where: {
        hackathon_id: id,
        student_id: req.user.id
      }
    });

    if (submission) {
      // Update existing submission
      await submission.update({
        project_title,
        project_description,
        github_url,
        live_url,
        demo_video_url,
        presentation_url,
        documentation_url,
        additional_files_url,
        submission_notes,
        status: 'draft' // Reset to draft when updating
      });

      res.json({
        success: true,
        message: 'Submission updated successfully',
        data: submission
      });
    } else {
      // Create new submission
      submission = await HackathonSubmission.create({
        hackathon_id: id,
        student_id: req.user.id,
        project_title,
        project_description,
        github_url,
        live_url,
        demo_video_url,
        presentation_url,
        documentation_url,
        additional_files_url,
        submission_notes,
        status: 'draft'
      });

      res.status(201).json({
        success: true,
        message: 'Submission created successfully',
        data: submission
      });
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(new AppError('Failed to create/update submission', 500));
  }
};

/**
 * Submit hackathon submission (Student only)
 */
const submitSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if hackathon exists
    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    // Check if student is eligible for the hackathon (either direct enrollment or group membership)
    const participant = await HackathonParticipant.findOne({
      where: {
        hackathon_id: id,
        student_id: req.user.id
      }
    });

    // If not directly enrolled, check if student is part of a group that's enrolled in this hackathon
    let isEligible = !!participant;
    
    if (!isEligible) {
      const groupMembership = await HackathonGroupMember.findOne({
        where: {
          student_id: req.user.id
        },
        include: [
          {
            model: HackathonGroup,
            as: 'group',
            where: {
              hackathon_id: id
            }
          }
        ]
      });
      
      isEligible = !!groupMembership;
    }

    if (!isEligible) {
      return next(new AppError('You are not enrolled in this hackathon', 403));
    }

    // Check if submission exists
    const submission = await HackathonSubmission.findOne({
      where: {
        hackathon_id: id,
        student_id: req.user.id
      }
    });

    if (!submission) {
      return next(new AppError('No submission found. Please create a submission first.', 404));
    }

    // Check if already submitted
    if (submission.status === 'submitted') {
      return next(new AppError('Submission has already been submitted', 400));
    }

    // Check if hackathon is still accepting submissions
    const now = new Date();
    if (now > hackathon.end_date) {
      return next(new AppError('Submission deadline has passed', 400));
    }

    // Submit the submission
    await submission.submit();

    // Update participant status if participant exists (direct enrollment)
    if (participant) {
      participant.status = 'submitted';
      participant.submitted_at = new Date();
      await participant.save();
    }

    res.json({
      success: true,
      message: 'Submission submitted successfully',
      data: submission
    });
  } catch (error) {
    next(new AppError('Failed to submit submission', 500));
  }
};

/**
 * Get student's submission for a hackathon (Student only)
 */
const getMySubmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const submission = await HackathonSubmission.findOne({
      where: {
        hackathon_id: id,
        student_id: req.user.id
      },
      include: [
        {
          model: Hackathon,
          as: 'hackathon',
          attributes: ['id', 'name', 'start_date', 'end_date', 'status']
        }
      ]
    });

    if (!submission) {
      return res.json({
        success: true,
        data: null,
        message: 'No submission found'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(new AppError('Failed to fetch submission', 500));
  }
};

/**
 * Get all submissions for a hackathon (Admin only)
 */
const getHackathonSubmissions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    const submissions = await HackathonSubmission.findByHackathon(id);

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    next(new AppError('Failed to fetch hackathon submissions', 500));
  }
};

/**
 * Review submission (Admin only)
 */
const reviewSubmission = async (req, res, next) => {
  try {
    const { id, submissionId } = req.params;
    const { status, review_notes, score } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return next(new AppError('Invalid status. Must be accepted or rejected', 400));
    }

    const submission = await HackathonSubmission.findOne({
      where: {
        id: submissionId,
        hackathon_id: id
      }
    });

    if (!submission) {
      return next(new AppError('Submission not found', 404));
    }

    if (status === 'accepted') {
      await submission.accept(req.user.id, review_notes, score);
    } else {
      await submission.reject(req.user.id, review_notes);
    }

    res.json({
      success: true,
      message: `Submission ${status} successfully`,
      data: submission
    });
  } catch (error) {
    next(new AppError('Failed to review submission', 500));
  }
};

/**
 * Set submission as winner (Admin only)
 */
const setSubmissionWinner = async (req, res, next) => {
  try {
    const { id, submissionId } = req.params;
    const { prize, ranking } = req.body;

    const submission = await HackathonSubmission.findOne({
      where: {
        id: submissionId,
        hackathon_id: id
      }
    });

    if (!submission) {
      return next(new AppError('Submission not found', 404));
    }

    await submission.setWinner(prize, ranking);

    res.json({
      success: true,
      message: 'Submission marked as winner successfully',
      data: submission
    });
  } catch (error) {
    next(new AppError('Failed to set submission as winner', 500));
  }
};

module.exports = {
  getAllHackathons,
  getMyHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  updateHackathonMultimedia,
  deleteHackathon,
  addParticipants,
  removeParticipants,
  getHackathonParticipants,
  toggleHackathonPublish,
  getHackathonMultimedia,
  getHackathonGroups,
  createHackathonGroup,
  addGroupMembers,
  removeGroupMembers,
  deleteHackathonGroup,
  linkGroupToHackathon,
  createOrUpdateSubmission,
  submitSubmission,
  getMySubmission,
  getHackathonSubmissions,
  reviewSubmission,
  setSubmissionWinner
};
