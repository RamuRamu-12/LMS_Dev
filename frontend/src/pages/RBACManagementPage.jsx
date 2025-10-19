import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUsers, FiBook, FiCode, FiAward, FiSave, FiRefreshCw } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const RBACManagementPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkPermissions, setBulkPermissions] = useState({
    courses: true,
    hackathons: false,
    realtimeProjects: false
  });

  const fetchStudentPermissions = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rbac/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.data) {
          console.log('Fetched permissions from backend:', data.data);
          // Merge fetched permissions with existing ones, but don't override with empty objects
          setPermissions(prev => {
            const merged = { ...prev };
            Object.entries(data.data).forEach(([studentId, permissions]) => {
              // Only update if the fetched permissions are not empty
              if (permissions && Object.keys(permissions).length > 0) {
                merged[studentId] = permissions;
              }
            });
            return merged;
          });
        }
      } else {
        // If response is not ok, use default permissions
        console.log('Failed to fetch permissions, response not ok:', response.status);
        return;
      }
    } catch (error) {
      // Use default permissions - silently fail
      return;
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users?role=student`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      if (data.success && data.data?.users) {
        setStudents(data.data.users);
        const initialPermissions = {};
        data.data.users.forEach(student => {
          initialPermissions[student.id] = {
            courses: true,
            hackathons: false,
            realtimeProjects: false
          };
        });
        console.log('Initial permissions created for students:', initialPermissions);
        setPermissions(initialPermissions);
        
        // Try to fetch existing permissions, but don't fail if it doesn't work
        fetchStudentPermissions().catch((error) => {
          console.log('Failed to fetch existing permissions, using defaults:', error);
          // Use defaults if fetch fails
        });
      } else {
        setStudents([]);
        setPermissions({});
      }
    } catch (error) {
      setStudents([]);
      setPermissions({});
      // Don't show error to user, just use empty state
    } finally {
      setLoading(false);
    }
  }, [fetchStudentPermissions]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const savePermissions = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }
      
      // Filter out empty permission objects and only send students with actual permission changes
      const filteredPermissions = {};
      Object.entries(permissions).forEach(([studentId, studentPermissions]) => {
        // Only include students that have actual permission values (not empty objects)
        if (studentPermissions && 
            Object.keys(studentPermissions).length > 0 &&
            (studentPermissions.courses !== undefined || 
             studentPermissions.hackathons !== undefined || 
             studentPermissions.realtimeProjects !== undefined)) {
          filteredPermissions[studentId] = studentPermissions;
        }
      });
      
      console.log('Saving permissions (filtered):', filteredPermissions);
      console.log('Original permissions object:', permissions);
      
      // Don't send request if no permissions to update
      if (Object.keys(filteredPermissions).length === 0) {
        alert('No permission changes to save.');
        setSaving(false);
        return;
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rbac/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions: filteredPermissions })
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        if (responseData && responseData.success) {
          console.log('✅ Permissions saved successfully!');
          alert('Permissions saved successfully!');
          // Don't refresh - keep the current state since it's already correct
          console.log('✅ Permissions state maintained - no refresh needed');
        } else {
          alert('Failed to save permissions. Please try again.');
        }
      } else {
        alert(`Failed to save permissions: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Save permissions error:', error);
      alert('Failed to save permissions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (studentId, permissionType) => {
    setPermissions(prev => {
      const currentStudentPerms = prev[studentId] || {
        courses: true,
        hackathons: false,
        realtimeProjects: false
      };
      
      const newPermissions = {
        ...prev,
        [studentId]: {
          ...currentStudentPerms,
          [permissionType]: !currentStudentPerms[permissionType]
        }
      };
      
      console.log(`Toggled ${permissionType} for student ${studentId}:`, newPermissions[studentId]);
      return newPermissions;
    });
  };

  const handleBulkPermissionChange = (permissionType, value) => {
    setBulkPermissions(prev => ({
      ...prev,
      [permissionType]: value
    }));
  };

  const applyBulkPermissions = () => {
    const newPermissions = { ...permissions };
    selectedStudents.forEach(studentId => {
      const currentStudentPerms = newPermissions[studentId] || {
        courses: true,
        hackathons: false,
        realtimeProjects: false
      };
      
      newPermissions[studentId] = {
        ...currentStudentPerms,
        ...bulkPermissions
      };
    });
    setPermissions(newPermissions);
    setSelectedStudents([]);
  };

  const selectAllStudents = () => {
    const filteredStudentIds = getFilteredStudents().map(student => student.id);
    setSelectedStudents(filteredStudentIds);
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getFilteredStudents = () => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getPermissionStats = () => {
    const totalStudents = students.length;
    const coursesEnabled = Object.values(permissions).filter(p => p && p.courses).length;
    const hackathonsEnabled = Object.values(permissions).filter(p => p && p.hackathons).length;
    const realtimeProjectsEnabled = Object.values(permissions).filter(p => p && p.realtimeProjects).length;

    return {
      totalStudents,
      coursesEnabled,
      hackathonsEnabled,
      realtimeProjectsEnabled
    };
  };

  const stats = getPermissionStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RBAC Management</h1>
          <p className="text-gray-600 mt-1">Control student access to courses, hackathons, and realtime projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={savePermissions}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <FiRefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiUsers className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiBook className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Courses Access</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.coursesEnabled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiAward className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hackathons Access</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.hackathonsEnabled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiCode className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Projects Access</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.realtimeProjectsEnabled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {selectedStudents.length > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedStudents.length} student(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={bulkPermissions.courses}
                    onChange={(e) => handleBulkPermissionChange('courses', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Courses</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={bulkPermissions.hackathons}
                    onChange={(e) => handleBulkPermissionChange('hackathons', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Hackathons</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={bulkPermissions.realtimeProjects}
                    onChange={(e) => handleBulkPermissionChange('realtimeProjects', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Projects</span>
                </label>
                <button
                  onClick={applyBulkPermissions}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllStudents}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="text-gray-600 hover:text-gray-700 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Student Access Control ({students.length > 0 ? getFilteredStudents().length : 0} students)
          </h3>
          {students.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {getFilteredStudents().length === students.length 
                ? 'All students shown' 
                : `${getFilteredStudents().length} of ${students.length} students shown`
              }
            </p>
          )}
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Students Found</h3>
            <p className="text-gray-500 mb-4">Students will appear here once they register in the system.</p>
            <button
              onClick={fetchStudents}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Refresh List
            </button>
          </div>
        ) : getFilteredStudents().length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No students match your search</p>
            <p className="text-gray-400 text-sm">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hackathons
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredStudents().map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex items-center space-x-3">
                          <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=6366f1&color=fff`}
                            alt={student.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => togglePermission(student.id, 'courses')}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                          permissions[student.id]?.courses 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                          permissions[student.id]?.courses ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => togglePermission(student.id, 'hackathons')}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                          permissions[student.id]?.hackathons 
                            ? 'bg-purple-500' 
                            : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                          permissions[student.id]?.hackathons ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => togglePermission(student.id, 'realtimeProjects')}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                          permissions[student.id]?.realtimeProjects 
                            ? 'bg-orange-500' 
                            : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                          permissions[student.id]?.realtimeProjects ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default RBACManagementPage;