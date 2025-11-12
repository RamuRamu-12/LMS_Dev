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
  const { projects, isLoading } = useRealtimeProjects();

  const project = projects.find(p => 
    p.id?.toLowerCase() === projectId?.toLowerCase() || 
    p.folderName?.toLowerCase() === projectId?.toLowerCase()
  );
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Get token for iframe authentication
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const projectUrl = `${apiUrl}/api/realtime-projects/${projectId}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  
  // Debug logging
  console.log('ProjectViewer - projectId:', projectId);
  console.log('ProjectViewer - project:', project);
  console.log('ProjectViewer - projectUrl:', projectUrl);
  console.log('ProjectViewer - token exists:', !!token);

  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // Footer is now shown by default - no CSS injection needed
        // Backend handles footer visibility based on project.json configuration
        console.log('Iframe loaded - footer will be shown by default');
      }
    } catch (error) {
      // Cross-origin error - backend handles footer visibility
      console.log('Cannot access iframe (cross-origin), backend handles footer visibility');
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
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
        <iframe
          ref={iframeRef}
          src={projectUrl}
          className="absolute inset-0 w-full h-full border-0"
          title={project.name}
          onLoad={(e) => {
            console.log('Iframe loaded successfully');
            handleIframeLoad();
            
            // Check if iframe loaded content
            try {
              const iframe = e.target;
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                console.log('Iframe document accessible');
                console.log('Iframe title:', iframeDoc.title);
                console.log('Iframe body content length:', iframeDoc.body?.innerHTML?.length || 0);
              } else {
                console.warn('Cannot access iframe document (cross-origin or security restriction)');
              }
            } catch (error) {
              console.warn('Error accessing iframe content:', error.message);
            }
          }}
          onError={(e) => {
            console.error('Iframe load error:', e);
          }}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
          allow="fullscreen"
        />
        {!project && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Project...</h3>
              <p className="text-gray-500">Please wait while the project loads</p>
            </div>
          </div>
        )}
      </div>

      {/* LMS Footer - Hidden for project viewer to maximize space */}
      {/* <Footer /> */}
    </div>
  );
};

export default ProjectViewer;

