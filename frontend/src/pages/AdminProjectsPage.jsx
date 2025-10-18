import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { projectService } from '../services/projectService';
import ProjectVideoManager from '../components/admin/ProjectVideoManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiVideo, FiEdit, FiEye, FiExternalLink } from 'react-icons/fi';
import Header from '../components/common/Header';
import toast from 'react-hot-toast';

const AdminProjectsPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showVideoManager, setShowVideoManager] = useState(false);
  const queryClient = useQueryClient();

  // Fetch projects from API
  const { data: projectsData, isLoading: loading, error } = useQuery(
    'admin-projects',
    () => projectService.getProjects(),
    {
      refetchOnWindowFocus: false,
      retry: 3
    }
  );

  // Seed projects mutation
  const seedProjectsMutation = useMutation(
    () => projectService.seedProjects(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-projects');
        toast.success('Projects seeded successfully!');
      },
      onError: (error) => {
        toast.error(`Failed to seed projects: ${error.message}`);
      }
    }
  );

  const projects = projectsData?.data?.projects || projectsData?.data || [];

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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error loading projects: {error.message}</p>
            <p className="text-gray-500">Please check:</p>
            <ul className="text-sm text-gray-400 mt-2">
              <li>1. Backend server is running (npm start in backend folder)</li>
              <li>2. Database is seeded with projects</li>
              <li>3. Check browser console for errors</li>
            </ul>
          </div>
        </div>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Realtime Projects Management
              </h1>
              <p className="text-gray-600">
                Manage project videos and content for the realtime projects section
              </p>
            </div>
            {projects.length === 0 && (
              <button
                onClick={() => seedProjectsMutation.mutate()}
                disabled={seedProjectsMutation.isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {seedProjectsMutation.isLoading ? 'Seeding...' : 'Seed Projects'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 mb-4">No projects found. Please check:</p>
              <ul className="text-sm text-gray-400">
                <li>1. Backend server is running (npm start in backend folder)</li>
                <li>2. Database is seeded with projects</li>
                <li>3. Check browser console for errors</li>
              </ul>
            </div>
          ) : (
            projects.map((project, index) => (
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
                    project.is_published 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {project.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>

                {/* Project Stats */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    <span className="font-medium capitalize">{project.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    <span className="font-medium">{project.estimated_duration || project.estimatedDuration}h</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    <span className="font-medium">{project.phases?.length || 0} phases</span>
                  </div>
                </div>
              </div>

              {/* Video Status */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      project.video_url || project.videoUrl
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <FiVideo className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {project.video_url || project.videoUrl ? 'Video Uploaded' : 'No Video'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {project.video_url || project.videoUrl ? 'Ready for students' : 'Upload required'}
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
                  {(project.video_url || project.videoUrl) && (
                    <a
                      href={project.video_url || project.videoUrl}
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
            ))
          )}
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
                  {projects.filter(p => p.video_url || p.videoUrl).length}
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
                  {projects.reduce((total, p) => total + (p.estimated_duration || p.estimatedDuration || 0), 0)}h
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
                  {projects.length > 0 ? Math.round((projects.filter(p => p.video_url || p.videoUrl).length / projects.length) * 100) : 0}%
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
