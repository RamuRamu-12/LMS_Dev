import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiGithub, 
  FiExternalLink, 
  FiVideo, 
  FiFileText, 
  FiUpload, 
  FiClock, 
  FiUser, 
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';

const HackathonSubmissionDetails = ({ submission, onClose, isAdmin = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'submitted':
        return <FiClock className="w-4 h-4" />;
      case 'under_review':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'accepted':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openUrl = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
                Submission Details
              </h2>
              <p className="text-gray-600 mt-1">
                {submission.hackathon?.name || 'Hackathon Submission'}
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
          {/* Status and Winner Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(submission.status)}`}>
                {getStatusIcon(submission.status)}
                <span className="ml-1 capitalize">{submission.status.replace('_', ' ')}</span>
              </span>
              {submission.is_winner && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 flex items-center">
                  <FiAward className="w-4 h-4 mr-1" />
                  Winner
                </span>
              )}
            </div>
            {submission.ranking && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Ranking</p>
                <p className="text-2xl font-bold text-indigo-600">#{submission.ranking}</p>
              </div>
            )}
          </div>

          {/* Project Information */}
          <div className="space-y-6">
            {/* Project Title and Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {submission.project_title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {submission.project_description}
              </p>
            </div>

            {/* URLs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GitHub URL */}
              {submission.github_url && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiGithub className="w-5 h-5 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">GitHub Repository</p>
                    <button
                      onClick={() => openUrl(submission.github_url)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 truncate"
                    >
                      {submission.github_url}
                    </button>
                  </div>
                </div>
              )}

              {/* Live URL */}
              {submission.live_url && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiExternalLink className="w-5 h-5 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Live Application</p>
                    <button
                      onClick={() => openUrl(submission.live_url)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 truncate"
                    >
                      {submission.live_url}
                    </button>
                  </div>
                </div>
              )}

              {/* Demo Video URL */}
              {submission.demo_video_url && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiVideo className="w-5 h-5 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Demo Video</p>
                    <button
                      onClick={() => openUrl(submission.demo_video_url)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 truncate"
                    >
                      View Demo Video
                    </button>
                  </div>
                </div>
              )}

              {/* Presentation URL */}
              {submission.presentation_url && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiFileText className="w-5 h-5 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Presentation</p>
                    <button
                      onClick={() => openUrl(submission.presentation_url)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 truncate"
                    >
                      View Presentation
                    </button>
                  </div>
                </div>
              )}

              {/* Documentation URL */}
              {submission.documentation_url && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiFileText className="w-5 h-5 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Documentation</p>
                    <button
                      onClick={() => openUrl(submission.documentation_url)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 truncate"
                    >
                      View Documentation
                    </button>
                  </div>
                </div>
              )}

              {/* Additional Files URL */}
              {submission.additional_files_url && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FiUpload className="w-5 h-5 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Additional Files</p>
                    <button
                      onClick={() => openUrl(submission.additional_files_url)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 truncate"
                    >
                      View Additional Files
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submission Notes */}
            {submission.submission_notes && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Additional Notes</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {submission.submission_notes}
                </p>
              </div>
            )}

            {/* Review Information (for admin or if reviewed) */}
            {(isAdmin || submission.review_notes || submission.score) && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Review Information</h4>
                
                {submission.score && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Score</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${submission.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{submission.score}/100</span>
                    </div>
                  </div>
                )}

                {submission.review_notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Review Notes</p>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {submission.review_notes}
                    </p>
                  </div>
                )}

                {submission.prize && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Prize</p>
                    <p className="text-lg font-semibold text-yellow-600">{submission.prize}</p>
                  </div>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Submitted</p>
                  <p className="text-sm text-gray-600">{formatDate(submission.submitted_at)}</p>
                </div>
                {submission.reviewed_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Reviewed</p>
                    <p className="text-sm text-gray-600">{formatDate(submission.reviewed_at)}</p>
                  </div>
                )}
                {submission.reviewer && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Reviewed By</p>
                    <p className="text-sm text-gray-600">{submission.reviewer.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HackathonSubmissionDetails;
