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

const TechnicalArchitecturePhasePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isModuleUnlocked, unlockNextPhase } = useProjectProgress();

  // Fetch videos for this project
  const { data: videosData, isLoading: videosLoading, error: videosError } = useQuery(
    ['project-videos', projectId],
    () => projectService.getProjectVideos(projectId, { phase: 'Technical Architecture' }),
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
            title: 'Phase 3 - Technical Architecture',
            description: 'Design system architecture and technical specifications',
            phaseNumber: 3,
            phaseType: 'TECH_ARCH',
            estimatedDuration: 12,
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

  const techArchTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '🏗️',
      description: 'Technical architecture overview and objectives'
    },
    {
      id: 'system-architecture',
      label: 'System Architecture',
      icon: '🏛️',
      description: 'High-level system design and components'
    },
    {
      id: 'database-design',
      label: 'Database Design',
      icon: '🗄️',
      description: 'Database schema and data modeling'
    },
    {
      id: 'api-design',
      label: 'API Design',
      icon: '🔌',
      description: 'RESTful API structure and endpoints'
    },
    {
      id: 'security-architecture',
      label: 'Security Architecture',
      icon: '🔒',
      description: 'Security measures and authentication'
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
          <p className="text-gray-600">Loading Technical Architecture Phase...</p>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Technical Architecture Overview</h3>
            
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
                          <span>Phase: {video.phase || 'Technical Architecture'}</span>
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
                        No Technical Architecture phase videos have been uploaded for this project yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                This phase focuses on designing the technical foundation for the {project.title}. 
                The Technical Architecture phase transforms the UI/UX designs into a robust, scalable, 
                and secure technical implementation plan.
              </p>
              
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Phase Objectives</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Design scalable system architecture</li>
                  <li>Create comprehensive database schema</li>
                  <li>Define RESTful API structure</li>
                  <li>Implement security measures and authentication</li>
                  <li>Plan deployment and infrastructure</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Deliverables</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>System Architecture Diagrams</li>
                  <li>Database Schema Design</li>
                  <li>API Documentation</li>
                  <li>Security Implementation Plan</li>
                  <li>Deployment Architecture</li>
                  <li>Technology Stack Documentation</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'system-architecture':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">System Architecture</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                High-level system design showing the overall architecture, technology stack, and component relationships 
                for the E-commerce platform.
              </p>
              
               {project.title === 'E-Commerce Web Application' ? (
               <div className="space-y-8">
                 {/* E-Commerce Architecture SVG Diagram */}
                 <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                   <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                     <span className="text-2xl">🏛️</span>
                     E-Commerce System Architecture
                   </h4>
                   
                   <div className="bg-gray-50 rounded-lg p-6 overflow-x-auto">
                     <div className="flex justify-center">
                       <div className="w-full max-w-4xl">
                         {/* Try multiple approaches to load the SVG */}
                         <div className="relative">
                           <img 
                             src="/ecommerce_architecture.svg" 
                             alt="E-Commerce Architecture Diagram"
                             className="max-w-full h-auto w-full"
                             style={{ minWidth: '800px', minHeight: '300px' }}
                             onLoad={() => {
                               console.log('✅ SVG loaded successfully from /ecommerce_architecture.svg');
                             }}
                             onError={(e) => {
                               console.error('❌ Failed to load SVG from /ecommerce_architecture.svg');
                               console.log('Current URL:', window.location.href);
                               console.log('Expected SVG path:', '/ecommerce_architecture.svg');
                               
                               // Try alternative paths
                               const alternativePaths = [
                                 './ecommerce_architecture.svg',
                                 '../public/ecommerce_architecture.svg',
                                 'ecommerce_architecture.svg'
                               ];
                               
                               let currentPathIndex = 0;
                               const tryNextPath = () => {
                                 if (currentPathIndex < alternativePaths.length) {
                                   const newSrc = alternativePaths[currentPathIndex];
                                   console.log(`Trying alternative path: ${newSrc}`);
                                   e.target.src = newSrc;
                                   currentPathIndex++;
                                 } else {
                                   // All paths failed, show fallback
                                   e.target.style.display = 'none';
                                   const fallback = document.createElement('div');
                                   fallback.className = 'text-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-300';
                                   fallback.innerHTML = `
                                     <div class="text-6xl mb-4">🏗️</div>
                                     <h3 class="text-xl font-bold text-gray-800 mb-2">E-Commerce Architecture Diagram</h3>
                                     <p class="text-gray-600 mb-4">The SVG diagram could not be loaded. Please check the file path.</p>
                                     <div class="text-sm text-gray-500 space-y-1">
                                       <p>Tried paths:</p>
                                       <p>• /ecommerce_architecture.svg</p>
                                       <p>• ./ecommerce_architecture.svg</p>
                                       <p>• ../public/ecommerce_architecture.svg</p>
                                       <p>• ecommerce_architecture.svg</p>
                                     </div>
                                     <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
                                       <p class="text-sm text-yellow-800">
                                         <strong>Solution:</strong> Ensure the file exists at <code>frontend/public/ecommerce_architecture.svg</code>
                                       </p>
                                     </div>
                                   `;
                                   e.target.parentNode.replaceChild(fallback, e.target);
                                 }
                               };
                               
                               e.target.onerror = tryNextPath;
                               tryNextPath();
                             }}
                           />
                         </div>
                       </div>
                     </div>
                     <div className="mt-4 text-center text-sm text-gray-600">
                       <p>Professional E-commerce system architecture diagram showing all components and data flows.</p>
                       <p className="text-xs text-gray-500 mt-2">
                         If the diagram doesn't appear, check the browser console for error messages.
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Architecture Components Explanation */}
                 <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                   <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                     <span className="text-2xl">🔍</span>
                     Key Architecture Components
                   </h4>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     {/* Client Applications */}
                     <div className="space-y-4">
                       <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                         <h5 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                           <span>💻</span>
                           Client Applications
                         </h5>
                         <div className="space-y-2 text-sm text-blue-700">
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                             <span><strong>Desktop Browser:</strong> Full-featured web experience</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                             <span><strong>Mobile Browser:</strong> Responsive mobile interface</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                             <span><strong>Tablet Browser:</strong> Optimized tablet experience</span>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Core Services */}
                     <div className="space-y-4">
                       <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                         <h5 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                           <span>⚡</span>
                           Next.js Application
                         </h5>
                         <div className="space-y-2 text-sm text-green-700">
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                             <span><strong>Frontend:</strong> React-based UI components</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                             <span><strong>API Routes:</strong> Server-side API endpoints</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                             <span><strong>Authentication:</strong> NextAuth.js integration</span>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Data & External Services */}
                     <div className="space-y-4">
                       <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                         <h5 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                           <span>🗄️</span>
                           Data & External Services
                         </h5>
                         <div className="space-y-2 text-sm text-purple-700">
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                             <span><strong>PostgreSQL:</strong> Primary database</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                             <span><strong>Stripe:</strong> Payment processing</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                             <span><strong>Cloudinary:</strong> Image management</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                             <span><strong>Resend:</strong> Email notifications</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                             <span><strong>Vercel:</strong> Hosting & deployment</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Service Layer Details */}
                 <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                   <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                     <span className="text-2xl">🔧</span>
                     Core Services Breakdown
                   </h4>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                       <h5 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                         <span>📦</span>
                         Product Service
                       </h5>
                       <p className="text-sm text-orange-700 mb-3">
                         Manages product catalog, inventory, and product information.
                       </p>
                       <ul className="text-xs text-orange-600 space-y-1">
                         <li>• Product CRUD operations</li>
                         <li>• Inventory management</li>
                         <li>• Product search & filtering</li>
                         <li>• Image handling via Cloudinary</li>
                       </ul>
                     </div>

                     <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                       <h5 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                         <span>🛒</span>
                         Cart Service
                       </h5>
                       <p className="text-sm text-blue-700 mb-3">
                         Handles shopping cart operations and session management.
                       </p>
                       <ul className="text-xs text-blue-600 space-y-1">
                         <li>• Add/remove items from cart</li>
                         <li>• Cart persistence</li>
                         <li>• Quantity updates</li>
                         <li>• Cart validation</li>
                       </ul>
                     </div>

                     <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                       <h5 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                         <span>📑</span>
                         Order Service
                       </h5>
                       <p className="text-sm text-green-700 mb-3">
                         Manages order processing, tracking, and fulfillment.
                       </p>
                       <ul className="text-xs text-green-600 space-y-1">
                         <li>• Order creation & tracking</li>
                         <li>• Order status management</li>
                         <li>• Order history</li>
                         <li>• Email notifications via Resend</li>
                       </ul>
                     </div>

                     <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                       <h5 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                         <span>💳</span>
                         Payment Service
                       </h5>
                       <p className="text-sm text-red-700 mb-3">
                         Handles secure payment processing and transactions.
                       </p>
                       <ul className="text-xs text-red-600 space-y-1">
                         <li>• Stripe payment integration</li>
                         <li>• Payment validation</li>
                         <li>• Transaction logging</li>
                         <li>• Refund processing</li>
                       </ul>
                     </div>

                     <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                       <h5 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                         <span>🔐</span>
                         Auth Service
                       </h5>
                       <p className="text-sm text-indigo-700 mb-3">
                         Manages user authentication and authorization.
                       </p>
                       <ul className="text-xs text-indigo-600 space-y-1">
                         <li>• User login/logout</li>
                         <li>• JWT token management</li>
                         <li>• Session handling</li>
                         <li>• Role-based access control</li>
                       </ul>
                     </div>

                     <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                       <h5 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                         <span>☁️</span>
                         Vercel Hosting
                       </h5>
                       <p className="text-sm text-gray-700 mb-3">
                         Provides hosting, deployment, and CDN services.
                       </p>
                       <ul className="text-xs text-gray-600 space-y-1">
                         <li>• Automatic deployments</li>
                         <li>• Global CDN</li>
                         <li>• SSL certificates</li>
                         <li>• Performance optimization</li>
                       </ul>
                     </div>
                   </div>
                 </div>

                {/* Technology Stack */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">⚙️</span>
                    Technology Stack
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-3">Frontend</h5>
                        <ul className="space-y-2 text-sm text-blue-700">
                          <li>• Next.js 14+ (App Router)</li>
                          <li>• TypeScript</li>
                          <li>• Tailwind CSS + Shadcn/ui</li>
                          <li>• Zustand (State Management)</li>
                          <li>• React Hook Form</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-3">Backend</h5>
                        <ul className="space-y-2 text-sm text-green-700">
                          <li>• Next.js API Routes</li>
                          <li>• PostgreSQL (Neon Serverless)</li>
                          <li>• Prisma (ORM)</li>
                          <li>• NextAuth.js</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-3">External Services</h5>
                        <ul className="space-y-2 text-sm text-purple-700">
                          <li>• Stripe (Payments)</li>
                          <li>• Cloudinary (Images)</li>
                          <li>• Resend (Email)</li>
                          <li>• Vercel (Hosting)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                 {/* Data Flow Architecture */}
                 <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                   <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                     <span className="text-2xl">🔄</span>
                     Data Flow Architecture
                   </h4>
                   
                   <div className="space-y-6">
                     {/* Customer Journey Flow */}
                     <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                       <h5 className="font-bold text-gray-800 mb-4 text-center">Customer Purchase Journey</h5>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200 text-center">
                           <div className="text-2xl mb-2">🛍️</div>
                           <div className="font-bold text-blue-800 text-sm">Browse Products</div>
                           <div className="text-xs text-gray-600 mt-1">Product Service</div>
                         </div>
                         <div className="text-center text-gray-500 flex items-center justify-center">→</div>
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-200 text-center">
                           <div className="text-2xl mb-2">🛒</div>
                           <div className="font-bold text-orange-800 text-sm">Add to Cart</div>
                           <div className="text-xs text-gray-600 mt-1">Cart Service</div>
                         </div>
                         <div className="text-center text-gray-500 flex items-center justify-center">→</div>
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200 text-center">
                           <div className="text-2xl mb-2">💳</div>
                           <div className="font-bold text-green-800 text-sm">Checkout</div>
                           <div className="text-xs text-gray-600 mt-1">Payment Service</div>
                         </div>
                         <div className="text-center text-gray-500 flex items-center justify-center">→</div>
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200 text-center">
                           <div className="text-2xl mb-2">📑</div>
                           <div className="font-bold text-purple-800 text-sm">Order Confirmation</div>
                           <div className="text-xs text-gray-600 mt-1">Order Service</div>
                         </div>
                       </div>
                     </div>

                     {/* Admin Management Flow */}
                     <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                       <h5 className="font-bold text-gray-800 mb-4 text-center">Admin Management Flow</h5>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-200 text-center">
                           <div className="text-2xl mb-2">📊</div>
                           <div className="font-bold text-indigo-800 text-sm">Dashboard</div>
                           <div className="text-xs text-gray-600 mt-1">Analytics & Overview</div>
                         </div>
                         <div className="text-center text-gray-500 flex items-center justify-center">→</div>
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-200 text-center">
                           <div className="text-2xl mb-2">📦</div>
                           <div className="font-bold text-orange-800 text-sm">Manage Products</div>
                           <div className="text-xs text-gray-600 mt-1">Product Service</div>
                         </div>
                         <div className="text-center text-gray-500 flex items-center justify-center">→</div>
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200 text-center">
                           <div className="text-2xl mb-2">📑</div>
                           <div className="font-bold text-green-800 text-sm">Process Orders</div>
                           <div className="text-xs text-gray-600 mt-1">Order Service</div>
                         </div>
                       </div>
                     </div>

                     {/* Authentication Flow */}
                     <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-6">
                       <h5 className="font-bold text-gray-800 mb-4 text-center">Authentication & Security Flow</h5>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-red-200 text-center">
                           <div className="text-2xl mb-2">🔐</div>
                           <div className="font-bold text-red-800 text-sm">User Login</div>
                           <div className="text-xs text-gray-600 mt-1">Auth Service</div>
                         </div>
                         <div className="text-center text-gray-500 flex items-center justify-center">→</div>
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-yellow-200 text-center">
                           <div className="text-2xl mb-2">🎫</div>
                           <div className="font-bold text-yellow-800 text-sm">JWT Token</div>
                           <div className="text-xs text-gray-600 mt-1">Session Management</div>
                         </div>
                         <div className="text-center text-gray-500 flex items-center justify-center">→</div>
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200 text-center">
                           <div className="text-2xl mb-2">🛡️</div>
                           <div className="font-bold text-blue-800 text-sm">API Protection</div>
                           <div className="text-xs text-gray-600 mt-1">Middleware</div>
                         </div>
                         <div className="text-center text-gray-500 flex items-center justify-center">→</div>
                         <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200 text-center">
                           <div className="text-2xl mb-2">✅</div>
                           <div className="font-bold text-green-800 text-sm">Authorized Access</div>
                           <div className="text-xs text-gray-600 mt-1">Service Layer</div>
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
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">System Architecture</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Frontend Layer</h5>
                        <p className="text-sm text-gray-600">User interface and client-side logic</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Backend Layer</h5>
                        <p className="text-sm text-gray-600">Server-side logic and API endpoints</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'database-design':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Database Design</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                Comprehensive database schema design using Prisma ORM with PostgreSQL, 
                including all entities, relationships, and constraints for the E-commerce platform.
              </p>
              
              {project.title === 'E-Commerce Web Application' ? (
              <div className="space-y-8">
                {/* Database Schema Diagram */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🗄️</span>
                    Database Schema
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-6 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 font-mono text-xs">
                        <div className="text-center font-bold mb-6 text-lg">E-Commerce Database Schema</div>
                        
                        {/* User Table */}
                        <div className="border-2 border-blue-300 rounded-lg p-4 mb-4">
                          <div className="font-bold text-blue-800 mb-2">User Table</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>id: String (PK)</span>
                              <span className="text-gray-500">@id @default(cuid())</span>
                            </div>
                            <div className="flex justify-between">
                              <span>email: String</span>
                              <span className="text-gray-500">@unique</span>
                            </div>
                            <div className="flex justify-between">
                              <span>name: String?</span>
                              <span className="text-gray-500">optional</span>
                            </div>
                            <div className="flex justify-between">
                              <span>password: String?</span>
                              <span className="text-gray-500">hashed</span>
                            </div>
                            <div className="flex justify-between">
                              <span>createdAt: DateTime</span>
                              <span className="text-gray-500">@default(now())</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Product Table */}
                        <div className="border-2 border-green-300 rounded-lg p-4 mb-4">
                          <div className="font-bold text-green-800 mb-2">Product Table</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>id: String (PK)</span>
                              <span className="text-gray-500">@id @default(cuid())</span>
                            </div>
                            <div className="flex justify-between">
                              <span>name: String</span>
                              <span className="text-gray-500">required</span>
                            </div>
                            <div className="flex justify-between">
                              <span>description: String?</span>
                              <span className="text-gray-500">optional</span>
                            </div>
                            <div className="flex justify-between">
                              <span>price: Decimal</span>
                              <span className="text-gray-500">@db.Decimal(10, 2)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>stock: Int</span>
                              <span className="text-gray-500">@default(0)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>isActive: Boolean</span>
                              <span className="text-gray-500">@default(true)</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Order Table */}
                        <div className="border-2 border-purple-300 rounded-lg p-4 mb-4">
                          <div className="font-bold text-purple-800 mb-2">Order Table</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>id: String (PK)</span>
                              <span className="text-gray-500">@id @default(cuid())</span>
                            </div>
                            <div className="flex justify-between">
                              <span>orderNumber: String</span>
                              <span className="text-gray-500">@unique</span>
                            </div>
                            <div className="flex justify-between">
                              <span>userId: String (FK)</span>
                              <span className="text-gray-500">→ User.id</span>
                            </div>
                            <div className="flex justify-between">
                              <span>total: Decimal</span>
                              <span className="text-gray-500">@db.Decimal(10, 2)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>status: OrderStatus</span>
                              <span className="text-gray-500">enum</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Relationships */}
                        <div className="border-2 border-orange-300 rounded-lg p-4">
                          <div className="font-bold text-orange-800 mb-2">Relationships</div>
                          <div className="space-y-1 text-sm">
                            <div>User → Order (1:many)</div>
                            <div>User → CartItem (1:many)</div>
                            <div>Product → OrderItem (1:many)</div>
                            <div>Product → CartItem (1:many)</div>
                            <div>Order → OrderItem (1:many)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Flow Diagram */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🔄</span>
                    Database Operations Flow
                  </h4>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                          <div className="font-bold text-blue-800">API Request</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                          <div className="font-bold text-green-800">Prisma ORM</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
                          <div className="font-bold text-purple-800">PostgreSQL</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-200">
                          <div className="font-bold text-orange-800">Query Result</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-red-200">
                          <div className="font-bold text-red-800">Data Processing</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-200">
                          <div className="font-bold text-indigo-800">API Response</div>
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
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Database Design</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Entity Design</h5>
                        <p className="text-sm text-gray-600">Core entities and their attributes</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Relationships</h5>
                        <p className="text-sm text-gray-600">Entity relationships and constraints</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'api-design':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">API Design</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                RESTful API structure with comprehensive endpoints for all E-commerce functionality, 
                including authentication, product management, cart operations, and order processing.
              </p>
              
              {project.title === 'E-Commerce Web Application' ? (
              <div className="space-y-8">
                {/* API Structure Diagram */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🔌</span>
                    API Structure
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-6 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 font-mono text-sm">
                        <div className="text-center font-bold mb-6 text-lg">API Endpoints Structure</div>
                        
                        <div className="space-y-4">
                          <div className="border border-blue-200 rounded p-3">
                            <div className="font-bold text-blue-800 mb-2">Authentication</div>
                            <div className="space-y-1 text-xs">
                              <div>POST /api/auth/login</div>
                              <div>POST /api/auth/register</div>
                              <div>POST /api/auth/logout</div>
                            </div>
                          </div>
                          
                          <div className="border border-green-200 rounded p-3">
                            <div className="font-bold text-green-800 mb-2">Products</div>
                            <div className="space-y-1 text-xs">
                              <div>GET /api/products</div>
                              <div>GET /api/products/[id]</div>
                              <div>POST /api/admin/products</div>
                              <div>PUT /api/admin/products/[id]</div>
                            </div>
                          </div>
                          
                          <div className="border border-purple-200 rounded p-3">
                            <div className="font-bold text-purple-800 mb-2">Cart</div>
                            <div className="space-y-1 text-xs">
                              <div>GET /api/cart</div>
                              <div>POST /api/cart</div>
                              <div>PUT /api/cart/[id]</div>
                              <div>DELETE /api/cart/[id]</div>
                            </div>
                          </div>
                          
                          <div className="border border-orange-200 rounded p-3">
                            <div className="font-bold text-orange-800 mb-2">Orders</div>
                            <div className="space-y-1 text-xs">
                              <div>GET /api/orders</div>
                              <div>POST /api/orders</div>
                              <div>GET /api/orders/[id]</div>
                              <div>PUT /api/admin/orders/[id]</div>
                            </div>
                          </div>
                          
                          <div className="border border-red-200 rounded p-3">
                            <div className="font-bold text-red-800 mb-2">Payments</div>
                            <div className="space-y-1 text-xs">
                              <div>POST /api/payments/create</div>
                              <div>POST /api/payments/webhook</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Flow Diagram */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🔄</span>
                    API Request Flow
                  </h4>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                          <div className="font-bold text-blue-800">Client Request</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                          <div className="font-bold text-green-800">API Route</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
                          <div className="font-bold text-purple-800">Middleware</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-200">
                          <div className="font-bold text-orange-800">Controller</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-red-200">
                          <div className="font-bold text-red-800">Service Layer</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-200">
                          <div className="font-bold text-indigo-800">Database</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-200">
                          <div className="font-bold text-pink-800">Response</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-200">
                          <div className="font-bold text-emerald-800">JSON Format</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-yellow-200">
                          <div className="font-bold text-yellow-800">Client</div>
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
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">API Design</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">RESTful Endpoints</h5>
                        <p className="text-sm text-gray-600">API routes and HTTP methods</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Request/Response</h5>
                        <p className="text-sm text-gray-600">Data formats and validation</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'security-architecture':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Security Architecture</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                Comprehensive security implementation including authentication, authorization, 
                data protection, and compliance measures for the E-commerce platform.
              </p>
              
              {project.title === 'E-Commerce Web Application' ? (
              <div className="space-y-8">
                {/* Security Layers Diagram */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    Security Architecture
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-6 overflow-x-auto">
                    <div className="min-w-max">
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 font-mono text-sm">
                        <div className="text-center font-bold mb-6 text-lg">Security Implementation</div>
                        
                        <div className="space-y-4">
                          <div className="border border-red-200 rounded p-3">
                            <div className="font-bold text-red-800 mb-2">Authentication Layer</div>
                            <div className="space-y-1 text-xs">
                              <div>• NextAuth.js JWT tokens</div>
                              <div>• Password hashing (bcrypt)</div>
                              <div>• Session management</div>
                              <div>• Multi-factor authentication</div>
                            </div>
                          </div>
                          
                          <div className="border border-orange-200 rounded p-3">
                            <div className="font-bold text-orange-800 mb-2">Authorization Layer</div>
                            <div className="space-y-1 text-xs">
                              <div>• Role-based access control</div>
                              <div>• API route protection</div>
                              <div>• Admin-only endpoints</div>
                              <div>• Resource-level permissions</div>
                            </div>
                          </div>
                          
                          <div className="border border-yellow-200 rounded p-3">
                            <div className="font-bold text-yellow-800 mb-2">Data Protection</div>
                            <div className="space-y-1 text-xs">
                              <div>• SQL injection prevention (Prisma)</div>
                              <div>• XSS protection (React)</div>
                              <div>• CSRF protection</div>
                              <div>• Input validation & sanitization</div>
                            </div>
                          </div>
                          
                          <div className="border border-green-200 rounded p-3">
                            <div className="font-bold text-green-800 mb-2">Network Security</div>
                            <div className="space-y-1 text-xs">
                              <div>• HTTPS enforcement</div>
                              <div>• CORS configuration</div>
                              <div>• Rate limiting</div>
                              <div>• Security headers</div>
                            </div>
                          </div>
                          
                          <div className="border border-blue-200 rounded p-3">
                            <div className="font-bold text-blue-800 mb-2">Payment Security</div>
                            <div className="space-y-1 text-xs">
                              <div>• Stripe PCI DSS compliance</div>
                              <div>• Tokenized payments</div>
                              <div>• Secure webhook handling</div>
                              <div>• Payment data encryption</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Flow Diagram */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🛡️</span>
                    Security Flow
                  </h4>
                  
                  <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-red-200">
                          <div className="font-bold text-red-800">User Login</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-orange-200">
                          <div className="font-bold text-orange-800">Credential Validation</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-yellow-200">
                          <div className="font-bold text-yellow-800">JWT Token</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-green-200">
                          <div className="font-bold text-green-800">API Request</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                          <div className="font-bold text-blue-800">Token Verification</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
                          <div className="font-bold text-purple-800">Access Control</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-200">
                          <div className="font-bold text-pink-800">Data Processing</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-200">
                          <div className="font-bold text-indigo-800">Encryption</div>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-emerald-200">
                          <div className="font-bold text-emerald-800">Secure Response</div>
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
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Security Architecture</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Authentication</h5>
                        <p className="text-sm text-gray-600">User authentication and session management</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">Authorization</h5>
                        <p className="text-sm text-gray-600">Access control and permissions</p>
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
                The Technical Architecture phase has been completed successfully for the {project.title} project. 
                This phase has established a solid technical foundation for building a robust, scalable, 
                and secure E-commerce platform.
              </p>
              
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Technical Architecture Summary</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Comprehensive system architecture designed with Next.js and PostgreSQL</li>
                  <li>Complete database schema with Prisma ORM implementation</li>
                  <li>RESTful API structure with all necessary endpoints</li>
                  <li>Robust security implementation with authentication and authorization</li>
                  <li>Scalable deployment architecture ready for production</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Next Phase: Development</h4>
                <p className="text-gray-600 mb-4">
                  With the technical architecture completed, the next phase will focus on implementing 
                  the designed system using the specified technology stack and following the established patterns.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Frontend Development</h5>
                    <p className="text-sm text-gray-600">Implement React components and user interfaces</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Backend Development</h5>
                    <p className="text-sm text-gray-600">Build API endpoints and business logic</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Database Implementation</h5>
                    <p className="text-sm text-gray-600">Set up database and run migrations</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">Integration & Testing</h5>
                    <p className="text-sm text-gray-600">Connect all components and test functionality</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Ready to Proceed?</h4>
                <p className="text-gray-600 mb-4">
                  This Technical Architecture phase is now complete. You can proceed to the next phase (Development) 
                  or review any section of this document as needed.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      unlockNextPhase(projectId, 'tech_arch');
                      navigate(`/realtime-projects/${projectId}/development`);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Continue to Development
                  </button>
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Download Technical Architecture Document
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
          <PhaseNavigationBar currentPhase="tech_arch" />
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
            <h1 className="text-xl font-bold text-gray-800 mb-2">Technical Architecture Phase</h1>
            <p className="text-sm text-gray-600">{project.title}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="p-4">
            <nav className="space-y-2">
              {techArchTabs.map((tab, index) => {
                const isUnlocked = isModuleUnlocked(projectId, 'tech_arch', tab.id);
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
                {techArchTabs.map((tab) => (
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
              currentPhase="tech_arch" 
              currentModule={selectedTab}
              onNext={() => {
                // Auto-advance to next module
                const techArchTabs = [
                  { id: 'overview' },
                  { id: 'system-architecture' },
                  { id: 'database-design' },
                  { id: 'api-design' },
                  { id: 'security-architecture' },
                  { id: 'conclusion' }
                ];
                const currentIndex = techArchTabs.findIndex(tab => tab.id === selectedTab);
                if (currentIndex < techArchTabs.length - 1) {
                  setSelectedTab(techArchTabs[currentIndex + 1].id);
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

export default TechnicalArchitecturePhasePage;
