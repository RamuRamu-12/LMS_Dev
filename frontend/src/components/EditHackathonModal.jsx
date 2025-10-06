import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiUsers, FiTag, FiUserPlus, FiUserMinus } from 'react-icons/fi';

const EditHackathonModal = ({ hackathon, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
    pdf_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (hackathon) {
      setFormData({
        name: hackathon.name || '',
        description: hackathon.description || '',
        technology: hackathon.technology || '',
        tech_stack: hackathon.tech_stack || [],
        start_date: hackathon.start_date ? new Date(hackathon.start_date).toISOString().slice(0, 16) : '',
        end_date: hackathon.end_date ? new Date(hackathon.end_date).toISOString().slice(0, 16) : '',
        difficulty: hackathon.difficulty || 'intermediate',
        max_participants: hackathon.max_participants || '',
        prize_description: hackathon.prize_description || '',
        rules: hackathon.rules || '',
        requirements: hackathon.requirements || '',
        video_url: hackathon.video_url || '',
        pdf_url: hackathon.pdf_url || ''
      });
      
      // Set selected students if hackathon has participants
      if (hackathon.participants && hackathon.participants.length > 0) {
        setSelectedStudents(hackathon.participants.map(p => p.student_id || p.id));
      }
    }
    
    // Fetch students
    fetchStudents();
  }, [hackathon]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      
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
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch('/api/users?role=student', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('token');
          throw new Error('Authentication token not found. Please login again.');
        }
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      console.log('Students API response:', data);
      
      // Handle different possible response formats
      let studentsArray = [];
      if (data.data && Array.isArray(data.data)) {
        studentsArray = data.data;
      } else if (Array.isArray(data)) {
        studentsArray = data;
      } else if (data.students && Array.isArray(data.students)) {
        studentsArray = data.students;
      }
      
      console.log('Processed students array:', studentsArray);
      setStudents(studentsArray);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
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

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAllStudents = () => {
    if (!Array.isArray(students) || students.length === 0) {
      return;
    }
    
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id));
    }
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
        student_ids: selectedStudents
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
                Max Participants
              </label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
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

          {/* Eligible Students */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Eligible Students
              </label>
              <button
                type="button"
                onClick={handleSelectAllStudents}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                disabled={!Array.isArray(students) || students.length === 0}
              >
                {Array.isArray(students) && selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Select students who are eligible to participate in this hackathon. You can leave this empty to allow all students.
            </p>
            
            {loadingStudents ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading students...</p>
              </div>
            ) : !Array.isArray(students) || students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found. Please check your authentication and try again.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="space-y-2">
                  {Array.isArray(students) && students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label
                        htmlFor={`student-${student.id}`}
                        className="flex-1 cursor-pointer text-sm text-gray-700"
                      >
                        <div className="font-medium">{student.username || student.name}</div>
                        <div className="text-gray-500">{student.email}</div>
                      </label>
                      {selectedStudents.includes(student.id) ? (
                        <FiUserMinus className="w-4 h-4 text-red-500" />
                      ) : (
                        <FiUserPlus className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedStudents.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                {selectedStudents.length} student(s) selected
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
