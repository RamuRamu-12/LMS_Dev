import React from 'react';
import { motion } from 'framer-motion';
import { FiCornerUpLeft, FiTrash2, FiEdit3, FiMoreVertical } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const MessageList = ({ messages, onReply, onDelete, isAdmin = false }) => {
  const handleReply = (message) => {
    onReply(message);
  };

  const handleDelete = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(messageId);
    }
  };

  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const formatMessageDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="space-y-4">
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatMessageDate(dayMessages[0].created_at)}
            </div>
          </div>

          {/* Messages for this date */}
          <div className="space-y-3">
            {dayMessages.map((message, index) => {
              const isConsecutive = index > 0 && 
                dayMessages[index - 1].user_id === message.user_id &&
                new Date(message.created_at) - new Date(dayMessages[index - 1].created_at) < 300000; // 5 minutes

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.is_deleted ? 'opacity-50' : ''} ${
                    isConsecutive ? 'mt-1' : 'mt-4'
                  }`}
                >
                  {/* Avatar - only show if not consecutive */}
                  {!isConsecutive && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {message.user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Message content */}
                  <div className={`flex-1 ${isConsecutive ? 'ml-11' : ''}`}>
                    {/* User name and time - only show if not consecutive */}
                    {!isConsecutive && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {message.user.name}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatMessageTime(message.created_at)}
                        </span>
                        {message.is_edited && (
                          <span className="text-gray-400 text-xs">(edited)</span>
                        )}
                      </div>
                    )}

                    {/* Reply to message */}
                    {message.replyToMessage && (
                      <div className="bg-gray-100 rounded-lg p-2 mb-2 border-l-4 border-blue-500">
                        <div className="text-xs text-gray-600 mb-1">
                          Replying to {message.replyToMessage.user.name}
                        </div>
                        <div className="text-sm text-gray-800">
                          {message.replyToMessage.message.length > 100
                            ? `${message.replyToMessage.message.substring(0, 100)}...`
                            : message.replyToMessage.message
                          }
                        </div>
                      </div>
                    )}

                    {/* Message content */}
                    <div className="group relative">
                      <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-md">
                        {message.is_deleted ? (
                          <div className="text-gray-500 italic text-sm">
                            This message was deleted
                          </div>
                        ) : (
                          <div className="text-gray-900 text-sm whitespace-pre-wrap">
                            {message.message}
                          </div>
                        )}
                      </div>

                      {/* Message actions */}
                      {!message.is_deleted && (
                        <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white rounded-lg shadow-lg border flex items-center space-x-1 p-1">
                            <button
                              onClick={() => handleReply(message)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-800"
                              title="Reply"
                            >
                              <FiCornerUpLeft className="w-3 h-3" />
                            </button>
                            
                            {(isAdmin || message.user_id === parseInt(localStorage.getItem('userId'))) && (
                              <button
                                onClick={() => handleDelete(message.id)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                                title="Delete"
                              >
                                <FiTrash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Consecutive message time */}
                    {isConsecutive && (
                      <div className="text-gray-400 text-xs mt-1 ml-4">
                        {formatMessageTime(message.created_at)}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMoreVertical className="w-8 h-8" />
          </div>
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
