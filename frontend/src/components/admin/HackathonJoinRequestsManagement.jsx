import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiClock, FiUser, FiMail, FiMessageSquare } from 'react-icons/fi';
import { hackathonService } from '../../services/hackathonService';

const HackathonJoinRequestsManagement = ({ hackathonId }) => {
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchJoinRequests();
  }, [hackathonId]);

  const fetchJoinRequests = async () => {
    try {
      setLoading(true);
      const response = await hackathonService.getHackathonJoinRequests(hackathonId);
      setJoinRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      setError('Failed to fetch join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessing(requestId);
      await hackathonService.approveJoinRequest(hackathonId, requestId, 'Approved by admin');
      await fetchJoinRequests(); // Refresh the list
      alert('Join request approved successfully!');
    } catch (error) {
      console.error('Error approving join request:', error);
      alert('Failed to approve join request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessing(requestId);
      await hackathonService.rejectJoinRequest(hackathonId, requestId, 'Rejected by admin');
      await fetchJoinRequests(); // Refresh the list
      alert('Join request rejected');
    } catch (error) {
      console.error('Error rejecting join request:', error);
      alert('Failed to reject join request');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading join requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchJoinRequests}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (joinRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Join Requests</h3>
        <p className="text-gray-600">No teams have requested to join this hackathon yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Join Requests ({joinRequests.length})
        </h3>
        <button
          onClick={fetchJoinRequests}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {joinRequests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{request.team_name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiClock className="w-4 h-4" />
                  <span>Submitted on {formatDate(request.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Team Members:</h5>
              <div className="space-y-2">
                {request.team_members.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <FiUser className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{member.name}</span>
                    <FiMail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{member.email}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            {request.message && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Message:</h5>
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <FiMessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="italic">{request.message}</p>
                </div>
              </div>
            )}

            {/* Review Notes */}
            {request.review_notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Review Notes:</h5>
                <p className="text-sm text-gray-600">{request.review_notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            {request.status === 'pending' && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleApprove(request.id)}
                  disabled={processing === request.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing === request.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiCheck className="w-4 h-4" />
                  )}
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  disabled={processing === request.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing === request.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiX className="w-4 h-4" />
                  )}
                  <span>Reject</span>
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HackathonJoinRequestsManagement;
