const express = require('express');
const router = express.Router();
const {
  getChatMessages,
  getMyChatRooms,
  getAllChatRooms,
  getChatStatistics,
  deleteMessage,
  toggleUserMute,
  addUserToChat,
  removeUserFromChat
} = require('../controllers/chatController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Student routes
router.get('/my-rooms', authenticate, getMyChatRooms);
router.get('/:hackathonId/:groupId/messages', authenticate, getChatMessages);

// Admin routes
router.get('/admin/rooms', authenticate, requireAdmin, getAllChatRooms);
router.get('/admin/statistics', authenticate, requireAdmin, getChatStatistics);
router.post('/admin/add-user', authenticate, requireAdmin, addUserToChat);
router.delete('/admin/:hackathonId/:groupId/:userId', authenticate, requireAdmin, removeUserFromChat);
router.patch('/admin/:hackathonId/:groupId/:userId/mute', authenticate, requireAdmin, toggleUserMute);

// Message moderation
router.delete('/messages/:messageId', authenticate, deleteMessage);

module.exports = router;
