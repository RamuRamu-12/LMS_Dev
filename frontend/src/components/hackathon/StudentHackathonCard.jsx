import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiAward, FiClock, FiEye, FiEdit3, FiCheckCircle } from 'react-icons/fi';
import { hackathonService } from '../../services/hackathonService';
import HackathonSubmissionForm from './HackathonSubmissionForm';
import HackathonSubmissionDetails from './HackathonSubmissionDetails';

const StudentHackathonCard = ({ hackathon, index, onViewDetails }) => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubmission();
  }, [hackathon.id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await hackathonService.getMySubmission(hackathon.id);
      setSubmission(response.data);
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionSuccess = (updatedSubmission) => {
    setSubmission(updatedSubmission);
    setShowSubmissionForm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
              {hackathon.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {hackathon.description}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(hackathon.status)}`}>
            {getStatusText(hackathon.status)}
          </span>
        </div>

        {/* Technology */}
        {hackathon.technology && (
          <div className="flex items-center space-x-2 mb-4">
            <FiAward className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-gray-600">{hackathon.technology}</span>
          </div>
        )}

        {/* Date and Time */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <FiCalendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FiClock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {formatTime(hackathon.start_date)} - {formatTime(hackathon.end_date)}
            </span>
          </div>
        </div>

        {/* Groups */}
        <div className="flex items-center space-x-2 mb-4">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {hackathon.groups?.length || 0} / {hackathon.max_groups || '∞'} groups
          </span>
        </div>

        {/* Prize */}
        {hackathon.prize_description && (
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-700">Prize: </span>
            <span className="text-sm text-gray-600">{hackathon.prize_description}</span>
          </div>
        )}

        {/* Submission Status */}
        {submission && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiCheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Submission: {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                </span>
              </div>
              {submission.is_winner && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  Winner
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onViewDetails(hackathon.id)}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <FiEye className="w-4 h-4 mr-2" />
            View Details
          </button>
          
          {submission ? (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSubmissionDetails(true)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <FiEye className="w-4 h-4 mr-1" />
                View Submission
              </button>
              <button
                onClick={() => setShowSubmissionForm(true)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <FiEdit3 className="w-4 h-4 mr-1" />
                Edit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSubmissionForm(true)}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <FiEdit3 className="w-4 h-4 mr-2" />
              Submit Project
            </button>
          )}
        </div>
      </div>

      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <HackathonSubmissionForm
          hackathon={hackathon}
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={handleSubmissionSuccess}
        />
      )}

      {/* Submission Details Modal */}
      {showSubmissionDetails && submission && (
        <HackathonSubmissionDetails
          submission={submission}
          onClose={() => setShowSubmissionDetails(false)}
        />
      )}
    </motion.div>
  );
};

export default StudentHackathonCard;
