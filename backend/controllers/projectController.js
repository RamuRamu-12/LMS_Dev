const { Project, Document, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const { status, difficulty, category, isPublished, page = 1, limit = 10 } = req.query;
    
    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (difficulty) whereClause.difficulty = difficulty;
    if (category) whereClause.category = category;
    if (isPublished !== undefined) whereClause.is_published = isPublished === 'true';

    const offset = (page - 1) * limit;
    
    const projects = await Project.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'title', 'document_type', 'phase', 'file_url', 'download_count'],
          where: { is_public: true },
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    res.json({
      success: true,
      data: {
        projects: projects.rows,
        pagination: {
          total: projects.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(projects.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'title', 'description', 'document_type', 'phase', 'file_url', 'file_size', 'mime_type', 'download_count', 'created_at'],
          where: { is_public: true },
          required: false,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// Create new project (Admin only)
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      estimatedDuration,
      category,
      technologies,
      phases,
      thumbnail,
      logo
    } = req.body;

    const project = await Project.create({
      title,
      description,
      difficulty,
      estimatedDuration,
      category,
      technologies,
      phases,
      thumbnail,
      logo,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    // Fetch the created project with associations
    const createdProject = await Project.findByPk(project.id, {
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
      message: 'Project created successfully',
      data: createdProject
    });
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// Update project (Admin only)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Add updatedBy to the update data
    updateData.updatedBy = req.user.id;

    const [updatedRowsCount] = await Project.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Fetch the updated project
    const updatedProject = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// Delete project (Admin only)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRowsCount = await Project.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};

// Publish/Unpublish project (Admin only)
const toggleProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;
    
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const updateData = {
      is_published,
      updated_by: req.user.id
    };

    if (is_published && !project.published_at) {
      updateData.published_at = new Date();
    }

    await Project.update(updateData, {
      where: { id }
    });

    res.json({
      success: true,
      message: `Project ${is_published ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    logger.error('Error toggling project status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project status',
      error: error.message
    });
  }
};

// Get project statistics (Admin only)
const getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const publishedProjects = await Project.count({ where: { is_published: true } });
    const activeProjects = await Project.count({ where: { status: 'active' } });
    
    const projectsByDifficulty = await Project.findAll({
      attributes: [
        'difficulty',
        [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']
      ],
      group: ['difficulty'],
      raw: true
    });

    const projectsByCategory = await Project.findAll({
      attributes: [
        'category',
        [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalProjects,
        publishedProjects,
        activeProjects,
        projectsByDifficulty,
        projectsByCategory
      }
    });
  } catch (error) {
    logger.error('Error fetching project statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project statistics',
      error: error.message
    });
  }
};

// Seed projects (Admin only)
const seedProjects = async (req, res) => {
  try {
    const seedProjectsScript = require('../seed-projects');
    await seedProjectsScript();
    
    res.json({
      success: true,
      message: 'Projects seeded successfully'
    });
  } catch (error) {
    logger.error('Error seeding projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding projects',
      error: error.message
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectStatus,
  getProjectStats,
  seedProjects
};