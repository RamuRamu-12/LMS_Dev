const { FileUpload, Course } = require('../models');
// Note: S3 utilities removed (S3 columns removed)
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Download file
 */
const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await FileUpload.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'is_published']
        }
      ]
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Check if course is published or user is enrolled
    if (!file.course.is_published) {
      throw new AppError('File not accessible', 403);
    }

    // Generate download URL (S3 columns removed, using direct URL)
    const downloadUrl = file.url;

    // Note: download count tracking removed

    logger.info(`File ${file.original_name} downloaded by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Download URL generated successfully',
      data: {
        downloadUrl,
        file: {
          id: file.id,
          original_name: file.original_name,
          file_type: file.file_type,
          size: file.size,
          size_formatted: file.getFileSizeFormatted()
        }
      }
    });
  } catch (error) {
    logger.error('Download file error:', error);
    next(error);
  }
};

/**
 * Preview file (for PDFs)
 */
const previewFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await FileUpload.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'is_published']
        }
      ]
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Check if course is published or user is enrolled
    if (!file.course.is_published) {
      throw new AppError('File not accessible', 403);
    }

    // Only PDFs can be previewed
    if (!file.isPdf()) {
      throw new AppError('File preview not supported for this file type', 400);
    }

    // Generate preview URL (S3 columns removed, using direct URL)
    const previewUrl = file.url;

    logger.info(`File ${file.original_name} previewed by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Preview URL generated successfully',
      data: {
        previewUrl,
        file: {
          id: file.id,
          original_name: file.original_name,
          file_type: file.file_type,
          size: file.size,
          size_formatted: file.getFileSizeFormatted()
        }
      }
    });
  } catch (error) {
    logger.error('Preview file error:', error);
    next(error);
  }
};

/**
 * Get course files
 */
const getCourseFiles = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const files = await FileUpload.findAll({
      where: { course_id: courseId },
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Course files retrieved successfully',
      data: {
        files: files.map(file => file.getPublicInfo())
      }
    });
  } catch (error) {
    logger.error('Get course files error:', error);
    next(error);
  }
};

/**
 * Get file information
 */
const getFileInfo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await FileUpload.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'is_published']
        }
      ]
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Check if course is published or user is enrolled
    if (!file.course.is_published) {
      throw new AppError('File not accessible', 403);
    }

    // Note: S3 metadata retrieval removed (s3_key column removed)
    const metadata = file.metadata || {};

    res.json({
      success: true,
      message: 'File information retrieved successfully',
      data: {
        file: {
          id: file.id,
          original_name: file.original_name,
          filename: file.filename,
          file_type: file.file_type,
          size: file.size,
          size_formatted: file.getFileSizeFormatted(),
          mimetype: file.mimetype,
          created_at: file.created_at,
          metadata: metadata
        }
      }
    });
  } catch (error) {
    logger.error('Get file info error:', error);
    next(error);
  }
};

module.exports = {
  downloadFile,
  previewFile,
  getCourseFiles,
  getFileInfo
};
