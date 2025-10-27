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

const BRDPhasePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isModuleUnlocked, unlockNextPhase } = useProjectProgress();

  // Fetch videos for this project
  const { data: videosData, isLoading: videosLoading, error: videosError } = useQuery(
    ['project-videos', projectId],
    () => projectService.getProjectVideos(projectId, { phase: 'BRD' }),
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

  const brdTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📋',
      description: 'Project overview and objectives'
    },
    {
      id: 'functional-requirements',
      label: 'Functional Requirements',
      icon: '⚙️',
      description: 'Core functionality specifications'
    },
    {
      id: 'non-functional-requirements',
      label: 'Non-Functional Requirements',
      icon: '🎯',
      description: 'Performance and quality requirements'
    },
    {
      id: 'user-stories',
      label: 'User Stories',
      icon: '👥',
      description: 'User scenarios and use cases'
    },
    {
      id: 'conclusion',
      label: 'Conclusion',
      icon: '✅',
      description: 'Summary and next steps'
    }
  ];

  const handleBackToProjects = () => {
    navigate('/student/realtime-projects');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BRD Phase...</p>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Project Overview</h3>
            
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
                          <span>Phase: {video.phase || 'BRD'}</span>
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
                        No BRD phase videos have been uploaded for this project yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                This phase focuses on creating a comprehensive Business Requirements Document (BRD) for the {project.title}. 
                The BRD serves as the foundation for all subsequent development phases and ensures that all stakeholders 
                have a clear understanding of the project's objectives, scope, and requirements.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Phase Objectives</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Define clear project scope and boundaries</li>
                  <li>Identify key stakeholders and their requirements</li>
                  <li>Document functional and non-functional requirements</li>
                  <li>Create user stories and use cases</li>
                  <li>Establish success criteria and metrics</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Deliverables</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Business Requirements Document</li>
                  <li>Stakeholder Analysis</li>
                  <li>Functional Requirements Specification</li>
                  <li>Non-Functional Requirements Specification</li>
                  <li>User Stories and Acceptance Criteria</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'functional-requirements':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Functional Requirements</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                Functional requirements define what the system must do to meet the business objectives. 
                These requirements describe the system's behavior and functionality from the user's perspective.
              </p>
              
              {project.title === 'E-Commerce Web Application' ? (
              <div className="space-y-8">
                {/* Epic 1: Product Discovery & Selection */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🛍️</span>
                    Product Discovery & Selection
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Product Browsing (US-001)</h5>
                      <p className="text-gray-600 text-sm mb-3">Browse products with filtering options to find products that match preferences and budget</p>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• View products in responsive grid layout</li>
                          <li>• Filter by category, price range, and attributes</li>
                          <li>• Search using keywords with real-time suggestions</li>
                          <li>• Sort by price, popularity, and rating</li>
                          <li>• Navigate through paginated results</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Product Information (US-002)</h5>
                      <p className="text-gray-600 text-sm mb-3">View detailed product information to make informed purchase decisions</p>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-green-700 space-y-1">
                          <li>• High-quality images with zoom functionality</li>
                          <li>• Detailed specifications and descriptions</li>
                          <li>• Stock availability and pricing information</li>
                          <li>• Customer reviews and ratings</li>
                          <li>• Related product recommendations</li>
                          <li>• Shipping information and delivery times</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Smart Search (US-003)</h5>
                      <p className="text-gray-600 text-sm mb-3">Search for products with intelligent suggestions for quick discovery</p>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-purple-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-purple-700 space-y-1">
                          <li>• Real-time search suggestions</li>
                          <li>• Results ranked by relevance</li>
                          <li>• Filter and sort search results</li>
                          <li>• Handle "no results found" gracefully</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Epic 2: Shopping Cart & Checkout */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🛒</span>
                    Shopping Cart & Checkout
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Shopping Cart Management (US-004)</h5>
                      <p className="text-gray-600 text-sm mb-3">Manage items in shopping cart to review and modify purchases before checkout</p>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-orange-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-orange-700 space-y-1">
                          <li>• Add products with quantity selection</li>
                          <li>• View all items with images and details</li>
                          <li>• Modify quantities and remove items</li>
                          <li>• See total price including taxes and shipping</li>
                          <li>• Persistent cart across browser sessions</li>
                          <li>• Cart badge with item count in header</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-red-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Secure Checkout (US-005)</h5>
                      <p className="text-gray-600 text-sm mb-3">Complete purchases securely with confidence</p>
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-red-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-red-700 space-y-1">
                          <li>• Enter shipping address and contact information</li>
                          <li>• Select shipping method and delivery option</li>
                          <li>• Review order summary with itemized costs</li>
                          <li>• Select secure payment method</li>
                          <li>• Complete payment process safely</li>
                          <li>• Receive order confirmation</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Order Confirmation (US-006)</h5>
                      <p className="text-gray-600 text-sm mb-3">Receive clear order confirmation and tracking information</p>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-indigo-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-indigo-700 space-y-1">
                          <li>• Order confirmation number and details</li>
                          <li>• Shipping information and estimated delivery</li>
                          <li>• Email confirmation with order details</li>
                          <li>• Access to order tracking information</li>
                          <li>• Shopping cart cleared after successful order</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Epic 3: Customer Account Management */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Customer Account Management
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-teal-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">User Authentication (US-007)</h5>
                      <p className="text-gray-600 text-sm mb-3">Create and manage account for personalized features and order tracking</p>
                      <div className="bg-teal-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-teal-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-teal-700 space-y-1">
                          <li>• Create account with email and password</li>
                          <li>• Secure sign-in to account</li>
                          <li>• Password reset functionality</li>
                          <li>• Update account information</li>
                          <li>• Secure sign-out from any device</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-cyan-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Order History & Tracking (US-008)</h5>
                      <p className="text-gray-600 text-sm mb-3">View order history and track orders for purchase monitoring</p>
                      <div className="bg-cyan-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-cyan-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-cyan-700 space-y-1">
                          <li>• View complete order history</li>
                          <li>• See status of each order</li>
                          <li>• Track shipping and delivery information</li>
                          <li>• Reorder previous purchases</li>
                          <li>• Download order receipts and invoices</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-emerald-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Profile Management (US-009)</h5>
                      <p className="text-gray-600 text-sm mb-3">Manage profile and preferences for customized shopping experience</p>
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-emerald-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-emerald-700 space-y-1">
                          <li>• Update personal information</li>
                          <li>• Manage multiple shipping addresses</li>
                          <li>• Set account preferences and notifications</li>
                          <li>• View and update payment methods</li>
                          <li>• Manage communication preferences</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Epic 4: Business Analytics & Management */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Business Analytics & Management
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-amber-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Sales Analytics (US-010)</h5>
                      <p className="text-gray-600 text-sm mb-3">View sales analytics and performance metrics for informed business decisions</p>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-amber-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-amber-700 space-y-1">
                          <li>• View key performance indicators and metrics</li>
                          <li>• See sales trends and analytics charts</li>
                          <li>• Analyze customer behavior and preferences</li>
                          <li>• View order distribution and patterns</li>
                          <li>• Export data for further analysis</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-rose-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">Order Management (US-011)</h5>
                      <p className="text-gray-600 text-sm mb-3">Manage customer orders efficiently for processing and customer satisfaction</p>
                      <div className="bg-rose-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-rose-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-rose-700 space-y-1">
                          <li>• View all orders in comprehensive table</li>
                          <li>• Filter orders by status, date, and customer</li>
                          <li>• Update order status and add notes</li>
                          <li>• View detailed order information</li>
                          <li>• Process refunds and cancellations</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-slate-500 pl-4">
                      <h5 className="font-semibold text-gray-800 mb-2">System Monitoring (US-012)</h5>
                      <p className="text-gray-600 text-sm mb-3">Monitor system performance and health for reliable customer service</p>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-slate-800 mb-2">Acceptance Criteria:</p>
                        <ul className="text-xs text-slate-700 space-y-1">
                          <li>• View system uptime and performance metrics</li>
                          <li>• Monitor user activity and system load</li>
                          <li>• Receive alerts for system issues</li>
                          <li>• Access error logs and diagnostics</li>
                          <li>• View security and compliance status</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Rules */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    Business Rules
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-700">Authentication & Security</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Users must be authenticated to make purchases</li>
                        <li>• JWT tokens expire after 30 minutes of inactivity</li>
                        <li>• Passwords must meet minimum security requirements</li>
                        <li>• Admin users have role-based access control</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-700">Order Processing</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Inventory must be checked before order confirmation</li>
                        <li>• Payment must be processed before order fulfillment</li>
                        <li>• Minimum order value of $25 for free shipping</li>
                        <li>• Orders can be cancelled within 24 hours</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-700">Product Management</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Products must have valid images and descriptions</li>
                        <li>• Inventory levels must be tracked in real-time</li>
                        <li>• Product categories must be properly assigned</li>
                        <li>• Price changes require admin approval</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-700">Customer Experience</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Shopping cart persists for 30 days</li>
                        <li>• Customer support response within 24 hours</li>
                        <li>• Return policy: 30-day return window</li>
                        <li>• Guest checkout available for quick purchases</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                // Generic content for other projects
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Core Features</h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-gray-800">User Authentication</h5>
                      <p className="text-gray-600 text-sm">Secure login and registration system with role-based access control</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-medium text-gray-800">Core Functionality</h5>
                        <p className="text-gray-600 text-sm">Main application features and business logic implementation</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                        <h5 className="font-medium text-gray-800">Data Management</h5>
                        <p className="text-gray-600 text-sm">Data storage, retrieval, and management capabilities</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                        <h5 className="font-medium text-gray-800">User Interface</h5>
                        <p className="text-gray-600 text-sm">Interactive user interface and user experience features</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Business Rules</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>Users must be authenticated to access protected features</li>
                      <li>Data validation and input sanitization required</li>
                      <li>Role-based access control for different user types</li>
                      <li>Error handling and user feedback mechanisms</li>
                      <li>Admin users can manage system settings and data</li>
                  </ul>
                </div>
              </div>
              )}
            </div>
          </div>
        );

      case 'non-functional-requirements':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Non-Functional Requirements</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                Non-functional requirements define how the system performs and operates, 
                focusing on quality attributes such as performance, security, and usability.
              </p>
              
              {project.title === 'E-Commerce Web Application' ? (
              <div className="space-y-8">
                {/* Performance Requirements */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    Performance Requirements
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-lg">Response Time</h5>
                      <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-blue-800">Page Load Time</span>
                            <span className="text-sm font-bold text-blue-600">&lt; 3 seconds</span>
                          </div>
                          <p className="text-xs text-blue-700">First Contentful Paint measurement for customer satisfaction</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">API Response Time</span>
                            <span className="text-sm font-bold text-green-600">&lt; 500ms</span>
                          </div>
                          <p className="text-xs text-green-700">Database query response for smooth user experience</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-purple-800">Search Results</span>
                            <span className="text-sm font-bold text-purple-600">&lt; 1 second</span>
                          </div>
                          <p className="text-xs text-purple-700">Search query response for improved conversion rates</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-orange-800">Image Loading</span>
                            <span className="text-sm font-bold text-orange-600">&lt; 2 seconds</span>
                          </div>
                          <p className="text-xs text-orange-700">Image display time for better visual experience</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-lg">Throughput</h5>
                      <div className="space-y-3">
                        <div className="bg-indigo-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-indigo-800">Concurrent Users</span>
                            <span className="text-sm font-bold text-indigo-600">1,000+</span>
                          </div>
                          <p className="text-xs text-indigo-700">Simultaneous active users for business growth</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-teal-800">Orders per Minute</span>
                            <span className="text-sm font-bold text-teal-600">100+</span>
                          </div>
                          <p className="text-xs text-teal-700">Order processing capacity for peak sales</p>
                        </div>
                        <div className="bg-cyan-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-cyan-800">Database Queries</span>
                            <span className="text-sm font-bold text-cyan-600">10,000+/min</span>
                          </div>
                          <p className="text-xs text-cyan-700">Query processing rate for system scalability</p>
                        </div>
                        <div className="bg-rose-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-rose-800">API Requests</span>
                            <span className="text-sm font-bold text-rose-600">50,000+/hr</span>
                          </div>
                          <p className="text-xs text-rose-700">API call volume for third-party integration</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Requirements */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    Security Requirements
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-lg">Authentication & Authorization</h5>
                      <div className="space-y-3">
                        <div className="bg-red-50 rounded-lg p-4">
                          <div className="font-medium text-red-800 mb-1">User Authentication</div>
                          <div className="text-sm text-red-700 mb-2">JWT with 2FA support via NextAuth.js</div>
                          <div className="text-xs text-red-600">Customer trust and data protection</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="font-medium text-orange-800 mb-1">Session Management</div>
                          <div className="text-sm text-orange-700 mb-2">30-minute timeout, secure cookies</div>
                          <div className="text-xs text-orange-600">Account security</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <div className="font-medium text-yellow-800 mb-1">Password Security</div>
                          <div className="text-sm text-yellow-700 mb-2">bcrypt hashing with strong policies</div>
                          <div className="text-xs text-yellow-600">Data breach prevention</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <div className="font-medium text-amber-800 mb-1">Admin Access Control</div>
                          <div className="text-sm text-amber-700 mb-2">Multi-level role-based permissions</div>
                          <div className="text-xs text-amber-600">Business data protection</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-lg">Data Protection</h5>
                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="font-medium text-green-800 mb-1">Data Encryption</div>
                          <div className="text-sm text-green-700 mb-2">AES-256 encryption with HTTPS/TLS 1.3</div>
                          <div className="text-xs text-green-600">Customer privacy protection</div>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-4">
                          <div className="font-medium text-emerald-800 mb-1">Payment Security</div>
                          <div className="text-sm text-emerald-700 mb-2">PCI DSS compliance via Stripe</div>
                          <div className="text-xs text-emerald-600">Legal compliance and trust</div>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-4">
                          <div className="font-medium text-teal-800 mb-1">Database Security</div>
                          <div className="text-sm text-teal-700 mb-2">Encrypted at rest with PostgreSQL</div>
                          <div className="text-xs text-teal-600">Data integrity protection</div>
                        </div>
                        <div className="bg-cyan-50 rounded-lg p-4">
                          <div className="font-medium text-cyan-800 mb-1">Input Validation</div>
                          <div className="text-sm text-cyan-700 mb-2">Server-side validation with Prisma ORM</div>
                          <div className="text-xs text-cyan-600">SQL injection prevention</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usability Requirements */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🎨</span>
                    Usability Requirements
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-lg">User Experience</h5>
                      <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="font-medium text-blue-800 mb-1">Mobile Responsiveness</div>
                          <div className="text-sm text-blue-700 mb-2">All screen sizes (320px-1920px)</div>
                          <div className="text-xs text-blue-600">Market reach and accessibility</div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4">
                          <div className="font-medium text-indigo-800 mb-1">Browser Compatibility</div>
                          <div className="text-sm text-indigo-700 mb-2">Chrome, Firefox, Safari, Edge</div>
                          <div className="text-xs text-indigo-600">Universal accessibility</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="font-medium text-purple-800 mb-1">Accessibility</div>
                          <div className="text-sm text-purple-700 mb-2">WCAG 2.1 AA compliance</div>
                          <div className="text-xs text-purple-600">Legal compliance and inclusion</div>
                        </div>
                        <div className="bg-violet-50 rounded-lg p-4">
                          <div className="font-medium text-violet-800 mb-1">Navigation</div>
                          <div className="text-sm text-violet-700 mb-2">User testing scores &gt; 4.0/5.0</div>
                          <div className="text-xs text-violet-600">Customer satisfaction</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-lg">Content & Design</h5>
                      <div className="space-y-3">
                        <div className="bg-pink-50 rounded-lg p-4">
                          <div className="font-medium text-pink-800 mb-1">Visual Design</div>
                          <div className="text-sm text-pink-700 mb-2">Modern, professional with consistent branding</div>
                          <div className="text-xs text-pink-600">Brand recognition and trust</div>
                        </div>
                        <div className="bg-rose-50 rounded-lg p-4">
                          <div className="font-medium text-rose-800 mb-1">Content Management</div>
                          <div className="text-sm text-rose-700 mb-2">Easy content updates via admin dashboard</div>
                          <div className="text-xs text-rose-600">Marketing agility</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="font-medium text-orange-800 mb-1">Error Handling</div>
                          <div className="text-sm text-orange-700 mb-2">User-friendly error messages</div>
                          <div className="text-xs text-orange-600">Reduced support burden</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <div className="font-medium text-amber-800 mb-1">Loading States</div>
                          <div className="text-sm text-amber-700 mb-2">Visual feedback with progress indicators</div>
                          <div className="text-xs text-amber-600">User experience quality</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reliability Requirements */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🛡️</span>
                    Reliability Requirements
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-lg">Availability</h5>
                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">System Uptime</span>
                            <span className="text-sm font-bold text-green-600">99.9%</span>
                          </div>
                          <div className="text-xs text-green-700">Monthly availability for revenue protection</div>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-emerald-800">Scheduled Maintenance</span>
                            <span className="text-sm font-bold text-emerald-600">&lt; 2 hours/month</span>
                          </div>
                          <div className="text-xs text-emerald-700">Minimal business disruption</div>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-teal-800">Recovery Time</span>
                            <span className="text-sm font-bold text-teal-600">&lt; 4 hours</span>
                          </div>
                          <div className="text-xs text-teal-700">System restoration for business continuity</div>
                        </div>
                        <div className="bg-cyan-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-cyan-800">Data Backup</span>
                            <span className="text-sm font-bold text-cyan-600">Daily automated</span>
                          </div>
                          <div className="text-xs text-cyan-700">Data protection frequency</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-lg">Error Handling</h5>
                      <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="font-medium text-blue-800 mb-1">Graceful Degradation</div>
                          <div className="text-sm text-blue-700 mb-2">Partial functionality with fallback mechanisms</div>
                          <div className="text-xs text-blue-600">Service continuity</div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4">
                          <div className="font-medium text-indigo-800 mb-1">Error Logging</div>
                          <div className="text-sm text-indigo-700 mb-2">Comprehensive logging with centralized tracking</div>
                          <div className="text-xs text-indigo-600">Issue resolution</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="font-medium text-purple-800 mb-1">User Notifications</div>
                          <div className="text-sm text-purple-700 mb-2">Clear error messages for user communication</div>
                          <div className="text-xs text-purple-600">Customer experience</div>
                        </div>
                        <div className="bg-violet-50 rounded-lg p-4">
                          <div className="font-medium text-violet-800 mb-1">System Monitoring</div>
                          <div className="text-sm text-violet-700 mb-2">Real-time alerts with automated monitoring</div>
                          <div className="text-xs text-violet-600">Proactive issue detection</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scalability Requirements */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Scalability Requirements
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-lg">Horizontal Scaling</h5>
                      <div className="space-y-3">
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="font-medium text-orange-800 mb-1">User Growth</div>
                          <div className="text-sm text-orange-700 mb-2">10x current capacity with auto-scaling</div>
                          <div className="text-xs text-orange-600">Business expansion capability</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <div className="font-medium text-amber-800 mb-1">Product Catalog</div>
                          <div className="text-sm text-amber-700 mb-2">100,000+ products with database optimization</div>
                          <div className="text-xs text-amber-600">Inventory management</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <div className="font-medium text-yellow-800 mb-1">Order Volume</div>
                          <div className="text-sm text-yellow-700 mb-2">1,000+ orders/day with queue management</div>
                          <div className="text-xs text-yellow-600">Sales growth support</div>
                        </div>
                        <div className="bg-lime-50 rounded-lg p-4">
                          <div className="font-medium text-lime-800 mb-1">Data Storage</div>
                          <div className="text-sm text-lime-700 mb-2">1TB+ capacity with cloud storage scaling</div>
                          <div className="text-xs text-lime-600">Long-term data retention</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-lg">Performance Scaling</h5>
                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="font-medium text-green-800 mb-1">CDN Integration</div>
                          <div className="text-sm text-green-700 mb-2">Global content delivery via Vercel CDN</div>
                          <div className="text-xs text-green-600">International reach</div>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-4">
                          <div className="font-medium text-emerald-800 mb-1">Caching Strategy</div>
                          <div className="text-sm text-emerald-700 mb-2">Multi-layer caching with Redis and browser</div>
                          <div className="text-xs text-emerald-600">Performance optimization</div>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-4">
                          <div className="font-medium text-teal-800 mb-1">Database Optimization</div>
                          <div className="text-sm text-teal-700 mb-2">Query performance with indexing</div>
                          <div className="text-xs text-teal-600">Cost efficiency</div>
                        </div>
                        <div className="bg-cyan-50 rounded-lg p-4">
                          <div className="font-medium text-cyan-800 mb-1">Image Optimization</div>
                          <div className="text-sm text-cyan-700 mb-2">WebP format with automatic conversion</div>
                          <div className="text-xs text-cyan-600">Bandwidth savings</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Metrics Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    Key Success Metrics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">40-60%</div>
                      <div className="text-sm text-gray-600">Revenue Growth (Year 1)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">5,000+</div>
                      <div className="text-sm text-gray-600">New Customers (Year 1)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">4.5+</div>
                      <div className="text-sm text-gray-600">Customer Rating</div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                // Generic content for other projects
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Page load time: &lt; 3 seconds</li>
                    <li>• Support 1000 concurrent users</li>
                    <li>• Database response time: &lt; 500ms</li>
                    <li>• 99.9% uptime availability</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Security</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• HTTPS encryption for all communications</li>
                    <li>• Password hashing with bcrypt</li>
                    <li>• JWT token-based authentication</li>
                    <li>• Input validation and sanitization</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Usability</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Responsive design for all devices</li>
                    <li>• Intuitive navigation and user flow</li>
                    <li>• Accessibility compliance (WCAG 2.1)</li>
                    <li>• Multi-language support capability</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Scalability</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Horizontal scaling capability</li>
                    <li>• Microservices architecture</li>
                    <li>• Database optimization and indexing</li>
                    <li>• CDN for static assets</li>
                  </ul>
                </div>
              </div>
              )}
            </div>
          </div>
        );

      case 'user-stories':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">User Stories</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                User stories capture the requirements from the perspective of different user types. 
                Each story follows the format: "As a [user type], I want [goal] so that [benefit]."
              </p>
              
              {project.title === 'E-Commerce Web Application' ? (
              <div className="space-y-8">
                {/* Epic 1: Product Discovery & Selection */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🛍️</span>
                    Epic 1: Product Discovery & Selection
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-001: Product Browsing</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As a</strong> Shopper <br/>
                          <strong>I want to</strong> browse products with filtering options <br/>
                          <strong>So that</strong> I can find products that match my preferences and budget
                        </p>
                        <div className="bg-blue-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• I can view products in a responsive grid layout</li>
                            <li>• I can filter products by category, price range, and other attributes</li>
                            <li>• I can search for specific products using keywords</li>
                            <li>• I can see product count and applied filters</li>
                            <li>• I can navigate through multiple pages of results</li>
                            <li>• I can sort products by price, popularity, and rating</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-blue-600 font-medium">
                          <strong>Business Value:</strong> Increased conversion rates through improved product discoverability
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-002: Product Information</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As a</strong> Shopper <br/>
                          <strong>I want to</strong> view detailed product information <br/>
                          <strong>So that</strong> I can make an informed purchase decision
                        </p>
                        <div className="bg-green-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• I can see high-quality product images with zoom functionality</li>
                            <li>• I can view detailed product specifications and descriptions</li>
                            <li>• I can see current stock availability and pricing</li>
                            <li>• I can read customer reviews and ratings</li>
                            <li>• I can view related product recommendations</li>
                            <li>• I can see shipping information and delivery times</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-green-600 font-medium">
                          <strong>Business Value:</strong> Reduced returns and increased customer confidence
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-003: Smart Search</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As a</strong> Shopper <br/>
                          <strong>I want to</strong> search for products with intelligent suggestions <br/>
                          <strong>So that</strong> I can quickly find what I'm looking for
                        </p>
                        <div className="bg-purple-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-purple-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-purple-700 space-y-1">
                            <li>• I can search using keywords with real-time suggestions</li>
                            <li>• I can see search results ranked by relevance</li>
                            <li>• I can apply and remove filters from search results</li>
                            <li>• I can see search result count and pagination</li>
                            <li>• I can handle "no results found" scenarios gracefully</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-purple-600 font-medium">
                          <strong>Business Value:</strong> Improved user experience and increased search conversion rates
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Epic 2: Shopping Cart & Checkout */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🛒</span>
                    Epic 2: Shopping Cart & Checkout
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="bg-orange-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-004: Shopping Cart Management</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As a</strong> Shopper <br/>
                          <strong>I want to</strong> manage items in my shopping cart <br/>
                          <strong>So that</strong> I can review and modify my purchase before checkout
                        </p>
                        <div className="bg-orange-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-orange-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-orange-700 space-y-1">
                            <li>• I can add products to my cart with quantity selection</li>
                            <li>• I can view all items in my cart with images and details</li>
                            <li>• I can modify quantities and remove items from my cart</li>
                            <li>• I can see the total price including taxes and shipping</li>
                            <li>• My cart persists across browser sessions</li>
                            <li>• I can see a cart badge in the header with item count</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-orange-600 font-medium">
                          <strong>Business Value:</strong> Increased average order value and reduced cart abandonment
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-005: Secure Checkout</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As a</strong> Shopper <br/>
                          <strong>I want to</strong> complete my purchase securely <br/>
                          <strong>So that</strong> I can buy products with confidence
                        </p>
                        <div className="bg-red-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-red-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>• I can enter my shipping address and contact information</li>
                            <li>• I can select a shipping method and delivery option</li>
                            <li>• I can review my order summary with itemized costs</li>
                            <li>• I can select a secure payment method</li>
                            <li>• I can complete the payment process safely</li>
                            <li>• I receive confirmation of my order</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-red-600 font-medium">
                          <strong>Business Value:</strong> Completed sales and customer trust
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-006: Order Confirmation</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As a</strong> Shopper <br/>
                          <strong>I want to</strong> receive clear order confirmation <br/>
                          <strong>So that</strong> I can track my purchase and know it was successful
                        </p>
                        <div className="bg-indigo-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-indigo-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-indigo-700 space-y-1">
                            <li>• I can see my order confirmation number and details</li>
                            <li>• I can view shipping information and estimated delivery</li>
                            <li>• I receive an email confirmation with order details</li>
                            <li>• I can access order tracking information</li>
                            <li>• My shopping cart is cleared after successful order</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-indigo-600 font-medium">
                          <strong>Business Value:</strong> Customer satisfaction and reduced support inquiries
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Epic 3: Customer Account Management */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Epic 3: Customer Account Management
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="bg-teal-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-007: User Authentication</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As a</strong> Shopper <br/>
                          <strong>I want to</strong> create and manage my account <br/>
                          <strong>So that</strong> I can access personalized features and track my orders
                        </p>
                        <div className="bg-teal-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-teal-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-teal-700 space-y-1">
                            <li>• I can create an account with email and password</li>
                            <li>• I can sign in securely to my account</li>
                            <li>• I can reset my password if forgotten</li>
                            <li>• I can update my account information</li>
                            <li>• I can sign out securely from any device</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-teal-600 font-medium">
                          <strong>Business Value:</strong> Customer retention and personalized experience
                        </div>
                      </div>
                    </div>

                    <div className="bg-cyan-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-008: Order History & Tracking</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As a</strong> Shopper <br/>
                          <strong>I want to</strong> view my order history and track orders <br/>
                          <strong>So that</strong> I can monitor my purchases and order status
                        </p>
                        <div className="bg-cyan-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-cyan-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-cyan-700 space-y-1">
                            <li>• I can view my complete order history</li>
                            <li>• I can see the status of each order</li>
                            <li>• I can track shipping and delivery information</li>
                            <li>• I can reorder previous purchases</li>
                            <li>• I can download order receipts and invoices</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-cyan-600 font-medium">
                          <strong>Business Value:</strong> Customer satisfaction and repeat purchases
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-009: Profile Management</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As a</strong> Shopper <br/>
                          <strong>I want to</strong> manage my profile and preferences <br/>
                          <strong>So that</strong> I can customize my shopping experience
                        </p>
                        <div className="bg-emerald-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-emerald-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-emerald-700 space-y-1">
                            <li>• I can update my personal information</li>
                            <li>• I can manage multiple shipping addresses</li>
                            <li>• I can set account preferences and notifications</li>
                            <li>• I can view and update payment methods</li>
                            <li>• I can manage my communication preferences</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-emerald-600 font-medium">
                          <strong>Business Value:</strong> Improved customer experience and data accuracy
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Epic 4: Business Analytics & Management */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Epic 4: Business Analytics & Management
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="bg-amber-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-010: Sales Analytics</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As an</strong> Administrator <br/>
                          <strong>I want to</strong> view sales analytics and performance metrics <br/>
                          <strong>So that</strong> I can make informed business decisions
                        </p>
                        <div className="bg-amber-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-amber-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-amber-700 space-y-1">
                            <li>• I can view key performance indicators and metrics</li>
                            <li>• I can see sales trends and analytics charts</li>
                            <li>• I can analyze customer behavior and preferences</li>
                            <li>• I can view order distribution and patterns</li>
                            <li>• I can export data for further analysis</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-amber-600 font-medium">
                          <strong>Business Value:</strong> Data-driven decision making and business optimization
                        </div>
                      </div>
                    </div>

                    <div className="bg-rose-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-011: Order Management</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As an</strong> Administrator <br/>
                          <strong>I want to</strong> manage customer orders efficiently <br/>
                          <strong>So that</strong> I can process orders and maintain customer satisfaction
                        </p>
                        <div className="bg-rose-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-rose-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-rose-700 space-y-1">
                            <li>• I can view all orders in a comprehensive table</li>
                            <li>• I can filter orders by status, date, and customer</li>
                            <li>• I can update order status and add notes</li>
                            <li>• I can view detailed order information</li>
                            <li>• I can process refunds and cancellations</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-rose-600 font-medium">
                          <strong>Business Value:</strong> Operational efficiency and customer service excellence
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-800 mb-3 text-lg">US-012: System Monitoring</h5>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 mb-3">
                          <strong>As an</strong> Administrator <br/>
                          <strong>I want to</strong> monitor system performance and health <br/>
                          <strong>So that</strong> I can ensure reliable service for customers
                        </p>
                        <div className="bg-slate-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-slate-800 mb-2">Acceptance Criteria:</p>
                          <ul className="text-sm text-slate-700 space-y-1">
                            <li>• I can view system uptime and performance metrics</li>
                            <li>• I can monitor user activity and system load</li>
                            <li>• I can receive alerts for system issues</li>
                            <li>• I can access error logs and diagnostics</li>
                            <li>• I can view security and compliance status</li>
                          </ul>
                        </div>
                        <div className="mt-3 text-xs text-slate-600 font-medium">
                          <strong>Business Value:</strong> System reliability and customer trust
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                // Generic content for other projects
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Stories</h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h5 className="font-medium text-gray-800 mb-2">User Registration</h5>
                      <p className="text-gray-600 text-sm mb-2">
                        <strong>As a</strong> new customer, <strong>I want to</strong> create an account <strong>so that</strong> I can save my information and track my orders.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Acceptance Criteria:</strong> User can register with email/password, receive confirmation email, and login successfully.
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h5 className="font-medium text-gray-800 mb-2">Product Browsing</h5>
                      <p className="text-gray-600 text-sm mb-2">
                        <strong>As a</strong> customer, <strong>I want to</strong> browse products by category <strong>so that</strong> I can easily find what I'm looking for.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Acceptance Criteria:</strong> Products are categorized, searchable, and display with images, prices, and descriptions.
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h5 className="font-medium text-gray-800 mb-2">Shopping Cart</h5>
                      <p className="text-gray-600 text-sm mb-2">
                        <strong>As a</strong> customer, <strong>I want to</strong> add items to my cart <strong>so that</strong> I can purchase multiple items together.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Acceptance Criteria:</strong> Items persist in cart, quantity can be modified, and total is calculated correctly.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Admin Stories</h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h5 className="font-medium text-gray-800 mb-2">Product Management</h5>
                      <p className="text-gray-600 text-sm mb-2">
                        <strong>As an</strong> admin, <strong>I want to</strong> manage products <strong>so that</strong> I can keep the catalog up to date.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Acceptance Criteria:</strong> Admin can add, edit, delete products with images, descriptions, and inventory.
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h5 className="font-medium text-gray-800 mb-2">Order Management</h5>
                      <p className="text-gray-600 text-sm mb-2">
                        <strong>As an</strong> admin, <strong>I want to</strong> view and manage orders <strong>so that</strong> I can fulfill customer requests.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Acceptance Criteria:</strong> Admin can view all orders, update order status, and track fulfillment.
                      </div>
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
                The Business Requirements Document (BRD) provides a comprehensive foundation for the {project.title} project. 
                This document serves as the single source of truth for all stakeholders and development team members.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">BRD Summary</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Clear project scope and objectives defined</li>
                  <li>Functional requirements documented with user stories</li>
                  <li>Non-functional requirements specified for performance and quality</li>
                  <li>Stakeholder roles and responsibilities identified</li>
                  <li>Success criteria and acceptance criteria established</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Next Phase: UI/UX Design</h4>
                <p className="text-gray-600 mb-4">
                  With the BRD completed, the next phase will focus on creating intuitive and user-friendly designs 
                  that align with the functional and non-functional requirements outlined in this document.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <span>🎨</span>
                      Design System
                    </h5>
                    <p className="text-sm text-gray-600">Color palette, typography, and components</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <span>👥</span>
                      Customer Pages
                    </h5>
                    <p className="text-sm text-gray-600">Customer-facing pages and interfaces</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <span>⚙️</span>
                      Admin Pages
                    </h5>
                    <p className="text-sm text-gray-600">Administrative interface and management</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <span>🗺️</span>
                      Navigation Flow
                    </h5>
                    <p className="text-sm text-gray-600">User journey maps and navigation patterns</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Ready to Proceed?</h4>
                <p className="text-gray-600 mb-4">
                  This BRD phase is now complete. You can proceed to the next phase (UI/UX Design) or review 
                  any section of this document as needed.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      unlockNextPhase(projectId, 'brd');
                      navigate(`/student/realtime-projects/${projectId}/uiux`);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Continue to UI/UX Phase
                  </button>
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Download BRD Document
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
          <PhaseNavigationBar currentPhase="brd" />
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
            <h1 className="text-xl font-bold text-gray-800 mb-2">BRD Phase</h1>
            <p className="text-sm text-gray-600">{project.title}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="p-4">
            <nav className="space-y-2">
              {brdTabs.map((tab, index) => {
                const isUnlocked = isModuleUnlocked(projectId, 'brd', tab.id);
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
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
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
                {brdTabs.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedTab === tab.id ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-xs ${
                      selectedTab === tab.id ? 'text-blue-600 font-medium' : 'text-gray-500'
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
              currentPhase="brd" 
              currentModule={selectedTab}
              onNext={() => {
                // Auto-advance to next module
                const brdTabs = [
                  { id: 'overview' },
                  { id: 'functional-requirements' },
                  { id: 'non-functional-requirements' },
                  { id: 'user-stories' },
                  { id: 'conclusion' }
                ];
                const currentIndex = brdTabs.findIndex(tab => tab.id === selectedTab);
                if (currentIndex < brdTabs.length - 1) {
                  setSelectedTab(brdTabs[currentIndex + 1].id);
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

export default BRDPhasePage;
