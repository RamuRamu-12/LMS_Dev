import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiEdit, FiEye, FiTrash2, FiUsers, FiCalendar, FiAward, FiFileText } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EditHackathonModal from '../components/EditHackathonModal';
import HackathonSubmissionsManagement from '../components/admin/HackathonSubmissionsManagement';
import Header from '../components/common/Header';
import { api } from '../services/api';

const AdminHackathonsPage = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [preservedFormData, setPreservedFormData] = useState(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedHackathonForSubmissions, setSelectedHackathonForSubmissions] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchHackathons();
  }, []);

  // Handle returning from group creation
  useEffect(() => {
    if (location.state?.openEditModal && location.state?.hackathonId) {
      const hackathon = hackathons.find(h => h.id === location.state.hackathonId);
      if (hackathon) {
        setSelectedHackathon(hackathon);
        setPreservedFormData(location.state.hackathonData);
        setShowEditModal(true);
        // Clear the state to prevent reopening on refresh
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, hackathons, navigate, location.pathname]);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      
      // Get token from multiple sources (same as CreateHackathonPage)
      let token = localStorage.getItem('accessToken');
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (!token) {
        token = sessionStorage.getItem('accessToken');
      }
      if (!token) {
        token = sessionStorage.getItem('token');
      }
      
      console.log('AdminHackathonsPage - Token found:', token ? `${token.substring(0, 20)}...` : 'null');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      const response = await api.get('/hackathons');

      console.log('AdminHackathonsPage - Response status:', response.status);
      console.log('AdminHackathonsPage - Response data:', response.data);

      const data = response.data;
      console.log('AdminHackathonsPage - First hackathon groups:', data.data?.hackathons?.[0]?.groups);
      setHackathons(data.data?.hackathons || []);
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHackathon = () => {
    navigate('/admin/hackathons/create');
  };

  const handleEditHackathon = (hackathon) => {
    setSelectedHackathon(hackathon);
    setShowEditModal(true);
  };

  const handleUpdateHackathon = async (updatedData) => {
    try {
      // Get token from multiple sources
      let token = localStorage.getItem('accessToken');
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (!token) {
        token = sessionStorage.getItem('accessToken');
      }
      if (!token) {
        token = sessionStorage.getItem('token');
      }
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('AdminHackathonsPage - Sending update request for hackathon:', selectedHackathon.id);
      console.log('AdminHackathonsPage - Update data:', updatedData);
      
      const response = await api.put(`/hackathons/${selectedHackathon.id}`, updatedData);

      console.log('AdminHackathonsPage - Response status:', response.status);
      console.log('AdminHackathonsPage - Response data:', response.data);

      const updateData = response.data;
      console.log('AdminHackathonsPage - Update response:', updateData);
      console.log('AdminHackathonsPage - Response success:', updateData.success);
      console.log('AdminHackathonsPage - Updated hackathon groups:', updateData.data?.groups);

      if (!updateData.success) {
        console.log('AdminHackathonsPage - Error condition met:', {
          dataSuccess: updateData.success,
          message: updateData.message,
          error: updateData.error
        });
        throw new Error(updateData.message || updateData.error || 'Failed to update hackathon');
      }

      console.log('AdminHackathonsPage - Update successful, proceeding with modal close');

      // Close modal first to show success
      setShowEditModal(false);
      setSelectedHackathon(null);
      
      // Refresh the hackathons list in background (don't await to prevent blocking)
      fetchHackathons().catch(err => {
        console.error('Error refreshing hackathons list:', err);
        // Don't show error to user as the update was successful
      });
      
    } catch (error) {
      console.error('Error updating hackathon:', error);
      alert(`Failed to update hackathon: ${error.message}`);
    }
  };

  const handleDeleteHackathon = async (hackathonId) => {
    if (!window.confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
      return;
    }

    try {
      // Get token from multiple sources
      let token = localStorage.getItem('accessToken');
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (!token) {
        token = sessionStorage.getItem('accessToken');
      }
      if (!token) {
        token = sessionStorage.getItem('token');
      }
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await api.delete(`/hackathons/${hackathonId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete hackathon');
      }

      // Remove from local state
      setHackathons(hackathons.filter(h => h.id !== hackathonId));
    } catch (err) {
      console.error('Error deleting hackathon:', err);
      alert('Failed to delete hackathon');
    }
  };

  const handleViewSubmissions = (hackathon) => {
    setSelectedHackathonForSubmissions(hackathon);
    setShowSubmissions(true);
  };

  const handleTogglePublish = async (hackathon) => {
    try {
      // Get token from multiple sources
      let token = localStorage.getItem('accessToken');
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (!token) {
        token = sessionStorage.getItem('accessToken');
      }
      if (!token) {
        token = sessionStorage.getItem('token');
      }
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await api.put(`/hackathons/${hackathon.id}/publish`, {
        is_published: !hackathon.is_published
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update hackathon');
      }

      // Update local state
      setHackathons(hackathons.map(h => 
        h.id === hackathon.id 
          ? { ...h, is_published: !h.is_published, published_at: !h.is_published ? new Date().toISOString() : null }
          : h
      ));
    } catch (err) {
      console.error('Error updating hackathon:', err);
      alert('Failed to update hackathon');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hackathons Management</h1>
            <p className="text-gray-600 mt-2">Manage hackathons and their groups</p>
          </div>
          <button
            onClick={handleCreateHackathon}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Hackathon</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Hackathons Grid */}
        {hackathons.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiAward className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hackathons Created</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first hackathon for students to participate in.
            </p>
            <button
              onClick={handleCreateHackathon}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Your First Hackathon</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                {/* Hackathon Header */}
                <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {hackathon.logo ? (
                    <img
                      src={hackathon.logo}
                      alt={hackathon.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <FiAward className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-semibold">{hackathon.name}</p>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Status and Difficulty Badges */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hackathon.status)}`}>
                      {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(hackathon.difficulty)}`}>
                      {hackathon.difficulty.charAt(0).toUpperCase() + hackathon.difficulty.slice(1)}
                    </span>
                  </div>

                  {/* Hackathon Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {hackathon.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {hackathon.description}
                  </p>

                  {/* Technology */}
                  {hackathon.technology && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-700">Technology: </span>
                      <span className="text-xs text-gray-600">{hackathon.technology}</span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="mb-4 space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <FiCalendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}</span>
                    </div>
                  </div>

                  {/* Groups */}
                  <div className="mb-4">
                    <div className="flex items-center text-xs text-gray-600 mb-1">
                      <FiUsers className="w-3 h-3 mr-1" />
                      <span>
                        {hackathon.groups?.length || 0}
                        {hackathon.max_groups ? ` / ${hackathon.max_groups}` : ''} groups
                      </span>
                    </div>
                    {hackathon.max_groups && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{
                            width: `${((hackathon.groups?.length || 0) / hackathon.max_groups) * 100}%`
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Published Status */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      hackathon.is_published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {hackathon.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditHackathon(hackathon)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-1"
                    >
                      <FiEdit className="w-4 h-4" />
                      <span className="text-xs">Edit</span>
                    </button>
                    <button
                      onClick={() => handleViewSubmissions(hackathon)}
                      className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center space-x-1"
                    >
                      <FiFileText className="w-4 h-4" />
                      <span className="text-xs">Submissions</span>
                    </button>
                    <button
                      onClick={() => handleTogglePublish(hackathon)}
                      className={`flex-1 py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-xs ${
                        hackathon.is_published
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {hackathon.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDeleteHackathon(hackathon.id)}
                      className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center justify-center"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Hackathon Modal */}
      {showEditModal && selectedHackathon && (
        <EditHackathonModal
          hackathon={selectedHackathon}
          preservedFormData={preservedFormData}
          onClose={() => {
            setShowEditModal(false);
            setSelectedHackathon(null);
            setPreservedFormData(null);
          }}
          onSave={handleUpdateHackathon}
        />
      )}

      {/* Submissions Management Modal */}
      {showSubmissions && selectedHackathonForSubmissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Submissions - {selectedHackathonForSubmissions.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Manage and review hackathon submissions
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSubmissions(false);
                    setSelectedHackathonForSubmissions(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <HackathonSubmissionsManagement hackathonId={selectedHackathonForSubmissions.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHackathonsPage;
