import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCalendar, FiUsers, FiAward, FiClock, FiExternalLink, FiDownload } from 'react-icons/fi';

const StudentHackathonDetailsModal = ({ hackathon, onClose }) => {
  if (!hackathon) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <FiX className="w-6 h-6" />
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{hackathon.name}</h2>
              <p className="text-indigo-100 mb-4">{hackathon.description}</p>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hackathon.status)}`}>
                  {getStatusText(hackathon.status)}
                </span>
                {hackathon.technology && (
                  <div className="flex items-center space-x-2">
                    <FiAward className="w-4 h-4" />
                    <span className="text-sm">{hackathon.technology}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Schedule */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiCalendar className="w-5 h-5 mr-2 text-blue-600" />
              Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Start Date & Time</h4>
                <p className="text-gray-600">{formatDate(hackathon.start_date)}</p>
                <p className="text-sm text-gray-500">{formatTime(hackathon.start_date)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">End Date & Time</h4>
                <p className="text-gray-600">{formatDate(hackathon.end_date)}</p>
                <p className="text-sm text-gray-500">{formatTime(hackathon.end_date)}</p>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiUsers className="w-5 h-5 mr-2 text-green-600" />
              Participants
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-green-600">
                {hackathon.current_participants || 0}
              </div>
              <div className="text-gray-600">
                <span className="text-sm">out of </span>
                <span className="font-medium">{hackathon.max_participants || '∞'}</span>
                <span className="text-sm"> participants</span>
              </div>
            </div>
          </div>

          {/* Prize */}
          {hackathon.prize_description && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiAward className="w-5 h-5 mr-2 text-yellow-600" />
                Prize
              </h3>
              <p className="text-gray-700">{hackathon.prize_description}</p>
            </div>
          )}

          {/* Rules */}
          {hackathon.rules && (
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rules</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{hackathon.rules}</p>
              </div>
            </div>
          )}

          {/* Requirements */}
          {hackathon.requirements && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{hackathon.requirements}</p>
              </div>
            </div>
          )}

          {/* Technology Stack */}
          {hackathon.tech_stack && hackathon.tech_stack.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {hackathon.tech_stack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          <div className="space-y-4">
            {hackathon.video_url && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FiExternalLink className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Intro Video</h4>
                    <p className="text-sm text-gray-600">Watch the hackathon introduction</p>
                  </div>
                </div>
                <a
                  href={hackathon.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>Watch</span>
                  <FiExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {hackathon.pdf_url && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiDownload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Documentation</h4>
                    <p className="text-sm text-gray-600">Download hackathon guidelines</p>
                  </div>
                </div>
                <a
                  href={hackathon.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>Download</span>
                  <FiDownload className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentHackathonDetailsModal;
