import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AccessDenied from '../components/common/AccessDenied';
import { usePermissions } from '../hooks/usePermissions';
import { useProjectProgress } from '../context/ProjectProgressContext';
import { projectService } from '../services/projectService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RealtimeProjectsPageSimple = () => {
  const { projectId } = useParams();
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();
  const { initializeProject } = useProjectProgress();
  const { permissions, loading: permissionsLoading, hasAccess, isAdmin } = usePermissions();

  // Fetch projects from API
  const { data: projectsData, isLoading: loading, error } = useQuery(
    'realtime-projects',
    () => projectService.getProjects(),
    {
      refetchOnWindowFocus: false,
      retry: 3
    }
  );

  const projects = projectsData?.data?.projects || projectsData?.data || [];

  // Set selected project based on URL params or first project
  useEffect(() => {
    if (projects.length > 0) {
      if (projectId) {
        // Find project by ID from URL
        const project = projects.find(p => p.id === parseInt(projectId));
        if (project) {
          setSelectedProject(project);
        }
      } else if (!selectedProject) {
        // Set first project if no projectId in URL
        setSelectedProject(projects[0]);
      }
    }
  }, [projects, projectId]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  const handleBeginJourney = () => {
    if (selectedProject) {
      initializeProject(selectedProject.id);
      navigate(`/student/realtime-projects/${selectedProject.id}/brd`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
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

  const handleContactAdmin = () => {
    // You can implement email functionality or redirect to contact page
    window.location.href = 'mailto:admin@gnanamai.com?subject=Request for Realtime Projects Access&body=Hello, I would like to request access to realtime projects. My student ID is: [Your Student ID]';
  };

  // Check permissions
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have permission and is not admin
  if (!isAdmin && !hasAccess('realtimeProjects')) {
    return <AccessDenied feature="realtimeProjects" onContactAdmin={handleContactAdmin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Realtime Projects
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn by doing with hands-on projects that build real-world skills
          </p>
        </motion.div>

        {/* Project Tabs */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Available</h3>
            <p className="text-gray-600 mb-4">
              No projects are currently available. Please check back later or contact an administrator.
            </p>
            <p className="text-sm text-gray-500">Please check:</p>
            <ul className="text-sm text-gray-400 mt-2">
              <li>1. Backend server is running (npm start in backend folder)</li>
              <li>2. Database is seeded with projects</li>
              <li>3. Check browser console for errors</li>
            </ul>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              {projects.map((project, index) => (
              <motion.button
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleProjectSelect(project)}
                className={`
                  relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300
                  ${selectedProject?.id === project.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/80 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-md hover:shadow-lg'
                  }
                  backdrop-blur-sm border border-white/20
                `}
              >
                <span className="relative z-10">
                  {project.title}
                </span>
                
                {/* Project number badge */}
                <div className={`
                  absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${selectedProject?.id === project.id
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-600 text-white'
                  }
                `}>
                  {index + 1}
                </div>
              </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Project Content */}
        {selectedProject && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            {/* Project Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-xl border border-white/20">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    {selectedProject.title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    {selectedProject.description}
                  </p>
                  
                  {/* Project Stats */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                      <span className="text-sm font-medium">Difficulty:</span>
                      <span className="font-semibold capitalize">{selectedProject.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                      <span className="text-sm font-medium">Duration:</span>
                      <span className="font-semibold">{selectedProject.estimated_duration || selectedProject.estimatedDuration}h</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
                      <span className="text-sm font-medium">Phases:</span>
                      <span className="font-semibold">{selectedProject.phases?.length || 5}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Video Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Project Overview Video</h3>
                
                {/* Video Display Area */}
                <div className="mb-8">
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">
                    {(() => {
                      // Find overview video from the videos array
                      const overviewVideo = selectedProject.videos?.find(video => video.video_type === 'overview');
                      const videoUrl = overviewVideo?.video_url || selectedProject.video_url || selectedProject.videoUrl;
                      
                      // Convert Google Drive URL to embeddable format
                      const getEmbeddableUrl = (url) => {
                        if (!url) return null;
                        
                        // Handle Google Drive URLs
                        if (url.includes('drive.google.com')) {
                          // Extract file ID from various Google Drive URL formats
                          let fileId = '';
                          
                          // Format: https://drive.google.com/file/d/FILE_ID/view
                          const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                          if (fileMatch) {
                            fileId = fileMatch[1];
                          }
                          
                          // Format: https://drive.google.com/open?id=FILE_ID
                          const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                          if (openMatch) {
                            fileId = openMatch[1];
                          }
                          
                          if (fileId) {
                            return `https://drive.google.com/file/d/${fileId}/preview`;
                          }
                        }
                        
                        // Handle YouTube URLs
                        if (url.includes('youtube.com') || url.includes('youtu.be')) {
                          return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
                        }
                        
                        // Return original URL for other video platforms
                        return url;
                      };
                      
                      const embedUrl = getEmbeddableUrl(videoUrl);
                      
                      return embedUrl ? (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <div className="text-8xl mb-6">🎥</div>
                            <h4 className="text-2xl font-bold mb-3">Project Overview Video</h4>
                            <p className="text-gray-300 text-lg max-w-md">
                              Watch this video to understand the complete project journey and get comprehensive knowledge about what you'll build.
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Video Description */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
                      📺
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        {selectedProject.title} - Complete Overview
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        This comprehensive video covers the entire project from start to finish. You'll learn about the technologies used, 
                        the development process, key features, and the skills you'll gain by completing this project.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Begin Journey Button */}
                <div className="text-center">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBeginJourney}
                    className="
                      inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                      text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl 
                      transition-all duration-300 hover:from-blue-700 hover:to-purple-700
                    "
                  >
                    <span className="text-2xl">🚀</span>
                    <span>Begin Your Journey</span>
                    <span className="text-2xl">→</span>
                  </motion.button>
                  
                  <p className="text-gray-500 text-sm mt-3">
                    Start with Phase 1 - BRD (Business Requirements Document)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default RealtimeProjectsPageSimple;
