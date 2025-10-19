const { Video, Project, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Get all videos for a project
const getProjectVideos = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { videoType, phase, isPublic } = req.query;
    
    const whereClause = { project_id: projectId };
    
    if (videoType) whereClause.video_type = videoType;
    if (phase) whereClause.phase = phase;
    if (isPublic !== undefined) whereClause.is_public = isPublic === 'true';

    const videos = await Video.findAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['video_type', 'ASC'], ['phase_number', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    logger.error('Error fetching project videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project videos',
      error: error.message
    });
  }
};

// Get video by ID
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'description']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    logger.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: error.message
    });
  }
};

// Create video (Admin only)
const createVideo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      videoUrl,
      video_url,
      thumbnailUrl,
      thumbnail_url,
      videoType,
      video_type,
      phase,
      phaseNumber,
      phase_number,
      duration,
      tags,
      isPublic,
      is_public = true
    } = req.body;

    // Use the provided field names or fall back to snake_case
    const finalVideoUrl = videoUrl || video_url;
    const finalThumbnailUrl = thumbnailUrl || thumbnail_url;
    const finalVideoType = videoType || video_type;
    const finalPhaseNumber = phaseNumber || phase_number;
    const finalIsPublic = isPublic !== undefined ? isPublic : is_public;

    // Validate required fields
    if (!title || !finalVideoUrl || !finalVideoType) {
      return res.status(400).json({
        success: false,
        message: 'Title, video URL, and video type are required'
      });
    }

    // Validate video type
    if (!['overview', 'phase'].includes(finalVideoType)) {
      return res.status(400).json({
        success: false,
        message: 'Video type must be either "overview" or "phase"'
      });
    }

    // Parse tags safely
    let parsedTags = null;
    if (tags && tags.trim() !== '') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (parseError) {
        logger.error('Error parsing tags:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid tags format. Must be valid JSON array.'
        });
      }
    }

    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Log the data we're about to create
    logger.info('Creating video with data:', {
      project_id: projectId,
      title,
      video_url: finalVideoUrl,
      video_type: finalVideoType,
      uploaded_by: req.user.id
    });

    // For overview videos, check if one already exists
    if (finalVideoType === 'overview') {
      const existingOverview = await Video.findOne({
        where: { project_id: projectId, video_type: 'overview' }
      });
      
      if (existingOverview) {
        return res.status(400).json({
          success: false,
          message: 'Overview video already exists for this project. Please update the existing one.'
        });
      }
    }

    const video = await Video.create({
      project_id: projectId,
      title,
      description,
      video_url: finalVideoUrl,
      thumbnail_url: finalThumbnailUrl,
      video_type: finalVideoType,
      phase,
      phase_number: finalPhaseNumber ? parseInt(finalPhaseNumber) : null,
      duration: duration ? parseInt(duration) : null,
      tags: parsedTags,
      is_public: finalIsPublic,
      uploaded_by: req.user.id,
      updated_by: req.user.id
    });

    // If this is an overview video, update the project's overview_video_url
    if (finalVideoType === 'overview') {
      await Project.update(
        { overview_video_url: finalVideoUrl, updated_by: req.user.id },
        { where: { id: projectId } }
      );
    }

    // Fetch the created video with associations
    const createdVideo = await Video.findByPk(video.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!createdVideo) {
      logger.error('Created video not found after creation:', video.id);
      return res.status(500).json({
        success: false,
        message: 'Video created but could not be retrieved'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: createdVideo
    });
  } catch (error) {
    logger.error('Error creating video:', error);
    logger.error('Request body:', req.body);
    logger.error('Project ID:', projectId);
    logger.error('User ID:', req.user?.id);
    res.status(500).json({
      success: false,
      message: 'Error creating video',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update video (Admin only)
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Add updated_by to the update data
    updateData.updated_by = req.user.id;

    // Parse tags if provided
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }

    // Handle field name mapping for frontend compatibility
    if (updateData.videoUrl) {
      updateData.video_url = updateData.videoUrl;
      delete updateData.videoUrl;
    }
    if (updateData.thumbnailUrl) {
      updateData.thumbnail_url = updateData.thumbnailUrl;
      delete updateData.thumbnailUrl;
    }
    if (updateData.videoType) {
      updateData.video_type = updateData.videoType;
      delete updateData.videoType;
    }
    if (updateData.phaseNumber) {
      updateData.phase_number = updateData.phaseNumber;
      delete updateData.phaseNumber;
    }
    if (updateData.isPublic !== undefined) {
      updateData.is_public = updateData.isPublic;
      delete updateData.isPublic;
    }

    const video = await Video.findByPk(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const [updatedRowsCount] = await Video.update(updateData, {
      where: { id }
    });

    // If this is an overview video and videoUrl was updated, update the project's overview_video_url
    if (video.video_type === 'overview' && updateData.video_url) {
      await Project.update(
        { overview_video_url: updateData.video_url, updated_by: req.user.id },
        { where: { id: video.project_id } }
      );
    }

    // Fetch the updated video
    const updatedVideo = await Video.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: updatedVideo
    });
  } catch (error) {
    logger.error('Error updating video:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: error.message
    });
  }
};

// Delete video (Admin only)
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findByPk(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // If this is an overview video, clear the project's overview_video_url
    if (video.video_type === 'overview') {
      await Project.update(
        { overview_video_url: null, updated_by: req.user.id },
        { where: { id: video.project_id } }
      );
    }

    // Delete from database
    await Video.destroy({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message
    });
  }
};

// Increment view count
const incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Video.increment('view_count', {
      where: { id }
    });

    res.json({
      success: true,
      message: 'View count updated'
    });
  } catch (error) {
    logger.error('Error incrementing view count:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating view count',
      error: error.message
    });
  }
};

// Get video statistics (Admin only)
const getVideoStats = async (req, res) => {
  try {
    const totalVideos = await Video.count();
    const publicVideos = await Video.count({ where: { is_public: true } });
    const totalViews = await Video.sum('view_count') || 0;
    
    const videosByType = await Video.findAll({
      attributes: [
        'video_type',
        [Video.sequelize.fn('COUNT', Video.sequelize.col('id')), 'count']
      ],
      group: ['video_type'],
      raw: true
    });

    const videosByPhase = await Video.findAll({
      attributes: [
        'phase',
        [Video.sequelize.fn('COUNT', Video.sequelize.col('id')), 'count']
      ],
      where: { video_type: 'phase' },
      group: ['phase'],
      raw: true
    });

    const recentVideos = await Video.findAll({
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        totalVideos,
        publicVideos,
        totalViews,
        videosByType,
        videosByPhase,
        recentVideos
      }
    });
  } catch (error) {
    logger.error('Error fetching video statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video statistics',
      error: error.message
    });
  }
};

module.exports = {
  getProjectVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  incrementViewCount,
  getVideoStats
};
