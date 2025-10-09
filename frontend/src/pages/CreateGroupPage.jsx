import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSave, FiX, FiUsers, FiPlus, FiMinus, FiUser, FiUserCheck, FiSearch } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';

const CreateGroupPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

    // Get hackathon data from location state
    const hackathonData = location.state?.hackathonData;
    const groupIndex = location.state?.groupIndex; // For editing existing group
    const existingGroup = location.state?.existingGroup;
    const isUpdate = location.state?.isUpdate; // Check if called from update modal
    const hackathonId = location.state?.hackathonId; // Hackathon ID for updates

  const [formData, setFormData] = useState({
    name: existingGroup?.name || '',
    description: existingGroup?.description || '',
    max_members: existingGroup?.max_members || '',
    student_ids: existingGroup?.student_ids || []
  });

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

  useEffect(() => {
    fetchStudents();
    if (existingGroup) {
      setSelectedStudents(existingGroup.student_ids || []);
    }
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStudentSelection = (studentId, isSelected) => {
    if (isSelected) {
      // Check max members limit
      if (formData.max_members && selectedStudents.length >= parseInt(formData.max_members)) {
        alert(`Maximum ${formData.max_members} members allowed in this group`);
        return;
      }
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Group name is required');
      }

      if (selectedStudents.length === 0) {
        throw new Error('Please select at least one student for the group');
      }

      // Validate max members
      if (formData.max_members && selectedStudents.length > parseInt(formData.max_members)) {
        throw new Error(`Cannot select more than ${formData.max_members} members`);
      }

      const groupData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        max_members: formData.max_members ? parseInt(formData.max_members) : null,
        student_ids: selectedStudents
      };

      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Create the group in the backend
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create group');
      }

      const data = await response.json();
      
        if (data.success) {
          if (isUpdate) {
            // If called from update modal, go back to hackathons list with edit modal state
            navigate('/admin/hackathons', {
              state: {
                groupCreated: true,
                openEditModal: true,
                hackathonId: hackathonId,
                hackathonData: hackathonData,
                message: 'Group created successfully! The edit modal will reopen with your form data preserved.'
              }
            });
          } else {
            // Navigate back to hackathon creation page with restored hackathon data
            navigate('/admin/hackathons/create', {
              state: {
                hackathonData: hackathonData, // Restore the hackathon form data
                groupCreated: true // Signal that a group was created
              }
            });
          }
        } else {
          throw new Error(data.message || 'Failed to create group');
        }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isUpdate) {
      // If called from update modal, go back to hackathons list
      navigate('/admin/hackathons');
    } else {
      // If called from create page, go back to create page
      navigate('/admin/hackathons/create', {
        state: { hackathonData }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {existingGroup ? 'Edit Group' : 'Create New Group'}
            </h1>
            <p className="text-gray-600 mt-2">
              {existingGroup 
                ? 'Modify group details and member assignments'
                : 'Set up a new group for the hackathon'
              }
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-sm border border-gray-200"
          >
            <FiX className="w-5 h-5" />
            <span>Cancel</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Group Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiUsers className="w-6 h-6 mr-3 text-indigo-600" />
              Group Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter group name (e.g., Team Alpha, Developers United)"
                  required
                />
              </div>

              <div>
                <label htmlFor="max_members" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Members
                </label>
                <input
                  type="number"
                  id="max_members"
                  name="max_members"
                  value={formData.max_members}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Set a limit on group size (optional)
                </p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Group Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Describe the group's focus or purpose (optional)"
                />
              </div>
            </div>
          </motion.div>

          {/* Student Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FiUserCheck className="w-6 h-6 mr-3 text-indigo-600" />
                Select Group Members
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-indigo-600">{selectedStudents.length}</span>
                  {formData.max_members && (
                    <span className="text-gray-400"> / {formData.max_members}</span>
                  )}
                  <span className="ml-1">selected</span>
                </div>
                {formData.max_members && (
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((selectedStudents.length / parseInt(formData.max_members)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                  placeholder="Search students by name or email..."
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-500">
                  Showing {filteredStudents.length} of {students.length} students
                </p>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {students.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No students found. Please check your authentication and try again.</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiSearch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No students found matching "{searchTerm}"</p>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudents.includes(student.id);
                    const isDisabled = formData.max_members && 
                      !isSelected && 
                      selectedStudents.length >= parseInt(formData.max_members);
                    
                    return (
                      <label
                        key={student.id}
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-indigo-50 border-2 border-indigo-200' 
                            : isDisabled
                            ? 'bg-gray-50 border border-gray-200 cursor-not-allowed opacity-50'
                            : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={(e) => handleStudentSelection(student.id, e.target.checked)}
                          className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="ml-2">
                            <FiUserCheck className="w-5 h-5 text-indigo-600" />
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedStudents.length > 0 && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <h3 className="text-sm font-medium text-indigo-900 mb-2">Selected Members:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map(studentId => {
                    const student = students.find(s => s.id === studentId);
                    return student ? (
                      <div key={studentId} className="flex items-center bg-white px-3 py-1 rounded-full text-sm border border-indigo-200">
                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700">{student.name}</span>
                        <button
                          type="button"
                          onClick={() => handleStudentSelection(studentId, false)}
                          className="ml-2 text-gray-400 hover:text-red-500"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="mt-2 text-xs text-indigo-700">
                  {selectedStudents.length} member{selectedStudents.length !== 1 ? 's' : ''} selected
                  {formData.max_members && ` (max ${formData.max_members})`}
                </div>
              </div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-end space-x-4"
          >
            <button
              type="button"
              onClick={handleCancel}
              className="bg-white text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedStudents.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span>{existingGroup ? 'Update Group' : 'Create Group'}</span>
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupPage;
