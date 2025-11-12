const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProjectsList,
  getProjectInfo,
  serveProjectMainPage,
  getCategories,
  getProjectStats,
  diagnoseProjects
} = require('../controllers/realtimeProjectsController');

// Diagnostic endpoint (no auth required for debugging)
router.get('/diagnose', diagnoseProjects);

// All routes require authentication
router.use(authenticate);

// Get all projects (for students with permission)
router.get('/list', getProjectsList);

// Get project categories
router.get('/categories', getCategories);

// Get project statistics
router.get('/stats', getProjectStats);

// Get project information by ID
router.get('/:projectId/info', getProjectInfo);

// Catch malformed requests where projectId is actually a resource path (shared, assets, etc.)
// This happens when paths are resolved incorrectly and missing the actual projectId
router.get('/shared/*', (req, res, next) => {
  // This is a malformed request - we need to know which project it belongs to
  // Check the referer to get the projectId
  const referer = req.get('referer') || '';
  const projectIdMatch = referer.match(/\/api\/realtime-projects\/([^\/]+)/);
  
  if (projectIdMatch && projectIdMatch[1]) {
    const projectId = projectIdMatch[1];
    const resourcePath = req.params[0] || '';
    console.log(`[Route Fix] Redirecting malformed request: /shared/${resourcePath} -> /${projectId}/shared/${resourcePath}`);
    return res.redirect(`/api/realtime-projects/${projectId}/shared/${resourcePath}${req.query.token ? `?token=${req.query.token}` : ''}`);
  }
  
  // If we can't determine the project, return a helpful error
  return res.status(400).json({
    success: false,
    message: 'Invalid request path. Resource paths must include the project ID.',
    example: '/api/realtime-projects/ecommerce/shared/navigation.js'
  });
});

// Similar handlers for other common resource directories
router.get('/assets/*', (req, res, next) => {
  const referer = req.get('referer') || '';
  const projectIdMatch = referer.match(/\/api\/realtime-projects\/([^\/]+)/);
  if (projectIdMatch && projectIdMatch[1]) {
    const projectId = projectIdMatch[1];
    const resourcePath = req.params[0] || '';
    return res.redirect(`/api/realtime-projects/${projectId}/assets/${resourcePath}${req.query.token ? `?token=${req.query.token}` : ''}`);
  }
  return res.status(400).json({ success: false, message: 'Invalid request path' });
});

router.get('/images/*', (req, res, next) => {
  const referer = req.get('referer') || '';
  const projectIdMatch = referer.match(/\/api\/realtime-projects\/([^\/]+)/);
  if (projectIdMatch && projectIdMatch[1]) {
    const projectId = projectIdMatch[1];
    const resourcePath = req.params[0] || '';
    return res.redirect(`/api/realtime-projects/${projectId}/images/${resourcePath}${req.query.token ? `?token=${req.query.token}` : ''}`);
  }
  return res.status(400).json({ success: false, message: 'Invalid request path' });
});

router.get('/js/*', (req, res, next) => {
  const referer = req.get('referer') || '';
  const projectIdMatch = referer.match(/\/api\/realtime-projects\/([^\/]+)/);
  if (projectIdMatch && projectIdMatch[1]) {
    const projectId = projectIdMatch[1];
    const resourcePath = req.params[0] || '';
    return res.redirect(`/api/realtime-projects/${projectId}/js/${resourcePath}${req.query.token ? `?token=${req.query.token}` : ''}`);
  }
  return res.status(400).json({ success: false, message: 'Invalid request path' });
});

router.get('/css/*', (req, res, next) => {
  const referer = req.get('referer') || '';
  const projectIdMatch = referer.match(/\/api\/realtime-projects\/([^\/]+)/);
  if (projectIdMatch && projectIdMatch[1]) {
    const projectId = projectIdMatch[1];
    const resourcePath = req.params[0] || '';
    return res.redirect(`/api/realtime-projects/${projectId}/css/${resourcePath}${req.query.token ? `?token=${req.query.token}` : ''}`);
  }
  return res.status(400).json({ success: false, message: 'Invalid request path' });
});

// Serve project files (HTML, CSS, JS, images, etc.) - all files use the same route structure
// HTML files get processed (base tag, token injection), assets are served directly
// This also handles SPA routing (e.g., /ecommerce/home, /ecommerce/products, etc.)
router.get('/:projectId/*', serveProjectMainPage);
router.get('/:projectId', serveProjectMainPage);

module.exports = router;
