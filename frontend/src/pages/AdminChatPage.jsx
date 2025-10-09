import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  FiMessageCircle, 
  FiUsers, 
  FiSearch, 
  FiFilter, 
  FiMoreVertical,
  FiVolumeX,
  FiUserPlus,
  FiUserMinus,
  FiTrash2,
  FiEye,
  FiBarChart
} from 'react-icons/fi';
import { chatService } from '../services/chatService';
import Header from '../components/common/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChatRoom from '../components/chat/ChatRoom';
import toast from 'react-hot-toast';

const AdminChatPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showStatistics, setShowStatistics] = useState(false);

  // Fetch all chat rooms
  const { data: chatRoomsData, isLoading: chatRoomsLoading, error: chatRoomsError } = useQuery(
    'admin-chat-rooms',
    () => chatService.getAllChatRooms(1, 50, searchTerm),
    {
      refetchOnWindowFocus: false,
      staleTime: 1 * 60 * 1000, // 1 minute for admin data
      retry: 1,
      onError: (error) => {
        console.error('Chat rooms API error:', error);
        toast.error('Failed to load chat rooms');
      }
    }
  );

  // Fetch chat statistics
  const { data: statisticsData, isLoading: statisticsLoading } = useQuery(
    'chat-statistics',
    () => chatService.getChatStatistics(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      enabled: showStatistics
    }
  );

  const chatRooms = chatRoomsData?.data?.chatRooms || [];
  const statistics = statisticsData?.data?.statistics || {};

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setSelectedRoom(null);
    setIsChatModalOpen(false);
  };

  const handleMuteUser = async (hackathonId, groupId, userId) => {
    try {
      await chatService.toggleUserMute(hackathonId, groupId, userId);
      toast.success('User mute status updated');
    } catch (error) {
      console.error('Error toggling user mute:', error);
      toast.error('Failed to update user mute status');
    }
  };

  const handleRemoveUser = async (hackathonId, groupId, userId) => {
    if (window.confirm('Are you sure you want to remove this user from the chat?')) {
      try {
        await chatService.removeUserFromChat(hackathonId, groupId, userId);
        toast.success('User removed from chat');
      } catch (error) {
        console.error('Error removing user:', error);
        toast.error('Failed to remove user from chat');
      }
    }
  };

  const filteredRooms = chatRooms.filter(room => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return room.hackathon.status === 'active';
    if (filterStatus === 'upcoming') return room.hackathon.status === 'upcoming';
    if (filterStatus === 'completed') return room.hackathon.status === 'completed';
    return true;
  });

  if (chatRoomsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Management</h1>
              <p className="text-gray-600">Monitor and manage all hackathon group chats</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <FiBarChart className="w-5 h-5" />
                <span>Statistics</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Panel */}
        {showStatistics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Statistics</h3>
            {statisticsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {statistics.totalMessages || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {statistics.totalParticipants || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {statistics.onlineUsers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Online Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {statistics.totalChatRooms || 0}
                  </div>
                  <div className="text-sm text-gray-600">Chat Rooms</div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 bg-white rounded-xl shadow-lg p-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search chat rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredRooms.length} chat room{filteredRooms.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </motion.div>

        {/* Chat Rooms List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No chat rooms found</h3>
              <p className="text-gray-600">No chat rooms match your current filters.</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <motion.div
                key={`${room.hackathon.id}-${room.group.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Room Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        <FiMessageCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {room.hackathon.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {room.group.group_name} • {room.participants.length} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        room.hackathon.status === 'active' 
                          ? 'text-green-600 bg-green-100'
                          : room.hackathon.status === 'upcoming'
                          ? 'text-blue-600 bg-blue-100'
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {room.hackathon.status}
                      </span>
                      <button
                        onClick={() => handleSelectRoom(room)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>View Chat</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Participants</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {room.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {participant.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {participant.role} • {participant.is_online ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleMuteUser(room.hackathon.id, room.group.id, participant.id)}
                            className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                            title="Mute/Unmute"
                          >
                            <FiVolumeX className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveUser(room.hackathon.id, room.group.id, participant.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove from chat"
                          >
                            <FiUserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>

      {/* Chat Room Modal */}
      {isChatModalOpen && selectedRoom && (
        <ChatRoom
          hackathon={selectedRoom.hackathon}
          group={selectedRoom.group}
          onClose={handleCloseChat}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default AdminChatPage;
