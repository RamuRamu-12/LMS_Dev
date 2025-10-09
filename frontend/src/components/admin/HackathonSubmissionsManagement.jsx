import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiEye, 
  FiCheckCircle, 
  FiXCircle, 
  FiAward, 
  FiStar,
  FiClock,
  FiUser
} from 'react-icons/fi';
import { hackathonService } from '../../services/hackathonService';
import HackathonSubmissionDetails from '../hackathon/HackathonSubmissionDetails';

const HackathonSubmissionsManagement = ({ hackathonId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: 'accepted',
    review_notes: '',
    score: ''
  });

  useEffect(() => {
    fetchSubmissions();
  }, [hackathonId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await hackathonService.getHackathonSubmissions(hackathonId);
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowSubmissionDetails(true);
  };

  const handleReviewSubmission = (submission) => {
    setReviewingSubmission(submission);
    setReviewData({
      status: submission.status === 'accepted' ? 'accepted' : 'rejected',
      review_notes: submission.review_notes || '',
      score: submission.score || ''
    });
  };

  const handleReviewSubmit = async () => {
    try {
      await hackathonService.reviewSubmission(
        hackathonId, 
        reviewingSubmission.id, 
        reviewData
      );
      setReviewingSubmission(null);
      fetchSubmissions();
    } catch (error) {
      console.error('Error reviewing submission:', error);
    }
  };

  const handleSetWinner = async (submission, prize = '', ranking = null) => {
    try {
      await hackathonService.setSubmissionWinner(
        hackathonId,
        submission.id,
        { prize, ranking }
      );
      fetchSubmissions();
    } catch (error) {
      console.error('Error setting winner:', error);
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Submissions</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchSubmissions}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submissions</h2>
          <p className="text-gray-600">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} received
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
          <p className="text-gray-600">Submissions will appear here once students submit their projects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((submission, index) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {submission.project_title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                    {submission.is_winner && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center">
                        <FiAward className="w-3 h-3 mr-1" />
                        Winner
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {submission.project_description}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FiUser className="w-4 h-4" />
                      <span>{submission.student?.name || 'Unknown Student'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-4 h-4" />
                      <span>Submitted: {formatDate(submission.submitted_at)}</span>
                    </div>
                    {submission.score && (
                      <div className="flex items-center space-x-1">
                        <FiStar className="w-4 h-4" />
                        <span>Score: {submission.score}/100</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleViewSubmission(submission)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="View Details"
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                  
                  {submission.status === 'submitted' && (
                    <button
                      onClick={() => handleReviewSubmission(submission)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Review Submission"
                    >
                      <FiCheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  
                  {submission.status === 'accepted' && !submission.is_winner && (
                    <button
                      onClick={() => handleSetWinner(submission)}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                      title="Set as Winner"
                    >
                      <FiAward className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Review Submission
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="accepted">Accept</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reviewData.score}
                  onChange={(e) => setReviewData({ ...reviewData, score: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter score"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewData.review_notes}
                  onChange={(e) => setReviewData({ ...reviewData, review_notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter review notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setReviewingSubmission(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {showSubmissionDetails && selectedSubmission && (
        <HackathonSubmissionDetails
          submission={selectedSubmission}
          onClose={() => {
            setShowSubmissionDetails(false);
            setSelectedSubmission(null);
          }}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default HackathonSubmissionsManagement;
