import React, { useEffect } from 'react';
import { FiX, FiCalendar, FiUsers, FiTag, FiAward, FiClock, FiFileText, FiVideo, FiFile } from 'react-icons/fi';

const HackathonDetailsModal = ({ hackathon, onClose }) => {
  useEffect(() => {
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    // Cleanup: restore body scrolling when modal is closed
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!hackathon) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return 'Unknown';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onWheel={(e) => e.preventDefault()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="relative">
          {/* Hackathon Logo/Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-10 rounded-t-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white opacity-5"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-white bg-opacity-25 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white border-opacity-30">
                  <FiAward className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                    {hackathon.name}
                  </h1>
                  <p className="text-purple-100 mt-2 text-lg font-medium">Hackathon Details & Information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-all duration-200 hover:bg-white hover:bg-opacity-20 p-2 rounded-full"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Status and Difficulty Tags */}
          <div className="absolute -bottom-6 left-10 flex space-x-3 z-20">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm border ${getStatusColor(hackathon.status)} border-opacity-50`}>
              {getStatusText(hackathon.status)}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm border ${getDifficultyColor(hackathon.difficulty)} border-opacity-50`}>
              {getDifficultyText(hackathon.difficulty)}
            </span>
          </div>
        </div>

        <div className="p-8 pt-16 bg-gradient-to-br from-gray-50 to-blue-50 min-h-[70vh]">
          {/* Description */}
          {hackathon.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-3"></div>
                About This Hackathon
              </h2>
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
                <p className="text-gray-700 leading-relaxed text-base">{hackathon.description}</p>
              </div>
            </div>
          )}

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Technology */}
            {(hackathon.technology || (hackathon.tech_stack && hackathon.tech_stack.length > 0)) && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg">
                    <FiTag className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Technology</h3>
                </div>
                {hackathon.technology && (
                  <p className="text-gray-700 text-sm font-medium mb-3">{hackathon.technology}</p>
                )}
                
                {hackathon.tech_stack && hackathon.tech_stack.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {hackathon.tech_stack.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg shadow-lg">
                  <FiCalendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Start Date</span>
                  <p className="text-gray-800 text-sm font-medium mt-1">{formatDateTime(hackathon.start_date)}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">End Date</span>
                  <p className="text-gray-800 text-sm font-medium mt-1">{formatDateTime(hackathon.end_date)}</p>
                </div>
              </div>
            </div>

            {/* Groups */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg shadow-lg">
                  <FiUsers className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Groups</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-800 text-sm font-bold">
                      {hackathon.groups?.length || 0} / {hackathon.max_groups || '∞'}
                    </span>
                    {hackathon.max_groups && (
                      <span className="text-xs font-semibold text-green-600">
                        {Math.round(((hackathon.groups?.length || 0) / hackathon.max_groups) * 100)}% filled
                      </span>
                    )}
                  </div>
                  {hackathon.max_groups && (
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(((hackathon.groups?.length || 0) / hackathon.max_groups) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prize */}
            {hackathon.prize_description && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-2 rounded-lg shadow-lg">
                    <FiAward className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Prizes</h3>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-yellow-100">
                  <p className="text-gray-800 text-sm leading-relaxed">{hackathon.prize_description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Rules and Requirements */}
          {(hackathon.rules || hackathon.requirements) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-3"></div>
                Guidelines & Requirements
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hackathon.rules && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-2 rounded-lg shadow-lg">
                        <FiFileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Rules</h3>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-yellow-100">
                      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{hackathon.rules}</p>
                    </div>
                  </div>
                )}

                {hackathon.requirements && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg">
                        <FiFileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Requirements</h3>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-indigo-100">
                      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{hackathon.requirements}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multimedia Content */}
          {(hackathon.video_url || hackathon.pdf_url) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-3"></div>
                Resources & Materials
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hackathon.video_url && (
                  <a
                    href={hackathon.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FiVideo className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Introduction Video</h3>
                        <p className="text-gray-600 text-sm">Watch the hackathon overview and guidelines</p>
                      </div>
                    </div>
                  </a>
                )}

                {hackathon.pdf_url && (
                  <a
                    href={hackathon.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FiFile className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Guidelines PDF</h3>
                        <p className="text-gray-600 text-sm">Download detailed project guidelines</p>
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-base"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetailsModal;
