const { ChatMessage, ChatParticipant, User, Hackathon, HackathonGroup } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get chat messages for a specific hackathon group
 */
const getChatMessages = async (req, res, next) => {
  try {
    const { hackathonId, groupId } = req.params;
    const { page = 1, limit = 50, before = null } = req.query;
    const userId = req.user.id;

    // Verify user has access to this chat
    const hasAccess = await verifyChatAccess(userId, hackathonId, groupId);
    if (!hasAccess) {
      return next(new AppError('Access denied to this chat room', 403));
    }

    // Build where clause for pagination
    let whereClause = {
      hackathon_id: hackathonId,
      group_id: groupId,
      is_deleted: false
    };

    if (before) {
      whereClause.id = { [Op.lt]: before };
    }

    // Get messages with pagination
    const messages = await ChatMessage.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: ChatMessage,
          as: 'replyToMessage',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Mark messages as read for this user
    await ChatParticipant.update(
      { 
        last_read_at: new Date(),
        unread_count: 0
      },
      {
        where: {
          hackathon_id: hackathonId,
          group_id: groupId,
          user_id: userId
        }
      }
    );

    res.json({
      success: true,
      data: {
        messages: messages.rows.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: messages.count,
          hasMore: messages.rows.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    next(new AppError('Failed to fetch chat messages', 500));
  }
};

/**
 * Get chat rooms for a user (hackathons they can participate in)
 */
const getMyChatRooms = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { role } = req.user;

    let whereClause = {
      user_id: userId,
      is_active: true
    };

    // If admin, get all chat rooms
    if (role === 'admin') {
      whereClause = { is_active: true };
    }

    const chatRooms = await ChatParticipant.findAll({
      where: whereClause,
      include: [
        {
          model: Hackathon,
          as: 'hackathon',
          attributes: ['id', 'title', 'description', 'start_date', 'end_date', 'status']
        },
        {
          model: HackathonGroup,
          as: 'group',
          attributes: ['id', 'group_name', 'description']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['last_activity_at', 'DESC']]
    });

    // Group by hackathon
    const groupedRooms = chatRooms.reduce((acc, room) => {
      const hackathonId = room.hackathon.id;
      if (!acc[hackathonId]) {
        acc[hackathonId] = {
          hackathon: room.hackathon,
          groups: []
        };
      }
      acc[hackathonId].groups.push({
        id: room.group.id,
        group_name: room.group.group_name,
        description: room.group.description,
        unread_count: room.unread_count,
        last_read_at: room.last_read_at,
        is_online: room.is_online,
        role: room.role
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        chatRooms: Object.values(groupedRooms),
        total: Object.keys(groupedRooms).length
      }
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    next(new AppError('Failed to fetch chat rooms', 500));
  }
};

/**
 * Get all chat rooms for admin
 */
const getAllChatRooms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    let whereClause = {
      is_active: true
    };

    if (search) {
      whereClause[Op.or] = [
        { '$hackathon.title$': { [Op.iLike]: `%${search}%` } },
        { '$group.group_name$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const chatRooms = await ChatParticipant.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Hackathon,
          as: 'hackathon',
          attributes: ['id', 'title', 'description', 'start_date', 'end_date', 'status']
        },
        {
          model: HackathonGroup,
          as: 'group',
          attributes: ['id', 'group_name', 'description']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['last_activity_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true
    });

    // Group by hackathon and group
    const groupedRooms = {};
    chatRooms.rows.forEach(room => {
      const key = `${room.hackathon.id}_${room.group.id}`;
      if (!groupedRooms[key]) {
        groupedRooms[key] = {
          hackathon: room.hackathon,
          group: room.group,
          participants: [],
          total_messages: 0,
          last_activity: room.last_activity_at
        };
      }
      groupedRooms[key].participants.push({
        id: room.user.id,
        name: room.user.name,
        email: room.user.email,
        unread_count: room.unread_count,
        is_online: room.is_online,
        role: room.role
      });
    });

    res.json({
      success: true,
      data: {
        chatRooms: Object.values(groupedRooms),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: chatRooms.count,
          hasMore: chatRooms.rows.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all chat rooms:', error);
    next(new AppError('Failed to fetch chat rooms', 500));
  }
};

/**
 * Get chat statistics for admin
 */
const getChatStatistics = async (req, res, next) => {
  try {
    const totalMessages = await ChatMessage.count({
      where: { is_deleted: false }
    });

    const totalParticipants = await ChatParticipant.count({
      where: { is_active: true }
    });

    const onlineUsers = await ChatParticipant.count({
      where: { is_online: true }
    });

    const totalChatRooms = await ChatParticipant.count({
      where: { is_active: true },
      group: ['hackathon_id', 'group_id'],
      distinct: true
    });

    const recentMessages = await ChatMessage.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Hackathon,
          as: 'hackathon',
          attributes: ['id', 'title']
        },
        {
          model: HackathonGroup,
          as: 'group',
          attributes: ['id', 'group_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        statistics: {
          totalMessages,
          totalParticipants,
          onlineUsers,
          totalChatRooms
        },
        recentMessages
      }
    });
  } catch (error) {
    console.error('Error fetching chat statistics:', error);
    next(new AppError('Failed to fetch chat statistics', 500));
  }
};

/**
 * Delete a message (for moderation)
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await ChatMessage.findByPk(messageId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    // Check if user can delete this message (author or admin)
    if (message.user_id !== userId && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this message', 403));
    }

    // Soft delete the message
    await message.update({
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date()
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    next(new AppError('Failed to delete message', 500));
  }
};

/**
 * Mute/unmute a user in a chat room
 */
const toggleUserMute = async (req, res, next) => {
  try {
    const { hackathonId, groupId, userId: targetUserId } = req.params;
    const adminId = req.user.id;

    // Only admins can mute users
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can mute users', 403));
    }

    const participant = await ChatParticipant.findOne({
      where: {
        hackathon_id: hackathonId,
        group_id: groupId,
        user_id: targetUserId
      }
    });

    if (!participant) {
      return next(new AppError('User not found in this chat room', 404));
    }

    await participant.update({
      is_muted: !participant.is_muted
    });

    res.json({
      success: true,
      message: `User ${participant.is_muted ? 'unmuted' : 'muted'} successfully`,
      data: {
        is_muted: participant.is_muted
      }
    });
  } catch (error) {
    console.error('Error toggling user mute:', error);
    next(new AppError('Failed to toggle user mute', 500));
  }
};

/**
 * Add user to chat room (for admins)
 */
const addUserToChat = async (req, res, next) => {
  try {
    const { hackathonId, groupId, userId } = req.body;
    const adminId = req.user.id;

    // Only admins can add users to chat
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can add users to chat', 403));
    }

    // Check if user is already in the chat
    const existingParticipant = await ChatParticipant.findOne({
      where: {
        hackathon_id: hackathonId,
        group_id: groupId,
        user_id: userId
      }
    });

    if (existingParticipant) {
      return next(new AppError('User is already in this chat room', 400));
    }

    // Add user to chat
    const participant = await ChatParticipant.create({
      hackathon_id: hackathonId,
      group_id: groupId,
      user_id: userId,
      role: 'member'
    });

    res.json({
      success: true,
      message: 'User added to chat room successfully',
      data: { participant }
    });
  } catch (error) {
    console.error('Error adding user to chat:', error);
    next(new AppError('Failed to add user to chat', 500));
  }
};

/**
 * Remove user from chat room (for admins)
 */
const removeUserFromChat = async (req, res, next) => {
  try {
    const { hackathonId, groupId, userId } = req.params;
    const adminId = req.user.id;

    // Only admins can remove users from chat
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can remove users from chat', 403));
    }

    const participant = await ChatParticipant.findOne({
      where: {
        hackathon_id: hackathonId,
        group_id: groupId,
        user_id: userId
      }
    });

    if (!participant) {
      return next(new AppError('User not found in this chat room', 404));
    }

    await participant.update({ is_active: false });

    res.json({
      success: true,
      message: 'User removed from chat room successfully'
    });
  } catch (error) {
    console.error('Error removing user from chat:', error);
    next(new AppError('Failed to remove user from chat', 500));
  }
};

/**
 * Helper function to verify chat access
 */
const verifyChatAccess = async (userId, hackathonId, groupId) => {
  try {
    // Check if user is a participant in this group
    const participant = await ChatParticipant.findOne({
      where: {
        hackathon_id: hackathonId,
        group_id: groupId,
        user_id: userId,
        is_active: true
      }
    });

    if (participant) return true;

    // Check if user is admin
    const user = await User.findByPk(userId);
    if (user && user.role === 'admin') {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying chat access:', error);
    return false;
  }
};

module.exports = {
  getChatMessages,
  getMyChatRooms,
  getAllChatRooms,
  getChatStatistics,
  deleteMessage,
  toggleUserMute,
  addUserToChat,
  removeUserFromChat
};
