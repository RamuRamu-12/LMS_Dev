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

const DeploymentPhasePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isModuleUnlocked, unlockNextPhase } = useProjectProgress();

  // Fetch videos for this project
  const { data: videosData, isLoading: videosLoading, error: videosError } = useQuery(
    ['project-videos', projectId],
    () => projectService.getProjectVideos(projectId, { phase: 'Deployment' }),
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
          },
          {
            id: 5,
            title: 'Phase 5 - Testing & Quality Assurance',
            description: 'Comprehensive testing and quality assurance',
            phaseNumber: 5,
            phaseType: 'TESTING',
            estimatedDuration: 8,
            order: 5
          },
          {
            id: 6,
            title: 'Phase 6 - Deployment',
            description: 'Deploy application to production and maintain operations',
            phaseNumber: 6,
            phaseType: 'DEPLOYMENT',
            estimatedDuration: 6,
            order: 6
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
          },
          {
            id: 11,
            title: 'Phase 6 - Deployment',
            description: 'Deploy analytics platform and data pipelines',
            phaseNumber: 6,
            phaseType: 'DEPLOYMENT',
            estimatedDuration: 5,
            order: 6
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
          },
          {
            id: 16,
            title: 'Phase 6 - Deployment',
            description: 'Deploy AI models and learning platform',
            phaseNumber: 6,
            phaseType: 'DEPLOYMENT',
            estimatedDuration: 7,
            order: 6
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

  const deploymentTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '🚀',
      description: 'Deployment phase overview and objectives'
    },
    {
      id: 'deployment-planning',
      label: 'Deployment Planning',
      icon: '📋',
      description: 'Deployment possibilities and setup strategies'
    },
    {
      id: 'environment-setup',
      label: 'Environment Setup',
      icon: '🏗️',
      description: 'Local and cloud environment configuration'
    },
    {
      id: 'final-steps',
      label: 'Final Steps',
      icon: '🎉',
      description: 'Project completion and code download'
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
          <p className="text-gray-600">Loading Deployment Phase...</p>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Deployment Overview</h3>
            
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
                          <span>Phase: {video.phase || 'Deployment'}</span>
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
                        No Deployment phase videos have been uploaded for this project yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                This phase focuses on deploying the {project.title} to production environments and ensuring 
                smooth operation with proper monitoring, maintenance, and scalability measures in place.
              </p>
              
              <div className="bg-orange-50 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Phase Objectives</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Deploy application to production environment</li>
                  <li>Set up monitoring and logging systems</li>
                  <li>Implement CI/CD pipeline for automated deployments</li>
                  <li>Configure load balancing and auto-scaling</li>
                  <li>Establish backup and disaster recovery procedures</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Deliverables</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Production-ready application deployment</li>
                  <li>Environment configuration and setup</li>
                  <li>CI/CD pipeline implementation</li>
                  <li>Monitoring and alerting systems</li>
                  <li>Documentation and runbooks</li>
                  <li>Performance optimization and scaling plan</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'deployment-planning':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">E-Commerce Deployment Planning</h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive deployment strategy for E-commerce applications covering local development 
                setup and cloud deployment options for production environments.
              </p>
            </div>

            {/* Deployment Possibilities */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Deployment Possibilities</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Local Development</h5>
                    <div className="space-y-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">💻</span>
                        Local Machine Setup
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Purpose:</strong> Development and testing</div>
                        <div><strong>Requirements:</strong> Node.js, PostgreSQL, Git</div>
                        <div><strong>Benefits:</strong> Fast development, offline work</div>
                        <div><strong>Limitations:</strong> Single user, limited scalability</div>
                      </div>
                      </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🐳</span>
                        Docker Local Setup
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Purpose:</strong> Containerized development</div>
                        <div><strong>Requirements:</strong> Docker, Docker Compose</div>
                        <div><strong>Benefits:</strong> Consistent environment, easy setup</div>
                        <div><strong>Use Case:</strong> Team development, production-like setup</div>
                    </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Cloud Deployment</h5>
                    <div className="space-y-3">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">☁️</span>
                        AWS Deployment
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Services:</strong> EC2, RDS, S3, CloudFront</div>
                        <div><strong>Benefits:</strong> Scalable, reliable, global reach</div>
                        <div><strong>Cost:</strong> Pay-as-you-use, enterprise-grade</div>
                        <div><strong>Best For:</strong> Production, high-traffic applications</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <h6 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🌐</span>
                        Google Cloud Platform
                      </h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Services:</strong> Compute Engine, Cloud SQL, Storage</div>
                        <div><strong>Benefits:</strong> AI/ML integration, global network</div>
                        <div><strong>Cost:</strong> Competitive pricing, free tier</div>
                        <div><strong>Best For:</strong> Data-driven applications, analytics</div>
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Local Deployment Setup Scripts */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Local Deployment Setup</h4>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h5 className="text-lg font-medium text-gray-800 mb-4">Prerequisites Installation</h5>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Node.js & npm Installation</h6>
                      <pre className="text-sm text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
{`# Install Node.js (LTS version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version`}
                      </pre>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">PostgreSQL Installation</h6>
                      <pre className="text-sm text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
{`# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h5 className="text-lg font-medium text-gray-800 mb-4">E-Commerce Application Setup</h5>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Clone and Install Dependencies</h6>
                      <pre className="text-sm text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
{`# Clone the repository
git clone https://github.com/your-username/ecommerce-app.git
cd ecommerce-app

# Install dependencies
npm install

# Install Prisma CLI globally
npm install -g prisma`}
                      </pre>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Environment Configuration</h6>
                      <pre className="text-sm text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
{`# Create environment file
cp .env.example .env

# Configure environment variables
DATABASE_URL="postgresql://ecommerce_user:your_password@localhost:5432/ecommerce_db"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"`}
                      </pre>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">Database Setup and Migration</h6>
                      <pre className="text-sm text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
{`# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database with sample data
npx prisma db seed

# Start the development server
npm run dev`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Deployment Options */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Cloud Deployment Options</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">AWS Deployment</h5>
                  <div className="space-y-3">
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <h6 className="font-semibold text-gray-800 mb-2">AWS Services Setup</h6>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div><strong>EC2 Instance:</strong> t3.medium (2 vCPU, 4GB RAM)</div>
                        <div><strong>RDS PostgreSQL:</strong> db.t3.micro for development</div>
                        <div><strong>S3 Bucket:</strong> For file storage and static assets</div>
                        <div><strong>CloudFront:</strong> CDN for global content delivery</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">AWS Deployment Script</h6>
                      <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
{`# AWS CLI setup
aws configure

# Create EC2 instance
aws ec2 run-instances \\
  --image-id ami-0c02fb55956c7d316 \\
  --instance-type t3.medium \\
  --key-name your-key-pair \\
  --security-group-ids sg-xxxxxxxxx \\
  --subnet-id subnet-xxxxxxxxx

# Install dependencies on EC2
sudo apt update
sudo apt install nodejs npm postgresql-client
git clone https://github.com/your-username/ecommerce-app.git
cd ecommerce-app
npm install
npm run build`}
                      </pre>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Google Cloud Platform</h5>
                  <div className="space-y-3">
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h6 className="font-semibold text-gray-800 mb-2">GCP Services Setup</h6>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div><strong>Compute Engine:</strong> e2-medium (2 vCPU, 4GB RAM)</div>
                        <div><strong>Cloud SQL:</strong> PostgreSQL instance</div>
                        <div><strong>Cloud Storage:</strong> For file storage and backups</div>
                        <div><strong>Cloud CDN:</strong> Global content delivery</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-medium text-gray-800 mb-2">GCP Deployment Script</h6>
                      <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
{`# GCP CLI setup
gcloud auth login
gcloud config set project your-project-id

# Create Compute Engine instance
gcloud compute instances create ecommerce-app \\
  --zone=us-central1-a \\
  --machine-type=e2-medium \\
  --image-family=ubuntu-2004-lts \\
  --image-project=ubuntu-os-cloud \\
  --boot-disk-size=20GB

# Deploy application
gcloud compute scp --recurse ./ecommerce-app ecommerce-app:~/`}
                      </pre>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Deployment Checklist */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Deployment Checklist</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Pre-Deployment</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Code review and testing completed</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Environment variables configured</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Database migrations ready</span>
                  </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">SSL certificates obtained</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Post-Deployment</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Application health checks passing</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Domain and DNS configured</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Backup procedures tested</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                      <span className="text-sm text-gray-700">Performance monitoring active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'environment-setup':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Environment Setup</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                Environment setup involves configuring development, staging, and production environments 
                with appropriate security, performance, and monitoring configurations.
              </p>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Environment Configuration</h4>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">Development Environment</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-medium text-gray-700 mb-1">Configuration</h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Local development server</li>
                            <li>• Debug mode enabled</li>
                            <li>• Hot reloading active</li>
                            <li>• Mock data and services</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-700 mb-1">Access</h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Developer team only</li>
                            <li>• No authentication required</li>
                            <li>• Full debugging access</li>
                            <li>• Test data available</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">Staging Environment</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-medium text-gray-700 mb-1">Configuration</h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Production-like setup</li>
                            <li>• Performance monitoring</li>
                            <li>• Real database (test data)</li>
                            <li>• Load balancing enabled</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-700 mb-1">Access</h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• QA team and stakeholders</li>
                            <li>• User acceptance testing</li>
                            <li>• Performance testing</li>
                            <li>• Security testing</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">Production Environment</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-medium text-gray-700 mb-1">Configuration</h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• High availability setup</li>
                            <li>• Auto-scaling enabled</li>
                            <li>• CDN integration</li>
                            <li>• Full monitoring suite</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-700 mb-1">Access</h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• End users and customers</li>
                            <li>• Restricted admin access</li>
                            <li>• Audit logging enabled</li>
                            <li>• 24/7 monitoring</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Environment Variables</h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">Database Configuration</h5>
                      <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                        <div>DATABASE_URL=postgresql://user:pass@host:5432/dbname</div>
                        <div>DB_POOL_SIZE=20</div>
                        <div>DB_TIMEOUT=30000</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">API Configuration</h5>
                      <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                        <div>API_BASE_URL=https://api.example.com</div>
                        <div>JWT_SECRET=your-secret-key</div>
                        <div>RATE_LIMIT=1000</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">External Services</h5>
                      <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                        <div>PAYMENT_API_KEY=sk_live_...</div>
                        <div>EMAIL_SERVICE_URL=https://api.sendgrid.com</div>
                        <div>CDN_URL=https://cdn.example.com</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

       case 'final-steps':
        return (
           <div className="space-y-8">
             <div className="text-center">
               <h3 className="text-4xl font-bold text-gray-800 mb-4">🎉 Congratulations!</h3>
               <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                 You have successfully completed all phases of the E-Commerce application development! 
                 From planning to deployment, you've built a comprehensive, production-ready application.
               </p>
                    </div>
                    
             {/* Achievement Summary */}
             <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-200">
               <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Project Completion Summary</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                   <div className="text-3xl mb-3">📋</div>
                   <h5 className="font-semibold text-gray-800 mb-2">BRD Phase</h5>
                   <p className="text-sm text-gray-600">Requirements defined and documented</p>
                      </div>
                 <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                   <div className="text-3xl mb-3">🎨</div>
                   <h5 className="font-semibold text-gray-800 mb-2">UI/UX Design</h5>
                   <p className="text-sm text-gray-600">User interface and experience designed</p>
                    </div>
                 <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                   <div className="text-3xl mb-3">🏗️</div>
                   <h5 className="font-semibold text-gray-800 mb-2">Architecture</h5>
                   <p className="text-sm text-gray-600">System architecture planned</p>
                      </div>
                 <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                   <div className="text-3xl mb-3">💻</div>
                   <h5 className="font-semibold text-gray-800 mb-2">Development</h5>
                   <p className="text-sm text-gray-600">Full-stack application built</p>
                    </div>
                 <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                   <div className="text-3xl mb-3">🧪</div>
                   <h5 className="font-semibold text-gray-800 mb-2">Testing</h5>
                   <p className="text-sm text-gray-600">Comprehensive testing completed</p>
                      </div>
                 <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                   <div className="text-3xl mb-3">🚀</div>
                   <h5 className="font-semibold text-gray-800 mb-2">Deployment</h5>
                   <p className="text-sm text-gray-600">Application deployed and ready</p>
                    </div>
                  </div>
                </div>

             {/* E-Commerce Features Delivered */}
             <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
               <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">E-Commerce Features Delivered</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                   <div className="text-3xl mb-3">🛒</div>
                   <h5 className="font-semibold text-gray-800 mb-2">Shopping Experience</h5>
                   <div className="text-sm text-gray-600 space-y-1">
                     <div>• Product browsing & search</div>
                     <div>• Shopping cart management</div>
                     <div>• Wishlist functionality</div>
                     <div>• Product filtering & sorting</div>
                      </div>
                    </div>
                 <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                   <div className="text-3xl mb-3">💳</div>
                   <h5 className="font-semibold text-gray-800 mb-2">Payment Processing</h5>
                   <div className="text-sm text-gray-600 space-y-1">
                     <div>• Stripe integration</div>
                     <div>• Secure payment processing</div>
                     <div>• Order management</div>
                     <div>• Receipt generation</div>
                      </div>
                    </div>
                 <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                   <div className="text-3xl mb-3">👤</div>
                   <h5 className="font-semibold text-gray-800 mb-2">User Management</h5>
                   <div className="text-sm text-gray-600 space-y-1">
                     <div>• User registration & login</div>
                     <div>• Profile management</div>
                     <div>• Order history</div>
                     <div>• Session management</div>
                  </div>
                </div>
                 <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                   <div className="text-3xl mb-3">📦</div>
                   <h5 className="font-semibold text-gray-800 mb-2">Admin Panel</h5>
                   <div className="text-sm text-gray-600 space-y-1">
                     <div>• Product management</div>
                     <div>• Order tracking</div>
                     <div>• User management</div>
                     <div>• Analytics dashboard</div>
                    </div>
                    </div>
                 <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                   <div className="text-3xl mb-3">🔐</div>
                   <h5 className="font-semibold text-gray-800 mb-2">Security Features</h5>
                   <div className="text-sm text-gray-600 space-y-1">
                     <div>• Data encryption</div>
                     <div>• Authentication security</div>
                     <div>• Payment security (PCI)</div>
                     <div>• Input validation</div>
                    </div>
                    </div>
                 <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
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

             {/* Technology Stack */}
             <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
               <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Technology Stack Implemented</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                   <div className="text-2xl mb-2">⚛️</div>
                   <div className="text-sm font-medium text-gray-800">React & Next.js</div>
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
                   <div className="text-2xl mb-2">💳</div>
                   <div className="text-sm font-medium text-gray-800">Stripe</div>
                      </div>
                 <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                   <div className="text-2xl mb-2">🎨</div>
                   <div className="text-sm font-medium text-gray-800">Tailwind CSS</div>
                      </div>
                 <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                   <div className="text-2xl mb-2">🔐</div>
                   <div className="text-sm font-medium text-gray-800">NextAuth</div>
                    </div>
                 <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                   <div className="text-2xl mb-2">☁️</div>
                   <div className="text-sm font-medium text-gray-800">AWS/GCP</div>
                  </div>
                 <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                   <div className="text-2xl mb-2">🧪</div>
                   <div className="text-sm font-medium text-gray-800">Jest & Cypress</div>
                </div>
                      </div>
                    </div>
                    
             {/* Download Code Section */}
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200 text-center">
               <h4 className="text-3xl font-semibold text-gray-800 mb-4">Download Your E-Commerce Application</h4>
               <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                 Your complete E-Commerce application is ready! Download the source code and start building your online business.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center gap-3">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   Download Source Code
                 </button>
                 <button className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-lg flex items-center gap-3">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   Download Documentation
                 </button>
                        </div>
               <div className="mt-6 text-sm text-gray-500">
                 <p>Includes: Complete source code, setup instructions, database schema, and deployment guides</p>
                  </div>
                </div>

             {/* Final Message */}
             <div className="text-center">
               <h5 className="text-xl font-semibold text-gray-800 mb-4">Ready to Launch Your E-Commerce Business?</h5>
               <p className="text-gray-600 max-w-2xl mx-auto">
                 You now have a complete, production-ready E-Commerce application with all the features needed to start selling online. 
                 Customize it further, add your products, and launch your business!
               </p>
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
          <PhaseNavigationBar currentPhase="deployment" />
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
            <h1 className="text-xl font-bold text-gray-800 mb-2">Deployment Phase</h1>
            <p className="text-sm text-gray-600">{project.title}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="p-4">
            <nav className="space-y-2">
              {deploymentTabs.map((tab, index) => {
                const isUnlocked = isModuleUnlocked(projectId, 'deployment', tab.id);
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
                          ? 'bg-red-100 text-red-700 shadow-sm'
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
                {deploymentTabs.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedTab === tab.id ? 'bg-orange-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-xs ${
                      selectedTab === tab.id ? 'text-orange-600 font-medium' : 'text-gray-500'
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
             {selectedTab !== 'final-steps' && (
            <NextButton 
              currentPhase="deployment" 
              currentModule={selectedTab}
              onNext={() => {
                // Auto-advance to next module
                const deploymentTabs = [
                  { id: 'overview' },
                     { id: 'deployment-planning' },
                     { id: 'environment-setup' },
                     { id: 'final-steps' }
                ];
                const currentIndex = deploymentTabs.findIndex(tab => tab.id === selectedTab);
                if (currentIndex < deploymentTabs.length - 1) {
                  setSelectedTab(deploymentTabs[currentIndex + 1].id);
                }
              }}
            />
             )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DeploymentPhasePage;
