import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiUsers, FiMoreVertical, FiTrash2, FiVolumeX } from 'react-icons/fi';
import { useSocket } from '../../contexts/SocketContext';
import { chatService } from '../../services/chatService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import OnlineUsers from './OnlineUsers';

const ChatRoom = ({ 
  hackathon, 
  group, 
  onClose, 
  isAdmin = false 
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const { 
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
  } = useSocket();

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Join chat room when component mounts
  useEffect(() => {
    if (hackathon && group && isConnected) {
      joinChatRoom(hackathon.id, group.id);
      loadMessages();
    }

    return () => {
      if (hackathon && group) {
        leaveChatRoom(hackathon.id, group.id);
      }
    };
  }, [hackathon, group, isConnected]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      if (data.roomId === `chat_${hackathon.id}_${group.id}`) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    const handleMessagesRead = (data) => {
      // Update UI to show messages as read
      console.log('Messages read by user:', data.userId);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, hackathon, group]);

  // Load messages
  const loadMessages = async (pageNum = 1, before = null) => {
    try {
      setLoading(true);
      const response = await chatService.getChatMessages(
        hackathon.id, 
        group.id, 
        pageNum, 
        50, 
        before
      );

      if (pageNum === 1) {
        setMessages(response.data.messages);
      } else {
        setMessages(prev => [...response.data.messages, ...prev]);
      }

      setHasMore(response.data.pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load more messages
  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      const oldestMessage = messages[0];
      loadMessages(page + 1, oldestMessage?.id);
    }
  };

  // Send message
  const handleSendMessage = (message, messageType = 'text') => {
    if (message.trim() && isConnected) {
      sendMessage(hackathon.id, group.id, message, messageType, replyingTo?.id);
      setReplyingTo(null);
    }
  };

  // Handle typing
  const handleTyping = (isTyping) => {
    if (isTyping) {
      startTyping(hackathon.id, group.id);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(hackathon.id, group.id);
      }, 3000);
    } else {
      clearTimeout(typingTimeoutRef.current);
      stopTyping(hackathon.id, group.id);
    }
  };

  // Mark messages as read
  const handleMarkAsRead = () => {
    markMessagesAsRead(hackathon.id, group.id);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when user scrolls to bottom
  useEffect(() => {
    const handleScroll = () => {
      const element = document.querySelector('.chat-messages');
      if (element) {
        const { scrollTop, scrollHeight, clientHeight } = element;
        if (scrollHeight - scrollTop - clientHeight < 100) {
          handleMarkAsRead();
        }
      }
    };

    const element = document.querySelector('.chat-messages');
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const typingUsersList = Array.from(typingUsers.entries())
    .filter(([userId]) => onlineUsers.has(userId))
    .map(([userId, userName]) => userName);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiUsers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{hackathon.title}</h3>
              <p className="text-blue-100 text-sm">{group.group_name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Online users indicator */}
            <button
              onClick={() => setShowOnlineUsers(!showOnlineUsers)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title={`${onlineUsers.size} online users`}
            >
              <div className="relative">
                <FiUsers className="w-5 h-5" />
                {onlineUsers.size > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {onlineUsers.size}
                  </span>
                )}
              </div>
            </button>

            {/* Options menu */}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <FiMoreVertical className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 bg-white text-gray-800 rounded-lg shadow-lg py-2 z-10 min-w-[150px]"
                  >
                    <button
                      onClick={() => {
                        setShowOnlineUsers(true);
                        setShowOptions(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <FiUsers className="w-4 h-4" />
                      <span>View Members</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          // Admin actions
                          setShowOptions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <FiVolumeX className="w-4 h-4" />
                        <span>Mute All</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Connection status */}
        {!isConnected && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3">
            <p className="text-yellow-700 text-sm">
              Connecting to chat... Please wait.
            </p>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main chat area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto chat-messages p-4 space-y-4">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Load more button */}
                  {hasMore && (
                    <button
                      onClick={loadMoreMessages}
                      disabled={loading}
                      className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load more messages'}
                    </button>
                  )}

                  {/* Messages */}
                  <MessageList
                    messages={messages}
                    onReply={setReplyingTo}
                    onDelete={handleDeleteMessage}
                    isAdmin={isAdmin}
                  />

                  {/* Typing indicator */}
                  <TypingIndicator users={typingUsersList} />

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Reply preview */}
            {replyingTo && (
              <div className="bg-gray-100 p-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Replying to <span className="font-medium">{replyingTo.user.name}</span>
                    </p>
                    <p className="text-sm text-gray-800 truncate">
                      {replyingTo.message.length > 50 
                        ? `${replyingTo.message.substring(0, 50)}...` 
                        : replyingTo.message
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Message input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              disabled={!isConnected}
              placeholder={`Message ${group.group_name}...`}
            />
          </div>

          {/* Online users sidebar */}
          <AnimatePresence>
            {showOnlineUsers && (
              <motion.div
                initial={{ x: 300 }}
                animate={{ x: 0 }}
                exit={{ x: 300 }}
                className="w-64 bg-gray-50 border-l border-gray-200 p-4"
              >
                <OnlineUsers
                  hackathonId={hackathon.id}
                  groupId={group.id}
                  onlineUsers={onlineUsers}
                  onClose={() => setShowOnlineUsers(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatRoom;
