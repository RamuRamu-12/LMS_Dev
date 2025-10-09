import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Chat room events
      newSocket.on('joined_room', (data) => {
        console.log('Joined room:', data);
        setOnlineUsers(new Set(data.onlineUsers));
      });

      newSocket.on('user_joined', (data) => {
        console.log('User joined:', data);
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      });

      newSocket.on('user_left', (data) => {
        console.log('User left:', data);
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      });

      newSocket.on('new_message', (data) => {
        console.log('New message received:', data);
        // This will be handled by individual chat components
      });

      newSocket.on('user_typing', (data) => {
        console.log('User typing:', data);
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (data.isTyping) {
            newMap.set(data.userId, data.userName);
          } else {
            newMap.delete(data.userId);
          }
          return newMap;
        });
      });

      newSocket.on('messages_read', (data) => {
        console.log('Messages read:', data);
      });

      newSocket.on('notification', (notification) => {
        console.log('Notification received:', notification);
        // Handle notifications (could show toast, etc.)
      });

      newSocket.on('admin_notification', (data) => {
        console.log('Admin notification:', data);
        // Handle admin-specific notifications
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
        setTypingUsers(new Map());
      };
    }
  }, [user, token]);

  // Socket utility functions
  const joinChatRoom = (hackathonId, groupId) => {
    if (socket && isConnected) {
      socket.emit('join_chat_room', { hackathonId, groupId });
    }
  };

  const leaveChatRoom = (hackathonId, groupId) => {
    if (socket && isConnected) {
      const roomId = `chat_${hackathonId}_${groupId}`;
      socket.leave(roomId);
    }
  };

  const sendMessage = (hackathonId, groupId, message, messageType = 'text', replyToMessageId = null) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        hackathonId,
        groupId,
        message,
        messageType,
        replyToMessageId
      });
    }
  };

  const startTyping = (hackathonId, groupId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { hackathonId, groupId });
    }
  };

  const stopTyping = (hackathonId, groupId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { hackathonId, groupId });
    }
  };

  const markMessagesAsRead = (hackathonId, groupId) => {
    if (socket && isConnected) {
      socket.emit('mark_messages_read', { hackathonId, groupId });
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
