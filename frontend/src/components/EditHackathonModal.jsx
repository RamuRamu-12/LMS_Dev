import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiUsers, FiTag, FiUserPlus, FiUserMinus, FiPlus } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const EditHackathonModal = ({ hackathon, preservedFormData, onClose, onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technology: '',
    tech_stack: [],
    start_date: '',
    end_date: '',
    difficulty: 'intermediate',
    max_participants: '',
    max_groups: '',
    prize_description: '',
    rules: '',
    requirements: '',
    video_url: '',
    pdf_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  useEffect(() => {
    if (hackathon) {
      // Use preserved form data if available, otherwise use hackathon data
      const dataToUse = preservedFormData || hackathon;
      setFormData({
        name: dataToUse.name || '',
        description: dataToUse.description || '',
        technology: dataToUse.technology || '',
        tech_stack: dataToUse.tech_stack || [],
        start_date: dataToUse.start_date ? new Date(dataToUse.start_date).toISOString().slice(0, 16) : '',
        end_date: dataToUse.end_date ? new Date(dataToUse.end_date).toISOString().slice(0, 16) : '',
        difficulty: dataToUse.difficulty || 'intermediate',
        max_participants: dataToUse.max_participants || '',
        max_groups: dataToUse.max_groups || '',
        prize_description: dataToUse.prize_description || '',
        rules: dataToUse.rules || '',
        requirements: dataToUse.requirements || '',
        video_url: dataToUse.video_url || '',
        pdf_url: dataToUse.pdf_url || ''
      });
      
      // Don't set selected groups here - let fetchHackathonGroups handle it
      // This prevents race conditions between hackathon.groups and API data
    }
    
    // Fetch all available groups and hackathon groups in parallel
    fetchGroups();
    fetchHackathonGroups();
  }, [hackathon, preservedFormData]);

  // Handle returning from group creation
  useEffect(() => {
    if (location.state?.groupCreated) {
      // Refresh groups when returning from group creation
      fetchGroups();
      fetchHackathonGroups();
      // Clear the state to prevent unnecessary refreshes
      navigate(location.pathname, { replace: true });
    }
  }, [location.state?.groupCreated, navigate, location.pathname]);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      
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
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch('/api/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
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
        return data.data; // Return the groups data
      }
      return [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchHackathonGroups = async () => {
    if (!hackathon?.id) return;
    
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
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`/api/hackathons/${hackathon.id}/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
        // The API returns HackathonGroup objects, we need to map to the original group IDs
        const groupIds = data.data.map(hackathonGroup => hackathonGroup.group_id || hackathonGroup.id);
        setSelectedGroupIds(groupIds);
      } else {
        // If no groups found, ensure selectedGroupIds is empty
        setSelectedGroupIds([]);
      }
    } catch (error) {
      console.error('Error fetching hackathon groups:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTechStackChange = (e) => {
    const value = e.target.value;
    const techStack = value.split(',').map(tech => tech.trim()).filter(tech => tech);
    setFormData(prev => ({
      ...prev,
      tech_stack: techStack
    }));
  };

  const handleGroupSelection = (groupId) => {
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
    const selectedGroups = getSelectedGroups();
    return selectedGroups.reduce((total, group) => total + (group.members?.length || 0), 0);
  };

  const navigateToCreateGroup = () => {
    // Close the modal first
    onClose();
    // Navigate to create group page with hackathon data
    navigate('/admin/hackathons/create-group', {
      state: {
        hackathonData: formData,
        hackathonId: hackathon?.id,
        isUpdate: true
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
        const updateData = {
          ...formData,
          selectedGroupIds: selectedGroupIds.filter(id => id && id !== '')
        };
      await onSave(updateData);
    } catch (error) {
      console.error('Error saving hackathon:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Edit Hackathon</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hackathon Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter hackathon name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technology
              </label>
              <input
                type="text"
                name="technology"
                value={formData.technology}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Machine Learning, Web Development"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tech Stack
            </label>
            <input
              type="text"
              value={Array.isArray(formData.tech_stack) ? formData.tech_stack.join(', ') : formData.tech_stack || ''}
              onChange={handleTechStackChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Python, React, Node.js (comma-separated)"
            />
            <p className="text-sm text-gray-500 mt-1">Separate technologies with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the hackathon..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Dates and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Groups
              </label>
              <input
                type="number"
                name="max_groups"
                value={formData.max_groups}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Optional"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prize Description
              </label>
              <input
                type="text"
                name="prize_description"
                value={formData.prize_description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Multimedia Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL (Drive Link)
              </label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF URL (Drive Link)
              </label>
              <input
                type="url"
                name="pdf_url"
                value={formData.pdf_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>

          {/* Rules and Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rules
              </label>
              <textarea
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Hackathon rules and guidelines..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Project requirements and deliverables..."
              />
            </div>
          </div>

          {/* Group Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Selected Groups
              </label>
              <div className="text-right">
                <div className="text-sm text-gray-500">Selected Groups</div>
                <div className="text-lg font-bold text-indigo-600">{selectedGroupIds.length}</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Select groups that are eligible to participate in this hackathon. You can leave this empty to allow all groups.
              <br />
              <span className="text-indigo-600 font-medium">✓ Currently linked groups are pre-selected</span> - uncheck to remove them.
            </p>
            
            {/* Create New Group Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={navigateToCreateGroup}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <FiPlus className="w-5 h-5" />
                <span className="font-medium">Create New Group</span>
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Create a new group and it will be automatically selected for this hackathon
              </p>
            </div>
            
            {loadingGroups ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading groups...</p>
              </div>
            ) : !Array.isArray(groups) || groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No groups found. Please create groups first.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="space-y-3">
                  {Array.isArray(groups) && groups.map((group) => {
                    const isSelected = selectedGroupIds.includes(group.id);
                    return (
                      <div
                        key={group.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-50 border-2 border-indigo-200' : 'hover:bg-white border border-gray-200'
                        }`}
                        onClick={() => handleGroupSelection(group.id)}
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-600' 
                              : 'border-gray-300 hover:border-indigo-400'
                          }`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 cursor-pointer">
                          <div className={`font-medium flex items-center space-x-2 ${
                            isSelected ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                            <span>{group.name}</span>
                            {isSelected && (
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                                ✓ Linked
                              </span>
                            )}
                          </div>
                          <div className={`text-sm ${
                            isSelected ? 'text-indigo-600' : 'text-gray-500'
                          }`}>
                            {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''}
                            {group.description && ` • ${group.description}`}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <div className="flex items-center space-x-1 text-red-600">
                              <FiUserMinus className="w-4 h-4" />
                              <span className="text-xs font-medium">Remove</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-gray-400 hover:text-indigo-600">
                              <FiUserPlus className="w-4 h-4" />
                              <span className="text-xs font-medium">Add</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Group Analysis Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Group Analysis</h4>
              
              {/* Linked Groups Section */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Currently Linked Groups</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {selectedGroupIds.length} group{selectedGroupIds.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="ml-5 text-sm text-gray-600 mb-2">
                  {getTotalParticipants()} total member{getTotalParticipants() !== 1 ? 's' : ''}
                </div>
                {selectedGroupIds.length > 0 ? (
                  <div className="ml-5 space-y-1">
                    {groups.filter(group => selectedGroupIds.includes(group.id)).map((group, index) => (
                      <div key={group.id} className="flex items-center justify-between text-xs bg-indigo-50 px-2 py-1 rounded">
                        <span className="text-indigo-800 font-medium">{group.name}</span>
                        <span className="text-indigo-600">{group.members?.length || 0} members</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-5 text-xs text-gray-500 italic">No groups currently linked</div>
                )}
              </div>

              {/* Available Groups Section */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="font-medium text-gray-700">Available Groups to Add</span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    {groups.length - selectedGroupIds.length} group{(groups.length - selectedGroupIds.length) !== 1 ? 's' : ''}
                  </span>
                </div>
                {groups.length - selectedGroupIds.length > 0 ? (
                  <div className="ml-5 space-y-1">
                    {groups.filter(group => !selectedGroupIds.includes(group.id)).map((group, index) => (
                      <div key={group.id} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                        <span className="text-gray-700">{group.name}</span>
                        <span className="text-gray-500">{group.members?.length || 0} members</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-5 text-xs text-gray-500 italic">All groups are already linked</div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Hackathon'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHackathonModal;
