/**
 * Navigation and Content Loading System
 * Handles sequential loading of subphase content
 */

class PhaseNavigation {
  constructor() {
    this.currentPhase = null;
    this.currentTab = 'overview';
    this.subphases = [];
    this.contentCache = {};
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    // Get current phase from page data JSON
    const pageData = document.getElementById('page-data');
    if (pageData) {
      try {
        const data = JSON.parse(pageData.textContent);
        this.currentPhase = data.phase;
      } catch (e) {
        // Fallback: try to get phase from data attribute or URL
        const phaseMatch = window.location.pathname.match(/\/([^\/]+)_?phase/);
        if (phaseMatch) {
          let phaseName = phaseMatch[1].replace('_', '-').replace('Testing', 'testing').replace('Deployment', 'deployment');
          // Map folder names to phase IDs
          const phaseMap = {
            'BRD': 'brd',
            'UI_UX': 'uiux',
            'UI-UX': 'uiux',
            'Architectural_Design': 'architectural',
            'Development': 'development',
            'Testing': 'testing',
            'Deployment': 'deployment'
          };
          this.currentPhase = phaseMap[phaseName] || phaseName.toLowerCase();
        }
      }
      
      // Normalize phase name
      if (this.currentPhase === 'code-development') {
        this.currentPhase = 'development';
      }
      
      this.loadSubphases();
      this.setupEventListeners();
      this.updatePhaseNavigationBar();
      this.loadInitialContent();
      this.rewriteFooterAssets();
    }
  }

  loadSubphases() {
    // Define subphases for each phase based on folder structure
    const phaseSubphases = {
      'brd': [
        { id: 'overview', file: 'Overview_Content.html', label: 'Overview', icon: '📋' },
        { id: 'functional-requirements', file: 'Functional_Requirements.html', label: 'Functional Requirements', icon: '⚙️' },
        { id: 'non-functional-requirements', file: 'Non_Functional_Requirements.html', label: 'Non-Functional Requirements', icon: '🎯' },
        { id: 'user-stories', file: 'User_Stories.html', label: 'User Stories', icon: '👥' },
        { id: 'conclusion', file: 'Conclusion.html', label: 'Conclusion', icon: '✅' }
      ],
      'uiux': [
        { id: 'overview', file: 'Overview_Content.html', label: 'Overview', icon: '🎨' },
        { id: 'design-system', file: 'Design_System.html', label: 'Design System', icon: '🎨' },
        { id: 'customer-pages', file: 'Customer_Pages.html', label: 'Customer Pages', icon: '👥' },
        { id: 'admin-pages', file: 'Admin_Pages.html', label: 'Admin Pages', icon: '⚙️' },
        { id: 'navigation-flow', file: 'Navigation_Flow.html', label: 'Navigation Flow', icon: '🗺️' },
        { id: 'conclusion', file: 'Conclusion.html', label: 'Conclusion', icon: '✅' }
      ],
      'architectural': [
        { id: 'overview', file: 'Overview_Content.html', label: 'Overview', icon: '🏗️' },
        { id: 'system-architecture', file: 'System_Architecture.html', label: 'System Architecture', icon: '⚙️' },
        { id: 'database-design', file: 'Database_Design.html', label: 'Database Design', icon: '🗄️' },
        { id: 'api-design', file: 'API_Design.html', label: 'API Design', icon: '🔌' },
        { id: 'security-architecture', file: 'Security_Architecture.html', label: 'Security Architecture', icon: '🔒' },
        { id: 'conclusion', file: 'Conclusion.html', label: 'Conclusion', icon: '✅' }
      ],
      'development': [
        { id: 'overview', file: 'Overview_Content.html', label: 'Overview', icon: '💻' },
        { id: 'frontend-development', file: 'Frontend_Development.html', label: 'Frontend Development', icon: '🎨' },
        { id: 'backend-development', file: 'Backend_Development.html', label: 'Backend Development', icon: '⚙️' },
        { id: 'database-implementation', file: 'Database_Implementation.html', label: 'Database Implementation', icon: '🗄️' },
        { id: 'testing', file: 'Testing_QA.html', label: 'Testing & QA', icon: '🧪' },
        { id: 'conclusion', file: 'Conclusion.html', label: 'Conclusion', icon: '✅' }
      ],
      'testing': [
        { id: 'overview', file: 'Overview_Content.html', label: 'Overview', icon: '🧪' },
        { id: 'test-planning', file: 'Test_Planning.html', label: 'Test Planning', icon: '📋' },
        { id: 'unit-testing', file: 'Unit_Testing.html', label: 'Unit Testing', icon: '🔬' },
        { id: 'integration-testing', file: 'Integration_Testing.html', label: 'Integration Testing', icon: '🔗' },
        { id: 'performance-testing', file: 'Performance_Testing.html', label: 'Performance Testing', icon: '⚡' },
        { id: 'conclusion', file: 'Conclusion.html', label: 'Conclusion', icon: '✅' }
      ],
      'deployment': [
        { id: 'overview', file: 'Overview_Content.html', label: 'Overview', icon: '🚀' },
        { id: 'deployment-planning', file: 'Deployment_Planning.html', label: 'Deployment Planning', icon: '📋' },
        { id: 'environment-setup', file: 'Environment_Setup.html', label: 'Environment Setup', icon: '🏗️' },
        { id: 'final-steps', file: 'Final_Steps.html', label: 'Final Steps', icon: '🎉' }
      ]
    };

    this.subphases = phaseSubphases[this.currentPhase] || [];
    this.renderSidebar();
  }

  renderSidebar() {
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!sidebarNav) return;

    sidebarNav.innerHTML = '';
    
    this.subphases.forEach((subphase, index) => {
      const navItem = document.createElement('li');
      navItem.className = 'sidebar-nav-item';
      
      const isActive = this.currentTab === subphase.id;
      
      navItem.innerHTML = `
        <button 
          class="sidebar-nav-btn ${isActive ? 'active' : ''}"
          data-tab="${subphase.id}"
        >
          <span class="sidebar-nav-icon">${subphase.icon}</span>
          <div class="sidebar-nav-content">
            <div class="sidebar-nav-label">${subphase.label}</div>
            <div class="sidebar-nav-desc">${this.getSubphaseDescription(subphase.id)}</div>
          </div>
        </button>
      `;
      
      sidebarNav.appendChild(navItem);
    });
    
    // Ensure all buttons are enabled and not disabled
    const allSidebarButtons = sidebarNav.querySelectorAll('.sidebar-nav-btn');
    allSidebarButtons.forEach(btn => {
      btn.classList.remove('disabled');
      btn.removeAttribute('disabled');
    });
  }

  getSubphaseDescription(id) {
    const descriptions = {
      'overview': 'Phase overview and objectives',
      'functional-requirements': 'Core functionality specifications',
      'non-functional-requirements': 'Performance and quality requirements',
      'user-stories': 'User scenarios and use cases',
      'conclusion': 'Summary and next steps',
      'design-system': 'Color palette, typography, and components',
      'customer-pages': 'Customer-facing pages and interfaces',
      'admin-pages': 'Administrative interface and management',
      'navigation-flow': 'User journey maps and navigation patterns',
      'system-architecture': 'Overall system structure and components',
      'database-design': 'Data models and relationships',
      'api-design': 'RESTful APIs and endpoints',
      'security-architecture': 'Security measures and protocols',
      'frontend-development': 'React.js components and user interface',
      'backend-development': 'Node.js API server and business logic',
      'database-implementation': 'PostgreSQL setup and data models',
      'testing': 'Unit testing and quality assurance',
      'test-planning': 'Test strategy and test case development',
      'unit-testing': 'Individual component and function testing',
      'integration-testing': 'System integration and API testing',
      'performance-testing': 'Load testing and performance optimization',
      'deployment-planning': 'Deployment possibilities and setup strategies',
      'environment-setup': 'Local and cloud environment configuration',
      'final-steps': 'Project completion and code download'
    };
    return descriptions[id] || '';
  }

  setupEventListeners() {
    // Sidebar navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.sidebar-nav-btn')) {
        const btn = e.target.closest('.sidebar-nav-btn');
        const tabId = btn.dataset.tab;
        if (tabId) {
          this.switchTab(tabId);
        }
      }
    });

    // Next button click
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.goToNext();
      });
    }

    // Phase navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.phase-nav-btn')) {
        const phaseId = e.target.closest('.phase-nav-btn').dataset.phase;
        if (phaseId) {
          this.navigateToPhase(phaseId);
        }
      }
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    this.renderSidebar();
    this.loadContent(tabId);
    this.updateProgress();
    
    // Hide next button on conclusion/final-steps
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      if (tabId === 'conclusion' || tabId === 'final-steps') {
        nextBtn.style.display = 'none';
      } else {
        // Check if there's a next module
        const currentIndex = this.subphases.findIndex(s => s.id === tabId);
        const hasNext = currentIndex < this.subphases.length - 1;
        nextBtn.style.display = hasNext ? 'flex' : 'none';
      }
    }
  }

  goToNext() {
    const currentIndex = this.subphases.findIndex(s => s.id === this.currentTab);
    if (currentIndex < this.subphases.length - 1) {
      const nextSubphase = this.subphases[currentIndex + 1];
      this.switchTab(nextSubphase.id);
      
      // Scroll to top
      const contentArea = document.querySelector('.content-area');
      if (contentArea) {
        contentArea.scrollTop = 0;
      }
    }
  }

  async loadContent(tabId) {
    const contentArea = document.getElementById('current-content');
    if (!contentArea) return;

    // Show loading state
    contentArea.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <div style="width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
        <p style="color: #6b7280;">Loading content...</p>
      </div>
    `;

    // Check cache first
    if (this.contentCache[tabId]) {
      contentArea.innerHTML = this.contentCache[tabId];
      contentArea.classList.add('content-fade-in');
      return;
    }

    // Find the content file for this tab
    const subphase = this.subphases.find(s => s.id === tabId);
    if (!subphase) {
      contentArea.innerHTML = '<div class="content-section"><p>Content not found</p></div>';
      return;
    }

    // Load content from file
    let contentUrl; // Declare outside try block for error handling
    try {
      // Resolve the file path relative to current page location
      // Get current page URL and construct the content file URL
      const currentUrl = new URL(window.location.href);
      const currentPath = currentUrl.pathname;
      
      // CRITICAL: Use stored project ID and API base first (set by token interceptor)
      // This is the most reliable source since it's set by the backend
      let projectId = window.__LMS_PROJECT_ID;
      let apiBase = window.__LMS_API_BASE;
      
      console.log('[Navigation] Initial state - projectId:', projectId, 'apiBase:', apiBase);
      console.log('[Navigation] Current URL:', currentUrl.href);
      console.log('[Navigation] Current path:', currentPath);
      
      // If API base not set, construct it from project ID or extract from URL
      if (!apiBase) {
        // First, try to extract backend origin from current URL if it's already an API URL
        let backendOrigin = null;
        if (currentPath.includes('/api/realtime-projects/')) {
          // Current URL is already pointing to backend API - use current origin
          backendOrigin = currentUrl.origin;
          console.log('[Navigation] Using backend origin from current API URL:', backendOrigin);
        } else {
          // Not an API URL - try to determine backend URL
          // Check if we're on a frontend domain and need to use backend domain
          const currentHost = currentUrl.hostname;
          const currentPort = currentUrl.port;
          
          console.log('[Navigation] Current host:', currentHost, 'port:', currentPort);
          
          if (currentHost === 'gnanamai.com' || currentHost === 'www.gnanamai.com') {
            // Frontend domain - backend should be api.gnanamai.com
            backendOrigin = currentUrl.protocol + '//api.gnanamai.com';
            console.log('[Navigation] Using backend origin for production:', backendOrigin);
          } else if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
            // Local development - backend is on different port (5000)
            // Always use port 5000 for backend, regardless of current port (3000 for frontend)
            backendOrigin = currentUrl.protocol + '//localhost:5000';
            console.log('[Navigation] Using backend origin for local development:', backendOrigin);
          } else {
            // Fallback to current origin (shouldn't happen in normal flow)
            backendOrigin = currentUrl.origin;
            console.warn('[Navigation] Using current origin as fallback (may be incorrect):', backendOrigin);
          }
        }
        
        if (projectId && backendOrigin) {
          apiBase = backendOrigin + '/api/realtime-projects/' + projectId;
          window.__LMS_API_BASE = apiBase;
          console.log('[Navigation] Constructed API base from stored project ID:', apiBase);
        } else if (currentPath.includes('/api/realtime-projects/')) {
          // Extract project ID from URL
          const pathMatch = currentPath.match(/^\/api\/realtime-projects\/([^\/]+)/);
          if (pathMatch && pathMatch[1]) {
            projectId = pathMatch[1];
            // Verify it's not a phase folder
            const phaseFolders = ['BRD_phase', 'UI_UX_phase', 'Architectural_Design_phase', 'Development Phase', 'Testing_phase', 'Deployment Phase'];
            const isPhaseFolder = phaseFolders.some(pf => {
              const normalizedPf = pf.replace(/\s+/g, '_').toLowerCase();
              const normalizedExtracted = projectId.replace(/\s+/g, '_').toLowerCase();
              return normalizedPf === normalizedExtracted || projectId.includes('_phase') || projectId.includes('Phase');
            });
            
            if (!isPhaseFolder && backendOrigin) {
              apiBase = backendOrigin + '/api/realtime-projects/' + projectId;
              window.__LMS_API_BASE = apiBase;
              window.__LMS_PROJECT_ID = projectId;
              console.log('[Navigation] Constructed API base from URL:', apiBase);
            } else if (isPhaseFolder) {
              console.warn('[Navigation] Extracted ID is a phase folder, not project ID:', projectId);
            }
          }
        }
        
        // Final fallback: if we still don't have apiBase but we're on an API URL, construct from current URL
        if (!apiBase && currentPath.includes('/api/realtime-projects/')) {
          const pathMatch = currentPath.match(/^\/api\/realtime-projects\/([^\/]+)/);
          if (pathMatch && pathMatch[1]) {
            const extractedId = pathMatch[1];
            const phaseFolders = ['BRD_phase', 'UI_UX_phase', 'Architectural_Design_phase', 'Development Phase', 'Testing_phase', 'Deployment Phase'];
            const isPhaseFolder = phaseFolders.some(pf => {
              const normalizedPf = pf.replace(/\s+/g, '_').toLowerCase();
              const normalizedExtracted = extractedId.replace(/\s+/g, '_').toLowerCase();
              return normalizedPf === normalizedExtracted || extractedId.includes('_phase') || extractedId.includes('Phase');
            });
            
            if (!isPhaseFolder) {
              // Extract project ID by going up the path
              const pathParts = currentPath.split('/').filter(p => p);
              // pathParts = ['api', 'realtime-projects', 'ecommerce', ...]
              if (pathParts.length >= 3 && pathParts[0] === 'api' && pathParts[1] === 'realtime-projects') {
                projectId = pathParts[2];
                apiBase = currentUrl.origin + '/api/realtime-projects/' + projectId;
                window.__LMS_API_BASE = apiBase;
                window.__LMS_PROJECT_ID = projectId;
                console.log('[Navigation] Final fallback - constructed API base from path:', apiBase);
              }
            }
          }
        }
      }
      
      // Final validation
      if (!apiBase) {
        console.error('[Navigation] CRITICAL: Could not determine API base!');
        console.error('[Navigation] Current URL:', currentUrl.href);
        console.error('[Navigation] Current path:', currentPath);
        console.error('[Navigation] Project ID:', projectId);
        throw new Error('Unable to determine API base URL for content loading');
      }
      
      console.log('[Navigation] Final API base:', apiBase);
      
      if (apiBase) {
        // Use LMS API base to construct the URL
        // Format: /api/realtime-projects/{projectId}/{phase_folder}/{content_file}
        // Example: /api/realtime-projects/ecommerce/BRD_phase/Overview_Content.html
        
        // Map phase ID to folder name
        const phaseFolders = {
          'brd': 'BRD_phase',
          'uiux': 'UI_UX_phase',
          'architectural': 'Architectural_Design_phase',
          'development': 'Development Phase',
          'testing': 'Testing_phase',
          'deployment': 'Deployment Phase'
        };
        
        let phaseFolder = null;
        
        // First, try to get phase folder from current phase
        if (this.currentPhase && phaseFolders[this.currentPhase]) {
          phaseFolder = phaseFolders[this.currentPhase];
          console.log('[Navigation] Using current phase folder:', phaseFolder);
        } else {
          // Fallback: try to extract from current URL path
          const pathParts = currentPath.split('/').filter(p => p);
          // pathParts = ['api', 'realtime-projects', 'ecommerce', 'BRD_phase', 'Overview.html']
          const projectIndex = pathParts.findIndex(p => p === 'realtime-projects');
          
          if (projectIndex >= 0 && projectIndex + 3 < pathParts.length) {
            // Get phase folder from URL (index 3 after 'api', 'realtime-projects', projectId)
            const urlPhaseFolder = pathParts[projectIndex + 3];
            // Check if it's a known phase folder (handle spaces)
            const foundPhase = Object.keys(phaseFolders).find(
              key => {
                const pf = phaseFolders[key];
                return pf === urlPhaseFolder || 
                       pf.replace(/\s+/g, '_') === urlPhaseFolder ||
                       pf.replace(/\s+/g, '') === urlPhaseFolder ||
                       decodeURIComponent(urlPhaseFolder) === pf;
              }
            );
            if (foundPhase) {
              phaseFolder = phaseFolders[foundPhase];
              console.log('[Navigation] Extracted phase folder from URL:', phaseFolder);
            }
          }
        }
        
        // Construct the content path with phase folder
        let contentPath;
        if (phaseFolder) {
          // Handle folder names with spaces - encode the folder name for URL
          // Express will decode it on the backend, and path.join will handle it correctly
          const encodedFolder = encodeURIComponent(phaseFolder);
          contentPath = encodedFolder + '/' + subphase.file;
          console.log('[Navigation] Content path with phase folder:', contentPath);
        } else {
          // Last resort: use filename only (shouldn't happen)
          contentPath = subphase.file;
          console.warn('[Navigation] No phase folder found, using filename only:', contentPath);
        }
        
        // Construct final URL
        const cleanApiBase = apiBase.replace(/\/$/, ''); // Remove trailing slash
        const cleanContentPath = contentPath.replace(/^\//, ''); // Remove leading slash
        contentUrl = cleanApiBase + '/' + cleanContentPath;
        console.log('[Navigation] Final content URL:', contentUrl);
        
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
              window.__LMS_TOKEN = token; // Cache it
            }
          } catch (e) {
            console.warn('[Navigation] Could not read token from URL:', e);
          }
        }
        
        // Add token if available (CRITICAL for authentication)
        if (token && !contentUrl.includes('token=')) {
          const separator = contentUrl.includes('?') ? '&' : '?';
          contentUrl = contentUrl + separator + 'token=' + encodeURIComponent(token);
        } else if (!token) {
          console.warn('[Navigation] No token available for content request!');
        }
      } else {
        // Standalone mode: resolve relative to current page
        const pathParts = currentPath.split('/').filter(p => p);
        pathParts.pop(); // Remove filename
        const directoryPath = '/' + pathParts.join('/') + '/';
        contentUrl = new URL(subphase.file, currentUrl.origin + directoryPath).href;
      }
      
      console.log('[Navigation] Loading content from:', contentUrl);
      console.log('[Navigation] Token available:', !!window.__LMS_TOKEN);
      console.log('[Navigation] API Base:', apiBase || 'Not set (standalone mode)');
      
      // Validate URL before fetching
      if (!contentUrl || contentUrl === 'undefined' || contentUrl.includes('undefined')) {
        throw new Error('Invalid content URL constructed');
      }
      
      const response = await fetch(contentUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        credentials: 'include' // Include cookies if any
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Failed to load content: ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}`);
      }
      
      const html = await response.text();
      
      // Extract content from the HTML (assumes content is in a specific container)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        console.warn('[Navigation] HTML parsing warning:', parserError.textContent);
      }
      
      const content = doc.querySelector('.content-body') || doc.querySelector('body') || doc.body;
      
      if (!content) {
        throw new Error('No content found in loaded HTML');
      }

      // Rewrite asset URLs to include project base and token
      this.rewriteAssetUrls(content);
      
      // Cache and display
      this.contentCache[tabId] = content.innerHTML;
      contentArea.innerHTML = this.contentCache[tabId];
      contentArea.classList.add('content-fade-in');
      
    } catch (error) {
      console.error('Error loading content:', error);
      console.error('Content URL attempted:', contentUrl);
      console.error('Token available:', !!window.__LMS_TOKEN);
      console.error('LMS API Base:', window.__LMS_API_BASE);
      contentArea.innerHTML = `
        <div class="content-section">
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem;">
            <p style="color: #991b1b;">Unable to load content. Error: ${error.message}</p>
            <p style="color: #991b1b; margin-top: 0.5rem; font-size: 0.875rem;">File: ${subphase.file}</p>
            <p style="color: #991b1b; margin-top: 0.5rem; font-size: 0.875rem;">URL: ${contentUrl || 'Not constructed'}</p>
          </div>
        </div>
      `;
    }
  }

  rewriteAssetUrls(container) {
    if (!container) return;

    const apiBaseRaw = window.__LMS_API_BASE || '';
    if (!apiBaseRaw) return;
    const apiBase = apiBaseRaw.replace(/\/$/, '') + '/';

    // Resolve URL relative to API base
    const resolveUrl = (url) => {
      try {
        // Handle relative paths with ../
        if (url.startsWith('../')) {
          // Remove ../ and construct path relative to project root (apiBase)
          // When content is loaded from phase folder, ../ goes up to project root
          const relativePath = url.replace('../', '');
          // Construct URL: apiBase + relativePath
          // Example: ../ecommerce_architecture.svg -> /api/realtime-projects/ecommerce/ecommerce_architecture.svg
          return apiBase + relativePath;
        } else if (url.startsWith('./')) {
          // Handle ./ paths - these are relative to current phase folder
          // Get current phase folder from API base or current path
          const currentPath = window.location.pathname;
          let phaseFolder = '';
          
          // Extract phase folder from current path if available
          const pathMatch = currentPath.match(/\/api\/realtime-projects\/[^\/]+\/([^\/]+)\//);
          if (pathMatch && pathMatch[1]) {
            phaseFolder = pathMatch[1] + '/';
            const relativePath = url.replace('./', '');
            return apiBase + phaseFolder + relativePath;
          }
          // Fallback: remove ./ and use relative to API base
          return apiBase + url.replace('./', '');
        } else if (!url.startsWith('/') && !url.startsWith('http')) {
          // Relative path without ./ or ../ - assume it's relative to project root
          return apiBase + url;
        }
        
        // Absolute path or full URL
        return new URL(url, apiBase).href;
      } catch (e) {
        console.warn('[Navigation] Error resolving URL:', url, e);
        return url;
      }
    };

    const getToken = () => {
      let token = window.__LMS_TOKEN;
      if (token) return token;
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
        // Ignore token extraction errors
      }
      return token || '';
    };

    const addToken = (url) => {
      const token = getToken();
      if (!token) return url;
      try {
        const urlObj = new URL(url);
        if (!urlObj.searchParams.has('token')) {
          urlObj.searchParams.set('token', token);
        }
        return urlObj.href;
      } catch (e) {
        if (url.includes('token=')) return url;
        const separator = url.includes('?') ? '&' : '?';
        return url + separator + 'token=' + encodeURIComponent(token);
      }
    };

    const shouldRewrite = (value) => {
      if (!value) return false;
      const trimmed = value.trim();
      if (!trimmed) return false;
      const lower = trimmed.toLowerCase();
      if (lower.startsWith('http://') || lower.startsWith('https://') ||
          lower.startsWith('data:') || lower.startsWith('mailto:') ||
          lower.startsWith('tel:') || lower.startsWith('#')) {
        return false;
      }
      return true;
    };

    const rewriteAttribute = (selector, attribute) => {
      const elements = container.querySelectorAll(selector);
      elements.forEach((el) => {
        const value = el.getAttribute(attribute);
        if (!shouldRewrite(value)) return;
        const resolved = resolveUrl(value);
        const withToken = addToken(resolved);
        el.setAttribute(attribute, withToken);
      });
    };

    rewriteAttribute('img[src]', 'src');
    rewriteAttribute('source[src]', 'src');
    rewriteAttribute('video[src]', 'src');
    rewriteAttribute('audio[src]', 'src');
    rewriteAttribute('script[src]', 'src');
    rewriteAttribute('link[rel="stylesheet"][href]', 'href');
    rewriteAttribute('a[href]', 'href');
    rewriteAttribute('[data-image]', 'data-image');
  }

  rewriteFooterAssets() {
    // Rewrite footer logo and other assets when served through LMS API
    const apiBaseRaw = window.__LMS_API_BASE || '';
    if (!apiBaseRaw) return;
    
    const apiBase = apiBaseRaw.replace(/\/$/, '') + '/';
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    // Resolve URL relative to API base
    const resolveUrl = (url) => {
      try {
        return new URL(url, apiBase).href;
      } catch (e) {
        return url;
      }
    };
    
    const getToken = () => {
      let token = window.__LMS_TOKEN;
      if (token) return token;
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
        // Ignore token extraction errors
      }
      return token || '';
    };
    
    const addToken = (url) => {
      const token = getToken();
      if (!token) return url;
      try {
        const urlObj = new URL(url);
        if (!urlObj.searchParams.has('token')) {
          urlObj.searchParams.set('token', token);
        }
        return urlObj.href;
      } catch (e) {
        if (url.includes('token=')) return url;
        const separator = url.includes('?') ? '&' : '?';
        return url + separator + 'token=' + encodeURIComponent(token);
      }
    };
    
    const shouldRewrite = (value) => {
      if (!value) return false;
      const trimmed = value.trim();
      if (!trimmed) return false;
      const lower = trimmed.toLowerCase();
      if (lower.startsWith('http://') || lower.startsWith('https://') ||
          lower.startsWith('data:') || lower.startsWith('mailto:') ||
          lower.startsWith('tel:') || lower.startsWith('#')) {
        return false;
      }
      return true;
    };
    
    // Rewrite footer logo images
    const footerLogos = footer.querySelectorAll('img[src*="lms_logo"]');
    footerLogos.forEach((img) => {
      const src = img.getAttribute('src');
      if (!shouldRewrite(src)) return;
      
      // Handle relative paths - convert ../lms_logo.svg to proper API path
      let resolvedSrc = src;
      if (src.startsWith('../')) {
        // Remove ../ and construct path relative to API base
        const relativePath = src.replace('../', '');
        resolvedSrc = apiBase + relativePath;
      } else if (!src.startsWith('/') && !src.startsWith('http')) {
        // Relative path without ../
        resolvedSrc = apiBase + src;
      } else {
        resolvedSrc = resolveUrl(src);
      }
      
      const withToken = addToken(resolvedSrc);
      img.setAttribute('src', withToken);
    });
  }

  loadInitialContent() {
    // Load the first subphase content
    // Wait a bit to ensure token is initialized (if in LMS context)
    if (this.subphases.length > 0) {
      // Small delay to ensure LMS token interceptor has initialized
      setTimeout(() => {
        this.switchTab(this.subphases[0].id);
      }, 100);
    }
  }

  updateProgress() {
    const progressList = document.getElementById('progress-list');
    if (!progressList) return;

    progressList.innerHTML = '';
    
    this.subphases.forEach((subphase) => {
      const progressItem = document.createElement('div');
      progressItem.className = 'progress-item';
      
      const isActive = this.currentTab === subphase.id;
      
      progressItem.innerHTML = `
        <div class="progress-dot ${isActive ? 'active' : ''}"></div>
        <span class="progress-label ${isActive ? 'active' : ''}">${subphase.label}</span>
      `;
      
      progressList.appendChild(progressItem);
    });
  }

  navigateToPhase(phaseId) {
    // Map phase IDs to folder names
    const phaseFolders = {
      'brd': 'BRD_phase',
      'uiux': 'UI_UX_phase',
      'architectural': 'Architectural_Design_phase',
      'code-development': 'Development Phase',
      'development': 'Development Phase',
      'testing': 'Testing_phase',
      'deployment': 'Deployment Phase'
    };

    const folder = phaseFolders[phaseId];
    if (!folder) {
      console.error('[Navigation] Unknown phase ID:', phaseId);
      return;
    }

    let targetUrl;
    const currentPath = window.location.pathname;
    const currentHref = window.location.href;
    
    // CRITICAL: Always use stored project ID first (set by token interceptor)
    // This is the most reliable source since it's set by the backend
    let projectId = window.__LMS_PROJECT_ID;
    
    // If not available, extract from current path
    // Path format: /api/realtime-projects/{projectId}/{phase_folder}/{file.html}
    if (!projectId) {
      const pathParts = currentPath.split('/').filter(p => p);
      const projectIndex = pathParts.findIndex(p => p === 'realtime-projects');
      
      if (projectIndex >= 0 && projectIndex + 1 < pathParts.length) {
        const extractedId = pathParts[projectIndex + 1];
        
        // Check if it's actually a project ID (not a phase folder)
        const phaseFolderNames = Object.values(phaseFolders);
        const isPhaseFolder = phaseFolderNames.some(pf => {
          // Handle spaces in folder names (e.g., "Development Phase")
          const normalizedPf = pf.replace(/\s+/g, '_').toLowerCase();
          const normalizedExtracted = extractedId.replace(/\s+/g, '_').toLowerCase();
          return normalizedPf === normalizedExtracted || 
                 extractedId.includes('_phase') || 
                 extractedId.includes('Phase');
        });
        
        if (!isPhaseFolder) {
          projectId = extractedId;
          console.log('[Navigation] Extracted project ID from path:', projectId);
        }
      }
    }
    
    // If still no project ID, try to extract from href
    if (!projectId && currentHref.includes('/api/realtime-projects/')) {
      const urlMatch = currentHref.match(/\/api\/realtime-projects\/([^\/\?]+)/);
      if (urlMatch && urlMatch[1]) {
        const extractedId = urlMatch[1];
        const phaseFolderNames = Object.values(phaseFolders);
        const isPhaseFolder = phaseFolderNames.some(pf => {
          const normalizedPf = pf.replace(/\s+/g, '_').toLowerCase();
          const normalizedExtracted = extractedId.replace(/\s+/g, '_').toLowerCase();
          return normalizedPf === normalizedExtracted || 
                 extractedId.includes('_phase') || 
                 extractedId.includes('Phase');
        });
        if (!isPhaseFolder) {
          projectId = extractedId;
          console.log('[Navigation] Extracted project ID from href:', projectId);
        }
      }
    }
    
    // If still no project ID, we can't proceed
    if (!projectId) {
      console.error('[Navigation] ERROR: Could not determine project ID!');
      console.error('[Navigation] Current path:', currentPath);
      console.error('[Navigation] Current href:', currentHref);
      console.error('[Navigation] Stored project ID:', window.__LMS_PROJECT_ID);
      return;
    }
    
    // Construct API base with the project ID
    // Use stored API base if available, otherwise determine backend origin
    let backendOrigin = null;
    const currentUrl = new URL(window.location.href);
    const currentPathForNav = currentUrl.pathname; // Use different variable name to avoid conflict
    
    if (currentPathForNav.includes('/api/realtime-projects/')) {
      // Current URL is already pointing to backend API - use current origin
      backendOrigin = currentUrl.origin;
    } else {
      // Not an API URL - try to determine backend URL
      const currentHost = currentUrl.hostname;
      
      if (currentHost === 'gnanamai.com' || currentHost === 'www.gnanamai.com') {
        // Frontend domain - backend should be api.gnanamai.com
        backendOrigin = currentUrl.protocol + '//api.gnanamai.com';
      } else if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        // Local development - backend is on different port (5000)
        // Always use port 5000 for backend, regardless of current port
        backendOrigin = currentUrl.protocol + '//localhost:5000';
        console.log('[Navigation] Using backend origin for local development:', backendOrigin);
      } else {
        // Fallback to current origin (shouldn't happen in normal flow)
        backendOrigin = currentUrl.origin;
        console.warn('[Navigation] Using current origin as fallback (may be incorrect):', backendOrigin);
      }
    }
    
    const apiBase = backendOrigin + '/api/realtime-projects/' + projectId;
    window.__LMS_API_BASE = apiBase; // Cache it
    window.__LMS_PROJECT_ID = projectId; // Cache project ID
    console.log('[Navigation] Using project ID:', projectId);
    console.log('[Navigation] Backend origin:', backendOrigin);
    console.log('[Navigation] API base:', apiBase);
    
    // Construct target URL: /api/realtime-projects/{projectId}/{phase_folder}/Overview.html
    const cleanApiBase = apiBase.replace(/\/$/, ''); // Remove trailing slash
    // Handle folder names with spaces (e.g., "Development Phase")
    const cleanFolder = folder.replace(/^\//, ''); // Remove leading slash
    targetUrl = cleanApiBase + '/' + encodeURIComponent(cleanFolder) + '/Overview.html';
    
    // Final validation: ensure URL contains project ID
    if (!targetUrl.includes('/api/realtime-projects/' + projectId + '/')) {
      console.error('[Navigation] ERROR: Constructed URL does not contain project ID!');
      console.error('[Navigation] URL:', targetUrl);
      console.error('[Navigation] Project ID:', projectId);
      return;
    }
    
    console.log('[Navigation] API Base:', cleanApiBase);
    console.log('[Navigation] Phase Folder:', cleanFolder);
    console.log('[Navigation] Constructed phase URL:', targetUrl);
    
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
          window.__LMS_TOKEN = token; // Cache it
        }
      } catch (e) {
        console.warn('[Navigation] Could not read token from URL:', e);
      }
    }
    
    // Add token if available
    if (token && !targetUrl.includes('token=')) {
      const separator = targetUrl.includes('?') ? '&' : '?';
      targetUrl = targetUrl + separator + 'token=' + encodeURIComponent(token);
    }
    
    console.log('[Navigation] Navigating to phase:', phaseId, 'Folder:', folder, 'Final URL:', targetUrl);
    
    // Navigate to the target URL - use replace to avoid adding to history
    window.location.replace(targetUrl);
  }

  updatePhaseNavigationBar() {
    // Remove any locked states from phase navigation buttons
    const phases = ['brd', 'uiux', 'architectural', 'code-development', 'testing', 'deployment'];
    
    phases.forEach(phaseId => {
      const phaseBtn = document.querySelector(`[data-phase="${phaseId}"]`);
      if (phaseBtn) {
        // Remove locked class and restore opacity
        phaseBtn.classList.remove('locked');
        phaseBtn.removeAttribute('disabled');
        const circle = phaseBtn.querySelector('.phase-nav-circle');
        if (circle) {
          circle.classList.remove('phase-locked');
          circle.style.opacity = '1';
        }
      }
    });
    
    // Also remove any lock classes from all phase buttons (in case some were missed)
    const allPhaseButtons = document.querySelectorAll('.phase-nav-btn');
    allPhaseButtons.forEach(btn => {
      btn.classList.remove('locked');
      btn.removeAttribute('disabled');
      const circle = btn.querySelector('.phase-nav-circle');
      if (circle) {
        circle.classList.remove('phase-locked');
        circle.style.opacity = '1';
      }
    });
  }
}

// Initialize navigation system
const phaseNav = new PhaseNavigation();

// Clean up any lock-related localStorage data and remove lock classes on page load
(function() {
  // Clear old progress data that might have lock information
  if (localStorage.getItem('ecommerceProjectProgress')) {
    localStorage.removeItem('ecommerceProjectProgress');
  }
  
  // Remove any lock classes from phase navigation buttons
  setTimeout(() => {
    const phaseButtons = document.querySelectorAll('.phase-nav-btn');
    phaseButtons.forEach(btn => {
      btn.classList.remove('locked');
      const circle = btn.querySelector('.phase-nav-circle');
      if (circle) {
        circle.classList.remove('phase-locked');
        circle.style.opacity = '1';
      }
    });
    
    // Remove any disabled classes from sidebar buttons
    const sidebarButtons = document.querySelectorAll('.sidebar-nav-btn');
    sidebarButtons.forEach(btn => {
      btn.classList.remove('disabled');
      btn.removeAttribute('disabled');
      
      // Remove lock icons if present
      const icon = btn.querySelector('.sidebar-nav-icon');
      if (icon && icon.textContent.includes('🔒')) {
        // Find the original icon from subphases
        const tabId = btn.dataset.tab;
        if (tabId && phaseNav.subphases) {
          const subphase = phaseNav.subphases.find(s => s.id === tabId);
          if (subphase) {
            icon.textContent = subphase.icon;
          }
        }
      }
    });
  }, 100);
})();
