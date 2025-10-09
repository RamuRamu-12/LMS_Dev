import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink, FiVideo, FiFileText, FiUpload, FiSave, FiSend } from 'react-icons/fi';
import { hackathonService } from '../../services/hackathonService';

const HackathonSubmissionForm = ({ hackathon, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    project_title: '',
    project_description: '',
    github_url: '',
    live_url: '',
    demo_video_url: '',
    presentation_url: '',
    documentation_url: '',
    additional_files_url: '',
    submission_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);

  useEffect(() => {
    fetchExistingSubmission();
  }, [hackathon.id]);

  const fetchExistingSubmission = async () => {
    try {
      const response = await hackathonService.getMySubmission(hackathon.id);
      if (response.data) {
        setExistingSubmission(response.data);
        setFormData({
          project_title: response.data.project_title || '',
          project_description: response.data.project_description || '',
          github_url: response.data.github_url || '',
          live_url: response.data.live_url || '',
          demo_video_url: response.data.demo_video_url || '',
          presentation_url: response.data.presentation_url || '',
          documentation_url: response.data.documentation_url || '',
          additional_files_url: response.data.additional_files_url || '',
          submission_notes: response.data.submission_notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching existing submission:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.project_title.trim()) {
      setError('Project title is required');
      return false;
    }
    if (!formData.project_description.trim()) {
      setError('Project description is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const response = await hackathonService.createOrUpdateSubmission(hackathon.id, formData);
      setSuccess('Submission saved successfully!');
      setExistingSubmission(response.data);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save submission');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      // First save the submission
      await hackathonService.createOrUpdateSubmission(hackathon.id, formData);
      
      // Then submit it
      const response = await hackathonService.submitSubmission(hackathon.id);
      setSuccess('Submission submitted successfully!');
      setExistingSubmission(response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit submission');
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmissionDeadlinePassed = () => {
    const now = new Date();
    const endDate = new Date(hackathon.end_date);
    return now > endDate;
  };

  const canSubmit = () => {
    return !isSubmissionDeadlinePassed() && 
           formData.project_title.trim() && 
           formData.project_description.trim();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Submit Your Project
              </h2>
              <p className="text-gray-600 mt-1">
                {hackathon.name} - {existingSubmission ? 'Update Submission' : 'Create New Submission'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {isSubmissionDeadlinePassed() && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-600">
                ⚠️ Submission deadline has passed. You can still save your work but cannot submit.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Project Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="project_title"
                value={formData.project_title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your project title"
                required
              />
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                name="project_description"
                value={formData.project_description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your project, its features, and how it works"
                required
              />
            </div>

            {/* URLs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GitHub URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiGithub className="inline w-4 h-4 mr-1" />
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              {/* Live URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiExternalLink className="inline w-4 h-4 mr-1" />
                  Live Application URL
                </label>
                <input
                  type="url"
                  name="live_url"
                  value={formData.live_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://your-app.com"
                />
              </div>

              {/* Demo Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiVideo className="inline w-4 h-4 mr-1" />
                  Demo Video URL (Drive Link)
                </label>
                <input
                  type="url"
                  name="demo_video_url"
                  value={formData.demo_video_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://drive.google.com/file/..."
                />
              </div>

              {/* Presentation URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiFileText className="inline w-4 h-4 mr-1" />
                  Presentation Slides URL (Drive Link)
                </label>
                <input
                  type="url"
                  name="presentation_url"
                  value={formData.presentation_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://drive.google.com/file/..."
                />
              </div>

              {/* Documentation URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiFileText className="inline w-4 h-4 mr-1" />
                  Documentation URL (Drive Link)
                </label>
                <input
                  type="url"
                  name="documentation_url"
                  value={formData.documentation_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://drive.google.com/file/..."
                />
              </div>

              {/* Additional Files URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUpload className="inline w-4 h-4 mr-1" />
                  Additional Files URL (Drive Link)
                </label>
                <input
                  type="url"
                  name="additional_files_url"
                  value={formData.additional_files_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://drive.google.com/file/..."
                />
              </div>
            </div>

            {/* Submission Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="submission_notes"
                value={formData.submission_notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Any additional information about your submission..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.project_title.trim() || !formData.project_description.trim()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <FiSend className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Project'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HackathonSubmissionForm;
