import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiAward, FiClock, FiEye } from 'react-icons/fi';

const StudentHackathonCard = ({ hackathon, index, onViewDetails }) => {
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

        {/* Participants */}
        <div className="flex items-center space-x-2 mb-4">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {hackathon.current_participants || 0} / {hackathon.max_participants || '∞'} participants
          </span>
        </div>

        {/* Prize */}
        {hackathon.prize_description && (
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-700">Prize: </span>
            <span className="text-sm text-gray-600">{hackathon.prize_description}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onViewDetails(hackathon.id)}
          className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          <FiEye className="w-4 h-4 mr-2" />
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default StudentHackathonCard;
