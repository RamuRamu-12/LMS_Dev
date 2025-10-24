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

const UIUXPhasePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isModuleUnlocked, unlockNextPhase } = useProjectProgress();

  // Fetch videos for this project
  const { data: videosData, isLoading: videosLoading, error: videosError } = useQuery(
    ['project-videos', projectId],
    () => projectService.getProjectVideos(projectId, { phase: 'UI/UX' }),
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

  const uiuxTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '🎨',
      description: 'Design phase overview and objectives'
    },
    {
      id: 'design-system',
      label: 'Design System',
      icon: '🎨',
      description: 'Color palette, typography, and components'
    },
    {
      id: 'customer-pages',
      label: 'Customer Pages',
      icon: '👥',
      description: 'Customer-facing pages and interfaces'
    },
    {
      id: 'admin-pages',
      label: 'Admin Pages',
      icon: '⚙️',
      description: 'Administrative interface and management'
    },
    {
      id: 'navigation-flow',
      label: 'Navigation Flow',
      icon: '🗺️',
      description: 'User journey maps and navigation patterns'
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
          <p className="text-gray-600">Loading UI/UX Phase...</p>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">UI/UX Design Overview</h3>
            
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
                          <span>Phase: {video.phase || 'UI/UX'}</span>
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
                        No UI/UX phase videos have been uploaded for this project yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                This phase focuses on creating intuitive and user-friendly designs for the {project.title}. 
                The UI/UX design phase transforms the business requirements into visual and interactive experiences 
                that users will love and find easy to use.
              </p>
              
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Phase Objectives</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Create user-centered design solutions</li>
                  <li>Develop wireframes and prototypes</li>
                  <li>Establish visual design system and branding</li>
                  <li>Conduct usability testing and validation</li>
                  <li>Ensure accessibility and responsive design</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Deliverables</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>User Journey Maps</li>
                  <li>Low-fidelity Wireframes</li>
                  <li>Interactive Prototypes</li>
                  <li>High-fidelity Visual Designs</li>
                  <li>Design System and Style Guide</li>
                  <li>Usability Testing Report</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'design-system':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Design System</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                A comprehensive design system ensures consistency and efficiency across all pages and components 
                of the E-commerce platform.
              </p>
              
              {project.title === 'E-Commerce Web Application' ? (
              <div className="space-y-8">
                {/* Color Palette */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🎨</span>
                    Simple Color Palette
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-600 rounded"></div>
                          <div>
                            <h5 className="font-semibold text-gray-800">Primary</h5>
                            <p className="text-sm text-gray-600">#3B82F6</p>
                      </div>
                      </div>
                        <p className="text-xs text-gray-500">Main brand color for buttons, links, and highlights</p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-green-600 rounded"></div>
                          <div>
                            <h5 className="font-semibold text-gray-800">Success</h5>
                            <p className="text-sm text-gray-600">#10B981</p>
                    </div>
                        </div>
                        <p className="text-xs text-gray-500">Success states, confirmations, and positive actions</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-red-600 rounded"></div>
                          <div>
                            <h5 className="font-semibold text-gray-800">Error</h5>
                            <p className="text-sm text-gray-600">#EF4444</p>
                      </div>
                      </div>
                        <p className="text-xs text-gray-500">Error states, warnings, and destructive actions</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gray-600 rounded"></div>
                          <div>
                            <h5 className="font-semibold text-gray-800">Text</h5>
                            <p className="text-sm text-gray-600">#374151</p>
                    </div>
                        </div>
                        <p className="text-xs text-gray-500">Primary text color for readability</p>
                  </div>
                </div>

                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-white border border-gray-300 rounded"></div>
                          <div>
                            <h5 className="font-semibold text-gray-800">Background</h5>
                            <p className="text-sm text-gray-600">#FFFFFF</p>
                    </div>
                    </div>
                        <p className="text-xs text-gray-500">Main background color for pages and cards</p>
                    </div>
                      
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gray-300 rounded"></div>
                          <div>
                            <h5 className="font-semibold text-gray-800">Border</h5>
                            <p className="text-sm text-gray-600">#E5E7EB</p>
                  </div>
                </div>
                        <p className="text-xs text-gray-500">Subtle borders and dividers</p>
              </div>
            </div>
          </div>
                </div>

                {/* Typography */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    Typography
                  </h4>
              
              <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3">Font Family</h5>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-lg font-medium text-gray-800 mb-2">Inter (Google Fonts)</p>
                        <p className="text-sm text-gray-600">Clean, modern, and highly readable font for web interfaces</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                          <h6 className="font-semibold text-gray-800 mb-2">Headers</h6>
                          <div className="space-y-2">
                            <div className="text-2xl font-bold text-gray-800">24px, Bold</div>
                            <p className="text-xs text-gray-500">Page titles and main headings</p>
                          </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                          <h6 className="font-semibold text-gray-800 mb-2">Body</h6>
                          <div className="space-y-2">
                            <div className="text-base text-gray-600">16px, Regular</div>
                            <p className="text-xs text-gray-500">Main content and descriptions</p>
                    </div>
                  </div>
                </div>

                      <div className="space-y-4">
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h6 className="font-semibold text-gray-800 mb-2">Small</h6>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500">14px, Regular</div>
                            <p className="text-xs text-gray-500">Captions, labels, and secondary text</p>
                      </div>
                    </div>
                        
                        <div className="bg-orange-50 rounded-lg p-4">
                          <h6 className="font-semibold text-gray-800 mb-2">Usage Guidelines</h6>
                          <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Maintain consistent line height (1.5)</li>
                            <li>• Use proper contrast ratios</li>
                            <li>• Limit to 2-3 font weights</li>
                          </ul>
                      </div>
                    </div>
                      </div>
                    </div>
                      </div>

                {/* Simple Components */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🧩</span>
                    Simple Components
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3">Buttons</h5>
                      <div className="space-y-3">
                        <div className="px-4 py-2 bg-blue-600 text-white text-sm rounded text-center">Primary Button</div>
                        <div className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded text-center">Secondary Button</div>
                        <p className="text-xs text-gray-500">40px height, rounded corners</p>
                    </div>
                  </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3">Cards</h5>
                      <div className="space-y-3">
                        <div className="bg-white border border-gray-200 rounded p-4">
                          <div className="w-full h-16 bg-gray-100 rounded mb-2"></div>
                          <div className="text-sm text-gray-600">Card Content</div>
                </div>
                        <p className="text-xs text-gray-500">White background, light border, 16px padding</p>
              </div>
            </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3">Inputs</h5>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Input field" 
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          disabled
                        />
                        <p className="text-xs text-gray-500">40px height, light border</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                // Generic content for other projects
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Design System</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Color Palette</h5>
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-blue-600 rounded"></div>
                          <div className="w-8 h-8 bg-green-600 rounded"></div>
                          <div className="w-8 h-8 bg-purple-600 rounded"></div>
                          <div className="w-8 h-8 bg-orange-600 rounded"></div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Typography</h5>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-gray-800">Headings</div>
                          <div className="text-base text-gray-600">Body text</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'customer-pages':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Customer Pages</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                Customer-facing pages designed for optimal user experience and conversion. These pages form the 
                core of the E-commerce platform's user interface.
              </p>
              
              {project.title === 'E-Commerce Web Application' ? (
              <div className="space-y-8">
                {/* Homepage Wireframe */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🏠</span>
                    Homepage
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 font-mono text-xs">
                        <div className="border-b border-gray-300 pb-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">[Logo] [Home] [Products] [About] [Contact] [Cart] [Login]</span>
                          </div>
                        </div>
                        
                        <div className="text-center py-8 mb-6">
                          <div className="text-lg font-bold mb-2">Welcome to Our Store</div>
                          <div className="text-sm mb-4">Shop Amazing Products</div>
                          <div className="bg-blue-600 text-white px-4 py-2 rounded text-xs inline-block">[Shop Now]</div>
                        </div>
                        
                        <div className="bg-gray-200 h-32 rounded mb-4 flex items-center justify-center">
                          <span className="text-gray-500">[Hero Image]</span>
                        </div>
                        
                        <div className="border-t border-gray-300 pt-4">
                          <div className="text-center font-bold mb-4">Featured Products</div>
                          <div className="grid grid-cols-4 gap-2">
                            {[1,2,3,4].map(i => (
                              <div key={i} className="border border-gray-300 rounded p-2 text-center">
                                <div className="bg-gray-200 h-16 rounded mb-1"></div>
                                <div className="text-xs">Product {i}</div>
                                <div className="text-xs font-bold">$99.99</div>
                                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs mt-1">[Add Cart]</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-300 pt-4 mt-4 text-center text-xs">
                          <div>[About] [Contact] [Privacy] [Terms]</div>
                          <div className="mt-2">© 2024 E-Commerce Platform. All rights reserved.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Page Wireframe */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🛍️</span>
                    Products Page
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 font-mono text-xs">
                        <div className="border-b border-gray-300 pb-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">[Logo] [Home] [Products] [About] [Contact] [Cart] [Login]</span>
                          </div>
                        </div>
                        
                        <div className="font-bold mb-4">Products</div>
                        
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="border border-gray-300 rounded p-2 text-center">
                              <div className="bg-gray-200 h-16 rounded mb-1"></div>
                              <div className="text-xs">Product {i}</div>
                              <div className="text-xs font-bold">$99.99</div>
                              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs mt-1">[Add Cart]</div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {[5,6,7,8].map(i => (
                            <div key={i} className="border border-gray-300 rounded p-2 text-center">
                              <div className="bg-gray-200 h-16 rounded mb-1"></div>
                              <div className="text-xs">Product {i}</div>
                              <div className="text-xs font-bold">$99.99</div>
                              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs mt-1">[Add Cart]</div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-center">
                          <span className="text-xs">[Previous] 1 2 3 [Next]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Detail Page Wireframe */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    Product Detail Page
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 font-mono text-xs">
                        <div className="border-b border-gray-300 pb-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">[Logo] [Home] [Products] [About] [Contact] [Cart] [Login]</span>
                          </div>
                        </div>
                        
                        <div className="text-xs mb-4">Home &gt; Products &gt; Product Name</div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-gray-300 rounded p-4">
                            <div className="bg-gray-200 h-32 rounded mb-2 flex items-center justify-center">
                              <span className="text-gray-500">Main Image</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="font-bold">Product Name</div>
                            <div className="font-bold text-lg">$99.99</div>
                            <div className="text-xs">
                              <div>Description:</div>
                              <div>This is a great product</div>
                            </div>
                            <div className="text-xs">
                              <div>Quantity: [1] [+][-]</div>
                            </div>
                            <div className="bg-blue-600 text-white px-4 py-2 rounded text-xs inline-block">[Add to Cart]</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cart Page Wireframe */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🛒</span>
                    Shopping Cart Page
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 font-mono text-xs">
                        <div className="border-b border-gray-300 pb-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">[Logo] [Home] [Products] [About] [Contact] [Cart(2)] [Login]</span>
                          </div>
                        </div>
                        
                        <div className="font-bold mb-4">Shopping Cart (2 items)</div>
                        
                        <div className="grid grid-cols-2 gap-4">
                      <div>
                            <div className="font-bold mb-2">Cart Items</div>
                        <div className="space-y-2">
                              <div className="border border-gray-300 rounded p-2 flex items-center gap-2">
                                <div className="bg-gray-200 w-12 h-12 rounded"></div>
                                <div className="flex-1">
                                  <div className="font-bold">Product 1</div>
                                  <div>$99.99</div>
                                  <div className="text-xs">Qty: [1] [+][-] [Remove]</div>
                          </div>
                          </div>
                              <div className="border border-gray-300 rounded p-2 flex items-center gap-2">
                                <div className="bg-gray-200 w-12 h-12 rounded"></div>
                                <div className="flex-1">
                                  <div className="font-bold">Product 2</div>
                                  <div>$149.99</div>
                                  <div className="text-xs">Qty: [1] [+][-] [Remove]</div>
                          </div>
                          </div>
                        </div>
                      </div>
                      <div>
                            <div className="font-bold mb-2">Order Summary</div>
                            <div className="border border-gray-300 rounded p-2 space-y-1">
                              <div className="text-xs">Subtotal: $249.98</div>
                              <div className="text-xs">Tax: $20.00</div>
                              <div className="text-xs border-t border-gray-300 pt-1">Total: $269.98</div>
                              <div className="bg-blue-600 text-white px-4 py-2 rounded text-xs mt-2 text-center">[Checkout]</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkout Page Wireframe */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">💳</span>
                    Checkout Page
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 font-mono text-xs">
                        <div className="border-b border-gray-300 pb-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">[Logo] [Home] [Products] [About] [Contact] [Cart] [Login]</span>
                          </div>
                        </div>
                        
                        <div className="font-bold mb-4">Checkout</div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-bold mb-2">Shipping Info</div>
                        <div className="space-y-2">
                              <div>
                                <div className="text-xs">Full Name</div>
                                <div className="border border-gray-300 rounded px-2 py-1">[___________________]</div>
                        </div>
                              <div>
                                <div className="text-xs">Email</div>
                                <div className="border border-gray-300 rounded px-2 py-1">[___________________]</div>
                      </div>
                              <div>
                                <div className="text-xs">Address</div>
                                <div className="border border-gray-300 rounded px-2 py-1">[___________________]</div>
                              </div>
                              <div>
                                <div className="text-xs">City</div>
                                <div className="border border-gray-300 rounded px-2 py-1">[___________________]</div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold mb-2">Order Summary</div>
                            <div className="border border-gray-300 rounded p-2 space-y-1">
                              <div className="text-xs">Product 1 - $99.99</div>
                              <div className="text-xs">Product 2 - $149.99</div>
                              <div className="text-xs border-t border-gray-300 pt-1">Subtotal: $249.98</div>
                              <div className="text-xs">Tax: $20.00</div>
                              <div className="text-xs border-t border-gray-300 pt-1">Total: $269.98</div>
                              <div className="bg-blue-600 text-white px-4 py-2 rounded text-xs mt-2 text-center">[Continue to Payment]</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Login Page Wireframe */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🔐</span>
                    Login Page
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 font-mono text-xs">
                        <div className="border-b border-gray-300 pb-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">[Logo]</span>
                            <span className="text-xs">[Back to Home]</span>
                    </div>
                    </div>
                        
                        <div className="text-center py-8">
                          <div className="font-bold text-lg mb-4">Login to Our Store</div>
                          
                          <div className="border border-gray-300 rounded p-4 max-w-sm mx-auto">
                            <div className="space-y-3">
                              <div>
                                <div className="text-xs mb-1">Email</div>
                                <div className="border border-gray-300 rounded px-2 py-1">[_____________________________]</div>
                    </div>
                              <div>
                                <div className="text-xs mb-1">Password</div>
                                <div className="border border-gray-300 rounded px-2 py-1">[_____________________________]</div>
                    </div>
                              <div className="bg-blue-600 text-white px-4 py-2 rounded text-center">[Login]</div>
                              <div className="text-center text-xs">Don't have an account? [Sign Up]</div>
                  </div>
                </div>
              </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                // Generic content for other projects
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Pages</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Homepage</h5>
                        <p className="text-sm text-gray-600">Main landing page with navigation and key content</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Product Pages</h5>
                        <p className="text-sm text-gray-600">Product listing and detail pages</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'admin-pages':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Admin Pages</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                Administrative interface designed for efficient management of products, orders, and system operations.
              </p>
              
              {project.title === 'E-Commerce Web Application' ? (
              <div className="space-y-8">
                {/* Admin Dashboard Wireframe */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Admin Dashboard
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 font-mono text-xs">
                        <div className="border-b border-gray-300 pb-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">[Admin Logo] [Dashboard] [Products] [Orders] [Logout]</span>
                          </div>
                    </div>
                    
                        <div className="font-bold mb-4">Dashboard</div>
                        
                        <div className="border border-gray-300 rounded p-4 mb-4">
                          <div className="font-bold mb-2">Key Metrics</div>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { title: 'Total Orders', value: '1,234' },
                              { title: "Today's Orders", value: '45' },
                              { title: 'Pending Orders', value: '23' },
                              { title: 'Revenue This Month', value: '$45,678' }
                            ].map((metric, i) => (
                              <div key={i} className="border border-gray-300 rounded p-2 text-center">
                                <div className="text-xs font-bold">{metric.title}</div>
                                <div className="text-sm font-bold">{metric.value}</div>
                    </div>
                            ))}
                  </div>
                </div>

                        <div className="border border-gray-300 rounded p-4">
                          <div className="font-bold mb-2">Recent Orders</div>
                          <div className="space-y-1">
                            <div className="border border-gray-300 rounded p-2">
                              <div className="text-xs">Order #12345 - John Doe - $99.99</div>
                              <div className="text-xs">Status: Pending - [Process] [View]</div>
                            </div>
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-xs">[View All Orders]</span>
                          </div>
                        </div>
                      </div>
                    </div>
                      </div>
                    </div>
                    
                {/* Admin Products Page Wireframe */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    Admin Products Page
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 font-mono text-xs">
                        <div className="border-b border-gray-300 pb-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">[Admin Logo] [Dashboard] [Products] [Orders] [Logout]</span>
                      </div>
                    </div>
                    
                        <div className="font-bold mb-4">Products</div>
                        <div className="mb-4">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs">[Add New Product]</span>
                      </div>
                        
                        <div className="border border-gray-300 rounded p-4">
                          <div className="font-bold mb-2">Product List</div>
                          <div className="space-y-2">
                            <div className="border border-gray-300 rounded p-2 flex items-center gap-2">
                              <div className="bg-gray-200 w-12 h-12 rounded"></div>
                              <div className="flex-1">
                                <div className="font-bold">Product 1 - $99.99</div>
                                <div className="text-xs">Stock: 15 units</div>
                              </div>
                              <div className="space-x-1">
                                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">[Edit]</span>
                                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">[Delete]</span>
                              </div>
                            </div>
                            <div className="border border-gray-300 rounded p-2 flex items-center gap-2">
                              <div className="bg-gray-200 w-12 h-12 rounded"></div>
                              <div className="flex-1">
                                <div className="font-bold">Product 2 - $149.99</div>
                                <div className="text-xs">Stock: 8 units</div>
                              </div>
                              <div className="space-x-1">
                                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">[Edit]</span>
                                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">[Delete]</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-xs">[Previous] 1 2 3 [Next]</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Orders Page Wireframe */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    Admin Orders Page
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 font-mono text-xs">
                        <div className="border-b border-gray-300 pb-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">[Admin Logo] [Dashboard] [Products] [Orders] [Logout]</span>
                    </div>
                    </div>
                        
                        <div className="font-bold mb-4">Orders</div>
                        
                        <div className="border border-gray-300 rounded p-4">
                          <div className="font-bold mb-2">Order List</div>
                          <div className="space-y-2">
                            <div className="border border-gray-300 rounded p-2">
                              <div className="text-xs font-bold">Order #12345 - John Doe</div>
                              <div className="text-xs">Date: Dec 20, 2024</div>
                              <div className="text-xs">Total: $99.99</div>
                              <div className="text-xs">Status: [Pending ▼] [Process] [View]</div>
                    </div>
                            <div className="border border-gray-300 rounded p-2">
                              <div className="text-xs font-bold">Order #12344 - Jane Smith</div>
                              <div className="text-xs">Date: Dec 19, 2024</div>
                              <div className="text-xs">Total: $149.99</div>
                              <div className="text-xs">Status: [Shipped ▼] [Track] [View]</div>
                  </div>
                </div>
                          <div className="text-center mt-2">
                            <span className="text-xs">[Previous] 1 2 3 [Next]</span>
              </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                // Generic content for other projects
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Admin Pages</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Dashboard</h5>
                        <p className="text-sm text-gray-600">Main admin dashboard with key metrics</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Management</h5>
                        <p className="text-sm text-gray-600">Content and data management interfaces</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'navigation-flow':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Navigation Flow</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                User journey maps and navigation patterns that guide users through the E-commerce platform.
              </p>
              
              {project.title === 'E-Commerce Web Application' ? (
              <div className="space-y-8">
                {/* Customer Flow */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    Customer Flow
                  </h4>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                        <div className="font-bold text-blue-800">Homepage</div>
                      </div>
                      <div className="text-gray-500">→</div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                        <div className="font-bold text-green-800">Products</div>
                      </div>
                      <div className="text-gray-500">→</div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
                        <div className="font-bold text-purple-800">Product Detail</div>
                      </div>
                      <div className="text-gray-500">→</div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-200">
                        <div className="font-bold text-orange-800">Add to Cart</div>
                      </div>
                      <div className="text-gray-500">→</div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-red-200">
                        <div className="font-bold text-red-800">Cart</div>
                      </div>
                      <div className="text-gray-500">→</div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-200">
                        <div className="font-bold text-indigo-800">Checkout</div>
                      </div>
                      <div className="text-gray-500">→</div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-200">
                        <div className="font-bold text-pink-800">Payment</div>
                      </div>
                      <div className="text-gray-500">→</div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-200">
                        <div className="font-bold text-emerald-800">Order Confirmed</div>
                      </div>
                    </div>
                    <div className="text-center mt-4 text-xs text-gray-600">
                      Login/Register (if needed) can be accessed at any point
                    </div>
                  </div>
                </div>

                {/* Admin Flow */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">⚙️</span>
                    Admin Flow
                  </h4>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                        <div className="font-bold text-gray-800">Admin Login</div>
                      </div>
                      <div className="text-gray-500">→</div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                        <div className="font-bold text-blue-800">Dashboard</div>
                      </div>
                      <div className="text-gray-500">→</div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                        <div className="font-bold text-green-800">Products Management</div>
                      </div>
                      <div className="text-gray-500">→</div>
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
                        <div className="font-bold text-purple-800">Orders Management</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                // Generic content for other projects
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Navigation Flow</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">User Journey</h5>
                        <p className="text-sm text-gray-600">Main user flow through the application</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Admin Flow</h5>
                        <p className="text-sm text-gray-600">Administrative user navigation patterns</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );



      case 'conclusion':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Conclusion & Next Steps</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                The UI/UX Design phase has been completed successfully for the {project.title} project. 
                This phase has established a solid foundation for creating an intuitive and user-friendly interface 
                that meets both business objectives and user needs.
              </p>
              
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">UI/UX Phase Summary</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Comprehensive wireframes created for all major user flows</li>
                  <li>Interactive prototypes developed and tested with users</li>
                  <li>High-fidelity visual designs completed with design system</li>
                  <li>Usability testing conducted and improvements implemented</li>
                  <li>Accessibility guidelines and responsive design ensured</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Next Phase: Architectural Design</h4>
                <p className="text-gray-600 mb-4">
                  With the UI/UX design completed, the next phase will focus on creating a robust and scalable 
                  technical architecture that supports the designed user interface and business requirements.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">System Architecture</h5>
                    <p className="text-sm text-gray-600">Define overall system structure and components</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Database Design</h5>
                    <p className="text-sm text-gray-600">Design data models and relationships</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">API Design</h5>
                    <p className="text-sm text-gray-600">Define RESTful APIs and endpoints</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Security Architecture</h5>
                    <p className="text-sm text-gray-600">Implement security measures and protocols</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Ready to Proceed?</h4>
                <p className="text-gray-600 mb-4">
                  This UI/UX Design phase is now complete. You can proceed to the next phase (Architectural Design) 
                  or review any section of this document as needed.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      unlockNextPhase(projectId, 'uiux');
                      navigate(`/realtime-projects/${projectId}/architectural`);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Continue to Architectural Design
                  </button>
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Download UI/UX Design Document
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
          <PhaseNavigationBar currentPhase="uiux" />
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
            <h1 className="text-xl font-bold text-gray-800 mb-2">UI/UX Design Phase</h1>
            <p className="text-sm text-gray-600">{project.title}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="p-4">
            <nav className="space-y-2">
              {uiuxTabs.map((tab, index) => {
                const isUnlocked = isModuleUnlocked(projectId, 'uiux', tab.id);
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
                          ? 'bg-purple-100 text-purple-700 shadow-sm'
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
                {uiuxTabs.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedTab === tab.id ? 'bg-purple-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-xs ${
                      selectedTab === tab.id ? 'text-purple-600 font-medium' : 'text-gray-500'
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
              currentPhase="uiux" 
              currentModule={selectedTab}
              onNext={() => {
                // Auto-advance to next module
                const uiuxTabs = [
                  { id: 'overview' },
                  { id: 'design-system' },
                  { id: 'customer-pages' },
                  { id: 'admin-pages' },
                  { id: 'navigation-flow' },
                  { id: 'conclusion' }
                ];
                const currentIndex = uiuxTabs.findIndex(tab => tab.id === selectedTab);
                if (currentIndex < uiuxTabs.length - 1) {
                  setSelectedTab(uiuxTabs[currentIndex + 1].id);
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

export default UIUXPhasePage;
