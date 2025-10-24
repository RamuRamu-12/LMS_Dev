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

const CodeDevelopmentPhasePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isModuleUnlocked, unlockNextPhase } = useProjectProgress();

  // Fetch videos for this project
  const { data: videosData, isLoading: videosLoading, error: videosError } = useQuery(
    ['project-videos', projectId],
    () => projectService.getProjectVideos(projectId, { phase: 'Development' }),
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
          },
          {
            id: 4,
            title: 'Phase 4 - Code Development',
            description: 'Implement the application code based on specifications',
            phaseNumber: 4,
            phaseType: 'CODE_DEVELOPMENT',
            estimatedDuration: 15,
            order: 4
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
          },
          {
            id: 9,
            title: 'Phase 4 - Code Development',
            description: 'Implement analytics dashboard and data processing',
            phaseNumber: 4,
            phaseType: 'CODE_DEVELOPMENT',
            estimatedDuration: 13,
            order: 4
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
          },
          {
            id: 14,
            title: 'Phase 4 - Code Development',
            description: 'Implement AI models and learning algorithms',
            phaseNumber: 4,
            phaseType: 'CODE_DEVELOPMENT',
            estimatedDuration: 16,
            order: 4
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

  const codeDevTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '💻',
      description: 'Code development phase overview and objectives'
    },
    {
      id: 'frontend-development',
      label: 'Frontend Development',
      icon: '🎨',
      description: 'React.js components and user interface'
    },
    {
      id: 'backend-development',
      label: 'Backend Development',
      icon: '⚙️',
      description: 'Node.js API server and business logic'
    },
    {
      id: 'database-implementation',
      label: 'Database Implementation',
      icon: '🗄️',
      description: 'PostgreSQL setup and data models'
    },
    {
      id: 'testing',
      label: 'Testing & QA',
      icon: '🧪',
      description: 'Unit testing and quality assurance'
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
          <p className="text-gray-600">Loading Code Development Phase...</p>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Code Development Overview</h3>
            
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
                          <span>Phase: {video.phase || 'Development'}</span>
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
                        No Development phase videos have been uploaded for this project yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                This phase focuses on implementing the actual code for the {project.title} based on the architectural 
                design and UI/UX specifications. This is where the technical blueprint becomes a working application.
              </p>
              
              <div className="bg-emerald-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Phase Objectives</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Implement frontend components and user interfaces</li>
                  <li>Develop backend API services and business logic</li>
                  <li>Set up database and implement data models</li>
                  <li>Integrate all system components</li>
                  <li>Ensure code quality and testing standards</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Deliverables</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Fully functional frontend application</li>
                  <li>Complete backend API server</li>
                  <li>Database with sample data</li>
                  <li>Unit and integration tests</li>
                  <li>Code documentation and comments</li>
                  <li>Deployment-ready application</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'frontend-development':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Frontend Development</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive frontend implementation using React.js, Next.js, and modern web technologies 
                to create an intuitive and responsive e-commerce user interface.
              </p>
            </div>

            {/* Frontend File Structure Diagram */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800">E-Commerce Frontend File Structure</h4>
                <p className="text-sm text-gray-600 mt-1">Complete project structure showing all components, pages, and utilities</p>
              </div>
              <div className="p-6">
                <div className="flex justify-center">
                  <img 
                    src="/ecommerce_frontend_structure.svg" 
                    alt="E-Commerce Frontend File Structure" 
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                    style={{ maxHeight: '600px' }}
                  />
                </div>
              </div>
            </div>

            {/* Project Structure Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Project Structure Overview</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Core Directories */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📁</span>
                    <h5 className="font-semibold text-gray-800">Core Directories</h5>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">src/</code> - Source code
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">public/</code> - Static assets
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">components/</code> - Reusable components
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">pages/</code> - Application pages
                    </li>
                  </ul>
                </div>

                {/* Configuration Files */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">⚙️</span>
                    <h5 className="font-semibold text-gray-800">Configuration</h5>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">package.json</code> - Dependencies
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">tailwind.config.js</code> - Styling
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">vite.config.js</code> - Build tool
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">.env</code> - Environment variables
                    </li>
                  </ul>
                </div>

                {/* Key Features */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🚀</span>
                    <h5 className="font-semibold text-gray-800">Key Features</h5>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Responsive Design
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Component-based Architecture
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      State Management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      API Integration
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Detailed Folder Structure */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Detailed Folder Structure & Descriptions</h4>
              <div className="space-y-6">
                {/* Pages Directory */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">📄</span>
                    <h5 className="font-semibold text-gray-800">Pages Directory (<code className="bg-white px-2 py-1 rounded text-sm">app/</code>)</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Contains all application pages and routing components using Next.js App Router</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Customer Pages</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <code>page.tsx</code> - Homepage with hero section</li>
                        <li>• <code>products/page.tsx</code> - Product catalog listing</li>
                        <li>• <code>products/[id]/page.tsx</code> - Individual product details</li>
                        <li>• <code>cart/page.tsx</code> - Shopping cart</li>
                        <li>• <code>checkout/page.tsx</code> - Checkout process</li>
                        <li>• <code>login/page.tsx</code> - User authentication</li>
                        <li>• <code>register/page.tsx</code> - User registration</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Admin Pages</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <code>admin/page.tsx</code> - Admin dashboard</li>
                        <li>• <code>admin/products/page.tsx</code> - Product management</li>
                        <li>• <code>admin/orders/page.tsx</code> - Order management</li>
                        <li>• <code>about/page.tsx</code> - About page</li>
                        <li>• <code>contact/page.tsx</code> - Contact page</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Components Directory */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">🧩</span>
                    <h5 className="font-semibold text-gray-800">Components Directory (<code className="bg-white px-2 py-1 rounded text-sm">components/</code>)</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Reusable UI components organized by functionality</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Layout Components</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <code>layout/header.tsx</code> - Navigation header</li>
                        <li>• <code>layout/footer.tsx</code> - Site footer</li>
                        <li>• <code>providers/session-provider.tsx</code> - Auth provider</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">UI Components</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <code>ui/button.tsx</code> - Reusable buttons</li>
                        <li>• <code>ui/card.tsx</code> - Product cards</li>
                        <li>• <code>ui/input.tsx</code> - Form inputs</li>
                        <li>• <code>ui/badge.tsx</code> - Status badges</li>
                        <li>• <code>ui/label.tsx</code> - Form labels</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">E-commerce Features</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Product listing components</li>
                        <li>• Shopping cart functionality</li>
                        <li>• Checkout process components</li>
                        <li>• Payment integration</li>
                        <li>• Order management</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* API Routes Directory */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">🔌</span>
                    <h5 className="font-semibold text-gray-800">API Routes Directory (<code className="bg-white px-2 py-1 rounded text-sm">app/api/</code>)</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Next.js API routes for backend functionality</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">E-commerce APIs</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <code>products/route.ts</code> - Product management</li>
                        <li>• <code>cart/route.ts</code> - Shopping cart API</li>
                        <li>• <code>orders/route.ts</code> - Order processing</li>
                        <li>• <code>auth/[...nextauth]/route.ts</code> - Authentication</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Admin APIs</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <code>admin/products/route.ts</code> - Admin product management</li>
                        <li>• <code>admin/orders/route.ts</code> - Admin order management</li>
                        <li>• <code>admin/dashboard/route.ts</code> - Admin analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Additional Directories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Lib Directory */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">📚</span>
                      <h5 className="font-semibold text-gray-800">Lib Directory (<code className="bg-white px-2 py-1 rounded text-sm">lib/</code>)</h5>
                  </div>
                    <p className="text-sm text-gray-600 mb-3">Utility functions and configurations</p>
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Core Utilities</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <code>auth.ts</code> - Authentication utilities</li>
                        <li>• <code>db.ts</code> - Database configuration</li>
                        <li>• <code>stripe.ts</code> - Payment processing</li>
                        <li>• <code>utils.ts</code> - Helper functions</li>
                      </ul>
                    </div>
                  </div>

                  {/* Store Directory */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">🛒</span>
                      <h5 className="font-semibold text-gray-800">Store Directory (<code className="bg-white px-2 py-1 rounded text-sm">store/</code>)</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">State management for E-commerce features</p>
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">State Management</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <code>cart-store.ts</code> - Shopping cart state</li>
                        <li>• User session management</li>
                        <li>• Product state management</li>
                        <li>• Order tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Prisma Directory */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">🗄️</span>
                    <h5 className="font-semibold text-gray-800">Prisma Directory (<code className="bg-white px-2 py-1 rounded text-sm">prisma/</code>)</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Database schema and migrations</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Database Schema</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <code>schema.prisma</code> - Database schema definition</li>
                        <li>• <code>seed.ts</code> - Database seeding script</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Features</h6>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Product and category models</li>
                        <li>• User and order management</li>
                        <li>• Cart and payment tracking</li>
                        <li>• Admin functionality</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technology Stack & Implementation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Technology Stack */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Technology Stack</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">⚛️</span>
                      <h5 className="font-medium text-gray-800">Next.js 14+</h5>
                    </div>
                    <p className="text-sm text-gray-600">Full-stack React framework with App Router, Server Components, and API routes</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🎨</span>
                      <h5 className="font-medium text-gray-800">Tailwind CSS</h5>
                    </div>
                    <p className="text-sm text-gray-600">Utility-first CSS framework for rapid UI development</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🔄</span>
                      <h5 className="font-medium text-gray-800">App Router</h5>
                    </div>
                    <p className="text-sm text-gray-600">File-based routing with Server and Client Components</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📊</span>
                      <h5 className="font-medium text-gray-800">Prisma ORM</h5>
                    </div>
                    <p className="text-sm text-gray-600">Type-safe database access and query builder</p>
                  </div>
                </div>
              </div>

              {/* Implementation Features */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Implementation Features</h4>
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Responsive Design</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Mobile-first approach</li>
                      <li>• Breakpoint-based layouts</li>
                      <li>• Touch-friendly interactions</li>
                      <li>• Cross-device compatibility</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Performance Optimization</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Code splitting with React.lazy()</li>
                      <li>• Image optimization and lazy loading</li>
                      <li>• Bundle size optimization</li>
                      <li>• Memoization for expensive operations</li>
                    </ul>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">E-commerce Features</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Shopping cart functionality</li>
                      <li>• Payment processing with Stripe</li>
                      <li>• Order management system</li>
                      <li>• Product search and filtering</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Development Workflow */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Development Workflow & Best Practices</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm font-medium text-gray-800">Component Design</div>
                  <div className="text-xs text-gray-600">Reusable, composable components</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="text-sm font-medium text-gray-800">State Management</div>
                  <div className="text-xs text-gray-600">Context API and local state</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-sm font-medium text-gray-800">API Integration</div>
                  <div className="text-xs text-gray-600">Next.js API routes and Prisma</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="text-sm font-medium text-gray-800">Testing</div>
                  <div className="text-xs text-gray-600">Unit and integration tests</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'backend-development':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Backend Development</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive backend implementation using Next.js API routes, Prisma ORM, and modern web technologies 
                to create a robust and scalable e-commerce server infrastructure.
              </p>
            </div>

            {/* Backend File Structure Diagram */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800">E-Commerce Backend Project Structure</h4>
                <p className="text-sm text-gray-600 mt-1">Complete backend structure showing API routes, utilities, and database configuration</p>
                        </div>
              <div className="p-6">
                <div className="flex justify-center">
                  <img 
                    src="/ecommerce_backend_structure.svg" 
                    alt="E-Commerce Backend Project Structure" 
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                    style={{ maxHeight: '600px' }}
                  />
                        </div>
                        </div>
                      </div>

            {/* API Routes Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">API Routes Implementation</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Authentication APIs */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🔐</span>
                    <h5 className="font-semibold text-gray-800">Authentication APIs</h5>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/auth/[...nextauth]</code> - NextAuth configuration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/auth/register</code> - User registration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/auth/login</code> - User authentication
                    </li>
                  </ul>
                    </div>

                {/* Product APIs */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📦</span>
                    <h5 className="font-semibold text-gray-800">Product APIs</h5>
                        </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/products</code> - Product CRUD operations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/products/[id]</code> - Individual product management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/admin/products</code> - Admin product management
                    </li>
                  </ul>
                        </div>

                {/* Cart & Order APIs */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🛒</span>
                    <h5 className="font-semibold text-gray-800">Cart & Order APIs</h5>
                        </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/cart</code> - Shopping cart management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/orders</code> - Order processing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/admin/orders</code> - Admin order management
                    </li>
                  </ul>
                      </div>

                {/* Admin APIs */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">👑</span>
                    <h5 className="font-semibold text-gray-800">Admin APIs</h5>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/admin/dashboard</code> - Admin analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/admin/products</code> - Product management
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <code className="bg-white px-2 py-1 rounded text-xs">/api/admin/orders</code> - Order management
                    </li>
                  </ul>
                    </div>
                  </div>
                </div>

            {/* Backend Architecture */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Backend Architecture & Implementation</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Core Libraries */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Core Libraries & Utilities</h5>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🔐</span>
                      <h6 className="font-medium text-gray-800">Authentication (lib/auth.ts)</h6>
                    </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                      <li>• NextAuth configuration</li>
                      <li>• JWT token management</li>
                      <li>• Session handling</li>
                      <li>• Role-based access control</li>
                        </ul>
                      </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🗄️</span>
                      <h6 className="font-medium text-gray-800">Database (lib/db.ts)</h6>
                    </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Prisma client configuration</li>
                      <li>• Connection pooling</li>
                      <li>• Database utilities</li>
                      <li>• Error handling</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">💳</span>
                      <h6 className="font-medium text-gray-800">Payment (lib/stripe.ts)</h6>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Stripe integration</li>
                          <li>• Payment processing</li>
                      <li>• Webhook handling</li>
                      <li>• Error management</li>
                        </ul>
                      </div>
                    </div>

                {/* Database & State Management */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Database & State Management</h5>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">📊</span>
                      <h6 className="font-medium text-gray-800">Prisma Schema (prisma/schema.prisma)</h6>
                    </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                      <li>• User and authentication models</li>
                      <li>• Product and category schemas</li>
                      <li>• Order and cart relationships</li>
                      <li>• Admin and analytics models</li>
                        </ul>
                      </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🛒</span>
                      <h6 className="font-medium text-gray-800">State Management (store/cart-store.ts)</h6>
                    </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Shopping cart state</li>
                      <li>• User session management</li>
                      <li>• Product state tracking</li>
                      <li>• Order processing state</li>
                        </ul>
                      </div>
                  <div className="bg-rose-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🧪</span>
                      <h6 className="font-medium text-gray-800">Testing (__tests__/)</h6>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• API endpoint testing</li>
                      <li>• Database integration tests</li>
                      <li>• Authentication testing</li>
                      <li>• Payment processing tests</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Technology Stack */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Backend Technology Stack</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-sm font-medium text-gray-800">Next.js API</div>
                  <div className="text-xs text-gray-600">API Routes</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🗄️</div>
                  <div className="text-sm font-medium text-gray-800">Prisma</div>
                  <div className="text-xs text-gray-600">Database ORM</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔐</div>
                  <div className="text-sm font-medium text-gray-800">NextAuth</div>
                  <div className="text-xs text-gray-600">Authentication</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="text-sm font-medium text-gray-800">Stripe</div>
                  <div className="text-xs text-gray-600">Payment Processing</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'database-implementation':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Database Implementation</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive database implementation using PostgreSQL and Prisma ORM to create a robust, 
                scalable data layer for the e-commerce application with optimized relationships and performance.
              </p>
            </div>

            {/* Database Schema Diagram */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800">E-Commerce Database Schema</h4>
                <p className="text-sm text-gray-600 mt-1">Complete database structure showing all tables, relationships, and constraints</p>
              </div>
              <div className="p-6">
                <div className="flex justify-center">
                  <img 
                    src="/ecommerce_database_structure.svg" 
                    alt="E-Commerce Database Schema" 
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                    style={{ maxHeight: '600px' }}
                  />
                </div>
              </div>
            </div>

            {/* Database Tables Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Database Tables & Relationships</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Core Tables */}
                  <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Core Tables</h5>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">👤</span>
                      <h6 className="font-semibold text-gray-800">Users Table</h6>
                      </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <code>id</code> - Primary key (CUID)</li>
                      <li>• <code>email</code> - Unique email address</li>
                      <li>• <code>name</code> - User display name</li>
                      <li>• <code>password</code> - Hashed password</li>
                      <li>• <code>createdAt, updatedAt</code> - Timestamps</li>
                    </ul>
                    </div>
                    
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">📦</span>
                      <h6 className="font-semibold text-gray-800">Products Table</h6>
                      </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <code>id</code> - Primary key (CUID)</li>
                      <li>• <code>name</code> - Product name (unique)</li>
                      <li>• <code>description</code> - Product details</li>
                      <li>• <code>price</code> - Decimal price value</li>
                      <li>• <code>stock</code> - Inventory count</li>
                      <li>• <code>isActive</code> - Product status</li>
                    </ul>
                    </div>
                  </div>

                {/* Transaction Tables */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Transaction Tables</h5>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">📋</span>
                      <h6 className="font-semibold text-gray-800">Orders Table</h6>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <code>id</code> - Primary key (CUID)</li>
                      <li>• <code>orderNumber</code> - Unique order identifier</li>
                      <li>• <code>userId</code> - Foreign key to users</li>
                      <li>• <code>total</code> - Order total amount</li>
                      <li>• <code>status</code> - Order status enum</li>
                      <li>• <code>shippingAddress</code> - JSON address data</li>
                    </ul>
                </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🛒</span>
                      <h6 className="font-semibold text-gray-800">Cart Items Table</h6>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <code>id</code> - Primary key (CUID)</li>
                      <li>• <code>userId</code> - Foreign key to users</li>
                      <li>• <code>productId</code> - Foreign key to products</li>
                      <li>• <code>quantity</code> - Item quantity</li>
                      <li>• <code>UNIQUE(userId, productId)</code> - Composite unique</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Relationships */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Database Relationships & Constraints</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <span className="text-sm text-gray-700">Products → Order Items (One-to-Many)</span>
                        </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <span className="text-sm text-gray-700">Users → Cart Items (One-to-Many)</span>
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
                        <p className="text-xs text-gray-600">CUID-based unique identifiers for all tables</p>
                        </div>
                      </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Foreign Keys</span>
                        <p className="text-xs text-gray-600">Cascade delete for data integrity</p>
                        </div>
                      </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Unique Constraints</span>
                        <p className="text-xs text-gray-600">Email addresses and product names must be unique</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Enum Types</span>
                        <p className="text-xs text-gray-600">OrderStatus enum for order state management</p>
                      </div>
                    </div>
                  </div>
                    </div>
                  </div>
                </div>

            {/* Prisma Configuration */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Prisma ORM Configuration</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Schema Configuration</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="font-medium text-gray-800 mb-2">Database Provider</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                      <li>• PostgreSQL as primary database</li>
                      <li>• Environment variable configuration</li>
                      <li>• Connection string management</li>
                      <li>• Prisma client generation</li>
                      </ul>
                    </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="font-medium text-gray-800 mb-2">Data Types</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                      <li>• String fields with CUID generation</li>
                      <li>• Decimal for precise price calculations</li>
                      <li>• JSON for flexible address storage</li>
                      <li>• DateTime for audit trails</li>
                      </ul>
                    </div>
                  </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Migration & Seeding</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="font-medium text-gray-800 mb-2">Database Migrations</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Schema version control</li>
                      <li>• Automatic migration generation</li>
                      <li>• Rollback capabilities</li>
                      <li>• Production deployment support</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="font-medium text-gray-800 mb-2">Data Seeding</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Sample product data</li>
                      <li>• Test user accounts</li>
                      <li>• Category initialization</li>
                      <li>• Development environment setup</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance & Optimization */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Database Performance & Optimization</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-sm font-medium text-gray-800">Query Optimization</div>
                  <div className="text-xs text-gray-600">Efficient data retrieval</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔗</div>
                  <div className="text-sm font-medium text-gray-800">Relationships</div>
                  <div className="text-xs text-gray-600">Optimized joins</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🛡️</div>
                  <div className="text-sm font-medium text-gray-800">Data Integrity</div>
                  <div className="text-xs text-gray-600">Referential integrity</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'testing':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Testing & Quality Assurance</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive testing strategy for the e-commerce application covering unit tests, 
                integration tests, and end-to-end testing to ensure reliability, performance, and user satisfaction.
              </p>
            </div>

            {/* Testing Architecture Diagram */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800">E-Commerce Testing Architecture</h4>
                <p className="text-sm text-gray-600 mt-1">Complete testing structure showing unit, integration, and E2E test organization</p>
              </div>
              <div className="p-6">
                <div className="flex justify-center">
                  <img 
                    src="/ecommerce_testing_structure.svg" 
                    alt="E-Commerce Testing Architecture" 
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                    style={{ maxHeight: '600px' }}
                  />
                </div>
              </div>
            </div>

            {/* Testing Framework Setup */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Testing Framework Configuration</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Jest Configuration */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Jest & React Testing Library</h5>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🧪</span>
                      <h6 className="font-semibold text-gray-800">Unit Testing Setup</h6>
                    </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Jest configuration with Next.js integration</li>
                      <li>• React Testing Library for component testing</li>
                      <li>• JSDOM environment for DOM testing</li>
                      <li>• Path mapping for clean imports (@/)</li>
                      <li>• Setup files for global test configuration</li>
                        </ul>
                      </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="font-medium text-gray-800 mb-2">Test Configuration Files</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <code>jest.config.js</code> - Jest configuration</li>
                      <li>• <code>jest.setup.js</code> - Test setup and mocks</li>
                      <li>• <code>tsconfig.json</code> - TypeScript configuration</li>
                      <li>• <code>package.json</code> - Test scripts and dependencies</li>
                        </ul>
                      </div>
                    </div>

                {/* E2E Testing */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">End-to-End Testing</h5>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🎭</span>
                      <h6 className="font-semibold text-gray-800">Cypress & Playwright</h6>
                    </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Cypress for user journey testing</li>
                      <li>• Playwright for cross-browser testing</li>
                      <li>• Visual regression testing</li>
                      <li>• Mobile responsive testing</li>
                      <li>• Payment flow validation</li>
                        </ul>
                      </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="font-medium text-gray-800 mb-2">E2E Test Categories</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                      <li>• User registration and authentication</li>
                      <li>• Product browsing and search</li>
                      <li>• Shopping cart functionality</li>
                      <li>• Checkout and payment process</li>
                      <li>• Admin panel operations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

            {/* E-commerce Specific Testing */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">E-Commerce Testing Scenarios</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Experience Testing */}
                  <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">User Experience</h5>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🛒</span>
                      <h6 className="font-semibold text-gray-800">Shopping Cart</h6>
                    </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Add/remove products</li>
                      <li>• Quantity updates</li>
                      <li>• Price calculations</li>
                      <li>• Cart persistence</li>
                      <li>• Empty cart handling</li>
                        </ul>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">💳</span>
                      <h6 className="font-semibold text-gray-800">Payment Flow</h6>
                    </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Stripe integration testing</li>
                      <li>• Payment method validation</li>
                      <li>• Order confirmation</li>
                      <li>• Error handling</li>
                      <li>• Receipt generation</li>
                        </ul>
                      </div>
                    </div>
                    
                {/* Product Management Testing */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Product Management</h5>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">📦</span>
                      <h6 className="font-semibold text-gray-800">Product Catalog</h6>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Product listing and pagination</li>
                      <li>• Search and filtering</li>
                      <li>• Product detail views</li>
                      <li>• Image loading and optimization</li>
                      <li>• Stock availability checks</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🔍</span>
                      <h6 className="font-semibold text-gray-800">Search & Filter</h6>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Text search functionality</li>
                      <li>• Category filtering</li>
                      <li>• Price range filtering</li>
                      <li>• Sort options</li>
                      <li>• Search result accuracy</li>
                    </ul>
                  </div>
                </div>

                {/* Admin & Security Testing */}
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Admin & Security</h5>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🔐</span>
                      <h6 className="font-semibold text-gray-800">Authentication</h6>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• User login/logout</li>
                      <li>• Session management</li>
                      <li>• Password validation</li>
                      <li>• Role-based access</li>
                      <li>• JWT token handling</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">⚙️</span>
                      <h6 className="font-semibold text-gray-800">Admin Panel</h6>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Product CRUD operations</li>
                      <li>• Order management</li>
                      <li>• User management</li>
                      <li>• Dashboard analytics</li>
                      <li>• System configuration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Coverage & Quality Metrics */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Test Coverage & Quality Metrics</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Coverage Areas</h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">85%</div>
                        <div>
                        <span className="text-sm font-medium text-gray-800">Component Coverage</span>
                        <p className="text-xs text-gray-600">UI components and interactions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">90%</div>
                        <div>
                        <span className="text-sm font-medium text-gray-800">API Coverage</span>
                        <p className="text-xs text-gray-600">Backend endpoints and services</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">75%</div>
                        <div>
                        <span className="text-sm font-medium text-gray-800">E2E Coverage</span>
                        <p className="text-xs text-gray-600">User journey scenarios</p>
                        </div>
                      </div>
                    </div>
                  </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Quality Metrics</h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Test Execution Time</span>
                        <p className="text-xs text-gray-600">Unit tests: &lt;5s, E2E tests: &lt;10min</p>
                </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <div>
                        <span className="text-sm font-medium text-gray-800">Bug Detection Rate</span>
                        <p className="text-xs text-gray-600">95% of critical issues caught in testing</p>
                    </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <div>
                        <span className="text-sm font-medium text-gray-800">Performance Benchmarks</span>
                        <p className="text-xs text-gray-600">Page load &lt;2s, API response &lt;500ms</p>
                    </div>
                  </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Accessibility Score</span>
                        <p className="text-xs text-gray-600">WCAG 2.1 AA compliance &gt;90%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testing Tools & Automation */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Testing Tools & Automation</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🧪</div>
                  <div className="text-sm font-medium text-gray-800">Jest</div>
                  <div className="text-xs text-gray-600">Unit & Integration</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🎭</div>
                  <div className="text-sm font-medium text-gray-800">Cypress</div>
                  <div className="text-xs text-gray-600">E2E Testing</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🎪</div>
                  <div className="text-sm font-medium text-gray-800">Playwright</div>
                  <div className="text-xs text-gray-600">Cross-browser</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium text-gray-800">Coverage</div>
                  <div className="text-xs text-gray-600">Reporting</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'conclusion':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">E-Commerce Development Complete</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The Code Development phase has been successfully completed for the E-Commerce application. 
                We have built a fully functional online shopping platform with modern technologies and 
                comprehensive e-commerce features.
              </p>
            </div>

            {/* E-Commerce Development Summary */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Development Summary</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🎨</span>
                      Frontend Development
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Next.js 14+ with App Router architecture</li>
                      <li>• React components with TypeScript</li>
                      <li>• Tailwind CSS for responsive design</li>
                      <li>• Shopping cart with Zustand state management</li>
                      <li>• Product catalog and search functionality</li>
                      <li>• Checkout and payment integration</li>
                </ul>
              </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">⚙️</span>
                      Backend Development
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Next.js API routes for serverless functions</li>
                      <li>• Prisma ORM for database operations</li>
                      <li>• NextAuth for authentication</li>
                      <li>• Stripe integration for payments</li>
                      <li>• RESTful API design</li>
                      <li>• Admin panel functionality</li>
                    </ul>
                  </div>
                  </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🗄️</span>
                      Database Implementation
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• PostgreSQL database with Prisma schema</li>
                      <li>• User authentication and management</li>
                      <li>• Product catalog and inventory</li>
                      <li>• Order processing and tracking</li>
                      <li>• Shopping cart persistence</li>
                      <li>• Data relationships and constraints</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🧪</span>
                      Testing & Quality
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Jest and React Testing Library</li>
                      <li>• Cypress for E2E testing</li>
                      <li>• Component and API testing</li>
                      <li>• Payment flow validation</li>
                      <li>• Cross-browser compatibility</li>
                      <li>• Performance optimization</li>
                    </ul>
                  </div>
                  </div>
                </div>
              </div>

            {/* E-Commerce Features Delivered */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Features Delivered</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-3xl mb-3">🛒</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Shopping Experience</h5>
                  <p className="text-sm text-gray-600">Product browsing, search, filtering, and cart management</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-3xl mb-3">💳</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Payment Processing</h5>
                  <p className="text-sm text-gray-600">Secure checkout with Stripe integration and order management</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-3xl mb-3">👤</div>
                  <h5 className="font-semibold text-gray-800 mb-2">User Management</h5>
                  <p className="text-sm text-gray-600">Authentication, profiles, and personalized experience</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <div className="text-3xl mb-3">📦</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Product Management</h5>
                  <p className="text-sm text-gray-600">Admin panel for inventory and order management</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                  <div className="text-3xl mb-3">🔐</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Security</h5>
                  <p className="text-sm text-gray-600">Secure authentication and data protection</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
                  <div className="text-3xl mb-3">📱</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Responsive Design</h5>
                  <p className="text-sm text-gray-600">Mobile-first design for all devices</p>
                </div>
              </div>
            </div>

            {/* Technology Stack */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Technology Stack Implemented</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">⚛️</div>
                  <div className="text-sm font-medium text-gray-800">Next.js 14+</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔷</div>
                  <div className="text-sm font-medium text-gray-800">TypeScript</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="text-sm font-medium text-gray-800">Tailwind CSS</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🗄️</div>
                  <div className="text-sm font-medium text-gray-800">PostgreSQL</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="text-sm font-medium text-gray-800">Prisma ORM</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔐</div>
                  <div className="text-sm font-medium text-gray-800">NextAuth</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="text-sm font-medium text-gray-800">Stripe</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🧪</div>
                  <div className="text-sm font-medium text-gray-800">Jest & Cypress</div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Ready for Production?</h4>
              <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
                The E-Commerce application is now fully developed and ready for deployment. 
                All core features have been implemented, tested, and optimized for performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => {
                      unlockNextPhase(projectId, 'code-development');
                      navigate(`/realtime-projects/${projectId}/testing`);
                    }}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Continue to Testing Phase
                  </button>
                <button className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  Download Documentation
                  </button>
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
          <PhaseNavigationBar currentPhase="code-development" />
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
            <h1 className="text-xl font-bold text-gray-800 mb-2">Code Development Phase</h1>
            <p className="text-sm text-gray-600">{project.title}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="p-4">
            <nav className="space-y-2">
              {codeDevTabs.map((tab, index) => {
                const isUnlocked = isModuleUnlocked(projectId, 'code-development', tab.id);
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
                          ? 'bg-emerald-100 text-emerald-700 shadow-sm'
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
                {codeDevTabs.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedTab === tab.id ? 'bg-emerald-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-xs ${
                      selectedTab === tab.id ? 'text-emerald-600 font-medium' : 'text-gray-500'
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
              currentPhase="code-development" 
              currentModule={selectedTab}
              onNext={() => {
                // Auto-advance to next module
                const codeDevTabs = [
                  { id: 'overview' },
                  { id: 'frontend-development' },
                  { id: 'backend-development' },
                  { id: 'database-implementation' },
                  { id: 'testing' },
                  { id: 'conclusion' }
                ];
                const currentIndex = codeDevTabs.findIndex(tab => tab.id === selectedTab);
                if (currentIndex < codeDevTabs.length - 1) {
                  setSelectedTab(codeDevTabs[currentIndex + 1].id);
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

export default CodeDevelopmentPhasePage;
