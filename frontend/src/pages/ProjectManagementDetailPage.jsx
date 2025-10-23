import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProjectManagementDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    videoType: 'overview',
    phase: '',
    phaseNumber: '',
    duration: '',
    tags: '',
    isPublic: true
  });
  const [documentForm, setDocumentForm] = useState({
    title: '',
    description: '',
    documentType: 'brd',
    phase: '',
    version: '1.0',
    tags: '',
    isPublic: true
  });
  const [submitting, setSubmitting] = useState(false);

  const projectPhases = [
    { id: 1, name: 'BRD', title: 'Business Requirements Document', number: 1 },
    { id: 2, name: 'UI/UX', title: 'UI/UX Design', number: 2 },
    { id: 3, name: 'Architecture', title: 'Architectural Design', number: 3 },
    { id: 4, name: 'Code', title: 'Code Development', number: 4 },
    { id: 5, name: 'Testing', title: 'Testing & QA', number: 5 },
    { id: 6, name: 'Deployment', title: 'Deployment', number: 6 }
  ];

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const [projectRes, videosRes, documentsRes] = await Promise.all([
        fetch(`${apiUrl}/api/projects/${projectId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch(`${apiUrl}/api/projects/${projectId}/videos`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch(`${apiUrl}/api/projects/${projectId}/documents`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ]);

      const [projectData, videosData, documentsData] = await Promise.all([
        projectRes.json(),
        videosRes.json(),
        documentsRes.json()
      ]);

      if (projectData.success) setProject(projectData.data);
      if (videosData.success) setVideos(videosData.data);
      if (documentsData.success) setDocuments(documentsData.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = editingItem 
        ? `${apiUrl}/api/projects/videos/${editingItem.id}`
        : `${apiUrl}/api/projects/${projectId}/videos`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(videoForm)
      });

      const data = await response.json();
      if (data.success) {
        setShowVideoModal(false);
        setEditingItem(null);
        setVideoForm({
          title: '',
          description: '',
          videoUrl: '',
          thumbnailUrl: '',
          videoType: 'overview',
          phase: '',
          phaseNumber: '',
          duration: '',
          tags: '',
          isPublic: true
        });
        fetchProjectData();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting video:', error);
      alert('Error submitting video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = editingItem 
        ? `${apiUrl}/api/projects/documents/${editingItem.id}`
        : `${apiUrl}/api/projects/${projectId}/documents`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(documentForm)
      });

      const data = await response.json();
      if (data.success) {
        setShowDocumentModal(false);
        setEditingItem(null);
        setDocumentForm({
          title: '',
          description: '',
          documentType: 'brd',
          phase: '',
          version: '1.0',
          tags: '',
          isPublic: true
        });
        fetchProjectData();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting document:', error);
      alert('Error submitting document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    if (type === 'video') {
      setVideoForm({
        title: item.title,
        description: item.description || '',
        videoUrl: item.videoUrl,
        thumbnailUrl: item.thumbnailUrl || '',
        videoType: item.videoType,
        phase: item.phase || '',
        phaseNumber: item.phaseNumber || '',
        duration: item.duration || '',
        tags: item.tags ? JSON.stringify(item.tags) : '',
        isPublic: item.isPublic
      });
      setShowVideoModal(true);
    } else {
      setDocumentForm({
        title: item.title,
        description: item.description || '',
        documentType: item.documentType,
        phase: item.phase || '',
        version: item.version || '1.0',
        tags: item.tags ? JSON.stringify(item.tags) : '',
        isPublic: item.isPublic
      });
      setShowDocumentModal(true);
    }
  };

  const handleDelete = async (item, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = type === 'video' 
        ? `${apiUrl}/api/projects/videos/${item.id}`
        : `${apiUrl}/api/projects/documents/${item.id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });

      const data = await response.json();
      if (data.success) {
        fetchProjectData();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Error deleting ${type}`);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <button
            onClick={() => navigate('/admin/projects')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <button
              onClick={() => navigate('/admin/projects')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              ← Back to Projects
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 text-sm rounded-full ${
              project.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {project.isPublished ? 'Published' : 'Draft'}
            </span>
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full capitalize">
              {project.difficulty}
            </span>
            <span className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
              {project.estimatedDuration}h
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'videos', 'documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Overview Video</label>
                  <div className="mt-1">
                    {project.overviewVideoUrl ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                        <span className="text-green-800">Video uploaded</span>
                        <a
                          href={project.overviewVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Video
                        </a>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 rounded-md">
                        <span className="text-yellow-800">No overview video uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Technologies</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {project.technologies?.map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Phases</h3>
              <div className="space-y-3">
                {projectPhases.map((phase) => {
                  const phaseVideos = videos.filter(v => v.phase === phase.name);
                  const phaseDocs = documents.filter(d => d.phase === phase.name);
                  
                  return (
                    <div key={phase.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <h4 className="font-medium text-gray-900">{phase.title}</h4>
                        <p className="text-sm text-gray-600">
                          {phaseVideos.length} videos, {phaseDocs.length} documents
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setVideoForm(prev => ({ ...prev, videoType: 'phase', phase: phase.name, phaseNumber: phase.number }));
                            setShowVideoModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Add Video
                        </button>
                        <button
                          onClick={() => {
                            setDocumentForm(prev => ({ ...prev, phase: phase.name }));
                            setShowDocumentModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Add Doc
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Project Videos</h3>
              <button
                onClick={() => {
                  setVideoForm({
                    title: '',
                    description: '',
                    videoUrl: '',
                    thumbnailUrl: '',
                    videoType: 'overview',
                    phase: '',
                    phaseNumber: '',
                    duration: '',
                    tags: '',
                    isPublic: true
                  });
                  setEditingItem(null);
                  setShowVideoModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add Video
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium text-gray-900">{video.title}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(video, 'video')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video, 'video')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{video.videoType}</span>
                    </div>
                    {video.phase && (
                      <div className="flex justify-between">
                        <span>Phase:</span>
                        <span>{video.phase}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Views:</span>
                      <span>{video.viewCount}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Watch Video →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Project Documents</h3>
              <button
                onClick={() => {
                  setDocumentForm({
                    title: '',
                    description: '',
                    documentType: 'brd',
                    phase: '',
                    version: '1.0',
                    tags: '',
                    isPublic: true
                  });
                  setEditingItem(null);
                  setShowDocumentModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add Document
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <div key={document.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium text-gray-900">{document.title}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(document, 'document')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(document, 'document')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{document.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{document.documentType}</span>
                    </div>
                    {document.phase && (
                      <div className="flex justify-between">
                        <span>Phase:</span>
                        <span>{document.phase}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(document.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Downloads:</span>
                      <span>{document.downloadCount}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <a
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/documents/${document.id}/download`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Download →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? 'Edit Video' : 'Add Video'}
            </h3>
            
            <form onSubmit={handleVideoSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video Type
                    </label>
                    <select
                      value={videoForm.videoType}
                      onChange={(e) => setVideoForm({...videoForm, videoType: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="overview">Overview Video</option>
                      <option value="phase">Phase Video</option>
                    </select>
                  </div>
                  
                  {videoForm.videoType === 'phase' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phase
                      </label>
                      <select
                        value={videoForm.phase}
                        onChange={(e) => setVideoForm({...videoForm, phase: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select Phase</option>
                        {projectPhases.map(phase => (
                          <option key={phase.id} value={phase.name}>{phase.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL (Drive URL)
                  </label>
                  <input
                    type="url"
                    value={videoForm.videoUrl}
                    onChange={(e) => setVideoForm({...videoForm, videoUrl: e.target.value})}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={videoForm.thumbnailUrl}
                    onChange={(e) => setVideoForm({...videoForm, thumbnailUrl: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({...videoForm, duration: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phase Number
                    </label>
                    <input
                      type="number"
                      value={videoForm.phaseNumber}
                      onChange={(e) => setVideoForm({...videoForm, phaseNumber: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={videoForm.isPublic}
                    onChange={(e) => setVideoForm({...videoForm, isPublic: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    Make video public
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Add')} Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? 'Edit Document' : 'Add Document'}
            </h3>
            
            <form onSubmit={handleDocumentSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Type
                    </label>
                    <select
                      value={documentForm.documentType}
                      onChange={(e) => setDocumentForm({...documentForm, documentType: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="brd">BRD</option>
                      <option value="uiux">UI/UX</option>
                      <option value="architecture">Architecture</option>
                      <option value="code">Code</option>
                      <option value="testing">Testing</option>
                      <option value="deployment">Deployment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phase
                    </label>
                    <select
                      value={documentForm.phase}
                      onChange={(e) => setDocumentForm({...documentForm, phase: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select Phase</option>
                      {projectPhases.map(phase => (
                        <option key={phase.id} value={phase.name}>{phase.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={documentForm.title}
                    onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={documentForm.description}
                    onChange={(e) => setDocumentForm({...documentForm, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={documentForm.version}
                      onChange={(e) => setDocumentForm({...documentForm, version: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={documentForm.tags}
                      onChange={(e) => setDocumentForm({...documentForm, tags: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublicDoc"
                    checked={documentForm.isPublic}
                    onChange={(e) => setDocumentForm({...documentForm, isPublic: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isPublicDoc" className="text-sm text-gray-700">
                    Make document public
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDocumentModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Add')} Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default ProjectManagementDetailPage;
