import api from './api';

export const chatService = {
  // Get chat rooms for current user
  getMyChatRooms: async () => {
    const response = await api.get('/chat/my-rooms');
    return response.data;
  },

  // Get messages for a specific chat room
  getChatMessages: async (hackathonId, groupId, page = 1, limit = 50, before = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (before) {
      params.append('before', before);
    }

    const response = await api.get(`/chat/${hackathonId}/${groupId}/messages?${params}`);
    return response.data;
  },

  // Admin: Get all chat rooms
  getAllChatRooms: async (page = 1, limit = 20, search = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (search) {
      params.append('search', search);
    }

    const response = await api.get(`/chat/admin/rooms?${params}`);
    return response.data;
  },

  // Admin: Get chat statistics
  getChatStatistics: async () => {
    const response = await api.get('/chat/admin/statistics');
    return response.data;
  },

  // Admin: Add user to chat room
  addUserToChat: async (hackathonId, groupId, userId) => {
    const response = await api.post('/chat/admin/add-user', {
      hackathonId,
      groupId,
      userId
    });
    return response.data;
  },

  // Admin: Remove user from chat room
  removeUserFromChat: async (hackathonId, groupId, userId) => {
    const response = await api.delete(`/chat/admin/${hackathonId}/${groupId}/${userId}`);
    return response.data;
  },

  // Admin: Toggle user mute status
  toggleUserMute: async (hackathonId, groupId, userId) => {
    const response = await api.patch(`/chat/admin/${hackathonId}/${groupId}/${userId}/mute`);
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  }
};
