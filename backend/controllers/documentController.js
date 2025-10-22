const { Document, Project, User } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents, images, and archives are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Get all documents for a project
const getProjectDocuments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { documentType, phase, isPublic } = req.query;
    
    const whereClause = { project_id: projectId };
    
    if (documentType) whereClause.document_type = documentType;
    if (phase) whereClause.phase = phase;
    // Note: is_public column was removed, so no filtering by public status

    const documents = await Document.findAll({
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
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    logger.error('Error fetching project documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project documents',
      error: error.message
    });
  }
};

// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id, {
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

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    logger.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document',
      error: error.message
    });
  }
};

// Upload document (Admin only)
const uploadDocument = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      documentType,
      phase,
      version,
      tags,
      isPublic = true
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      // Delete uploaded file if project doesn't exist
      await fs.unlink(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Generate file URL
    const fileUrl = `/uploads/documents/${req.file.filename}`;

    const document = await Document.create({
      project_id: projectId,
      title,
      description,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_url: fileUrl,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      file_extension: path.extname(req.file.originalname).toLowerCase(),
      document_type: documentType,
      phase,
      version,
      tags: tags ? JSON.parse(tags) : null,
      uploaded_by: req.user.id,
      updated_by: req.user.id
    });

    // Fetch the created document with associations
    const createdDocument = await Document.findByPk(document.id, {
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

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: createdDocument
    });
  } catch (error) {
    logger.error('Error uploading document:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('Error cleaning up uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// Update document (Admin only)
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Add updatedBy to the update data
    updateData.updatedBy = req.user.id;

    // Parse tags if provided
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }

    const [updatedRowsCount] = await Document.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Fetch the updated document
    const updatedDocument = await Document.findByPk(id, {
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
      message: 'Document updated successfully',
      data: updatedDocument
    });
  } catch (error) {
    logger.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating document',
      error: error.message
    });
  }
};

// Delete document (Admin only)
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete the file from filesystem
    try {
      await fs.unlink(document.file_path);
    } catch (fileError) {
      logger.warn('Error deleting file from filesystem:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await Document.destroy({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

// Download document
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if document is public or user has access
    if (!document.isPublic) {
      // Add additional access control logic here if needed
      return res.status(403).json({
        success: false,
        message: 'Access denied to this document'
      });
    }

    // Check if file exists
    try {
      await fs.access(document.file_path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Note: download_count column was removed, so no download tracking

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Length', document.file_size);

    // Stream the file
    const fileStream = require('fs').createReadStream(document.file_path);
    fileStream.pipe(res);

  } catch (error) {
    logger.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message
    });
  }
};

// Get document statistics (Admin only)
const getDocumentStats = async (req, res) => {
  try {
    const totalDocuments = await Document.count();
    const publicDocuments = await Document.count(); // Note: is_public column was removed
    const totalDownloads = 0; // Note: download_count column was removed
    
    const documentsByType = await Document.findAll({
      attributes: [
        'document_type',
        [Document.sequelize.fn('COUNT', Document.sequelize.col('id')), 'count']
      ],
      group: ['document_type'],
      raw: true
    });

    const recentUploads = await Document.findAll({
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
        totalDocuments,
        publicDocuments,
        totalDownloads,
        documentsByType,
        recentUploads
      }
    });
  } catch (error) {
    logger.error('Error fetching document statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document statistics',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  getProjectDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentStats
};
