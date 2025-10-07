import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSave, FiX, FiCalendar, FiUsers, FiAward, FiUpload, FiPlus, FiEdit3, FiTrash2, FiSettings } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const CreateHackathonPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();


  // Function to get token from multiple sources
  const getAuthToken = () => {
    if (token) return token;
    
    let localToken = localStorage.getItem('accessToken');
    if (localToken) return localToken;
    
    localToken = localStorage.getItem('token');
    if (localToken) return localToken;
    
    let sessionToken = sessionStorage.getItem('accessToken');
    if (sessionToken) {
      localStorage.setItem('accessToken', sessionToken);
      return sessionToken;
    }
    
    sessionToken = sessionStorage.getItem('token');
    if (sessionToken) {
      localStorage.setItem('accessToken', sessionToken);
      return sessionToken;
    }
    
    return null;
  };

  const [groups, setGroups] = useState([]); // All available groups
  const [selectedGroupIds, setSelectedGroupIds] = useState([]); // Groups selected for this hackathon

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    technology: '',
    tech_stack: [],
    start_date: '',
    end_date: '',
    difficulty: 'intermediate',
    max_participants: '',
    prize_description: '',
    rules: '',
    requirements: '',
    video_url: '',
    pdf_url: '',
    max_groups: '' // Maximum number of groups allowed
  });

  useEffect(() => {
    fetchStudents();
    fetchAllGroups(); // Fetch all available groups
    // Load existing groups from backend if hackathon ID exists (for editing)
    if (location.state?.hackathonId) {
      fetchHackathonGroups(location.state.hackathonId);
    }
    
    // Refresh groups if a group was just created
    if (location.state?.groupCreated) {
      fetchAllGroups();
      // Restore hackathon form data if it was passed back
      if (location.state?.hackathonData) {
        setFormData(location.state.hackathonData);
      }
      // Clear the state to prevent unnecessary refreshes
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  const fetchStudents = async () => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/users?role=student', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to fetch students: ${response.status}`);
      }

      const data = await response.json();
      setStudents(data.data?.users || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please refresh the page.');
    }
  };

  const fetchAllGroups = async () => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/groups', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to fetch groups: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setGroups(data.data);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups. Please refresh the page.');
    }
  };


  const fetchHackathonGroups = async (hackathonId) => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`/api/hackathons/${hackathonId}/groups`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to fetch hackathon groups: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        // Set selected group IDs for this hackathon
        const groupIds = data.data.map(group => group.id);
        setSelectedGroupIds(groupIds);
      }
    } catch (err) {
      console.error('Error fetching hackathon groups:', err);
      setError('Failed to load existing groups. Please refresh the page.');
    }
  };

  // Add debugging
  useEffect(() => {
    const token = localStorage.getItem('token');
    const accessToken = localStorage.getItem('accessToken');
    const sessionToken = sessionStorage.getItem('token');
    const sessionAccessToken = sessionStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    console.log('=== Authentication Debug ===');
    console.log('AuthContext token:', token);
    console.log('AuthContext user:', user);
    console.log('localStorage token exists:', !!token);
    console.log('localStorage token length:', token ? token.length : 0);
    console.log('localStorage accessToken exists:', !!accessToken);
    console.log('localStorage accessToken length:', accessToken ? accessToken.length : 0);
    console.log('sessionStorage token exists:', !!sessionToken);
    console.log('sessionStorage token length:', sessionToken ? sessionToken.length : 0);
    console.log('sessionStorage accessToken exists:', !!sessionAccessToken);
    console.log('sessionStorage accessToken length:', sessionAccessToken ? sessionAccessToken.length : 0);
    console.log('localStorage user exists:', !!user);
    console.log('localStorage user:', user);
    console.log('============================');
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTechStackChange = (e) => {
    const value = e.target.value;
    const techStack = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    setFormData(prev => ({
      ...prev,
      tech_stack: techStack
    }));
  };

  const navigateToCreateGroup = () => {
    navigate('/admin/hackathons/create-group', {
      state: {
        hackathonData: formData // Pass the current hackathon form data
      }
    });
  };

  const toggleGroupSelection = (groupId) => {
    setSelectedGroupIds(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const getSelectedGroups = () => {
    return groups.filter(group => selectedGroupIds.includes(group.id));
  };

  const getTotalParticipants = () => {
    return getSelectedGroups().reduce((total, group) => total + (group.members?.length || 0), 0);
  };

  const linkGroupsToHackathon = async (hackathonId, groupIds) => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      // Link each selected group to the hackathon
      for (const groupId of groupIds) {
        const response = await fetch(`/api/hackathons/${hackathonId}/groups/${groupId}/link`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to link group to hackathon');
        }
      }
    } catch (err) {
      console.error('Error linking groups to hackathon:', err);
      throw new Error('Failed to link groups to hackathon. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!');
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      console.log('Validating form data:', {
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date
      });
      
      if (!formData.name || !formData.description || !formData.start_date || !formData.end_date) {
        console.log('Validation failed - missing required fields');
        throw new Error('Name, description, start date, and end date are required');
      }
      
      console.log('Form validation passed');

      // Validate dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }

      const authToken = getAuthToken();
      console.log('Token found:', authToken ? `${authToken.substring(0, 20)}...` : 'null');
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please login again.');
      }

      console.log('Creating hackathon with data:', formData);
      
      const response = await fetch('/api/hackathons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          max_groups: formData.max_groups ? parseInt(formData.max_groups) : null
        })
      });
      
      console.log('Hackathon creation response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create hackathon');
      }

      const data = await response.json();
      
      // If hackathon was created successfully and we have selected groups, link them
      if (data.success && data.data && selectedGroupIds.length > 0) {
        const hackathonId = data.data.id;
        await linkGroupsToHackathon(hackathonId, selectedGroupIds);
      }
      
      // Redirect to hackathons page
      navigate('/admin/hackathons');
    } catch (err) {
      console.error('Error creating hackathon:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Create Hackathon</h1>
            <p className="text-gray-600 mt-2 text-lg">Set up a new hackathon with organized groups</p>
          </div>
            <button
              onClick={() => navigate('/admin/hackathons')}
              className="bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-lg border border-gray-200"
            >
              <FiX className="w-5 h-5" />
              <span>Cancel</span>
            </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <FiAward className="w-6 h-6 text-white" />
              </div>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Hackathon Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                  placeholder="Enter hackathon name"
                  required
                />
              </div>

              <div>
                <label htmlFor="technology" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Technology
                </label>
                <input
                  type="text"
                  id="technology"
                  name="technology"
                  value={formData.technology}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., React, Python, Machine Learning"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe the hackathon, its goals, and what participants will build"
                required
              />
            </div>

            <div className="mt-6">
              <label htmlFor="tech_stack" className="block text-sm font-medium text-gray-700 mb-2">
                Technology Stack
              </label>
              <input
                type="text"
                id="tech_stack"
                value={Array.isArray(formData.tech_stack) ? formData.tech_stack.join(', ') : formData.tech_stack || ''}
                onChange={handleTechStackChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="React, Node.js, MongoDB, AWS (comma-separated)"
              />
              <p className="text-sm text-gray-500 mt-1">Separate technologies with commas</p>
            </div>
          </motion.div>

          {/* Schedule & Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiCalendar className="w-6 h-6 mr-2 text-indigo-600" />
              Schedule & Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  id="max_participants"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>
            </div>
          </motion.div>

          {/* Content & Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiUpload className="w-6 h-6 mr-2 text-indigo-600" />
              Content & Rules
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Promotional Video URL (Drive Link)
                </label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label htmlFor="pdf_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Details PDF URL (Drive Link)
                </label>
                <input
                  type="url"
                  id="pdf_url"
                  name="pdf_url"
                  value={formData.pdf_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label htmlFor="prize_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Prize Description
                </label>
                <textarea
                  id="prize_description"
                  name="prize_description"
                  value={formData.prize_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe the prizes for winners"
                />
              </div>

              <div>
                <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
                  Rules & Guidelines
                </label>
                <textarea
                  id="rules"
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="List the rules and guidelines for the hackathon"
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Requirements
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Specify what participants need to deliver"
                />
              </div>
            </div>
          </motion.div>

          {/* Group Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
                Hackathon Groups
            </h2>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Selected Groups</div>
                  <div className="text-2xl font-bold text-indigo-600">{selectedGroupIds.length}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Participants</div>
                  <div className="text-2xl font-bold text-emerald-600">{getTotalParticipants()}</div>
                </div>
              </div>
            </div>

            {/* Group Settings */}
            <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiSettings className="w-5 h-5 mr-2 text-indigo-600" />
                Group Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="max_groups" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Number of Groups
                  </label>
                    <input
                    type="number"
                    id="max_groups"
                    name="max_groups"
                    value={formData.max_groups}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Set a limit on the total number of groups (optional)
                  </p>
                    </div>
                <div>
                  <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Total Participants
                  </label>
                  <input
                    type="number"
                    id="max_participants"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Set a limit on total participants across all groups
                  </p>
                </div>
              </div>
            </div>

            {/* Create New Group Button */}
            <div className="mb-8">
              <button
                type="button"
                onClick={navigateToCreateGroup}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
              >
                <FiPlus className="w-6 h-6" />
                <span className="text-lg font-medium">Create New Group</span>
              </button>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Create groups separately and then select them for this hackathon
              </p>
            </div>

            {/* Available Groups Selection */}
            {groups.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Groups for Hackathon</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {groups.map((group) => {
                    const isSelected = selectedGroupIds.includes(group.id);
                    return (
                      <div 
                        key={group.id} 
                        className={`bg-gradient-to-br from-white to-gray-50 border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                          isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => toggleGroupSelection(group.id)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleGroupSelection(group.id)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <h4 className="text-lg font-semibold text-gray-900">{group.name}</h4>
                            </div>
                            {group.description && (
                              <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <FiUsers className="w-4 h-4 mr-1" />
                                {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''}
                              </span>
                              {group.max_members && (
                                <span className="flex items-center">
                                  <FiSettings className="w-4 h-4 mr-1" />
                                  Max: {group.max_members}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Group Members Preview */}
                        {group.members && group.members.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">Members:</div>
                            <div className="flex flex-wrap gap-2">
                              {group.members.slice(0, 3).map(member => (
                                <div key={member.id} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                                  {member.name}
                                </div>
                              ))}
                              {group.members.length > 3 && (
                                <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                                  +{group.members.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Available</h3>
                <p className="text-gray-500 mb-6">Create your first group to organize participants for hackathons</p>
                <button
                  type="button"
                  onClick={navigateToCreateGroup}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>Create First Group</span>
                </button>
              </div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-end space-x-4"
          >
              <button
                type="button"
                onClick={() => navigate('/admin/hackathons')}
                className="bg-white text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-200 shadow-lg"
              >
                Cancel
              </button>
            <button
              type="submit"
              disabled={loading || selectedGroupIds.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="text-lg font-medium">Creating Hackathon...</span>
                </div>
              ) : (
                <>
                  <FiSave className="w-6 h-6" />
                  <span className="text-lg font-medium">Create Hackathon</span>
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateHackathonPage;
