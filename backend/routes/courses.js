const express = require('express');
const { authenticate, requireAdmin, requireEnrollment, optionalAuth } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { uploadMultiple, uploadLogo, validateUploadedFiles, uploadSingle } = require('../middleware/upload');
const courseController = require('../controllers/courseController');
const chapterController = require('../controllers/chapterController');
const { courseSchemas, commonSchemas } = require('../utils/validation');
const { CourseChapter } = require('../models');

const router = express.Router();

// Public routes
router.get('/', 
  optionalAuth,
  validate(courseSchemas.list, 'query'),
  courseController.getCourses
);

router.get('/search', 
  optionalAuth,
  validate(courseSchemas.search, 'query'),
  courseController.searchCourses
);

router.get('/popular', 
  optionalAuth,
  courseController.getPopularCourses
);

router.get('/top-rated', 
  optionalAuth,
  courseController.getTopRatedCourses
);

router.get('/categories', 
  courseController.getCategories
);

// Get course logo (public route - no authentication required)
// This must come before /:id route to avoid conflicts
router.get('/:id/logo',
  validate(commonSchemas.id, 'params'),
  courseController.getCourseLogo
);

// Handle preflight OPTIONS request for logo
router.options('/:id/logo', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.status(200).end();
});

// Get course enrollments (admin only) - must come before /:id route
router.get('/:id/enrollments', 
  authenticate,
  requireAdmin,
  validate(commonSchemas.id, 'params'),
  courseController.getCourseEnrollments
);

router.get('/:id', 
  optionalAuth,
  validate(commonSchemas.id, 'params'),
  courseController.getCourseById
);

// Admin routes
router.post('/', 
  authenticate,
  requireAdmin,
  validate(courseSchemas.create, 'body'),
  courseController.createCourse
);

router.put('/:id', 
  authenticate,
  requireAdmin,
  validate(commonSchemas.id, 'params'),
  validate(courseSchemas.update, 'body'),
  courseController.updateCourse
);

router.delete('/:id', 
  authenticate,
  requireAdmin,
  validate(commonSchemas.id, 'params'),
  courseController.deleteCourse
);

router.post('/:id/publish', 
  authenticate,
  requireAdmin,
  validate(commonSchemas.id, 'params'),
  courseController.publishCourse
);

router.post('/:id/unpublish', 
  authenticate,
  requireAdmin,
  validate(commonSchemas.id, 'params'),
  courseController.unpublishCourse
);

// File upload routes
router.post('/:id/files', 
  authenticate,
  requireAdmin,
  validate(commonSchemas.id, 'params'),
  uploadMultiple('files', 5),
  validateUploadedFiles,
  courseController.uploadCourseFiles
);

router.post('/:id/logo',
  authenticate,
  requireAdmin,
  validate(commonSchemas.id, 'params'),
  uploadLogo('logo'),
  courseController.uploadCourseLogo
);


router.delete('/:id/files/:fileId', 
  authenticate,
  requireAdmin,
  validate(commonSchemas.id, 'params'),
  courseController.deleteCourseFile
);

// Student routes
router.get('/:id/content', 
  authenticate,
  requireEnrollment,
  validate(commonSchemas.id, 'params'),
  courseController.getCourseContent
);

router.post('/:id/enroll', 
  authenticate,
  validate(commonSchemas.id, 'params'),
  courseController.enrollInCourse
);

router.post('/:id/unenroll', 
  authenticate,
  validate(commonSchemas.id, 'params'),
  courseController.unenrollFromCourse
);

router.put('/:id/progress', 
  authenticate,
  requireEnrollment,
  validate(commonSchemas.id, 'params'),
  courseController.updateProgress
);

router.post('/:id/rate', 
  authenticate,
  requireEnrollment,
  validate(commonSchemas.id, 'params'),
  courseController.rateCourse
);

// Chapter routes
router.post('/:courseId/chapters', 
  authenticate,
  requireAdmin, 
  uploadSingle('file'), 
  chapterController.createChapter
);

router.get('/:courseId/chapters', 
  authenticate,
  chapterController.getChapters
);

router.get('/:courseId/chapters/:chapterId', 
  authenticate,
  chapterController.getChapter
);

router.put('/:courseId/chapters/:chapterId', 
  authenticate,
  requireAdmin, 
  uploadSingle('file'), 
  chapterController.updateChapter
);

router.delete('/:courseId/chapters/:chapterId', 
  authenticate,
  requireAdmin, 
  chapterController.deleteChapter
);

router.put('/:courseId/chapters/reorder', 
  authenticate,
  requireAdmin, 
  chapterController.reorderChapters
);

router.patch('/:courseId/chapters/:chapterId/toggle-publish', 
  authenticate,
  requireAdmin, 
  async (req, res, next) => {
    try {
      const { courseId, chapterId } = req.params;
      const chapter = await CourseChapter.findOne({
        where: { id: chapterId, course_id: courseId }
      });

      if (!chapter) {
        return res.status(404).json({
          success: false,
          message: 'Chapter not found'
        });
      }

      chapter.is_published = !chapter.is_published;
      await chapter.save();

      res.json({
        success: true,
        message: `Chapter ${chapter.is_published ? 'published' : 'unpublished'} successfully`,
        data: { chapter: chapter.getPublicInfo() }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
