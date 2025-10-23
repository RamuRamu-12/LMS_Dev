import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiUsers, FiTag, FiUserPlus, FiUserMinus, FiPlus, FiSearch, FiTrash2, FiSettings } from 'react-icons/fi';
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
  const [hackathonGroups, setHackathonGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    
    // Fetch students and hackathon groups
    fetchStudents();
    fetchHackathonGroups();
  }, [hackathon, preservedFormData]);


  const fetchStudents = async () => {
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

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users?role=student`, {
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
        throw new Error(`Failed to fetch students: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data?.users) {
        setStudents(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchHackathonGroups = async () => {
    if (!hackathon?.id) return;
    
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

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/hackathons/${hackathon.id}/groups`, {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch hackathon groups: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Convert hackathon groups to the format expected by the UI
        const groupsWithMembers = data.data.map(group => {
          // Ensure groupMembers is an array and handle edge cases
          const groupMembers = Array.isArray(group.groupMembers) ? group.groupMembers : [];
          
          return {
            id: group.id,
            name: group.name,
            description: group.description,
            max_members: group.max_members,
            student_ids: groupMembers.map(member => {
              // Handle case where member.student might be null/undefined
              return member.student ? member.student.id : member.student_id;
            }).filter(id => id != null) // Remove any null/undefined IDs
          };
        });
        console.log('EditHackathonModal - Groups fetched successfully:', groupsWithMembers);
        setHackathonGroups(groupsWithMembers);
      } else {
        console.log('EditHackathonModal - No groups data received');
        setHackathonGroups([]);
      }
    } catch (error) {
      console.error('Error fetching hackathon groups:', error);
      // Show error to user but don't break the UI
      console.warn('Failed to load hackathon groups, continuing with empty groups');
      setHackathonGroups([]);
    } finally {
      setLoadingGroups(false);
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

  // Add a new group for this hackathon
  const addGroup = () => {
    const newGroup = {
      id: Date.now(), // Temporary ID for UI
      name: '',
      description: '',
      student_ids: [],
      max_members: null
    };
    setHackathonGroups(prev => [...prev, newGroup]);
  };

  // Remove a group from this hackathon
  const removeGroup = (groupId) => {
    setHackathonGroups(prev => prev.filter(group => group.id !== groupId));
  };

  // Update group details
  const updateGroup = (groupId, updates) => {
    setHackathonGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, ...updates } : group
    ));
  };

  // Add student to group
  const addStudentToGroup = (groupId, studentId) => {
    setHackathonGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const newStudentIds = [...(group.student_ids || []), studentId];
        return { ...group, student_ids: newStudentIds };
      }
      return group;
    }));
  };

  // Remove student from group
  const removeStudentFromGroup = (groupId, studentId) => {
    setHackathonGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const newStudentIds = (group.student_ids || []).filter(id => id !== studentId);
        return { ...group, student_ids: newStudentIds };
      }
      return group;
    }));
  };

  const getTotalParticipants = () => {
    return hackathonGroups.reduce((total, group) => total + (group.student_ids?.length || 0), 0);
  };

  // Filter students based on search term
  const getFilteredStudents = (groupStudentIds = []) => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const notInGroup = !groupStudentIds.includes(student.id);
      return matchesSearch && notInGroup;
    });
  };

  // Get students already in a group
  const getStudentsInGroup = (groupStudentIds = []) => {
    return students.filter(student => groupStudentIds.includes(student.id));
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
          groups: hackathonGroups.filter(group => group.name && group.student_ids && group.student_ids.length > 0)
        };
        
        console.log('EditHackathonModal - Sending groups data:', updateData.groups);
        console.log('EditHackathonModal - Total groups to send:', updateData.groups.length);
        
        // Validate groups before sending
        for (const group of updateData.groups) {
          if (!group.name || !group.student_ids || group.student_ids.length === 0) {
            throw new Error(`Group "${group.name || 'Unnamed'}" is missing required information`);
          }
        }
        
      await onSave(updateData);
    } catch (error) {
      console.error('Error saving hackathon:', error);
      alert(`Failed to update hackathon: ${error.message}`);
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

          {/* Hackathon Groups Management */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <label className="block text-lg font-semibold text-gray-900">
                Hackathon Groups
              </label>
              <div className="text-right">
                <div className="text-sm text-gray-500">Groups Created</div>
                <div className="text-lg font-bold text-indigo-600">{hackathonGroups.length}</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Manage groups specifically for this hackathon. Each group is tied exclusively to this hackathon.
            </p>
            
            {/* Create New Group Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={addGroup}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <FiPlus className="w-5 h-5" />
                <span className="font-medium">Add New Group</span>
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Create groups specifically for this hackathon
              </p>
            </div>
            
            {loadingGroups ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading groups...</p>
              </div>
            ) : hackathonGroups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No groups created yet for this hackathon.
              </div>
            ) : (
              <div className="space-y-4">
                {hackathonGroups.map((group, index) => (
                  <div key={group.id} className="bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                            placeholder="Enter group name"
                            className="text-xl font-bold text-gray-900 bg-transparent border-none outline-none flex-1 placeholder-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => removeGroup(group.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Remove group"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <textarea
                          value={group.description || ''}
                          onChange={(e) => updateGroup(group.id, { description: e.target.value })}
                          placeholder="Group description (optional)"
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4 resize-none"
                        />

                        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6 p-4 bg-white rounded-lg border border-gray-200">
                          <span className="flex items-center">
                            <FiUsers className="w-4 h-4 mr-2 text-indigo-600" />
                            <span className="font-medium">{group.student_ids?.length || 0}</span>
                            <span className="ml-1">member{(group.student_ids?.length || 0) !== 1 ? 's' : ''}</span>
                              </span>
                          <div className="flex items-center space-x-2">
                            <label className="text-gray-600">Max:</label>
                            <input
                              type="number"
                              value={group.max_members || ''}
                              onChange={(e) => updateGroup(group.id, { max_members: e.target.value ? parseInt(e.target.value) : null })}
                              placeholder="∞"
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                              min="1"
                            />
                          </div>
                        </div>

                        {/* Student Selection */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-700">Student Management</div>
                            <div className="text-xs text-gray-500">
                              {getStudentsInGroup(group.student_ids).length} selected
                            </div>
                          </div>
                          
                          {/* Search Bar */}
                          <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search students by name or email..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                          </div>

                          {/* Students Already in Group */}
                          {getStudentsInGroup(group.student_ids).length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">Selected Students:</div>
                              <div className="flex flex-wrap gap-2">
                                {getStudentsInGroup(group.student_ids).map((student) => (
                                  <button
                                    key={student.id}
                                    type="button"
                                    onClick={() => removeStudentFromGroup(group.id, student.id)}
                                    className="bg-indigo-100 text-indigo-800 border border-indigo-300 px-3 py-2 rounded-lg text-sm hover:bg-indigo-200 transition-colors flex items-center space-x-2"
                                  >
                                    <span>{student.name}</span>
                                    <FiX className="w-3 h-3" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Available Students */}
                          {getFilteredStudents(group.student_ids).length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                Available Students ({getFilteredStudents(group.student_ids).length}):
                        </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                {getFilteredStudents(group.student_ids).map((student) => (
                                  <button
                                    key={student.id}
                                    type="button"
                                    onClick={() => addStudentToGroup(group.id, student.id)}
                                    className="bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-left"
                                  >
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-xs text-gray-500">{student.email}</div>
                                  </button>
                                ))}
                </div>
              </div>
            )}
            
                          {getFilteredStudents(group.student_ids).length === 0 && searchTerm && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No students found matching "{searchTerm}"
                  </div>
                )}
              </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
