import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import PhaseNavigationBar from '../components/projects/PhaseNavigationBar';
import NextButton from '../components/projects/NextButton';
import { useProjectProgress } from '../context/ProjectProgressContext';

const TestingPhasePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isModuleUnlocked, unlockNextPhase } = useProjectProgress();

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
          },
          {
            id: 5,
            title: 'Phase 5 - Testing & Quality Assurance',
            description: 'Comprehensive testing and quality assurance',
            phaseNumber: 5,
            phaseType: 'TESTING',
            estimatedDuration: 8,
            order: 5
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
          },
          {
            id: 10,
            title: 'Phase 5 - Testing & Quality Assurance',
            description: 'Test data processing and visualization accuracy',
            phaseNumber: 5,
            phaseType: 'TESTING',
            estimatedDuration: 7,
            order: 5
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
          },
          {
            id: 15,
            title: 'Phase 5 - Testing & Quality Assurance',
            description: 'Test AI model accuracy and performance',
            phaseNumber: 5,
            phaseType: 'TESTING',
            estimatedDuration: 9,
            order: 5
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

  const testingTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '🧪',
      description: 'Testing phase overview and objectives'
    },
    {
      id: 'test-planning',
      label: 'Test Planning',
      icon: '📋',
      description: 'Test strategy and test case development'
    },
    {
      id: 'unit-testing',
      label: 'Unit Testing',
      icon: '🔬',
      description: 'Individual component and function testing'
    },
    {
      id: 'integration-testing',
      label: 'Integration Testing',
      icon: '🔗',
      description: 'System integration and API testing'
    },
    {
      id: 'performance-testing',
      label: 'Performance Testing',
      icon: '⚡',
      description: 'Load testing and performance optimization'
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
          <p className="text-gray-600">Loading Testing Phase...</p>
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
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">E-Commerce Testing & Quality Assurance</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive testing strategy for the E-Commerce application to ensure all shopping features, 
                payment processing, and user interactions work flawlessly across all devices and scenarios.
              </p>
            </div>

            {/* E-Commerce Testing Focus Areas */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Testing Focus Areas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-3xl mb-3">🛒</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Shopping Experience</h5>
                  <p className="text-sm text-gray-600">Product browsing, search, filtering, cart management, and checkout flow</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-3xl mb-3">💳</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Payment Processing</h5>
                  <p className="text-sm text-gray-600">Stripe integration, payment validation, order processing, and receipts</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-3xl mb-3">👤</div>
                  <h5 className="font-semibold text-gray-800 mb-2">User Management</h5>
                  <p className="text-sm text-gray-600">Authentication, registration, profiles, and session management</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <div className="text-3xl mb-3">📦</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Product Management</h5>
                  <p className="text-sm text-gray-600">Admin panel, inventory management, and product CRUD operations</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                  <div className="text-3xl mb-3">🔐</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Security Testing</h5>
                  <p className="text-sm text-gray-600">Data protection, authentication security, and payment security</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
                  <div className="text-3xl mb-3">📱</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Cross-Platform</h5>
                  <p className="text-sm text-gray-600">Mobile responsiveness, browser compatibility, and device testing</p>
                </div>
              </div>
            </div>

            {/* Testing Process Overview */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Testing Process</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Testing Methodology</h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Test Planning & Strategy</span>
                        <p className="text-xs text-gray-600">Define E-commerce specific test scenarios and coverage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Unit Testing</span>
                        <p className="text-xs text-gray-600">Test individual components, functions, and API endpoints</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Integration Testing</span>
                        <p className="text-xs text-gray-600">Verify system components work together seamlessly</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">Performance Testing</span>
                        <p className="text-xs text-gray-600">Load testing, stress testing, and optimization</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">E-Commerce Test Scenarios</h5>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-800 mb-1">User Journey Testing</h6>
                      <p className="text-xs text-gray-600">Complete shopping flow from registration to order completion</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Payment Flow Testing</h6>
                      <p className="text-xs text-gray-600">Stripe integration, payment processing, and error handling</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Admin Panel Testing</h6>
                      <p className="text-xs text-gray-600">Product management, order tracking, and user management</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-800 mb-1">Security Testing</h6>
                      <p className="text-xs text-gray-600">Authentication, authorization, and data protection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testing Tools & Technologies */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Testing Tools & Technologies</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🧪</div>
                  <div className="text-sm font-medium text-gray-800">Jest</div>
                  <div className="text-xs text-gray-600">Unit Testing</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🎭</div>
                  <div className="text-sm font-medium text-gray-800">Cypress</div>
                  <div className="text-xs text-gray-600">E2E Testing</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🎪</div>
                  <div className="text-sm font-medium text-gray-800">Playwright</div>
                  <div className="text-xs text-gray-600">Cross-browser</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-sm font-medium text-gray-800">K6</div>
                  <div className="text-xs text-gray-600">Load Testing</div>
                </div>
              </div>
              </div>

            {/* Success Criteria */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Testing Success Criteria</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">95%+</div>
                  <div className="text-sm font-medium text-gray-800">Code Coverage</div>
                  <div className="text-xs text-gray-600">Comprehensive test coverage</div>
              </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">&lt;2s</div>
                  <div className="text-sm font-medium text-gray-800">Page Load Time</div>
                  <div className="text-xs text-gray-600">Optimal performance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-sm font-medium text-gray-800">Payment Success</div>
                  <div className="text-xs text-gray-600">Reliable transactions</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'test-planning':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">E-Commerce Test Planning</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive test planning strategy specifically designed for E-commerce applications, 
                covering all critical shopping flows, payment processing, and user interactions.
              </p>
            </div>

            {/* E-Commerce Test Strategy */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Test Strategy</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Test Scope & Coverage</h5>
                    <div className="space-y-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🛒</span>
                        Shopping Experience
                      </h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Product browsing and search functionality</li>
                        <li>• Shopping cart add/remove/update operations</li>
                        <li>• Checkout process and order placement</li>
                        <li>• Product filtering and sorting</li>
                        <li>• Wishlist and favorites management</li>
                        </ul>
                      </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">💳</span>
                        Payment Processing
                      </h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Stripe payment integration testing</li>
                        <li>• Payment method validation</li>
                        <li>• Order confirmation and receipts</li>
                        <li>• Refund and cancellation processing</li>
                        <li>• Payment security and fraud prevention</li>
                        </ul>
                      </div>
                    </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Test Levels & Approach</h5>
                    <div className="space-y-3">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🔬</span>
                        Testing Levels
                      </h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Unit Testing: Components and functions</li>
                        <li>• Integration Testing: API and database</li>
                        <li>• E2E Testing: Complete user journeys</li>
                        <li>• Performance Testing: Load and stress</li>
                        <li>• Security Testing: Authentication & data</li>
                        </ul>
                      </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        Test Approach
                      </h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Automated testing for regression</li>
                        <li>• Manual testing for user experience</li>
                        <li>• Cross-browser compatibility testing</li>
                        <li>• Mobile responsiveness testing</li>
                        <li>• Accessibility compliance testing</li>
                        </ul>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* E-Commerce Test Cases */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Test Case Examples</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Critical User Flows</h5>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">TC_EC_001: Complete Purchase Flow</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Objective:</strong> Verify complete purchase process</div>
                        <div><strong>Steps:</strong> Browse → Add to Cart → Checkout → Payment → Confirmation</div>
                        <div><strong>Expected:</strong> Order placed successfully, confirmation email sent</div>
                        <div><strong>Priority:</strong> Critical</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">TC_EC_002: User Registration & Login</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Objective:</strong> Verify user account creation and authentication</div>
                        <div><strong>Steps:</strong> Register → Verify Email → Login → Access Profile</div>
                        <div><strong>Expected:</strong> Account created, user logged in, profile accessible</div>
                        <div><strong>Priority:</strong> High</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Payment & Security Tests</h5>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">TC_EC_003: Payment Processing</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Objective:</strong> Verify Stripe payment integration</div>
                        <div><strong>Steps:</strong> Add items → Checkout → Enter payment → Process</div>
                        <div><strong>Expected:</strong> Payment processed, order confirmed</div>
                        <div><strong>Priority:</strong> Critical</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">TC_EC_004: Admin Product Management</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Objective:</strong> Verify admin can manage products</div>
                        <div><strong>Steps:</strong> Login as admin → Add product → Update → Delete</div>
                        <div><strong>Expected:</strong> Product operations successful, changes reflected</div>
                        <div><strong>Priority:</strong> High</div>
                      </div>
                    </div>
                  </div>
                </div>
                      </div>
                    </div>
                    
            {/* Test Environment Setup */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Test Environment Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-3xl mb-3">💻</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Development Environment</h5>
                  <p className="text-sm text-gray-600">Local testing with mock data and services</p>
                        </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-3xl mb-3">🧪</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Staging Environment</h5>
                  <p className="text-sm text-gray-600">Production-like setup with test data</p>
                        </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-3xl mb-3">📱</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Device Testing</h5>
                  <p className="text-sm text-gray-600">Cross-device and browser compatibility</p>
                      </div>
                    </div>
                  </div>

            {/* Test Execution Timeline */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Test Execution Timeline</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-800">Week 1: Unit Testing</h6>
                    <p className="text-sm text-gray-600">Component testing, API testing, and utility function testing</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-800">Week 2: Integration Testing</h6>
                    <p className="text-sm text-gray-600">API integration, database testing, and third-party service testing</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-800">Week 3: E2E Testing</h6>
                    <p className="text-sm text-gray-600">Complete user journey testing and cross-browser testing</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-800">Week 4: Performance & Security</h6>
                    <p className="text-sm text-gray-600">Load testing, security testing, and final validation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'unit-testing':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">E-Commerce Unit Testing</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive unit testing strategy for E-commerce components, functions, and API endpoints 
                to ensure each piece works correctly in isolation before integration.
              </p>
            </div>

            {/* E-Commerce Component Testing */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Component Testing</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Shopping Components</h5>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🛒</span>
                        Product Card Component
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Tests:</strong> Rendering, price display, image loading</div>
                        <div><strong>Interactions:</strong> Add to cart, wishlist toggle</div>
                        <div><strong>Edge Cases:</strong> Out of stock, missing images</div>
                        <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                          <strong>Example:</strong> Test product card renders with correct price and handles add to cart click
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🛍️</span>
                        Shopping Cart Component
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Tests:</strong> Item display, quantity updates, totals</div>
                        <div><strong>Interactions:</strong> Remove items, update quantities</div>
                        <div><strong>State Management:</strong> Cart persistence, real-time updates</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">User Interface Components</h5>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🔐</span>
                        Authentication Forms
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Tests:</strong> Form validation, error handling</div>
                        <div><strong>Interactions:</strong> Login, registration, password reset</div>
                        <div><strong>Validation:</strong> Email format, password strength</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">💳</span>
                        Payment Form Component
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Tests:</strong> Stripe integration, form validation</div>
                        <div><strong>Interactions:</strong> Payment method selection, processing</div>
                        <div><strong>Security:</strong> Sensitive data handling</div>
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* E-Commerce API Testing */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce API Unit Testing</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Product Management APIs</h5>
                    <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">GET /api/products</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Tests:</strong> Product listing, pagination, filtering</div>
                        <div><strong>Edge Cases:</strong> Empty results, invalid filters</div>
                        <div><strong>Performance:</strong> Response time, data size</div>
                      </div>
                      </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">POST /api/products</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Tests:</strong> Product creation, validation, admin auth</div>
                        <div><strong>Edge Cases:</strong> Duplicate products, invalid data</div>
                        <div><strong>Security:</strong> Authorization, input sanitization</div>
                    </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Order & Payment APIs</h5>
                    <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">POST /api/orders</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Tests:</strong> Order creation, payment processing</div>
                        <div><strong>Edge Cases:</strong> Invalid cart, payment failures</div>
                        <div><strong>Integration:</strong> Stripe webhook handling</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">GET /api/orders/:id</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Tests:</strong> Order retrieval, user authorization</div>
                        <div><strong>Edge Cases:</strong> Non-existent orders, unauthorized access</div>
                        <div><strong>Security:</strong> User data protection</div>
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Testing Implementation Examples */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Testing Implementation Examples</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">React Component Testing</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="font-medium text-gray-800 mb-2">Product Card Test Example</h6>
                    <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
{`describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 29.99,
      image: 'test.jpg'
    };
    
    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('handles add to cart click', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={product} onAddToCart={mockAddToCart} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(mockAddToCart).toHaveBeenCalledWith(product);
  });
});`}
                    </pre>
                    </div>
                    </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">API Route Testing</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="font-medium text-gray-800 mb-2">Products API Test Example</h6>
                    <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
{`describe('/api/products', () => {
  it('GET /api/products returns products list', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
    
    expect(response.body).toHaveProperty('products');
    expect(Array.isArray(response.body.products)).toBe(true);
  });

  it('POST /api/products creates new product', async () => {
    const productData = {
      name: 'New Product',
      price: 19.99,
      description: 'Test product'
    };
    
    const response = await request(app)
      .post('/api/products')
      .send(productData)
      .set('Authorization', 'Bearer valid-token')
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(productData.name);
  });
});`}
                    </pre>
                    </div>
                    </div>
                  </div>
                </div>

            {/* Testing Metrics & Coverage */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Testing Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">95%</div>
                  <div className="text-sm font-medium text-gray-800">Code Coverage</div>
                  <div className="text-xs text-gray-600">Comprehensive test coverage</div>
              </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-2">200+</div>
                  <div className="text-sm font-medium text-gray-800">Test Cases</div>
                  <div className="text-xs text-gray-600">E-commerce specific tests</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-sm font-medium text-gray-800">Pass Rate</div>
                  <div className="text-xs text-gray-600">All tests passing</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-orange-600 mb-2">&lt;5s</div>
                  <div className="text-sm font-medium text-gray-800">Test Runtime</div>
                  <div className="text-xs text-gray-600">Fast execution</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integration-testing':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">E-Commerce Integration Testing</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive integration testing for E-commerce systems to ensure all components work together 
                seamlessly, from frontend to backend, database, and third-party services.
              </p>
            </div>

            {/* E-Commerce Integration Scenarios */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Integration Scenarios</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Shopping Flow Integration</h5>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🛒</span>
                        Complete Purchase Flow
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Flow:</strong> Browse → Add to Cart → Checkout → Payment → Order</div>
                        <div><strong>Components:</strong> Frontend → API → Database → Stripe → Email</div>
                        <div><strong>Validation:</strong> Data consistency, error handling, rollback</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">👤</span>
                        User Authentication Flow
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Flow:</strong> Register → Verify → Login → Session → Profile</div>
                        <div><strong>Components:</strong> Frontend → NextAuth → Database → JWT</div>
                        <div><strong>Validation:</strong> Token validation, session persistence</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Admin & Management Integration</h5>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">📦</span>
                        Product Management Flow
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Flow:</strong> Admin Login → Add Product → Upload Image → Publish</div>
                        <div><strong>Components:</strong> Admin Panel → API → Database → File Storage</div>
                        <div><strong>Validation:</strong> Authorization, data integrity, image processing</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        Order Management Flow
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Flow:</strong> Order Created → Notification → Admin View → Status Update</div>
                        <div><strong>Components:</strong> Database → Email → Admin Panel → Customer</div>
                        <div><strong>Validation:</strong> Real-time updates, notification delivery</div>
                      </div>
                    </div>
                  </div>
                </div>
                      </div>
                    </div>
                    
            {/* Third-Party Service Integration */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Third-Party Service Integration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">💳</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Stripe Payment Integration</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Payment processing flow</div>
                    <div>• Webhook verification</div>
                    <div>• Error handling & retries</div>
                    <div>• Refund processing</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">📧</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Email Service Integration</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Order confirmations</div>
                    <div>• Password reset emails</div>
                    <div>• Admin notifications</div>
                    <div>• Template rendering</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🖼️</div>
                  <h5 className="font-semibold text-gray-800 mb-2">File Storage Integration</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Product image uploads</div>
                    <div>• Image optimization</div>
                    <div>• CDN integration</div>
                    <div>• File security</div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Database Integration Testing */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Database Integration Testing</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Data Flow Testing</h5>
                    <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">User Registration Flow</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Test:</strong> Frontend form → API validation → Database insert</div>
                        <div><strong>Validation:</strong> Data consistency, unique constraints</div>
                        <div><strong>Rollback:</strong> Transaction failure handling</div>
                      </div>
                      </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Order Processing Flow</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Test:</strong> Cart → Order → Payment → Inventory update</div>
                        <div><strong>Validation:</strong> Stock availability, data integrity</div>
                        <div><strong>Rollback:</strong> Payment failure recovery</div>
                    </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Performance & Reliability</h5>
                    <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Query Performance</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Tests:</strong> Product search, pagination, filtering</div>
                        <div><strong>Metrics:</strong> Response time, query optimization</div>
                        <div><strong>Load:</strong> Concurrent user scenarios</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Data Consistency</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Tests:</strong> Transaction integrity, foreign keys</div>
                        <div><strong>Validation:</strong> Referential integrity, constraints</div>
                        <div><strong>Recovery:</strong> Database failure scenarios</div>
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Integration Test Results */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Integration Test Results</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Test Execution Summary</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600 mb-1">48</div>
                          <div className="text-sm text-gray-600">Passed</div>
                        </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-red-600 mb-1">2</div>
                          <div className="text-sm text-gray-600">Failed</div>
                        </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">1</div>
                          <div className="text-sm text-gray-600">Skipped</div>
                        </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600 mb-1">96%</div>
                          <div className="text-sm text-gray-600">Pass Rate</div>
                        </div>
                      </div>
                    </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Integration Coverage</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-sm text-gray-600">Shopping Flow</span>
                      <span className="text-sm font-medium text-green-600">100%</span>
                  </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-sm text-gray-600">Payment Integration</span>
                      <span className="text-sm font-medium text-green-600">100%</span>
                </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-sm text-gray-600">Admin Operations</span>
                      <span className="text-sm font-medium text-green-600">95%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-sm text-gray-600">Email Notifications</span>
                      <span className="text-sm font-medium text-green-600">90%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'performance-testing':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">E-Commerce Performance Testing</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive performance testing for E-commerce applications to ensure optimal user experience 
                under various load conditions, from normal shopping traffic to peak sales periods.
              </p>
            </div>

            {/* E-Commerce Load Testing Scenarios */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Load Testing Scenarios</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Shopping Traffic Scenarios</h5>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🛒</span>
                        Normal Shopping Load
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Users:</strong> 100-200 concurrent users</div>
                        <div><strong>Activities:</strong> Browsing, searching, adding to cart</div>
                        <div><strong>Response Time:</strong> &lt; 2 seconds</div>
                        <div><strong>Uptime:</strong> 99.9% availability</div>
                        </div>
                        </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">💳</span>
                        Checkout Load Testing
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Users:</strong> 50-100 concurrent checkouts</div>
                        <div><strong>Activities:</strong> Payment processing, order creation</div>
                        <div><strong>Response Time:</strong> &lt; 3 seconds</div>
                        <div><strong>Success Rate:</strong> 99.5% transaction success</div>
                      </div>
                    </div>
                        </div>
                        </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Peak Traffic Scenarios</h5>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        Black Friday Load
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Users:</strong> 1000+ concurrent users</div>
                        <div><strong>Activities:</strong> High-volume shopping, flash sales</div>
                        <div><strong>Response Time:</strong> &lt; 5 seconds</div>
                        <div><strong>Peak Duration:</strong> 2-4 hours sustained</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        Stress Testing
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Users:</strong> 2000+ concurrent users</div>
                        <div><strong>Activities:</strong> System breaking point testing</div>
                        <div><strong>Response Time:</strong> Graceful degradation</div>
                        <div><strong>Recovery:</strong> Auto-scaling activation</div>
                      </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Performance Metrics Dashboard */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Performance Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-2">1.2s</div>
                  <div className="text-sm font-medium text-gray-800">Page Load Time</div>
                  <div className="text-xs text-gray-600">Average across all pages</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                  <div className="text-sm font-medium text-gray-800">Uptime</div>
                  <div className="text-xs text-gray-600">Monthly availability</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-purple-600 mb-2">1500</div>
                  <div className="text-sm font-medium text-gray-800">Requests/Second</div>
                  <div className="text-xs text-gray-600">Peak throughput</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-orange-600 mb-2">0.1%</div>
                  <div className="text-sm font-medium text-gray-800">Error Rate</div>
                  <div className="text-xs text-gray-600">Failed requests</div>
                </div>
              </div>
            </div>

            {/* E-Commerce Specific Performance Tests */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Specific Performance Tests</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Shopping Experience Performance</h5>
                    <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Product Search Performance</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Test:</strong> Search 10,000+ products with filters</div>
                        <div><strong>Target:</strong> &lt; 500ms response time</div>
                        <div><strong>Optimization:</strong> Database indexing, search algorithms</div>
                      </div>
                      </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Shopping Cart Performance</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Test:</strong> Add/remove items, update quantities</div>
                        <div><strong>Target:</strong> &lt; 200ms response time</div>
                        <div><strong>Optimization:</strong> State management, API caching</div>
                    </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Payment & Order Performance</h5>
                    <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Payment Processing</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Test:</strong> Stripe payment processing under load</div>
                        <div><strong>Target:</strong> &lt; 3 seconds completion time</div>
                        <div><strong>Optimization:</strong> Payment optimization, retry logic</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Order Processing</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Test:</strong> Order creation and inventory updates</div>
                        <div><strong>Target:</strong> &lt; 1 second processing time</div>
                        <div><strong>Optimization:</strong> Database transactions, queue processing</div>
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Performance Optimization Strategies */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Performance Optimization</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">⚡</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Frontend Optimization</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Code splitting & lazy loading</div>
                    <div>• Image optimization & WebP</div>
                    <div>• Bundle size reduction</div>
                    <div>• Service worker caching</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🗄️</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Database Optimization</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Query optimization & indexing</div>
                    <div>• Connection pooling</div>
                    <div>• Redis caching layer</div>
                    <div>• Database monitoring</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🌐</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Infrastructure</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• CDN implementation</div>
                    <div>• Load balancing</div>
                    <div>• Auto-scaling groups</div>
                    <div>• Edge computing</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Performance Testing */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Security Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Security Test Results</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-sm text-gray-600">SQL Injection Protection</span>
                      <span className="text-sm font-medium text-green-600">✅ Secure</span>
                        </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-sm text-gray-600">XSS Attack Prevention</span>
                      <span className="text-sm font-medium text-green-600">✅ Secure</span>
                        </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-sm text-gray-600">CSRF Protection</span>
                      <span className="text-sm font-medium text-green-600">✅ Secure</span>
                      </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-sm text-gray-600">Payment Security</span>
                      <span className="text-sm font-medium text-green-600">✅ PCI Compliant</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Performance Under Attack</h5>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">DDoS Protection</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Status:</strong> Active protection enabled</div>
                        <div><strong>Capacity:</strong> 10,000+ requests/second</div>
                        <div><strong>Recovery:</strong> &lt; 30 seconds</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">Rate Limiting</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>API Limits:</strong> 100 requests/minute per IP</div>
                        <div><strong>Login Limits:</strong> 5 attempts per minute</div>
                        <div><strong>Effectiveness:</strong> 99.9% attack prevention</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'conclusion':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">E-Commerce Testing Complete</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The comprehensive testing and quality assurance phase for the E-Commerce application has been 
                successfully completed. All critical shopping features, payment processing, and user interactions 
                have been thoroughly tested and validated.
              </p>
            </div>

            {/* E-Commerce Testing Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Testing Summary</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Testing Achievements</h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Complete shopping flow testing (browse → cart → checkout → payment)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Stripe payment integration testing with 100% success rate</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">User authentication and session management validation</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Admin panel functionality and product management testing</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Cross-browser and mobile responsiveness validation</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Quality Metrics Achieved</h5>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">Code Coverage</span>
                        <span className="text-lg font-bold text-blue-600">95%</span>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">Test Pass Rate</span>
                        <span className="text-lg font-bold text-green-600">100%</span>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">Performance Score</span>
                        <span className="text-lg font-bold text-purple-600">98/100</span>
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">Security Score</span>
                        <span className="text-lg font-bold text-orange-600">A+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>

            {/* E-Commerce Features Validated */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Features Validated</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🛒</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Shopping Experience</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Product browsing & search</div>
                    <div>• Shopping cart management</div>
                    <div>• Wishlist functionality</div>
                    <div>• Product filtering & sorting</div>
                  </div>
                  </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">💳</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Payment Processing</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Stripe integration</div>
                    <div>• Order processing</div>
                    <div>• Payment validation</div>
                    <div>• Receipt generation</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">👤</div>
                  <h5 className="font-semibold text-gray-800 mb-2">User Management</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• User registration</div>
                    <div>• Authentication & sessions</div>
                    <div>• Profile management</div>
                    <div>• Order history</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">📦</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Admin Panel</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Product management</div>
                    <div>• Order tracking</div>
                    <div>• User management</div>
                    <div>• Analytics dashboard</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🔐</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Security Features</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Data encryption</div>
                    <div>• Authentication security</div>
                    <div>• Payment security (PCI)</div>
                    <div>• Input validation</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">📱</div>
                  <h5 className="font-semibold text-gray-800 mb-2">Cross-Platform</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Mobile responsiveness</div>
                    <div>• Browser compatibility</div>
                    <div>• Device testing</div>
                    <div>• Accessibility compliance</div>
                  </div>
                  </div>
                </div>
              </div>

            {/* Next Phase: Deployment */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Ready for Production Deployment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Deployment Readiness Checklist</h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">All tests passing with 100% success rate</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Performance benchmarks met (1.2s load time)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Security validation completed (A+ rating)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Cross-browser compatibility verified</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Next Phase: Deployment</h5>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">Infrastructure Setup</h6>
                      <p className="text-sm text-gray-600">Production environment configuration and deployment strategy</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">CI/CD Pipeline</h6>
                      <p className="text-sm text-gray-600">Automated deployment and continuous integration setup</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">Monitoring & Analytics</h6>
                      <p className="text-sm text-gray-600">Application monitoring, logging, and performance tracking</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h6 className="font-medium text-gray-800 mb-2">Go-Live Support</h6>
                      <p className="text-sm text-gray-600">Launch support and initial production monitoring</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 text-center">
              <h4 className="text-2xl font-semibold text-gray-800 mb-4">E-Commerce Testing Complete</h4>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                The E-Commerce application has passed all testing phases and is ready for production deployment. 
                All critical shopping features, payment processing, and user interactions have been validated.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => {
                      unlockNextPhase(projectId, 'testing');
                      navigate(`/student/realtime-projects/${projectId}/deployment`);
                    }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Continue to Deployment Phase
                  </button>
                <button className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                    Download Testing Report
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
          <PhaseNavigationBar currentPhase="testing" />
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
            <h1 className="text-xl font-bold text-gray-800 mb-2">Testing Phase</h1>
            <p className="text-sm text-gray-600">{project.title}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="p-4">
            <nav className="space-y-2">
              {testingTabs.map((tab, index) => {
                const isUnlocked = isModuleUnlocked(projectId, 'testing', tab.id);
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
                          ? 'bg-orange-100 text-orange-700 shadow-sm'
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
                {testingTabs.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedTab === tab.id ? 'bg-red-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-xs ${
                      selectedTab === tab.id ? 'text-red-600 font-medium' : 'text-gray-500'
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
              currentPhase="testing" 
              currentModule={selectedTab}
              onNext={() => {
                // Auto-advance to next module
                const testingTabs = [
                  { id: 'overview' },
                  { id: 'test-planning' },
                  { id: 'unit-testing' },
                  { id: 'integration-testing' },
                  { id: 'performance-testing' },
                  { id: 'conclusion' }
                ];
                const currentIndex = testingTabs.findIndex(tab => tab.id === selectedTab);
                if (currentIndex < testingTabs.length - 1) {
                  setSelectedTab(testingTabs[currentIndex + 1].id);
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

export default TestingPhasePage;
