import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import PhaseNavigationBar from '../components/projects/PhaseNavigationBar';
import NextButton from '../components/projects/NextButton';
import VideoPlayer from '../components/course/VideoPlayer';
import { useProjectProgress } from '../context/ProjectProgressContext';
import { projectService } from '../services/projectService';

const ArchitecturalDesignPhasePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isModuleUnlocked, unlockNextPhase } = useProjectProgress();

  // Fetch videos for this project
  const { data: videosData, isLoading: videosLoading, error: videosError } = useQuery(
    ['project-videos', projectId],
    () => projectService.getProjectVideos(projectId, { phase: 'Architecture' }),
    {
      enabled: !!projectId,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  const videos = videosData?.data || [];

  useEffect(() => {
    // Mock data for testing - in real app, fetch based on projectId
    const mockProjects = [
      {
        id: 1,
        title: 'E-Commerce Web Application',
        description: 'Build a complete e-commerce platform with modern technologies including React, Node.js, and PostgreSQL.',
        difficulty: 'intermediate',
        estimatedDuration: 40,
        phases: [
          {
            id: 1,
            title: 'Phase 1 - BRD (Business Requirements Document)',
            description: 'Define project scope, requirements, and technical specifications',
            phaseNumber: 1,
            phaseType: 'BRD',
            estimatedDuration: 8,
            order: 1
          },
          {
            id: 2,
            title: 'Phase 2 - UI/UX Design',
            description: 'Create intuitive and user-friendly designs',
            phaseNumber: 2,
            phaseType: 'UIUX',
            estimatedDuration: 10,
            order: 2
          },
          {
            id: 3,
            title: 'Phase 3 - Architectural Design',
            description: 'Design system architecture and technical specifications',
            phaseNumber: 3,
            phaseType: 'ARCHITECTURAL',
            estimatedDuration: 12,
            order: 3
          }
        ]
      },
      {
        id: 2,
        title: 'Data Analytics Dashboard',
        description: 'Create an interactive data analytics dashboard using modern visualization libraries and real-time data processing.',
        difficulty: 'intermediate',
        estimatedDuration: 35,
        phases: [
          {
            id: 6,
            title: 'Phase 1 - BRD (Business Requirements Document)',
            description: 'Define data requirements and analytics objectives',
            phaseNumber: 1,
            phaseType: 'BRD',
            estimatedDuration: 7,
            order: 1
          },
          {
            id: 7,
            title: 'Phase 2 - UI/UX Design',
            description: 'Design data visualization interfaces',
            phaseNumber: 2,
            phaseType: 'UIUX',
            estimatedDuration: 9,
            order: 2
          },
          {
            id: 8,
            title: 'Phase 3 - Architectural Design',
            description: 'Design data processing and visualization architecture',
            phaseNumber: 3,
            phaseType: 'ARCHITECTURAL',
            estimatedDuration: 11,
            order: 3
          }
        ]
      },
      {
        id: 3,
        title: 'AI-Powered Learning Assistant',
        description: 'Develop an intelligent learning assistant using AI and machine learning technologies.',
        difficulty: 'advanced',
        estimatedDuration: 45,
        phases: [
          {
            id: 11,
            title: 'Phase 1 - BRD (Business Requirements Document)',
            description: 'Define AI requirements and learning objectives',
            phaseNumber: 1,
            phaseType: 'BRD',
            estimatedDuration: 9,
            order: 1
          },
          {
            id: 12,
            title: 'Phase 2 - UI/UX Design',
            description: 'Design AI interaction interfaces',
            phaseNumber: 2,
            phaseType: 'UIUX',
            estimatedDuration: 11,
            order: 2
          },
          {
            id: 13,
            title: 'Phase 3 - Architectural Design',
            description: 'Design AI/ML system architecture',
            phaseNumber: 3,
            phaseType: 'ARCHITECTURAL',
            estimatedDuration: 13,
            order: 3
          }
        ]
      }
    ];

    const foundProject = mockProjects.find(p => p.id === parseInt(projectId));
    if (foundProject) {
      setProject(foundProject);
    }
    setLoading(false);
  }, [projectId]);

  const architecturalTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '🏗️',
      description: 'Architecture phase overview and objectives'
    },
    {
      id: 'system-architecture',
      label: 'System Architecture',
      icon: '⚙️',
      description: 'Overall system structure and components'
    },
    {
      id: 'database-design',
      label: 'Database Design',
      icon: '🗄️',
      description: 'Data models and relationships'
    },
    {
      id: 'api-design',
      label: 'API Design',
      icon: '🔌',
      description: 'RESTful APIs and endpoints'
    },
    {
      id: 'security-architecture',
      label: 'Security Architecture',
      icon: '🔒',
      description: 'Security measures and protocols'
    },
    {
      id: 'conclusion',
      label: 'Conclusion',
      icon: '✅',
      description: 'Summary and next steps'
    }
  ];

  const handleBackToProjects = () => {
    navigate('/realtime-projects');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Architectural Design Phase...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h2>
          <button
            onClick={handleBackToProjects}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Architectural Design Overview</h3>
            
            {/* Video Section */}
            <div className="mb-8">
              {videosLoading ? (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading videos...</p>
                </div>
              ) : videosError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="text-red-500 mr-3">⚠️</div>
                    <div>
                      <h4 className="text-red-800 font-medium">Unable to load videos</h4>
                      <p className="text-red-600 text-sm mt-1">
                        {videosError.message || 'Failed to fetch project videos'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : videos.length > 0 ? (
                <div className="space-y-6">
                  {videos.map((video) => (
                    <div key={video.id} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                      <div className="aspect-video w-full">
                        <VideoPlayer
                          url={video.video_url}
                          title={video.title}
                          className="w-full h-full"
                          showControls={true}
                        />
                      </div>
                      <div className="p-4 bg-gray-800 text-white">
                        <h4 className="text-lg font-semibold mb-2">{video.title}</h4>
                        {video.description && (
                          <p className="text-sm text-gray-300 mb-2">{video.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Duration: {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}</span>
                          <span>Views: {video.view_count || 0}</span>
                          <span>Phase: {video.phase || 'Architecture'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="text-yellow-500 mr-3">📹</div>
                    <div>
                      <h4 className="text-yellow-800 font-medium">No videos available</h4>
                      <p className="text-yellow-600 text-sm mt-1">
                        No Architecture phase videos have been uploaded for this project yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                This phase focuses on designing a robust and scalable technical architecture for the {project.title}. 
                The architectural design phase transforms the UI/UX requirements into a comprehensive technical blueprint 
                that ensures system reliability, performance, and maintainability.
              </p>
              
              <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Phase Objectives</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Define system architecture and component relationships</li>
                  <li>Design database schema and data flow</li>
                  <li>Create API specifications and endpoints</li>
                  <li>Implement security measures and protocols</li>
                  <li>Ensure scalability and performance requirements</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Deliverables</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>System Architecture Diagram</li>
                  <li>Database Schema Design</li>
                  <li>API Documentation</li>
                  <li>Security Architecture Plan</li>
                  <li>Technology Stack Specification</li>
                  <li>Deployment Architecture</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'system-architecture':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">System Architecture</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The system architecture defines the overall structure of the E-Commerce application, including the relationships 
                between different components, data flow, and communication patterns.
              </p>
            </div>
            
            {/* Main Architecture Diagram */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800">E-Commerce System Architecture Diagram</h4>
                <p className="text-sm text-gray-600 mt-1">Complete system overview showing all components and their interactions</p>
                      </div>
              <div className="p-6">
                <div className="flex justify-center">
                  <img 
                    src="/ecommerce_architecture.svg" 
                    alt="E-Commerce System Architecture Diagram" 
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                    style={{ maxHeight: '600px' }}
                  />
                      </div>
                      </div>
                    </div>

            {/* Architecture Layers Explanation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client Layer */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">💻</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Client Applications</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Multi-platform client support for maximum accessibility</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Desktop Browser (Chrome, Firefox, Safari)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Mobile Browser (iOS Safari, Chrome Mobile)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Tablet Browser (iPad, Android Tablets)
                  </li>
                </ul>
                </div>

              {/* Core Services Layer */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">⚙️</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Core Services</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Microservices architecture for scalability and maintainability</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Next.js Frontend & API Gateway
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Product Management Service
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Cart & Order Services
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Authentication & Payment Services
                  </li>
                        </ul>
                      </div>

              {/* Data & External Services Layer */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🗄️</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Data & External Services</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Robust data storage and third-party integrations</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    PostgreSQL Database
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Cloudinary (Image Storage)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Stripe (Payment Processing)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Resend (Email Service)
                  </li>
                        </ul>
                      </div>
                    </div>

            {/* Data Flow Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Data Flow & Communication Patterns</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Request Flow</h5>
                    <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <span className="text-sm text-gray-700">Client sends request to Next.js API</span>
                      </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <span className="text-sm text-gray-700">API routes to appropriate microservice</span>
                      </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <span className="text-sm text-gray-700">Service processes request and queries database</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <span className="text-sm text-gray-700">Response sent back through API to client</span>
                  </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Key Features</h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Scalable Architecture</span>
                        <p className="text-xs text-gray-600">Microservices can be scaled independently based on demand</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">High Availability</span>
                        <p className="text-xs text-gray-600">Redundant services and database replication</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Security First</span>
                        <p className="text-xs text-gray-600">JWT authentication and encrypted data transmission</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Cloud Native</span>
                        <p className="text-xs text-gray-600">Deployed on Vercel with external service integrations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technology Stack */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Technology Stack</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">⚛️</div>
                  <div className="text-sm font-medium text-gray-800">React.js</div>
                  <div className="text-xs text-gray-600">Frontend Framework</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="text-sm font-medium text-gray-800">Next.js</div>
                  <div className="text-xs text-gray-600">Full-Stack Framework</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🐘</div>
                  <div className="text-sm font-medium text-gray-800">PostgreSQL</div>
                  <div className="text-xs text-gray-600">Database</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">☁️</div>
                  <div className="text-sm font-medium text-gray-800">Vercel</div>
                  <div className="text-xs text-gray-600">Hosting Platform</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'database-design':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Database Design</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The database design defines the data structure, relationships, and storage requirements 
                for the E-Commerce application, ensuring efficient data management and optimal performance.
              </p>
            </div>
            
            {/* Main Database Schema Diagram */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800">E-Commerce Database Schema Diagram</h4>
                <p className="text-sm text-gray-600 mt-1">Complete database structure showing all tables, relationships, and constraints</p>
                      </div>
              <div className="p-6">
                <div className="flex justify-center">
                  <img 
                    src="/database_design.svg" 
                    alt="E-Commerce Database Schema Diagram" 
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                    style={{ maxHeight: '600px' }}
                  />
                </div>
              </div>
            </div>

            {/* Database Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Core Tables */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🗂️</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Core Tables</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Essential entities for e-commerce functionality</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Users (Authentication & Profiles)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Products (Catalog Management)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Categories (Product Organization)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Orders (Transaction Records)
                  </li>
                        </ul>
                      </div>

              {/* Relationship Tables */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🔗</span>
                    </div>
                  <h4 className="text-lg font-semibold text-gray-800">Relationship Tables</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Junction tables for complex relationships</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Order Items (Order-Product Link)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Cart Items (Shopping Cart)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Wishlist (User-Product Favorites)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Product Categories (Many-to-Many)
                  </li>
                        </ul>
                      </div>

              {/* Support Tables */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">⚙️</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Support Tables</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Additional tables for enhanced functionality</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Addresses (User Locations)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Reviews (Product Feedback)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Payments (Transaction Records)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Inventory (Stock Management)
                  </li>
                        </ul>
                      </div>
                    </div>

            {/* Database Relationships Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Database Relationships & Constraints</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Primary Relationships</h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <span className="text-sm text-gray-700">Users → Orders (One-to-Many)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <span className="text-sm text-gray-700">Orders → Order Items (One-to-Many)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <span className="text-sm text-gray-700">Categories → Products (One-to-Many)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <span className="text-sm text-gray-700">Products ↔ Categories (Many-to-Many)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Key Constraints</h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Primary Keys</span>
                        <p className="text-xs text-gray-600">Auto-incrementing IDs for unique identification</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Foreign Keys</span>
                        <p className="text-xs text-gray-600">Referential integrity between related tables</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Unique Constraints</span>
                        <p className="text-xs text-gray-600">Email addresses and product SKUs must be unique</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Check Constraints</span>
                        <p className="text-xs text-gray-600">Price and quantity values must be positive</p>
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                </div>

            {/* Performance & Optimization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Indexing Strategy */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">⚡</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Indexing Strategy</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Primary Indexes</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• All primary keys (auto-indexed)</li>
                      <li>• Foreign key columns</li>
                      <li>• Email addresses (unique)</li>
                      </ul>
                    </div>
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Search Indexes</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Product names and descriptions</li>
                      <li>• Order status and dates</li>
                      <li>• User search patterns</li>
                      </ul>
                    </div>
                  </div>
                </div>

              {/* Query Optimization */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl p-6 border border-teal-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🚀</span>
                    </div>
                  <h4 className="text-lg font-semibold text-gray-800">Query Optimization</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Performance Features</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Efficient JOIN operations</li>
                        <li>• Pagination for large datasets</li>
                        <li>• Connection pooling</li>
                      </ul>
                    </div>
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Caching Strategy</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Redis for session data</li>
                      <li>• Product catalog caching</li>
                      <li>• Query result caching</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Technology Stack */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Database Technology Stack</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🐘</div>
                  <div className="text-sm font-medium text-gray-800">PostgreSQL</div>
                  <div className="text-xs text-gray-600">Primary Database</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="text-sm font-medium text-gray-800">Prisma ORM</div>
                  <div className="text-xs text-gray-600">Database Toolkit</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-sm font-medium text-gray-800">Redis</div>
                  <div className="text-xs text-gray-600">Caching Layer</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">☁️</div>
                  <div className="text-sm font-medium text-gray-800">Neon</div>
                  <div className="text-xs text-gray-600">Cloud Database</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'api-design':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">API Design</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The API design defines the communication interface between the frontend and backend, 
                ensuring consistent and efficient data exchange with robust security and performance.
              </p>
            </div>
            
            {/* Main API Design Diagram */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800">E-Commerce API Architecture Diagram</h4>
                <p className="text-sm text-gray-600 mt-1">Complete API structure showing endpoints, authentication, and data flow</p>
              </div>
              <div className="p-6">
                <div className="flex justify-center">
                    <img 
                      src="/api_design_clear.svg" 
                      alt="E-Commerce API Design Diagram" 
                      className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                      style={{ maxHeight: 'auto', width: 'auto' }}
                    />
                </div>
              </div>
            </div>

            {/* API Categories Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Authentication APIs */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🔐</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Authentication APIs</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Secure user authentication and authorization</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    User Registration & Login
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    JWT Token Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Password Reset & Recovery
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Profile Management
                  </li>
                </ul>
              </div>

              {/* Product APIs */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📦</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Product APIs</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Product catalog and inventory management</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Product CRUD Operations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Category Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Search & Filtering
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Inventory Tracking
                  </li>
                </ul>
              </div>

              {/* Order APIs */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🛒</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Order APIs</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Shopping cart and order processing</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Cart Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Order Processing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Payment Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Order Tracking
                  </li>
                </ul>
              </div>
            </div>

            {/* API Endpoints Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">RESTful API Endpoints</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Authentication Endpoints</h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-mono">POST</span>
                          <span className="font-mono text-gray-600">/api/auth/register</span>
                      <span className="text-sm text-gray-500">User registration</span>
                        </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-mono">POST</span>
                          <span className="font-mono text-gray-600">/api/auth/login</span>
                      <span className="text-sm text-gray-500">User login</span>
                        </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">GET</span>
                          <span className="font-mono text-gray-600">/api/auth/profile</span>
                      <span className="text-sm text-gray-500">Get user profile</span>
                        </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-mono">PUT</span>
                      <span className="font-mono text-gray-600">/api/auth/profile</span>
                      <span className="text-sm text-gray-500">Update profile</span>
                      </div>
                    </div>
                </div>
                <div>
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Product Endpoints</h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">GET</span>
                          <span className="font-mono text-gray-600">/api/products</span>
                      <span className="text-sm text-gray-500">Get all products</span>
                        </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">GET</span>
                          <span className="font-mono text-gray-600">/api/products/:id</span>
                      <span className="text-sm text-gray-500">Get product by ID</span>
                        </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-mono">POST</span>
                          <span className="font-mono text-gray-600">/api/products</span>
                      <span className="text-sm text-gray-500">Create product</span>
                        </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-mono">PUT</span>
                          <span className="font-mono text-gray-600">/api/products/:id</span>
                      <span className="text-sm text-gray-500">Update product</span>
                        </div>
                      </div>
                    </div>
                        </div>
                        </div>

            {/* API Standards & Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request/Response Standards */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📋</span>
                        </div>
                  <h4 className="text-lg font-semibold text-gray-800">Request/Response Standards</h4>
                      </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Data Format</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• JSON for all requests/responses</li>
                      <li>• Consistent error message format</li>
                      <li>• Standardized HTTP status codes</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Pagination</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Limit and offset parameters</li>
                      <li>• Total count in response headers</li>
                      <li>• Consistent pagination metadata</li>
                    </ul>
                    </div>
                  </div>
                </div>

              {/* Security Features */}
              <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl p-6 border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🛡️</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Security Features</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Authentication</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• JWT token-based authentication</li>
                      <li>• Role-based access control (RBAC)</li>
                      <li>• Token refresh mechanism</li>
                      </ul>
                    </div>
                  <div className="bg-white rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Protection</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Rate limiting per endpoint</li>
                      <li>• Input validation & sanitization</li>
                        <li>• CORS configuration</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

            {/* API Performance & Monitoring */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">API Performance & Monitoring</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-sm font-medium text-gray-800">Response Time</div>
                  <div className="text-xs text-gray-600">Average &lt; 200ms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium text-gray-800">Monitoring</div>
                  <div className="text-xs text-gray-600">Real-time metrics</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="text-sm font-medium text-gray-800">Caching</div>
                  <div className="text-xs text-gray-600">Redis integration</div>
                </div>
              </div>
            </div>

            {/* API Technology Stack */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">API Technology Stack</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="text-sm font-medium text-gray-800">Next.js API</div>
                  <div className="text-xs text-gray-600">API Routes</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="text-sm font-medium text-gray-800">Prisma</div>
                  <div className="text-xs text-gray-600">Database ORM</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔐</div>
                  <div className="text-sm font-medium text-gray-800">JWT</div>
                  <div className="text-xs text-gray-600">Authentication</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm font-medium text-gray-800">Swagger</div>
                  <div className="text-xs text-gray-600">API Documentation</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security-architecture':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Security Architecture</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive security measures and protocols designed to protect the E-Commerce application, 
                ensuring data integrity, user privacy, and compliance with industry standards.
              </p>
            </div>

            {/* Security Overview Diagram */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800">E-Commerce Security Architecture</h4>
                <p className="text-sm text-gray-600 mt-1">Multi-layered security approach protecting all system components</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Client Security */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🖥️</span>
                      <h5 className="font-semibold text-gray-800">Client Security</h5>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• HTTPS/TLS encryption</li>
                      <li>• Content Security Policy (CSP)</li>
                      <li>• XSS protection</li>
                      <li>• Secure cookie handling</li>
                    </ul>
                  </div>

                  {/* API Security */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🔌</span>
                      <h5 className="font-semibold text-gray-800">API Security</h5>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• JWT authentication</li>
                      <li>• Rate limiting</li>
                      <li>• Input validation</li>
                      <li>• CORS configuration</li>
                    </ul>
                  </div>

                  {/* Database Security */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🗄️</span>
                      <h5 className="font-semibold text-gray-800">Database Security</h5>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Encrypted connections</li>
                      <li>• SQL injection prevention</li>
                      <li>• Access control</li>
                      <li>• Data encryption at rest</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication & Authorization */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Authentication & Authorization</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Authentication Methods</h5>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🔐</span>
                        <h6 className="font-medium text-gray-800">JWT Token Authentication</h6>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Secure token-based authentication with refresh mechanism</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Access tokens (15 min expiry)</li>
                        <li>• Refresh tokens (7 days expiry)</li>
                        <li>• Automatic token refresh</li>
                        <li>• Secure token storage</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🔑</span>
                        <h6 className="font-medium text-gray-800">Password Security</h6>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Strong password policies and secure storage</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• bcrypt hashing (12 rounds)</li>
                        <li>• Minimum 8 characters</li>
                        <li>• Special characters required</li>
                        <li>• Password strength validation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Role-Based Access Control</h5>
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">👑</span>
                        <h6 className="font-medium text-gray-800">Admin Role</h6>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Full system access</li>
                        <li>• User management</li>
                        <li>• Product CRUD operations</li>
                        <li>• Order management</li>
                        <li>• Analytics dashboard</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">👤</span>
                        <h6 className="font-medium text-gray-800">Customer Role</h6>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Browse products</li>
                        <li>• Manage cart</li>
                        <li>• Place orders</li>
                        <li>• View order history</li>
                        <li>• Update profile</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Data Protection & Privacy</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🔒</span>
                    <h5 className="font-semibold text-gray-800">Encryption</h5>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      TLS 1.3 for data in transit
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      AES-256 for data at rest
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      Encrypted database connections
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      Secure key management
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🛡️</span>
                    <h5 className="font-semibold text-gray-800">Privacy Controls</h5>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      GDPR compliance
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      Data anonymization
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      Right to be forgotten
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      Consent management
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🔍</span>
                    <h5 className="font-semibold text-gray-800">Monitoring</h5>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Real-time threat detection
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Security event logging
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Anomaly detection
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Automated alerts
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Security Implementation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Validation & Sanitization */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Input Validation & Sanitization</h4>
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <h5 className="font-medium text-gray-800 mb-2">SQL Injection Prevention</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Parameterized queries with Prisma ORM</li>
                      <li>• Input validation on all endpoints</li>
                      <li>• Database query sanitization</li>
                      <li>• Regular security testing</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <h5 className="font-medium text-gray-800 mb-2">XSS Protection</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Content Security Policy headers</li>
                      <li>• Input sanitization with DOMPurify</li>
                      <li>• Output encoding</li>
                      <li>• React's built-in XSS protection</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h5 className="font-medium text-gray-800 mb-2">CSRF Protection</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• CSRF tokens for state-changing operations</li>
                      <li>• SameSite cookie attributes</li>
                      <li>• Origin header validation</li>
                      <li>• Double submit cookie pattern</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* API Security */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">API Security Measures</h4>
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <h5 className="font-medium text-gray-800 mb-2">Rate Limiting</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 100 requests per minute per IP</li>
                      <li>• 1000 requests per hour per user</li>
                      <li>• Sliding window algorithm</li>
                      <li>• Redis-based rate limiting</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <h5 className="font-medium text-gray-800 mb-2">Request Validation</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Schema validation with Zod</li>
                      <li>• Request size limits</li>
                      <li>• File upload restrictions</li>
                      <li>• Malicious payload detection</li>
                    </ul>
                  </div>

                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                    <h5 className="font-medium text-gray-800 mb-2">CORS Configuration</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Whitelist specific origins</li>
                      <li>• Credentials handling</li>
                      <li>• Preflight request handling</li>
                      <li>• Dynamic origin validation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Security */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Payment Security</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💳</span>
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-2">PCI DSS Compliance</h5>
                  <p className="text-sm text-gray-600">Secure payment processing standards</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-2">Stripe Integration</h5>
                  <p className="text-sm text-gray-600">Tokenized payment processing</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-2">Fraud Detection</h5>
                  <p className="text-sm text-gray-600">Real-time transaction monitoring</p>
                </div>
              </div>
            </div>

            {/* Security Standards & Compliance */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Security Standards & Compliance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-3">🔒</div>
                  <h5 className="font-semibold text-gray-800 mb-2">GDPR</h5>
                  <p className="text-sm text-gray-600">EU data protection regulation compliance</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h5 className="font-semibold text-gray-800 mb-2">OWASP Top 10</h5>
                  <p className="text-sm text-gray-600">Web application security risks</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-3">✅</div>
                  <h5 className="font-semibold text-gray-800 mb-2">ISO 27001</h5>
                  <p className="text-sm text-gray-600">Information security management</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-3">🔐</div>
                  <h5 className="font-semibold text-gray-800 mb-2">SOC 2</h5>
                  <p className="text-sm text-gray-600">Security and availability controls</p>
                </div>
              </div>
            </div>

            {/* Security Monitoring & Incident Response */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Security Monitoring & Incident Response</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Real-time Monitoring</h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <span className="text-sm text-gray-700">Automated threat detection</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <span className="text-sm text-gray-700">Security event logging</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <span className="text-sm text-gray-700">Performance monitoring</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <span className="text-sm text-gray-700">Automated incident response</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Incident Response Plan</h5>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Detection & Analysis</h6>
                      <p className="text-xs text-gray-600">Automated alerts and manual monitoring</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Containment</h6>
                      <p className="text-xs text-gray-600">Immediate threat isolation and mitigation</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Recovery</h6>
                      <p className="text-xs text-gray-600">System restoration and data recovery</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Post-Incident</h6>
                      <p className="text-xs text-gray-600">Analysis, documentation, and improvement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'conclusion':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Conclusion & Next Steps</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                The Architectural Design phase has been completed successfully for the {project.title} project. 
                This phase has established a comprehensive technical foundation that ensures scalability, 
                security, and maintainability of the system.
              </p>
              
              <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Architectural Design Summary</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>System architecture defined with 3-tier structure</li>
                  <li>Database schema designed with optimized relationships</li>
                  <li>RESTful API specifications completed</li>
                  <li>Security measures and protocols established</li>
                  <li>Technology stack and infrastructure planned</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Next Phase: Code Development</h4>
                <p className="text-gray-600 mb-4">
                  With the architectural design completed, the next phase will focus on implementing the actual code 
                  based on the technical specifications and design patterns established.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Frontend Development</h5>
                    <p className="text-sm text-gray-600">React.js components and user interface implementation</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Backend Development</h5>
                    <p className="text-sm text-gray-600">Node.js API server and business logic implementation</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Database Implementation</h5>
                    <p className="text-sm text-gray-600">PostgreSQL database setup and data models</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Testing & Quality Assurance</h5>
                    <p className="text-sm text-gray-600">Unit testing, integration testing, and code quality</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Ready to Proceed?</h4>
                <p className="text-gray-600 mb-4">
                  This Architectural Design phase is now complete. You can proceed to the next phase (Code Development) 
                  or review any section of this document as needed.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      unlockNextPhase(projectId, 'architectural');
                      navigate(`/realtime-projects/${projectId}/code-development`);
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Continue to Code Development
                  </button>
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Download Architecture Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      {/* Phase Navigation Bar - Top Level */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-1">
          <PhaseNavigationBar currentPhase="architectural" />
        </div>
      </div>
      
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-white/90 backdrop-blur-sm shadow-xl border-r border-gray-200 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={handleBackToProjects}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
            >
              <span>←</span>
              <span>Back to Projects</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Architectural Design Phase</h1>
            <p className="text-sm text-gray-600">{project.title}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="p-4">
            <nav className="space-y-2">
              {architecturalTabs.map((tab, index) => {
                const isUnlocked = isModuleUnlocked(projectId, 'architectural', tab.id);
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => isUnlocked && setSelectedTab(tab.id)}
                    disabled={!isUnlocked}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                      ${isUnlocked
                        ? selectedTab === tab.id
                          ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className="text-lg">
                      {isUnlocked ? tab.icon : '🔒'}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs text-gray-500">
                        {isUnlocked ? tab.description : 'Complete previous modules to unlock'}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </nav>
          </div>

          {/* Progress Indicator */}
          <div className="p-4 border-t border-gray-200 mt-auto">
            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Phase Progress</h4>
              <div className="space-y-2">
                {architecturalTabs.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedTab === tab.id ? 'bg-indigo-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-xs ${
                      selectedTab === tab.id ? 'text-indigo-600 font-medium' : 'text-gray-500'
                    }`}>
                      {tab.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8 relative">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
            
            {/* Next Button - positioned relative to module content */}
            <NextButton 
              currentPhase="architectural" 
              currentModule={selectedTab}
              onNext={() => {
                // Auto-advance to next module
                const architecturalTabs = [
                  { id: 'overview' },
                  { id: 'system-architecture' },
                  { id: 'database-design' },
                  { id: 'api-design' },
                  { id: 'security-architecture' },
                  { id: 'conclusion' }
                ];
                const currentIndex = architecturalTabs.findIndex(tab => tab.id === selectedTab);
                if (currentIndex < architecturalTabs.length - 1) {
                  setSelectedTab(architecturalTabs[currentIndex + 1].id);
                }
              }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArchitecturalDesignPhasePage;
