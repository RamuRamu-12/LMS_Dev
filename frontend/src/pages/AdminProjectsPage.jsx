import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { projectService } from '../services/projectService';
import ProjectVideoManager from '../components/admin/ProjectVideoManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiVideo, FiEdit, FiEye, FiExternalLink } from 'react-icons/fi';
import Header from '../components/common/Header';

const AdminProjectsPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showVideoManager, setShowVideoManager] = useState(false);

  // Mock data for now - in real app, this would come from API
  const mockProjects = [
    {
      id: 1,
      title: 'E-Commerce Web Application',
      description: 'Build a complete e-commerce platform with modern technologies including React, Node.js, and PostgreSQL.',
      difficulty: 'intermediate',
      estimatedDuration: 40,
       videoUrl: null,
      isActive: true,
      createdAt: '2024-01-15',
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
      videoUrl: null,
      isActive: true,
      createdAt: '2024-01-20',
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
      videoUrl: null,
      isActive: true,
      createdAt: '2024-01-25',
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

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const handleManageVideo = (project) => {
    setSelectedProject(project);
    setShowVideoManager(true);
  };

  const handleViewProject = (project) => {
    window.open(`/realtime-projects`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Realtime Projects Management
          </h1>
          <p className="text-gray-600">
            Manage project videos and content for the realtime projects section
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            >
              {/* Project Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {project.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Project Stats */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    <span className="font-medium capitalize">{project.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    <span className="font-medium">{project.estimatedDuration}h</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    <span className="font-medium">{project.phases?.length || 5} phases</span>
                  </div>
                </div>
              </div>

              {/* Video Status */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      project.videoUrl 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <FiVideo className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {project.videoUrl ? 'Video Uploaded' : 'No Video'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {project.videoUrl ? 'Ready for students' : 'Upload required'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleManageVideo(project)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiEdit className="w-4 h-4" />
                    Manage Video
                  </button>
                  <button
                    onClick={() => handleViewProject(project)}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                  {project.videoUrl && (
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{projects.length}</p>
                <p className="text-gray-600 text-sm">Total Projects</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {projects.filter(p => p.videoUrl).length}
                </p>
                <p className="text-gray-600 text-sm">Videos Uploaded</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">⏱️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {projects.reduce((total, p) => total + p.estimatedDuration, 0)}h
                </p>
                <p className="text-gray-600 text-sm">Total Duration</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round((projects.filter(p => p.videoUrl).length / projects.length) * 100)}%
                </p>
                <p className="text-gray-600 text-sm">Completion Rate</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Video Manager Modal */}
      {showVideoManager && selectedProject && (
        <ProjectVideoManager
          project={selectedProject}
          onClose={() => {
            setShowVideoManager(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminProjectsPage;
