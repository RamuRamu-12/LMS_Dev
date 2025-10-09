import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiUsers, FiClock, FiChevronRight } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const ChatRoomsList = ({ chatRooms, onSelectRoom, loading = false }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleSelectRoom = (hackathon, group) => {
    setSelectedRoom(`${hackathon.id}-${group.id}`);
    onSelectRoom(hackathon, group);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'upcoming':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUnreadCount = (group) => {
    return group.unread_count || 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiMessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No chat rooms available</h3>
        <p className="text-gray-500">You don't have access to any hackathon group chats yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chatRooms.map((room) => (
        <motion.div
          key={room.hackathon.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Hackathon header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {room.hackathon.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {room.hackathon.description}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.hackathon.status)}`}>
                  {room.hackathon.status}
                </span>
                <div className="text-xs text-gray-500">
                  <FiClock className="w-3 h-3 inline mr-1" />
                  {formatDistanceToNow(new Date(room.hackathon.start_date), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>

          {/* Groups */}
          <div className="p-4">
            <div className="space-y-2">
              {room.groups.map((group) => {
                const isSelected = selectedRoom === `${room.hackathon.id}-${group.id}`;
                const unreadCount = getUnreadCount(group);
                
                return (
                  <motion.button
                    key={group.id}
                    onClick={() => handleSelectRoom(room.hackathon, group)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          <FiUsers className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {group.group_name}
                            </h4>
                            {group.role === 'admin' && (
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                                Admin
                              </span>
                            )}
                            {group.role === 'moderator' && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                                Mod
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {group.description || 'Group chat for collaboration'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Unread count */}
                        {unreadCount > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </div>
                        )}
                        
                        {/* Online indicator */}
                        {group.is_online && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        
                        <FiChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ChatRoomsList;
