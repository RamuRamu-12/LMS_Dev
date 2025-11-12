const fs = require('fs');
const path = require('path');
const projectDiscoveryService = require('../services/projectDiscoveryService');
const { StudentPermission } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * Check if student has access to realtime projects
 */
const checkProjectAccess = async (userId, userRole) => {
  if (userRole === 'admin') {
    return true;
  }

  try {
    const permission = await StudentPermission.findOne({
      where: { student_id: userId }
    });

    return permission ? permission.realtime_projects : false;
  } catch (error) {
    console.error('Error checking project access:', error);
    return false;
  }
};

/**
 * Get all projects (for students with permission)
 */
const getProjectsList = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check access permission
    const hasAccess = await checkProjectAccess(userId, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access realtime projects.'
      });
    }

    // Discover all projects
    const projects = await projectDiscoveryService.discoverProjects();

    // Apply filters if provided
    let filteredProjects = [...projects];
    const { category, difficulty, search, sort } = req.query;

    if (category && category !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.difficulty === difficulty);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    if (sort) {
      switch (sort) {
        case 'name':
          filteredProjects.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'difficulty':
          const diffOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          filteredProjects.sort((a, b) => 
            (diffOrder[a.difficulty] || 999) - (diffOrder[b.difficulty] || 999)
          );
          break;
        case 'newest':
          filteredProjects.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          break;
        case 'oldest':
          filteredProjects.sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          );
          break;
      }
    }

    // Get categories and stats
    const categories = await projectDiscoveryService.getCategories();
    const stats = await projectDiscoveryService.getStats();

    res.json({
      success: true,
      data: {
        projects: filteredProjects,
        categories,
        stats,
        total: filteredProjects.length,
        hasAccess: true
      }
    });
  } catch (error) {
    console.error('Error fetching projects list:', error);
    next(new AppError('Failed to fetch projects', 500));
  }
};

/**
 * Get project information by ID
 */
const getProjectInfo = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check access permission
    const hasAccess = await checkProjectAccess(userId, userRole);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access realtime projects.'
      });
    }

    const project = await projectDiscoveryService.getProjectById(projectId);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(new AppError('Failed to fetch project info', 500));
  }
};

/**
 * Serve project main page (index.html) with footer hiding
 */
const serveProjectMainPage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    // Get any sub-path (for SPA routing like /ecommerce/home, /ecommerce/products, etc.)
    const subPath = req.params[0] || ''; // This will be undefined if no sub-path
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    console.log(`[serveProjectMainPage] Request for project: ${projectId}, subPath: ${subPath || 'none'}`);
    console.log(`[serveProjectMainPage] User ID: ${userId}, Role: ${userRole}`);

    // Check access permission
    const hasAccess = await checkProjectAccess(userId, userRole);
    console.log(`[serveProjectMainPage] Has access: ${hasAccess}`);
    
    if (!hasAccess) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Access Denied</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .error { text-align: center; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Access Denied</h1>
            <p>You do not have permission to access this project.</p>
            <p>Please contact your administrator.</p>
          </div>
        </body>
        </html>
      `);
    }

    console.log(`[serveProjectMainPage] Looking for project: ${projectId}`);
    const project = await projectDiscoveryService.getProjectById(projectId);
    console.log(`[serveProjectMainPage] Project found: ${!!project}`);
    if (project) {
      console.log(`[serveProjectMainPage] Project path: ${project.path}`);
    }

    if (!project) {
      console.error(`[serveProjectMainPage] Project not found: ${projectId}`);
      // Get all projects for debugging
      const allProjects = await projectDiscoveryService.discoverProjects();
      console.error(`[serveProjectMainPage] Available projects: ${allProjects.map(p => p.id || p.folderName).join(', ')}`);
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Project Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .error { text-align: center; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Project Not Found</h1>
            <p>The project "${projectId}" was not found.</p>
            <p>Please check the project name and try again.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Determine the file to serve based on sub-path
    let filePath;
    
    if (!subPath || subPath.trim() === '') {
      // No sub-path - serve index.html
      filePath = path.join(project.path, 'index.html');
      console.log(`[serveProjectMainPage] No sub-path, serving index.html`);
    } else {
      // Remove leading slash if present and normalize path separators
      let cleanSubPath = subPath.replace(/^\/+/, '').replace(/\\/g, '/');
      
      // Prevent directory traversal
      const safePath = path.normalize(cleanSubPath).replace(/^(\.\.(\/|\\|$))+/, '');
      const safeFilePath = path.join(project.path, safePath);
      
      console.log(`[serveProjectMainPage] Checking file: ${safeFilePath}`);
      console.log(`[serveProjectMainPage] File exists: ${fs.existsSync(safeFilePath)}`);
      
      // Ensure file is within project directory
      if (!safeFilePath.startsWith(path.resolve(project.path))) {
        console.error(`[serveProjectMainPage] Path traversal attempt: ${safeFilePath}`);
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Check if file exists
      if (fs.existsSync(safeFilePath) && fs.statSync(safeFilePath).isFile()) {
        filePath = safeFilePath;
        console.log(`[serveProjectMainPage] Serving file: ${filePath}`);
      } else {
        // Check if it's a directory - if so, try Overview.html first, then index.html
        if (fs.existsSync(safeFilePath) && fs.statSync(safeFilePath).isDirectory()) {
          // For phase directories (BRD_phase, UI_UX_phase, etc.), try Overview.html first
          const overviewFile = path.join(safeFilePath, 'Overview.html');
          if (fs.existsSync(overviewFile)) {
            filePath = overviewFile;
            console.log(`[serveProjectMainPage] Serving Overview.html from phase directory: ${filePath}`);
          } else {
            const indexInDir = path.join(safeFilePath, 'index.html');
            if (fs.existsSync(indexInDir)) {
              filePath = indexInDir;
              console.log(`[serveProjectMainPage] Serving index.html from directory: ${filePath}`);
            } else {
              // It's likely an SPA route, serve index.html and let the app handle routing
              filePath = path.join(project.path, 'index.html');
              console.log(`[serveProjectMainPage] Directory without index.html, serving root index.html for SPA routing`);
            }
          }
        } else {
          // File doesn't exist - check if it's a request for a phase directory (e.g., BRD_phase/Overview.html)
          // Try to find the file by checking if the parent directory exists
          const pathParts = cleanSubPath.split('/');
          if (pathParts.length >= 2) {
            // It's a path like BRD_phase/Overview.html
            const parentDir = path.join(project.path, pathParts.slice(0, -1).join('/'));
            const fileName = pathParts[pathParts.length - 1];
            
            console.log(`[serveProjectMainPage] Checking parent directory: ${parentDir}`);
            console.log(`[serveProjectMainPage] Looking for file: ${fileName} in ${parentDir}`);
            
            if (fs.existsSync(parentDir) && fs.statSync(parentDir).isDirectory()) {
              const fullFilePath = path.join(parentDir, fileName);
              if (fs.existsSync(fullFilePath) && fs.statSync(fullFilePath).isFile()) {
                filePath = fullFilePath;
                console.log(`[serveProjectMainPage] Found file in parent directory: ${filePath}`);
              } else {
                // Try Overview.html if the requested file doesn't exist
                const overviewFile = path.join(parentDir, 'Overview.html');
                if (fs.existsSync(overviewFile)) {
                  filePath = overviewFile;
                  console.log(`[serveProjectMainPage] Serving Overview.html instead: ${filePath}`);
                } else {
                  filePath = path.join(project.path, 'index.html');
                  console.log(`[serveProjectMainPage] File not found, serving index.html for SPA routing`);
                }
              }
            } else {
              filePath = path.join(project.path, 'index.html');
              console.log(`[serveProjectMainPage] Parent directory not found, serving index.html for SPA routing`);
            }
          } else {
            // It's likely an SPA route, serve index.html and let the app handle routing
            filePath = path.join(project.path, 'index.html');
            console.log(`[serveProjectMainPage] File not found, serving index.html for SPA routing`);
          }
        }
      }
    }
    
    console.log(`[serveProjectMainPage] Final file path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`[serveProjectMainPage] File not found: ${filePath}`);
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>File Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .error { text-align: center; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>File Not Found</h1>
            <p>The requested file was not found in the project.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Check if this is an HTML file or an asset file
    const ext = path.extname(filePath).toLowerCase();
    const isHtmlFile = ext === '.html' || ext === '.htm';
    
    // If it's not an HTML file, serve it directly as a static asset
    if (!isHtmlFile) {
      console.log(`[serveProjectMainPage] Serving static asset: ${filePath}`);
      
      // Determine content type
      const contentTypes = {
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // Send file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      return;
    }

    // It's an HTML file - process it
    console.log(`[serveProjectMainPage] Reading HTML file from: ${filePath}...`);
    let html = fs.readFileSync(filePath, 'utf8');
    console.log(`[serveProjectMainPage] HTML file read, size: ${html.length} characters`);
    
    // Log first 500 characters to see what we're serving
    console.log(`[serveProjectMainPage] HTML preview (first 500 chars): ${html.substring(0, 500)}`);

    // Always remove any previously injected footer-hider styles to ensure footer visibility by default
    html = html.replace(/<style id="lms-footer-hider">[\s\S]*?<\/style>/gi, '');

    if (project.hideFooter === true) {
      const hideFooterCSS = `
        <style id="lms-footer-hider">
          footer,
          .footer,
          #footer,
          [class*="footer"],
          [id*="footer"],
          .site-footer,
          #site-footer,
          .main-footer,
          .footer-container,
          [role="contentinfo"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        </style>
      `;

      // Insert before </head> or at beginning of <body>
      if (html.includes('</head>')) {
        html = html.replace('</head>', hideFooterCSS + '</head>');
      } else if (html.includes('<body')) {
        html = html.replace('<body', hideFooterCSS + '<body');
      } else {
        html = hideFooterCSS + html;
      }
    }

    // Set base tag to fix relative paths - now everything uses the same route structure
    // Extract token from query string, Authorization header, or it might be in the URL
    let token = req.query.token || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '');
    
    // If no token found, try to extract from referer URL (in case it's embedded in iframe)
    if (!token && req.get('referer')) {
      try {
        const refererUrl = new URL(req.get('referer'));
        token = refererUrl.searchParams.get('token') || '';
      } catch (e) {
        // Ignore referer parsing errors
      }
    }
    
    // Use absolute URL for base tag - dynamically detect from request
    // Supports both local development and production deployments
    const protocol = req.protocol || (req.secure ? 'https' : 'http');
    const host = req.get('host') || process.env.API_URL?.replace(/^https?:\/\//, '') || 'localhost:5000';
    
    // Base href points to the project root - all files (HTML, CSS, JS, images) use the same route
    // IMPORTANT: Base href must end with a slash for proper resolution
    const baseHref = `${protocol}://${host}/api/realtime-projects/${projectId}/`;
    
    // Remove any existing base tags first
    html = html.replace(/<base[^>]*>/gi, '');
    
    // Add our base tag right after <head> or before </head>
    const baseTag = `<base href="${baseHref}">`;
    
    // Fix paths in HTML to work correctly with base tag
    // CRITICAL: Convert relative paths to ABSOLUTE paths WITH TOKEN BEFORE base tag injection
    // This ensures scripts load correctly even if base tag hasn't taken effect yet
    // CRITICAL: Add token to all asset URLs so browser requests include authentication
    
    // Helper function to add token to URL
    const addTokenToUrl = (url) => {
      if (!token) return url;
      // Check if token already exists
      if (url.includes('token=')) return url;
      const separator = url.includes('?') ? '&' : '?';
      return url + separator + 'token=' + encodeURIComponent(token);
    };
    
    // 1. Convert absolute paths like /shared/styles.css to full absolute URLs WITH TOKEN
    html = html.replace(/(href|src)\s*=\s*(["'])\/(shared|assets|images|js|css|fonts|scripts|styles)\//gi, (match, attr, quote, dir) => {
      const newPath = addTokenToUrl(`${baseHref}${dir}/`);
      console.log(`[Path Fix] Converting absolute path: ${match} -> ${attr}=${quote}${newPath}${quote}`);
      return `${attr}=${quote}${newPath}${quote}`;
    });
    
    // 2. Convert relative paths that go up directories (../shared/navigation.js, etc.)
    // Convert to FULL ABSOLUTE URLs with projectId included AND TOKEN
    // Match: src="../shared/navigation.js" or href="../../shared/styles.css"
    // Improved regex to handle spaces and be more precise
    html = html.replace(/(href|src)\s*=\s*(["'])(\.\.\/)+(shared|assets|images|js|css|fonts|scripts|styles)\/([^"']*?)\2/gi, (match, attr, quote, upDirs, dir, filePath) => {
      // Build the full path: shared/styles.css or assets/image.png
      const fullPath = `${dir}/${filePath}`;
      // Convert to absolute URL with projectId AND add token
      const absolutePath = addTokenToUrl(`${baseHref}${fullPath}`);
      console.log(`[Path Fix] Converting relative path: ${match} -> ${attr}=${quote}${absolutePath}${quote}`);
      return `${attr}=${quote}${absolutePath}${quote}`;
    });
    
    // 2b. Also handle relative paths without quotes (rare but possible)
    html = html.replace(/(href|src)\s*=\s*([^\s>]+)(\.\.\/)+(shared|assets|images|js|css|fonts|scripts|styles)\/([^\s>]*)/gi, (match, attr, prefix, upDirs, dir, filePath) => {
      // Only process if it looks like a path (not already absolute)
      if (!prefix.startsWith('http') && !prefix.startsWith('//') && !prefix.startsWith('data:')) {
        const fullPath = `${dir}/${filePath}`;
        const absolutePath = addTokenToUrl(`${baseHref}${fullPath}`);
        console.log(`[Path Fix] Converting unquoted relative path: ${match} -> ${attr}="${absolutePath}"`);
        return `${attr}="${absolutePath}"`;
      }
      return match;
    });
    
    // 3. Also fix any paths in style tags or inline styles that reference URLs
    html = html.replace(/url\((["']?)(\.\.\/)+(shared|assets|images|js|css|fonts|scripts|styles)\/([^"')]*?)\1\)/gi, (match, quote, upDirs, dir, filePath) => {
      const quoteChar = quote || '"';
      const fullPath = `${dir}/${filePath}`;
      const absolutePath = addTokenToUrl(`${baseHref}${fullPath}`);
      console.log(`[Path Fix] Converting CSS url: ${match} -> url(${quoteChar}${absolutePath}${quoteChar})`);
      return `url(${quoteChar}${absolutePath}${quoteChar})`;
    });
    
    // 4. Handle relative paths starting with ./ (current directory)
    html = html.replace(/(href|src)\s*=\s*(["'])\.\/(shared|assets|images|js|css|fonts|scripts|styles)\/([^"']*?)\2/gi, (match, attr, quote, dir, filePath) => {
      const fullPath = `${dir}/${filePath}`;
      const absolutePath = addTokenToUrl(`${baseHref}${fullPath}`);
      console.log(`[Path Fix] Converting current dir relative path: ${match} -> ${attr}=${quote}${absolutePath}${quote}`);
      return `${attr}=${quote}${absolutePath}${quote}`;
    });
    
    // 5. Handle relative paths for HTML navigation (e.g., BRD_phase/Overview.html, UI_UX_phase/Overview.html)
    // These are phase folder paths that should be converted to absolute URLs
    // Match: href="BRD_phase/Overview.html" or href="UI_UX_phase/Overview.html"
    // Simplified regex to match folder/File.html pattern
    html = html.replace(/(href)\s*=\s*(["'])([^"']+\/[^"']+\.html)\2/gi, (match, attr, quote, fullPath) => {
      // Only convert if it matches phase folder pattern and is not already absolute
      if (fullPath.match(/[^\/]+_(phase|Phase)\/|([A-Z][a-zA-Z]+\s*(Phase|phase))\//) && 
          !fullPath.startsWith('http') && !fullPath.startsWith('//') && !fullPath.startsWith('/api/realtime-projects/')) {
        const absolutePath = addTokenToUrl(`${baseHref}${fullPath}`);
        console.log(`[Path Fix] Converting phase navigation path: ${match} -> ${attr}=${quote}${absolutePath}${quote}`);
        return `${attr}=${quote}${absolutePath}${quote}`;
      }
      return match;
    });
    
    // 6. Handle any other relative HTML file paths (fallback for navigation links)
    // This catches paths like "BRD_phase/Overview.html", "UI_UX_phase/Overview.html", etc.
    html = html.replace(/(href)\s*=\s*(["'])([^"']+\.html)\2/gi, (match, attr, quote, filePath) => {
      // Skip if already absolute or external
      if (filePath.startsWith('http') || filePath.startsWith('//') || filePath.startsWith('mailto:') || filePath.startsWith('tel:') || filePath.startsWith('#')) {
        return match;
      }
      // Skip if already converted (contains /api/realtime-projects/)
      if (filePath.includes('/api/realtime-projects/')) {
        return match;
      }
      // Convert relative HTML paths to absolute URLs
      // baseHref already ends with '/', so filePath will be appended correctly
      const absolutePath = addTokenToUrl(`${baseHref}${filePath}`);
      console.log(`[Path Fix] Converting HTML navigation path: ${match} -> ${attr}=${quote}${absolutePath}${quote}`);
      return `${attr}=${quote}${absolutePath}${quote}`;
    });
    
    // 7. Also handle onclick handlers that might contain navigation (less common but possible)
    html = html.replace(/onclick\s*=\s*(["'])[^"']*location\.(href|replace)\s*=\s*["']([^"']+\.html)["'][^"']*\1/gi, (match, quote, method, filePath) => {
      if (!filePath.startsWith('http') && !filePath.startsWith('//') && !filePath.includes('/api/realtime-projects/')) {
        const absolutePath = addTokenToUrl(`${baseHref}${filePath}`);
        const newMatch = match.replace(filePath, absolutePath);
        console.log(`[Path Fix] Converting onclick navigation: ${match} -> ${newMatch}`);
        return newMatch;
      }
      return match;
    });
    
    // Create token injection script that runs IMMEDIATELY (before any other scripts)
    // This must run synchronously to intercept fetch calls from navigation.js
    // CRITICAL: Use JSON.stringify for safe string escaping in JavaScript
    // ALWAYS inject the script, even if token is empty - it will try to read from URL
    const tokenInterceptorScript = `
      <script>
        // Store token IMMEDIATELY - this must run before any other scripts
        // Use IIFE with immediate execution, no waiting for DOM
        (function() {
          'use strict';
          
          // Try to get token from injected value first, then from URL
          let token = ${JSON.stringify(token || '')};
          
          // If no token injected, try to read from current page URL
          if (!token) {
            try {
              // Read from window.location.search (query string)
              const urlParams = new URLSearchParams(window.location.search);
              token = urlParams.get('token') || '';
              
              // Also try reading from window.location.href as fallback
              if (!token) {
                const urlMatch = window.location.href.match(/[?&]token=([^&]+)/);
                if (urlMatch && urlMatch[1]) {
                  token = decodeURIComponent(urlMatch[1]);
                }
              }
            } catch (e) {
              console.warn('[LMS] Could not read token from URL:', e);
            }
          }
          
          // If still no token and we're in an iframe, try to get from parent
          if (!token && window.parent !== window) {
            try {
              // Try to access parent's token (might fail due to CORS)
              if (window.parent.__LMS_TOKEN) {
                token = window.parent.__LMS_TOKEN;
                console.log('[LMS] Got token from parent window');
              }
            } catch (e) {
              // Cross-origin access denied, ignore
              console.log('[LMS] Cannot access parent window (cross-origin)');
            }
          }
          
          // Set global variables IMMEDIATELY - these must be available before navigation.js runs
          window.__LMS_TOKEN = token || '';
          window.__LMS_PROJECT_ID = ${JSON.stringify(projectId)};
          window.__LMS_API_BASE = ${JSON.stringify(protocol + '://' + host + '/api/realtime-projects/' + projectId)};
          
          // Log for debugging
          console.log('[LMS] Token interceptor initialized');
          console.log('[LMS] Token available:', !!window.__LMS_TOKEN, window.__LMS_TOKEN ? '(length: ' + window.__LMS_TOKEN.length + ')' : '');
          console.log('[LMS] API Base:', window.__LMS_API_BASE);
          console.log('[LMS] Project ID:', window.__LMS_PROJECT_ID);
          console.log('[LMS] Current URL:', window.location.href);
          
          if (!window.__LMS_TOKEN) {
            console.error('[LMS] ERROR: No authentication token available!');
            console.error('[LMS] URL search params:', window.location.search);
            console.error('[LMS] Full URL:', window.location.href);
          }
          
          // Intercept fetch IMMEDIATELY (before navigation.js loads)
          const originalFetch = window.fetch;
          window.fetch = function(url, options) {
            // Convert Request object to URL string if needed
            let urlString = url;
            let requestOptions = options || {};
            
            if (url instanceof Request) {
              urlString = url.url;
              requestOptions = {
                method: url.method,
                headers: url.headers,
                body: url.body,
                mode: url.mode,
                credentials: url.credentials,
                cache: url.cache,
                redirect: url.redirect,
                referrer: url.referrer,
                integrity: url.integrity,
                ...requestOptions
              };
            }
            
            const originalUrl = urlString;
            
            // Get token - try window variable first, then URL
            let token = window.__LMS_TOKEN;
            if (!token && typeof urlString === 'string') {
              try {
                // Try to get token from current page URL
                const urlParams = new URLSearchParams(window.location.search);
                token = urlParams.get('token') || '';
                if (!token) {
                  const urlMatch = window.location.href.match(/[?&]token=([^&]+)/);
                  if (urlMatch && urlMatch[1]) {
                    token = decodeURIComponent(urlMatch[1]);
                  }
                }
                // Cache it for future use
                if (token) {
                  window.__LMS_TOKEN = token;
                }
              } catch (e) {
                // Ignore errors
              }
            }
            
            if (typeof urlString === 'string' && token) {
              try {
                // For relative URLs, add token directly (browser will resolve via base href)
                if (!urlString.startsWith('http') && !urlString.startsWith('//') && 
                    !urlString.startsWith('data:') && !urlString.startsWith('blob:') &&
                    !urlString.startsWith('mailto:') && !urlString.startsWith('tel:') &&
                    !urlString.startsWith('#')) {
                  // Add token to relative URL - browser will resolve it via base href
                  if (!urlString.includes('token=')) {
                    const separator = urlString.includes('?') ? '&' : '?';
                    urlString = urlString + separator + 'token=' + encodeURIComponent(token);
                    console.log('[LMS Fetch] Added token to relative URL:', originalUrl, '->', urlString);
                  }
                } else if (urlString.includes('/api/realtime-projects/')) {
                  // For absolute URLs to our API, ensure token is present
                  const urlObj = new URL(urlString);
                  if (!urlObj.searchParams.has('token')) {
                    urlObj.searchParams.set('token', token);
                    urlString = urlObj.href;
                    console.log('[LMS Fetch] Added token to absolute URL:', originalUrl, '->', urlString);
                  }
                }
              } catch (e) {
                console.error('[LMS Fetch] Error adding token to URL:', e, 'Original URL:', originalUrl);
              }
            } else if (typeof urlString === 'string' && urlString.includes('/api/realtime-projects/') && !token) {
              console.warn('[LMS Fetch] WARNING: Request to API but no token available! URL:', originalUrl);
            }
            
            // Call original fetch with modified URL
            return originalFetch.call(this, urlString, requestOptions);
          };
          
          // Also intercept XMLHttpRequest
          const originalXHROpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            if (typeof url === 'string') {
              // Get token - try window variable first, then URL
              let token = window.__LMS_TOKEN;
              if (!token) {
                try {
                  const urlParams = new URLSearchParams(window.location.search);
                  token = urlParams.get('token') || '';
                  if (!token) {
                    const urlMatch = window.location.href.match(/[?&]token=([^&]+)/);
                    if (urlMatch && urlMatch[1]) {
                      token = decodeURIComponent(urlMatch[1]);
                    }
                  }
                  if (token) {
                    window.__LMS_TOKEN = token;
                  }
                } catch (e) {
                  // Ignore errors
                }
              }
              
              if (token) {
                try {
                  let resolvedUrl = url;
                  if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
                    resolvedUrl = new URL(url, window.location.href).href;
                  }
                  if (resolvedUrl.includes('/api/realtime-projects/')) {
                    const urlObj = new URL(resolvedUrl);
                    if (!urlObj.searchParams.has('token')) {
                      urlObj.searchParams.set('token', token);
                      url = urlObj.href;
                    }
                  } else if (!url.startsWith('http') && !url.startsWith('//')) {
                    if (!url.includes('token=')) {
                      const separator = url.includes('?') ? '&' : '?';
                      url = url + separator + 'token=' + encodeURIComponent(token);
                    }
                  }
                } catch (e) {
                  if (!url.startsWith('http') && !url.startsWith('//') && !url.includes('token=')) {
                    const separator = url.includes('?') ? '&' : '?';
                    url = url + separator + 'token=' + encodeURIComponent(token);
                  }
                }
              }
            }
            return originalXHROpen.call(this, method, url, ...rest);
          };
          
          // Intercept link clicks IMMEDIATELY to add token to navigation
          // Only intercept if href doesn't already have token and is a relative URL
          document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href]');
            if (link) {
              // Get token - try window variable first, then URL
              let token = window.__LMS_TOKEN;
              if (!token) {
                try {
                  const urlParams = new URLSearchParams(window.location.search);
                  token = urlParams.get('token') || '';
                  if (!token) {
                    const urlMatch = window.location.href.match(/[?&]token=([^&]+)/);
                    if (urlMatch && urlMatch[1]) {
                      token = decodeURIComponent(urlMatch[1]);
                    }
                  }
                  if (token) {
                    window.__LMS_TOKEN = token;
                  }
                } catch (err) {
                  // Ignore errors
                }
              }
              
              if (token) {
                const href = link.getAttribute('href');
                // Only intercept relative URLs that don't already have token
                if (href && !href.startsWith('http') && !href.startsWith('//') && 
                    !href.startsWith('mailto:') && !href.startsWith('tel:') && 
                    !href.startsWith('#') && !href.includes('token=')) {
                  e.preventDefault();
                  // Resolve relative URL to absolute URL using current location (respects base tag)
                  try {
                    const resolvedUrl = new URL(href, window.location.href).href;
                    // Only add token if not already present
                    if (!resolvedUrl.includes('token=')) {
                      const separator = resolvedUrl.includes('?') ? '&' : '?';
                      const newUrl = resolvedUrl + separator + 'token=' + encodeURIComponent(token);
                      console.log('[LMS] Link click intercepted, adding token:', href, '->', newUrl);
                      window.location.href = newUrl;
                    } else {
                      // Token already present, just navigate
                      window.location.href = resolvedUrl;
                    }
                  } catch (err) {
                    // Fallback: resolve using base href
                    const baseUrl = window.location.origin + (window.location.pathname.match(/^\/api\/realtime-projects\/[^\/]+\//)?.[0] || '/');
                    const resolvedUrl = baseUrl + href;
                    const separator = resolvedUrl.includes('?') ? '&' : '?';
                    const newUrl = resolvedUrl + separator + 'token=' + encodeURIComponent(token);
                    console.log('[LMS] Link click intercepted (fallback), adding token:', href, '->', newUrl);
                    window.location.href = newUrl;
                  }
                }
              }
            }
          }, true); // Use capture phase to intercept early
        })();
      </script>
    `;
    
    // Add a script to fix CSS/JS/image paths dynamically after page load
    // This is a fallback to ensure all resources load correctly
    const pathFixScript = `
      <script>
        (function() {
          // Fix CSS link paths
          function fixResourcePaths() {
            const baseUrl = ${JSON.stringify(baseHref)};
            const projectId = ${JSON.stringify(projectId)};
            const token = window.__LMS_TOKEN || ${JSON.stringify(token || '')};
            
            // Helper to add token to URL
            function addTokenToUrl(url) {
              if (!token || url.includes('token=')) return url;
              const separator = url.includes('?') ? '&' : '?';
              return url + separator + 'token=' + encodeURIComponent(token);
            }
            
            // Fix all link[rel="stylesheet"] hrefs
            document.querySelectorAll('link[rel="stylesheet"]').forEach(function(link) {
              const href = link.getAttribute('href');
              const currentHref = link.href; // Browser-resolved URL
              
              if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('data:')) {
                let newHref = null;
                let needsFix = false;
                
                // Check if the resolved URL is missing the projectId (malformed)
                if (currentHref.includes('/api/realtime-projects/') && !currentHref.includes('/api/realtime-projects/' + projectId + '/')) {
                  // URL is malformed - missing projectId
                  needsFix = true;
                }
                
                // If it's a relative path that should be relative to project root
                if (href.startsWith('../') || href.startsWith('./')) {
                  const cleanPath = href.replace(/^(\.\.\/|\.\/)+/, '');
                  if (cleanPath.match(/^(shared|assets|images|js|css|fonts|scripts|styles)\//i)) {
                    newHref = baseUrl + cleanPath;
                    needsFix = true;
                  }
                } else if (href.startsWith('/shared/') || href.startsWith('/assets/') || href.startsWith('/images/') || 
                           href.startsWith('/js/') || href.startsWith('/css/') || href.startsWith('/fonts/') ||
                           href.startsWith('/scripts/') || href.startsWith('/styles/')) {
                  // Absolute path starting with /shared/, /assets/, etc. - convert to full URL
                  const cleanPath = href.substring(1); // Remove leading /
                  newHref = baseUrl + cleanPath;
                  needsFix = true;
                } else if (!href.startsWith('/') && !currentHref.includes('/api/realtime-projects/' + projectId + '/')) {
                  // Already relative but not pointing to correct base
                  newHref = baseUrl + href;
                  needsFix = true;
                }
                
                if (needsFix && newHref) {
                  newHref = addTokenToUrl(newHref);
                  console.log('[Path Fix Script] Fixing CSS link:', href, '->', newHref, '(was:', currentHref + ')');
                  link.href = newHref;
                } else if (currentHref.includes('/api/realtime-projects/') && !currentHref.includes('token=')) {
                  // URL is correct but missing token
                  newHref = addTokenToUrl(currentHref);
                  console.log('[Path Fix Script] Adding token to CSS link:', currentHref, '->', newHref);
                  link.href = newHref;
                }
              }
            });
            
            // Fix all script srcs
            document.querySelectorAll('script[src]').forEach(function(script) {
              const src = script.getAttribute('src');
              const currentSrc = script.src; // Browser-resolved URL
              
              if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
                let newSrc = null;
                let needsFix = false;
                
                // Check if the resolved URL is missing the projectId (malformed)
                if (currentSrc.includes('/api/realtime-projects/') && !currentSrc.includes('/api/realtime-projects/' + projectId + '/')) {
                  // URL is malformed - missing projectId
                  needsFix = true;
                }
                
                if (src.startsWith('../') || src.startsWith('./')) {
                  const cleanPath = src.replace(/^(\.\.\/|\.\/)+/, '');
                  if (cleanPath.match(/^(shared|assets|images|js|css|fonts|scripts|styles)\//i)) {
                    newSrc = baseUrl + cleanPath;
                    needsFix = true;
                  }
                } else if (src.startsWith('/shared/') || src.startsWith('/assets/') || src.startsWith('/images/') || 
                           src.startsWith('/js/') || src.startsWith('/css/') || src.startsWith('/fonts/') ||
                           src.startsWith('/scripts/') || src.startsWith('/styles/')) {
                  // Absolute path starting with /shared/, /assets/, etc. - convert to full URL
                  const cleanPath = src.substring(1); // Remove leading /
                  newSrc = baseUrl + cleanPath;
                  needsFix = true;
                } else if (!src.startsWith('/') && !currentSrc.includes('/api/realtime-projects/' + projectId + '/')) {
                  newSrc = baseUrl + src;
                  needsFix = true;
                }
                
                if (needsFix && newSrc) {
                  newSrc = addTokenToUrl(newSrc);
                  console.log('[Path Fix Script] Fixing script src:', src, '->', newSrc, '(was:', currentSrc + ')');
                  script.src = newSrc;
                } else if (currentSrc.includes('/api/realtime-projects/') && !currentSrc.includes('token=')) {
                  newSrc = addTokenToUrl(currentSrc);
                  console.log('[Path Fix Script] Adding token to script src:', currentSrc, '->', newSrc);
                  script.src = newSrc;
                }
              }
            });
            
            // Fix all img srcs
            document.querySelectorAll('img[src]').forEach(function(img) {
              const src = img.getAttribute('src');
              if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
                let newSrc = null;
                if (src.startsWith('../') || src.startsWith('./')) {
                  const cleanPath = src.replace(/^(\.\.\/|\.\/)+/, '');
                  if (cleanPath.match(/^(shared|assets|images|js|css|fonts|scripts|styles)\//i)) {
                    newSrc = baseUrl + cleanPath;
                  }
                } else if (!src.startsWith('/')) {
                  newSrc = baseUrl + src;
                }
                
                if (newSrc && (img.src !== newSrc && !img.src.includes('/api/realtime-projects/' + projectId + '/'))) {
                  newSrc = addTokenToUrl(newSrc);
                  console.log('[Path Fix Script] Fixing img src:', src, '->', newSrc);
                  img.src = newSrc;
                } else if (newSrc && img.src.includes('/api/realtime-projects/') && !img.src.includes('token=')) {
                  newSrc = addTokenToUrl(img.src);
                  console.log('[Path Fix Script] Adding token to img src:', img.src, '->', newSrc);
                  img.src = newSrc;
                }
              }
            });
          }
          
          // Run immediately and after DOM loads
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fixResourcePaths);
          } else {
            fixResourcePaths();
          }
          
          // Also run after a short delay to catch dynamically added elements
          setTimeout(fixResourcePaths, 100);
          setTimeout(fixResourcePaths, 500);
        })();
      </script>
    `;
    
    // Inject token interceptor, base tag, and path fix script at the very beginning of <head>
    if (html.includes('<head>')) {
      html = html.replace('<head>', '<head>' + tokenInterceptorScript + baseTag + pathFixScript);
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', tokenInterceptorScript + baseTag + pathFixScript + '</head>');
    } else if (html.includes('<body')) {
      html = html.replace('<body', tokenInterceptorScript + baseTag + pathFixScript + '<body');
    } else if (!html.includes('<html')) {
      html = tokenInterceptorScript + baseTag + pathFixScript + html;
    }
    
    // Also ensure all relative links work correctly by updating href/src attributes
    // This helps with projects that have internal navigation
    // Note: We're using base tag, so this might not be necessary, but helps with some edge cases
    
    // Inject a script to handle path rewriting and token injection
    // This script fixes HTML navigation paths and adds tokens to requests
    if (token) {
      const pathRewriteScript = `
      <script>
        (function() {
            // Store token and project info for requests
            window.__LMS_TOKEN = ${JSON.stringify(token)};
            window.__LMS_PROJECT_ID = ${JSON.stringify(projectId)};
            window.__LMS_API_BASE = ${JSON.stringify(protocol + '://' + host + '/api/realtime-projects/' + projectId)};
            
            // Helper function to check if URL is an HTML file
            function isHtmlFile(url) {
              if (!url) return false;
              // Check if it ends with .html or has no extension (likely an HTML page)
              return url.endsWith('.html') || 
                     (!url.includes('.') || url.match(/\/[^\/]+$/)) && 
                     !url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml)$/i);
            }
            
            // Helper function to add token to URL (for assets and HTML)
            function addTokenToUrl(url) {
              if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
                return url;
              }
              // Check if token already exists in URL
              if (url.includes('token=')) {
                return url;
              }
              
              // Get token - try window variable first, then URL
              let token = window.__LMS_TOKEN;
              if (!token) {
                try {
                  const urlParams = new URLSearchParams(window.location.search);
                  token = urlParams.get('token') || '';
                  if (!token) {
                    const urlMatch = window.location.href.match(/[?&]token=([^&]+)/);
                    if (urlMatch && urlMatch[1]) {
                      token = decodeURIComponent(urlMatch[1]);
                    }
                  }
                  if (token) {
                    window.__LMS_TOKEN = token;
                  }
                } catch (e) {
                  // Ignore errors
                }
              }
              
              if (!token) {
                return url;
              }
              const separator = url.includes('?') ? '&' : '?';
              return url + separator + 'token=' + encodeURIComponent(token);
            }
            
            // Helper function to rewrite paths (for navigation.js absolute URL construction)
            function rewritePath(url) {
              if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
                return url;
              }
              
              // Remove leading slash if present
              const cleanPath = url.startsWith('/') ? url.substring(1) : url;
              // Build the correct URL using the main project route
              const newUrl = window.__LMS_API_BASE + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);
              // Add token if available
              return addTokenToUrl(newUrl);
            }
          
            // Intercept fetch/XMLHttpRequest to add token to relative URLs
            const originalFetch = window.fetch;
            window.fetch = function(url, options) {
              if (typeof url === 'string') {
                // Resolve relative URLs to absolute URLs first (respects base href)
                let resolvedUrl = url;
                try {
                  // If it's a relative URL, resolve it relative to current location
                  if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:') && !url.startsWith('blob:')) {
                    resolvedUrl = new URL(url, window.location.href).href;
                  } else {
                    resolvedUrl = url;
                  }
                  // Add token to the resolved URL if it's a project URL
                  if (window.__LMS_TOKEN && resolvedUrl.includes('/api/realtime-projects/')) {
                    const urlObj = new URL(resolvedUrl);
                    if (!urlObj.searchParams.has('token')) {
                      urlObj.searchParams.set('token', window.__LMS_TOKEN);
                      url = urlObj.href;
                    }
                  } else if (window.__LMS_TOKEN && !url.startsWith('http') && !url.startsWith('//')) {
                    // For relative URLs, add token as query parameter
                    url = addTokenToUrl(url);
                  }
                } catch (e) {
                  // If URL resolution fails, just try to add token to original URL
                  if (window.__LMS_TOKEN) {
                    url = addTokenToUrl(url);
                  }
                }
              }
              return originalFetch.apply(this, arguments);
            };
            
            // Note: Link click interception is handled by tokenInterceptorScript above
            // No need to duplicate it here - the tokenInterceptorScript runs first and handles all link clicks
          
          // Fix navigation.js URL construction - must run immediately, not on DOMContentLoaded
          // Override window.location.replace to handle paths correctly
          const originalReplace = window.location.replace;
          window.location.replace = function(url) {
            if (typeof url === 'string') {
              // If it's an absolute URL constructed by navigation.js, rewrite it
              if (url.startsWith('http://') || url.startsWith('https://')) {
                try {
                  const urlObj = new URL(url);
                  const path = urlObj.pathname;
                  // If the path looks like a project file (not /api/realtime-projects/...)
                  if (path.match(/^\/([^\/]+_?phase|BRD_phase|UI_UX_phase|Architectural_Design_phase|Development Phase|Testing_phase|Deployment Phase)\//)) {
                    // Rewrite to use LMS API route
                    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
                    url = window.__LMS_API_BASE + '/' + cleanPath;
                    url = addTokenToUrl(url);
                  }
                } catch (e) {
                  // Invalid URL, try relative path rewrite
                  url = rewritePath(url);
                  url = addTokenToUrl(url);
                }
              } else if (!url.startsWith('http') && !url.startsWith('//')) {
                // Relative path, rewrite it
                url = rewritePath(url);
                url = addTokenToUrl(url);
              }
            }
            return originalReplace.call(this, url);
          };
          
          // Also override navigation.js's baseUrl construction by intercepting window.location
          // This prevents navigation.js from building wrong URLs
          const originalLocation = window.location;
          Object.defineProperty(window, 'location', {
            get: function() {
              return originalLocation;
            },
            configurable: true
          });
          
          // Intercept image/src loading
          document.addEventListener('DOMContentLoaded', function() {
            const images = document.querySelectorAll('img[src]');
            images.forEach(function(img) {
              const src = img.getAttribute('src');
              if (src) {
                const newSrc = addTokenToUrl(src);
                if (newSrc !== src) {
                  img.src = newSrc;
                }
              }
            });
            
            // Handle CSS links
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            links.forEach(function(link) {
              const href = link.getAttribute('href');
              if (href) {
                const newHref = addTokenToUrl(href);
                if (newHref !== href) {
                  link.href = newHref;
                }
              }
            });
            
            // Handle script sources
            const scripts = document.querySelectorAll('script[src]');
            scripts.forEach(function(script) {
              const src = script.getAttribute('src');
              if (src) {
                const newSrc = addTokenToUrl(src);
                if (newSrc !== src) {
                  script.src = newSrc;
                }
              }
            });
            
            // Pre-process all anchor links to include token
            const anchors = document.querySelectorAll('a[href]');
            anchors.forEach(function(anchor) {
              const href = anchor.getAttribute('href');
              if (href) {
                const newHref = addTokenToUrl(href);
                if (newHref !== href) {
                  anchor.href = newHref;
                }
              }
            });
          });
        })();
      </script>
      `;
      
      if (html.includes('</head>')) {
        html = html.replace('</head>', pathRewriteScript + '</head>');
      } else if (html.includes('<body')) {
        html = html.replace('<body', pathRewriteScript + '<body');
      }
    } else {
      // Even without token, we still need path rewriting for HTML navigation
      const noTokenPathScript = `
      <script>
        (function() {
          window.__LMS_PROJECT_ID = ${JSON.stringify(projectId)};
          window.__LMS_API_BASE = ${JSON.stringify(protocol + '://' + host + '/api/realtime-projects/' + projectId)};
          window.__LMS_FILES_BASE = ${JSON.stringify(protocol + '://' + host + '/api/realtime-projects/' + projectId + '/files')};
          
          function isHtmlFile(url) {
            if (!url) return false;
            return url.endsWith('.html') || 
                   (!url.includes('.') || url.match(/\/[^\/]+$/)) && 
                   !url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml)$/i);
          }
          
          function rewritePath(url) {
            if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
              return url;
            }
            
            const cleanPath = url.startsWith('/') ? url.substring(1) : url;
            const newUrl = window.__LMS_API_BASE + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);
            return newUrl;
          }
          
          function addTokenToUrl(url) {
            if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
              return url;
            }
            if (url.includes('token=')) {
              return url;
            }
            
            // Get token - try window variable first, then URL
            let token = window.__LMS_TOKEN;
            if (!token) {
              try {
                const urlParams = new URLSearchParams(window.location.search);
                token = urlParams.get('token') || '';
                if (!token) {
                  const urlMatch = window.location.href.match(/[?&]token=([^&]+)/);
                  if (urlMatch && urlMatch[1]) {
                    token = decodeURIComponent(urlMatch[1]);
                  }
                }
                if (token) {
                  window.__LMS_TOKEN = token;
                }
              } catch (e) {
                // Ignore errors
              }
            }
            
            if (!token) {
              return url;
            }
            const separator = url.includes('?') ? '&' : '?';
            return url + separator + 'token=' + encodeURIComponent(token);
          }
          
          // Override window.location.replace immediately to catch navigation.js calls
          const originalReplace = window.location.replace;
          window.location.replace = function(url) {
            if (typeof url === 'string') {
              // Get token - try window variable first, then URL
              let token = window.__LMS_TOKEN;
              if (!token) {
                try {
                  const urlParams = new URLSearchParams(window.location.search);
                  token = urlParams.get('token') || '';
                  if (!token) {
                    const urlMatch = window.location.href.match(/[?&]token=([^&]+)/);
                    if (urlMatch && urlMatch[1]) {
                      token = decodeURIComponent(urlMatch[1]);
                    }
                  }
                  if (token) {
                    window.__LMS_TOKEN = token;
                  }
                } catch (e) {
                  // Ignore errors
                }
              }
              
              // If it's an absolute URL constructed by navigation.js, rewrite it
              if (url.startsWith('http://') || url.startsWith('https://')) {
                try {
                  const urlObj = new URL(url);
                  const path = urlObj.pathname;
                  // If the path looks like a project file (not /api/realtime-projects/...)
                  if (path.match(/^\/([^\/]+_?phase|BRD_phase|UI_UX_phase|Architectural_Design_phase|Development Phase|Testing_phase|Deployment Phase)\//)) {
                    // Rewrite to use LMS API route
                    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
                    url = window.__LMS_API_BASE + '/' + cleanPath;
                    if (token) {
                      const separator = url.includes('?') ? '&' : '?';
                      url = url + separator + 'token=' + encodeURIComponent(token);
                    }
                  }
                } catch (e) {
                  // Invalid URL, try relative path rewrite
                  url = rewritePath(url);
                  if (token) {
                    const separator = url.includes('?') ? '&' : '?';
                    url = url + separator + 'token=' + encodeURIComponent(token);
                  }
                }
              } else if (!url.startsWith('http') && !url.startsWith('//')) {
                // Relative path, rewrite it
                url = rewritePath(url);
                if (token) {
                  const separator = url.includes('?') ? '&' : '?';
                  url = url + separator + 'token=' + encodeURIComponent(token);
                }
              }
            }
            return originalReplace.call(this, url);
          };
          
          // Also intercept XMLHttpRequest for compatibility
          const originalXHROpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            if (typeof url === 'string' && window.__LMS_TOKEN) {
              try {
                if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('data:')) {
                  const resolvedUrl = new URL(url, window.location.href).href;
                  if (resolvedUrl.includes('/api/realtime-projects/')) {
                    const urlObj = new URL(resolvedUrl);
                    if (!urlObj.searchParams.has('token')) {
                      urlObj.searchParams.set('token', window.__LMS_TOKEN);
                      url = urlObj.href;
                    }
                  } else {
                    url = addTokenToUrl(url);
                  }
                } else if (url.includes('/api/realtime-projects/')) {
                  const urlObj = new URL(url);
                  if (!urlObj.searchParams.has('token')) {
                    urlObj.searchParams.set('token', window.__LMS_TOKEN);
                    url = urlObj.href;
                  }
                }
              } catch (e) {
                url = addTokenToUrl(url);
              }
            }
            return originalXHROpen.call(this, method, url, ...rest);
          };
          
          // Also intercept navigation.js's URL construction pattern
          // When navigation.js does: baseUrl + '/' + folder + '/Overview.html'
          // We need to rewrite it before it's used
          document.addEventListener('DOMContentLoaded', function() {
            // Force navigation.js to use our rewritten paths
            // By monitoring and fixing any absolute URLs that are constructed
            const checkAndFixUrls = setInterval(function() {
              // This is a fallback - the main fix is the location.replace override above
            }, 100);
            
            setTimeout(function() {
              clearInterval(checkAndFixUrls);
            }, 5000); // Stop checking after 5 seconds
          });
        })();
      </script>
      `;
      
      if (html.includes('</head>')) {
        html = html.replace('</head>', noTokenPathScript + '</head>');
      } else if (html.includes('<body')) {
        html = html.replace('<body', noTokenPathScript + '<body');
      }
    }

    // Set headers to allow iframe embedding from frontend
    // Dynamically detect frontend origin from request headers for flexibility
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const referer = req.get('referer') || req.get('origin') || '';
    let refererOrigin = null;
    try {
      if (referer) {
        refererOrigin = new URL(referer).origin;
      }
  } catch (error) {
      // Invalid URL, ignore
      console.log(`[serveProjectMainPage] Could not parse referer origin: ${referer}`);
    }
    
    // Build frame-ancestors list - support both configured and dynamically detected origins
    const frameAncestorsList = [
      "'self'",
      frontendUrl,
      // Support localhost for development
      "http://localhost:3000",
      "https://localhost:3000",
      "http://localhost:*",
      "https://localhost:*",
      // Add dynamically detected origin if different from configured
      ...(refererOrigin && refererOrigin !== frontendUrl ? [refererOrigin] : [])
    ].filter(Boolean).join(' ');
    
    res.setHeader('Content-Type', 'text/html');
    // Use CSP frame-ancestors to allow embedding (modern standard)
    // Supports both local development and production deployments
    res.setHeader('Content-Security-Policy', `frame-ancestors ${frameAncestorsList}`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    console.log(`[serveProjectMainPage] Sending HTML response, length: ${html.length}`);
    res.send(html);
  } catch (error) {
    console.error('[serveProjectMainPage] Error serving project page:', error);
    console.error('[serveProjectMainPage] Error stack:', error.stack);
    next(new AppError('Failed to serve project page', 500));
  }
};

/**
 * Serve project files (CSS, JS, images, etc.)
 */
const serveProjectFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const filePath = req.params[0]; // Everything after /files/
    const userId = req.user?.id;
    const userRole = req.user?.role;

    console.log(`[serveProjectFile] Request for file: ${filePath} in project: ${projectId}`);

    // Check access permission
    const hasAccess = await checkProjectAccess(userId, userRole);
    
    if (!hasAccess) {
      console.log(`[serveProjectFile] Access denied for user: ${userId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const project = await projectDiscoveryService.getProjectById(projectId);

    if (!project) {
      console.error(`[serveProjectFile] Project not found: ${projectId}`);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Prevent directory traversal
    const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(project.path, safePath);
    console.log(`[serveProjectFile] Safe path: ${safePath}, Full path: ${fullPath}`);

    // Ensure file is within project directory
    if (!fullPath.startsWith(path.resolve(project.path))) {
      console.error(`[serveProjectFile] Path traversal attempt: ${fullPath}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      console.error(`[serveProjectFile] File not found: ${fullPath}`);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    console.log(`[serveProjectFile] Serving file: ${fullPath}`);

    // Determine content type
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Send file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving project file:', error);
    next(new AppError('Failed to serve project file', 500));
  }
};

/**
 * Get categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await projectDiscoveryService.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(new AppError('Failed to fetch categories', 500));
  }
};

/**
 * Get project statistics
 */
const getProjectStats = async (req, res, next) => {
  try {
    const stats = await projectDiscoveryService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(new AppError('Failed to fetch project stats', 500));
  }
};

/**
 * Diagnostic endpoint to check project discovery
 */
const diagnoseProjects = async (req, res, next) => {
  try {
    const projectsPath = projectDiscoveryService.projectsPath || 
                         path.join(__dirname, '../../Realtime_projects');
    
    const diagnostics = {
      projectsPath: projectsPath,
      pathExists: fs.existsSync(projectsPath),
      envPath: process.env.REALTIME_PROJECTS_PATH || 'Not set (using default)',
      discoveredProjects: [],
      errors: []
    };

    if (diagnostics.pathExists) {
      try {
        const projects = await projectDiscoveryService.discoverProjects();
        diagnostics.discoveredProjects = projects.map(p => ({
          id: p.id,
          folderName: p.folderName,
          name: p.name,
          path: p.path,
          hasIndexHtml: fs.existsSync(path.join(p.path, 'index.html')),
          indexPath: path.join(p.path, 'index.html')
        }));
      } catch (error) {
        diagnostics.errors.push(`Error discovering projects: ${error.message}`);
      }

      // List directory contents
      try {
        const items = fs.readdirSync(projectsPath, { withFileTypes: true });
        diagnostics.directoryContents = items.map(item => ({
          name: item.name,
          isDirectory: item.isDirectory(),
          isFile: item.isFile()
        }));
      } catch (error) {
        diagnostics.errors.push(`Error reading directory: ${error.message}`);
      }
    } else {
      diagnostics.errors.push(`Projects directory does not exist: ${projectsPath}`);
    }

    res.json({
      success: true,
      data: diagnostics
    });
  } catch (error) {
    next(new AppError('Diagnostic failed', 500));
  }
};

module.exports = {
  getProjectsList,
  getProjectInfo,
  serveProjectMainPage,
  serveProjectFile,
  getCategories,
  getProjectStats,
  checkProjectAccess,
  diagnoseProjects
};
