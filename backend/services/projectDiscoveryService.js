const fs = require('fs');
const path = require('path');

/**
 * Project Discovery Service
 * Scans Realtime_projects folder and discovers all HTML projects
 */

class ProjectDiscoveryService {
  constructor() {
    // Get projects path from environment or use default
    this.projectsPath = process.env.REALTIME_PROJECTS_PATH || 
                       path.join(__dirname, '../../Realtime_projects');
    
    // Log the path being used for debugging
    console.log('ProjectDiscoveryService initialized:');
    console.log('  - REALTIME_PROJECTS_PATH env:', process.env.REALTIME_PROJECTS_PATH || 'Not set');
    console.log('  - Using path:', this.projectsPath);
    console.log('  - Path exists:', fs.existsSync(this.projectsPath));
  }

  /**
   * Discover all projects in the Realtime_projects folder
   */
  async discoverProjects() {
    try {
      // Check if projects directory exists
      if (!fs.existsSync(this.projectsPath)) {
        console.log(`Projects directory not found: ${this.projectsPath}`);
        return [];
      }

      const projects = [];
      const items = fs.readdirSync(this.projectsPath, { withFileTypes: true });

      for (const item of items) {
        if (item.isDirectory()) {
          const projectPath = path.join(this.projectsPath, item.name);
          const projectInfo = await this.getProjectInfo(item.name, projectPath);
          
          if (projectInfo) {
            projects.push(projectInfo);
          }
        }
      }

      // Sort projects by order (if specified) or alphabetically by name
      projects.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return a.name.localeCompare(b.name);
      });

      return projects;
    } catch (error) {
      console.error('Error discovering projects:', error);
      return [];
    }
  }

  /**
   * Get project information from folder
   */
  async getProjectInfo(folderName, projectPath) {
    try {
      const indexPath = path.join(projectPath, 'index.html');
      
      // Project must have index.html
      if (!fs.existsSync(indexPath)) {
        return null;
      }

      // Try to read project.json
      const configPath = path.join(projectPath, 'project.json');
      let config = {};
      
      if (fs.existsSync(configPath)) {
        try {
          const configContent = fs.readFileSync(configPath, 'utf8');
          config = JSON.parse(configContent);
        } catch (error) {
          console.log(`Error reading project.json for ${folderName}:`, error.message);
        }
      }

      // Generate project info from folder name and config
      const projectId = config.id || folderName.toLowerCase().replace(/\s+/g, '-');
      const projectName = config.name || this.formatFolderName(folderName);
      
      return {
        id: projectId,
        folderName: folderName,
        name: projectName,
        description: config.description || `Interactive ${projectName} project`,
        category: config.category || 'Web Development',
        difficulty: config.difficulty || 'intermediate',
        thumbnail: config.thumbnail || this.findThumbnail(projectPath),
        tags: config.tags || [],
        estimatedHours: config.estimatedHours || 40,
        order: config.order !== undefined ? config.order : 999,
        version: config.version || '1.0.0',
        createdAt: config.createdAt || this.getFolderCreationDate(projectPath),
        updatedAt: config.updatedAt || this.getFolderModificationDate(projectPath),
        hideFooter: config.hideFooter === true, // Default to false (show footer unless explicitly hidden)
        hideHeader: config.hideHeader === true,
        path: projectPath
      };
    } catch (error) {
      console.error(`Error getting project info for ${folderName}:`, error);
      return null;
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId) {
    const projects = await this.discoverProjects();
    // Case-insensitive matching
    const projectIdLower = projectId?.toLowerCase();
    const project = projects.find(p => 
      p.id?.toLowerCase() === projectIdLower || 
      p.folderName?.toLowerCase() === projectIdLower
    );
    
    if (!project) {
      console.log(`Project not found: ${projectId}`);
      console.log(`Available projects: ${projects.map(p => p.id || p.folderName).join(', ')}`);
    }
    
    return project;
  }

  /**
   * Get project categories
   */
  async getCategories() {
    const projects = await this.discoverProjects();
    const categories = [...new Set(projects.map(p => p.category))];
    return categories.sort();
  }

  /**
   * Get project statistics
   */
  async getStats() {
    const projects = await this.discoverProjects();
    const categories = {};
    const difficulties = {};
    
    projects.forEach(project => {
      categories[project.category] = (categories[project.category] || 0) + 1;
      difficulties[project.difficulty] = (difficulties[project.difficulty] || 0) + 1;
    });

    return {
      total: projects.length,
      byCategory: categories,
      byDifficulty: difficulties
    };
  }

  /**
   * Format folder name to readable name
   */
  formatFolderName(folderName) {
    return folderName
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Find thumbnail image in project folder
   */
  findThumbnail(projectPath) {
    const thumbnailExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
    const possiblePaths = [
      'thumbnail.png',
      'thumbnail.jpg',
      'assets/thumbnail.png',
      'assets/thumbnail.jpg',
      'images/thumbnail.png',
      'img/thumbnail.png'
    ];

    for (const thumbPath of possiblePaths) {
      const fullPath = path.join(projectPath, thumbPath);
      if (fs.existsSync(fullPath)) {
        return thumbPath;
      }
    }

    return null;
  }

  /**
   * Get folder creation date
   */
  getFolderCreationDate(folderPath) {
    try {
      const stats = fs.statSync(folderPath);
      return stats.birthtime.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Get folder modification date
   */
  getFolderModificationDate(folderPath) {
    try {
      const stats = fs.statSync(folderPath);
      return stats.mtime.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }
}

module.exports = new ProjectDiscoveryService();

