/**
 * Progress Tracking System
 * Manages phase and module locking/unlocking using localStorage
 */
class ProgressTracker {
  constructor() {
    this.projectId = 'ecommerce'; // Single project for now
    this.initializeProgress();
  }

  initializeProgress() {
    const savedProgress = localStorage.getItem('ecommerceProjectProgress');
    if (!savedProgress) {
      // Initialize with BRD phase unlocked
      const initialProgress = {
        currentPhase: 'brd',
        unlockedPhases: ['brd'],
        unlockedModules: {
          brd: ['overview'],
          uiux: [],
          architectural: [],
          development: [],
          testing: [],
          deployment: []
        },
        completedModules: {
          brd: [],
          uiux: [],
          architectural: [],
          development: [],
          testing: [],
          deployment: []
        }
      };
      localStorage.setItem('ecommerceProjectProgress', JSON.stringify(initialProgress));
      this.progress = initialProgress;
    } else {
      try {
        this.progress = JSON.parse(savedProgress);
      } catch (e) {
        console.error('Error loading progress:', e);
        this.initializeProgress(); // Retry initialization
      }
    }
  }

  getProgress() {
    return this.progress;
  }

  isPhaseUnlocked(phase) {
    return this.progress.unlockedPhases.includes(phase);
  }

  isModuleUnlocked(phase, module) {
    return this.progress.unlockedModules[phase]?.includes(module) || false;
  }

  isModuleCompleted(phase, module) {
    return this.progress.completedModules[phase]?.includes(module) || false;
  }

  completeModule(phase, module) {
    if (!this.progress.completedModules[phase]) {
      this.progress.completedModules[phase] = [];
    }
    if (!this.progress.completedModules[phase].includes(module)) {
      this.progress.completedModules[phase].push(module);
      this.unlockNextModule(phase, module);
      this.saveProgress();
    }
  }

  unlockNextModule(phase, currentModule) {
    const moduleOrder = {
      brd: ['overview', 'functional-requirements', 'non-functional-requirements', 'user-stories', 'conclusion'],
      uiux: ['overview', 'design-system', 'customer-pages', 'admin-pages', 'navigation-flow', 'conclusion'],
      architectural: ['overview', 'system-architecture', 'database-design', 'api-design', 'security-architecture', 'conclusion'],
      development: ['overview', 'frontend-development', 'backend-development', 'database-implementation', 'testing', 'conclusion'],
      testing: ['overview', 'test-planning', 'unit-testing', 'integration-testing', 'performance-testing', 'conclusion'],
      deployment: ['overview', 'deployment-planning', 'environment-setup', 'final-steps']
    };

    const modules = moduleOrder[phase] || [];
    const currentIndex = modules.indexOf(currentModule);
    
    if (currentIndex < modules.length - 1) {
      const nextModule = modules[currentIndex + 1];
      if (!this.progress.unlockedModules[phase]) {
        this.progress.unlockedModules[phase] = [];
      }
      if (!this.progress.unlockedModules[phase].includes(nextModule)) {
        this.progress.unlockedModules[phase].push(nextModule);
      }

      // If completing conclusion, unlock next phase
      if (currentModule === 'conclusion' || (phase === 'deployment' && currentModule === 'final-steps')) {
        this.unlockNextPhase(phase);
      }
    }
  }

  unlockNextPhase(currentPhase) {
    const phases = ['brd', 'uiux', 'architectural', 'development', 'testing', 'deployment'];
    const currentIndex = phases.indexOf(currentPhase);
    
    if (currentIndex < phases.length - 1) {
      let nextPhase = phases[currentIndex + 1];
      // Map 'development' to 'code-development' for consistency with HTML
      const phaseMap = {
        'development': 'code-development'
      };
      const displayPhase = phaseMap[nextPhase] || nextPhase;
      
      // Unlock both internal name and display name
      if (!this.progress.unlockedPhases.includes(nextPhase)) {
        this.progress.unlockedPhases.push(nextPhase);
      }
      if (displayPhase !== nextPhase && !this.progress.unlockedPhases.includes(displayPhase)) {
        this.progress.unlockedPhases.push(displayPhase);
      }
      
      // Unlock overview of next phase
      if (!this.progress.unlockedModules[nextPhase]) {
        this.progress.unlockedModules[nextPhase] = [];
      }
      if (!this.progress.unlockedModules[nextPhase].includes('overview')) {
        this.progress.unlockedModules[nextPhase].push('overview');
      }
    }
  }

  saveProgress() {
    localStorage.setItem('ecommerceProjectProgress', JSON.stringify(this.progress));
  }
}

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
    this.progressTracker = new ProgressTracker();
    
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
      const isUnlocked = this.progressTracker.isModuleUnlocked(this.currentPhase, subphase.id);
      const isCompleted = this.progressTracker.isModuleCompleted(this.currentPhase, subphase.id);
      
      navItem.innerHTML = `
        <button 
          class="sidebar-nav-btn ${isActive ? 'active' : ''} ${!isUnlocked ? 'disabled' : ''} ${isCompleted ? 'completed' : ''}"
          data-tab="${subphase.id}"
          ${!isUnlocked ? 'disabled' : ''}
        >
          <span class="sidebar-nav-icon">${isUnlocked ? (isCompleted ? '✅' : subphase.icon) : '🔒'}</span>
          <div class="sidebar-nav-content">
            <div class="sidebar-nav-label">${subphase.label}</div>
            <div class="sidebar-nav-desc">${isUnlocked ? this.getSubphaseDescription(subphase.id) : 'Complete previous modules to unlock'}</div>
          </div>
        </button>
      `;
      
      sidebarNav.appendChild(navItem);
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
      if (e.target.closest('.sidebar-nav-btn') && !e.target.closest('.sidebar-nav-btn.disabled')) {
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
      if (e.target.closest('.phase-nav-btn') && !e.target.closest('.phase-nav-btn.locked')) {
        const phaseId = e.target.closest('.phase-nav-btn').dataset.phase;
        if (phaseId) {
          this.navigateToPhase(phaseId);
        }
      }
    });
  }

  switchTab(tabId) {
    // Check if module is unlocked before switching
    if (!this.progressTracker.isModuleUnlocked(this.currentPhase, tabId)) {
      alert('This module is locked. Please complete the previous modules to unlock it.');
      return;
    }

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
        // Check if there's a next module and if it's unlocked
        const currentIndex = this.subphases.findIndex(s => s.id === tabId);
        const hasNext = currentIndex < this.subphases.length - 1;
        nextBtn.style.display = hasNext ? 'flex' : 'none';
      }
    }
  }

  goToNext() {
    const currentIndex = this.subphases.findIndex(s => s.id === this.currentTab);
    if (currentIndex < this.subphases.length - 1) {
      // Mark current module as completed
      this.progressTracker.completeModule(this.currentPhase, this.currentTab);
      
      const nextSubphase = this.subphases[currentIndex + 1];
      
      // Check if next module is unlocked
      if (this.progressTracker.isModuleUnlocked(this.currentPhase, nextSubphase.id)) {
        this.switchTab(nextSubphase.id);
        
        // Scroll to top
        document.querySelector('.content-area').scrollTop = 0;
      } else {
        alert('The next module is locked. Please complete all content in the current module first.');
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
    try {
      const response = await fetch(subphase.file);
      if (!response.ok) {
        throw new Error('Failed to load content');
      }
      
      const html = await response.text();
      
      // Extract content from the HTML (assumes content is in a specific container)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.querySelector('.content-body') || doc.body;
      
      // Cache and display
      this.contentCache[tabId] = content.innerHTML;
      contentArea.innerHTML = this.contentCache[tabId];
      contentArea.classList.add('content-fade-in');
      
    } catch (error) {
      console.error('Error loading content:', error);
      contentArea.innerHTML = `
        <div class="content-section">
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem;">
            <p style="color: #991b1b;">Unable to load content. Please ensure the file ${subphase.file} exists.</p>
          </div>
        </div>
      `;
    }
  }

  loadInitialContent() {
    // Load the first subphase content
    if (this.subphases.length > 0) {
      this.switchTab(this.subphases[0].id);
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
    // Check if phase is unlocked (handle code-development vs development)
    let isUnlocked = this.progressTracker.isPhaseUnlocked(phaseId);
    if (phaseId === 'code-development') {
      isUnlocked = this.progressTracker.isPhaseUnlocked('code-development') || 
                   this.progressTracker.isPhaseUnlocked('development');
    }
    
    if (!isUnlocked) {
      alert('This phase is locked. Please complete the previous phases to unlock it.');
      return;
    }

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
    if (folder) {
      // All phase folders are at the root level, so construct path directly
      // Get the base URL (protocol + host + port)
      const baseUrl = window.location.protocol + '//' + window.location.host;
      // Construct the absolute URL to the target phase
      const targetUrl = baseUrl + '/' + folder + '/Overview.html';
      // Navigate to the target URL - use replace to avoid adding to history
      window.location.replace(targetUrl);
    }
  }

  updatePhaseNavigationBar() {
    // Update phase navigation bar to show locked states
    const progress = this.progressTracker.getProgress();
    const phases = ['brd', 'uiux', 'architectural', 'code-development', 'testing', 'deployment'];
    
    phases.forEach(phaseId => {
      const phaseBtn = document.querySelector(`[data-phase="${phaseId}"]`);
      if (phaseBtn) {
        // Check both phaseId and 'development' for code-development
        let isUnlocked = progress.unlockedPhases.includes(phaseId);
        if (phaseId === 'code-development') {
          isUnlocked = progress.unlockedPhases.includes('code-development') || 
                       progress.unlockedPhases.includes('development');
        }
        
        if (!isUnlocked) {
          phaseBtn.classList.add('locked');
          const circle = phaseBtn.querySelector('.phase-nav-circle');
          if (circle) {
            circle.classList.add('phase-locked');
            circle.style.opacity = '0.5';
          }
        } else {
          phaseBtn.classList.remove('locked');
          const circle = phaseBtn.querySelector('.phase-nav-circle');
          if (circle) {
            circle.classList.remove('phase-locked');
            circle.style.opacity = '1';
          }
        }
      }
    });
    
    // Also check for 'development' phase and update code-development button
    const developmentUnlocked = progress.unlockedPhases.includes('development');
    if (developmentUnlocked) {
      const codeDevBtn = document.querySelector(`[data-phase="code-development"]`);
      if (codeDevBtn && !codeDevBtn.classList.contains('locked')) {
        // Already unlocked, ensure it's visible
        codeDevBtn.classList.remove('locked');
        const circle = codeDevBtn.querySelector('.phase-nav-circle');
        if (circle) {
          circle.classList.remove('phase-locked');
          circle.style.opacity = '1';
        }
      }
    }
  }
}

// Initialize navigation system
const phaseNav = new PhaseNavigation();


