import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../common/Header';
import { useRealtimeProjects } from '../../hooks/useRealtimeProjects';
import LoadingSpinner from '../common/LoadingSpinner';

const ProjectViewer = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const { projects, isLoading } = useRealtimeProjects();

  // Validate projectId exists
  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Project</h2>
          <p className="text-gray-600 mb-4">No project ID provided.</p>
          <button
            onClick={() => navigate('/student/realtime-projects')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Find project by id or folderName
  const project = projects.find(p => 
    p.id?.toLowerCase() === projectId?.toLowerCase() || 
    p.folderName?.toLowerCase() === projectId?.toLowerCase()
  );

  // Get API URL and token
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  // Construct project URL only if projectId is valid
  const projectUrl = projectId 
    ? `${apiUrl}/api/realtime-projects/${projectId}${token ? `?token=${encodeURIComponent(token)}` : ''}`
    : null;
  
  // Debug logging
  console.log('ProjectViewer - projectId:', projectId);
  console.log('ProjectViewer - projects count:', projects.length);
  console.log('ProjectViewer - project:', project);
  console.log('ProjectViewer - projectUrl:', projectUrl);
  console.log('ProjectViewer - token exists:', !!token);

  const handleIframeLoad = () => {
    // Note: We cannot access iframe content due to cross-origin restrictions
    // This is expected behavior when iframe loads from different origin (localhost:5000 vs localhost:3000)
    // The backend handles all content rendering and footer visibility
    // No action needed here - the iframe will load and display content correctly
    setIframeLoading(false);
    console.log('Iframe loaded successfully - content is cross-origin, backend handles rendering');
  };

  const handleIframeError = (e) => {
    setIframeLoading(false);
    console.error('Iframe load error:', e);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (iframeRef.current?.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Show loading spinner while projects are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error if project not found after loading completes
  if (!isLoading && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">
            The project "{projectId}" was not found. Available projects: {projects.map(p => p.id || p.folderName).join(', ')}
          </p>
          <button
            onClick={() => navigate('/student/realtime-projects')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Don't render iframe if projectUrl is invalid
  if (!projectUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Project URL</h2>
          <p className="text-gray-600 mb-4">Unable to construct project URL.</p>
          <button
            onClick={() => navigate('/student/realtime-projects')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* LMS Header */}
      <Header />

      {/* Project Navigation Bar */}
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/student/realtime-projects')}
              className="flex items-center text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Projects
            </button>

            <h2 className="text-lg font-semibold text-gray-900">
              {project.name}
            </h2>

            <button
              onClick={toggleFullscreen}
              className="text-gray-600 hover:text-indigo-600 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Project iframe - Takes all remaining space */}
      <div className="flex-1 relative overflow-hidden" style={{ height: 0 }}>
        {iframeLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2 mt-4">Loading Project...</h3>
              <p className="text-gray-500">Please wait while the project loads</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={projectUrl}
          className="absolute inset-0 w-full h-full border-0"
          title={project?.name || 'Project Viewer'}
          onLoad={(e) => {
            console.log('Iframe loaded successfully');
            handleIframeLoad();
            
            // Note: We intentionally don't try to access iframe.contentDocument or iframe.contentWindow.document
            // because it's cross-origin (localhost:5000 vs localhost:3000) and will throw a security error.
            // This is expected behavior and the iframe will still display content correctly.
            // The backend handles all content rendering and the iframe will work properly.
          }}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
          allow="fullscreen"
        />
      </div>

      {/* LMS Footer - Hidden for project viewer to maximize space */}
      {/* <Footer /> */}
    </div>
  );
};

export default ProjectViewer;

