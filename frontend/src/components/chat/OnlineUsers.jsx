import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUsers, FiCircle } from 'react-icons/fi';
import { chatService } from '../../services/chatService';

const OnlineUsers = ({ hackathonId, groupId, onlineUsers, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipants();
  }, [hackathonId, groupId]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      // This would need to be implemented in the backend
      // For now, we'll use a mock implementation
      const mockParticipants = [
        { id: 1, name: 'John Doe', email: 'john@example.com', is_online: true, role: 'member' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', is_online: true, role: 'moderator' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', is_online: false, role: 'member' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', is_online: true, role: 'member' },
      ];
      setParticipants(mockParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-100';
      case 'moderator':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'moderator':
        return '🛡️';
      default:
        return '👤';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FiUsers className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Members</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Online count */}
      <div className="mb-4 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <FiCircle className="w-3 h-3 text-green-500" />
          <span className="text-sm font-medium text-green-800">
            {participants.filter(p => p.is_online).length} online
          </span>
        </div>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {participants.map((participant) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              {participant.is_online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {participant.name}
                </p>
                <span className="text-xs" title={participant.role}>
                  {getRoleIcon(participant.role)}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {participant.email}
              </p>
            </div>

            {/* Status indicator */}
            <div className="flex items-center space-x-1">
              <FiCircle 
                className={`w-2 h-2 ${
                  participant.is_online ? 'text-green-500' : 'text-gray-400'
                }`} 
              />
              <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(participant.role)}`}>
                {participant.role}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {participants.length} total members
        </div>
      </div>
    </div>
  );
};

export default OnlineUsers;
