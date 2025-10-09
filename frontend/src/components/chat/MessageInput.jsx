import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiImage, FiPaperclip, FiSmile } from 'react-icons/fi';

const MessageInput = ({ 
  onSendMessage, 
  onTyping, 
  disabled = false, 
  placeholder = "Type a message..." 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle typing detection
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    } else if (!message.trim() && isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (message.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 1000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping?.(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Handle image upload logic here
      console.log('Image selected:', file);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-t border-gray-200 p-4"
    >
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* File upload buttons */}
        <div className="flex items-center space-x-2">
          <label className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
            <FiImage className="w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={disabled}
            />
          </label>
          
          <label className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
            <FiPaperclip className="w-5 h-5" />
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              disabled={disabled}
            />
          </label>
        </div>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Connecting to chat..." : placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={1}
            maxLength={2000}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Character count */}
          {message.length > 1500 && (
            <div className="absolute bottom-1 right-12 text-xs text-gray-400">
              {message.length}/2000
            </div>
          )}
        </div>

        {/* Send button */}
        <motion.button
          type="submit"
          disabled={!message.trim() || disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-3 rounded-full transition-colors ${
            message.trim() && !disabled
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FiSend className="w-5 h-5" />
        </motion.button>
      </form>

      {/* Typing indicator */}
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-2 text-sm text-gray-500"
        >
          You are typing...
        </motion.div>
      )}
    </motion.div>
  );
};

export default MessageInput;
