const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, ChatMessage, ChatParticipant, HackathonGroup } = require('../models');

class SocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.connectedUsers = new Map(); // Map of userId -> socketId
    this.userSockets = new Map(); // Map of socketId -> userId
    this.roomUsers = new Map(); // Map of roomId -> Set of userIds

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
          attributes: ['id', 'name', 'email', 'role']
        });

        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.name} (${socket.userId}) connected`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);

      // Join user to their personal room for notifications
      socket.join(`user_${socket.userId}`);

      // Handle joining chat room
      socket.on('join_chat_room', async (data) => {
        try {
          const { hackathonId, groupId } = data;
          
          // Verify user has access to this chat room
          const hasAccess = await this.verifyChatAccess(socket.userId, hackathonId, groupId);
          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied to this chat room' });
            return;
          }

          const roomId = `chat_${hackathonId}_${groupId}`;
          
          // Leave previous rooms
          const currentRooms = Array.from(socket.rooms);
          currentRooms.forEach(room => {
            if (room.startsWith('chat_')) {
              socket.leave(room);
              this.removeUserFromRoom(room, socket.userId);
            }
          });

          // Join new room
          socket.join(roomId);
          this.addUserToRoom(roomId, socket.userId);

          // Update user's online status
          await this.updateUserOnlineStatus(socket.userId, groupId, true);

          // Notify others in the room
          socket.to(roomId).emit('user_joined', {
            userId: socket.userId,
            userName: socket.user.name,
            timestamp: new Date()
          });

          // Send room info
          socket.emit('joined_room', {
            roomId,
            hackathonId,
            groupId,
            onlineUsers: this.getRoomUsers(roomId)
          });

          console.log(`User ${socket.user.name} joined room ${roomId}`);
        } catch (error) {
          console.error('Error joining chat room:', error);
          socket.emit('error', { message: 'Failed to join chat room' });
        }
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        try {
          const { hackathonId, groupId, message, messageType = 'text', replyToMessageId } = data;
          
          // Verify user has access
          const hasAccess = await this.verifyChatAccess(socket.userId, hackathonId, groupId);
          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied to send messages' });
            return;
          }

          // Create message in database
          const chatMessage = await ChatMessage.create({
            hackathon_id: hackathonId,
            group_id: groupId,
            user_id: socket.userId,
            message: message,
            message_type: messageType,
            reply_to_message_id: replyToMessageId
          });

          // Fetch message with user details
          const messageWithUser = await ChatMessage.findByPk(chatMessage.id, {
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              },
              {
                model: ChatMessage,
                as: 'replyToMessage',
                include: [
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name']
                  }
                ]
              }
            ]
          });

          const roomId = `chat_${hackathonId}_${groupId}`;
          
          // Broadcast message to room
          this.io.to(roomId).emit('new_message', {
            message: messageWithUser,
            roomId
          });

          // Update unread counts for offline users
          await this.updateUnreadCounts(hackathonId, groupId, socket.userId);

        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { hackathonId, groupId } = data;
        const roomId = `chat_${hackathonId}_${groupId}`;
        
        socket.to(roomId).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data) => {
        const { hackathonId, groupId } = data;
        const roomId = `chat_${hackathonId}_${groupId}`;
        
        socket.to(roomId).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          isTyping: false
        });
      });

      // Handle message read
      socket.on('mark_messages_read', async (data) => {
        try {
          const { hackathonId, groupId } = data;
          
          await ChatParticipant.update(
            { last_read_at: new Date(), unread_count: 0 },
            {
              where: {
                hackathon_id: hackathonId,
                group_id: groupId,
                user_id: socket.userId
              }
            }
          );

          const roomId = `chat_${hackathonId}_${groupId}`;
          socket.to(roomId).emit('messages_read', {
            userId: socket.userId,
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        console.log(`User ${socket.user.name} (${socket.userId}) disconnected`);
        
        // Remove from connected users
        this.connectedUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);

        // Update online status
        const rooms = Array.from(socket.rooms);
        for (const room of rooms) {
          if (room.startsWith('chat_')) {
            const [, hackathonId, groupId] = room.split('_');
            await this.updateUserOnlineStatus(socket.userId, groupId, false);
            this.removeUserFromRoom(room, socket.userId);
            
            // Notify others
            socket.to(room).emit('user_left', {
              userId: socket.userId,
              userName: socket.user.name,
              timestamp: new Date()
            });
          }
        }
      });
    });
  }

  async verifyChatAccess(userId, hackathonId, groupId) {
    try {
      // Check if user is a participant in this group
      const participant = await ChatParticipant.findOne({
        where: {
          hackathon_id: hackathonId,
          group_id: groupId,
          user_id: userId,
          is_active: true
        }
      });

      if (participant) return true;

      // Check if user is admin (admins can access all chats)
      const user = await User.findByPk(userId);
      if (user && user.role === 'admin') {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying chat access:', error);
      return false;
    }
  }

  async updateUserOnlineStatus(userId, groupId, isOnline) {
    try {
      await ChatParticipant.update(
        { 
          is_online: isOnline,
          last_activity_at: new Date()
        },
        {
          where: {
            user_id: userId,
            group_id: groupId
          }
        }
      );
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  async updateUnreadCounts(hackathonId, groupId, senderId) {
    try {
      // Increment unread count for all participants except sender
      await ChatParticipant.increment('unread_count', {
        where: {
          hackathon_id: hackathonId,
          group_id: groupId,
          user_id: { [require('sequelize').Op.ne]: senderId },
          is_active: true
        }
      });
    } catch (error) {
      console.error('Error updating unread counts:', error);
    }
  }

  addUserToRoom(roomId, userId) {
    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, new Set());
    }
    this.roomUsers.get(roomId).add(userId);
  }

  removeUserFromRoom(roomId, userId) {
    if (this.roomUsers.has(roomId)) {
      this.roomUsers.get(roomId).delete(userId);
      if (this.roomUsers.get(roomId).size === 0) {
        this.roomUsers.delete(roomId);
      }
    }
  }

  getRoomUsers(roomId) {
    const userIds = this.roomUsers.get(roomId) || new Set();
    return Array.from(userIds);
  }

  // Method to send notification to specific user
  sendNotificationToUser(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Method to broadcast to all admins
  broadcastToAdmins(event, data) {
    this.io.emit('admin_notification', { event, data });
  }

  getIO() {
    return this.io;
  }
}

module.exports = SocketServer;
