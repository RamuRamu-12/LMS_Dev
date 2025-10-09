import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiUsers } from 'react-icons/fi';
import { useSocket } from '../../contexts/SocketContext';

const ChatNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      // Only show notification if user is not in the current chat room
      const currentRoom = `chat_${data.message.hackathon_id}_${data.message.group_id}`;
      const isInCurrentRoom = window.location.pathname.includes(`chat/${data.message.hackathon_id}/${data.message.group_id}`);
      
      if (!isInCurrentRoom) {
        const notification = {
          id: Date.now(),
          type: 'message',
          title: 'New Message',
          message: `${data.message.user.name}: ${data.message.message.substring(0, 50)}${data.message.message.length > 50 ? '...' : ''}`,
          hackathonId: data.message.hackathon_id,
          groupId: data.message.group_id,
          timestamp: new Date()
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5 notifications
        setIsOpen(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setIsOpen(false);
        }, 5000);
      }
    };

    const handleUserJoined = (data) => {
      const notification = {
        id: Date.now(),
        type: 'user_joined',
        title: 'User Joined',
        message: `${data.userName} joined the chat`,
        timestamp: new Date()
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    };

    const handleUserLeft = (data) => {
      const notification = {
        id: Date.now(),
        type: 'user_left',
        title: 'User Left',
        message: `${data.userName} left the chat`,
        timestamp: new Date()
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [socket]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <FiMessageCircle className="w-5 h-5 text-blue-500" />;
      case 'user_joined':
        return <FiUsers className="w-5 h-5 text-green-500" />;
      case 'user_left':
        return <FiUsers className="w-5 h-5 text-gray-500" />;
      default:
        return <FiMessageCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'border-l-blue-500 bg-blue-50';
      case 'user_joined':
        return 'border-l-green-500 bg-green-50';
      case 'user_left':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiMessageCircle className="w-5 h-5" />
                <span className="font-semibold">Chat Notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
                <button
                  onClick={clearAllNotifications}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 border-l-4 ${getNotificationColor(notification.type)} hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatNotification;
