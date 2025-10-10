import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';

const AccessDenied = ({ feature, onContactAdmin }) => {
  const getFeatureInfo = (feature) => {
    switch (feature) {
      case 'hackathons':
        return {
          title: 'Hackathon Access Required',
          description: 'You need administrator permission to participate in hackathons.',
          icon: <FiShield className="w-12 h-12 text-purple-600" />
        };
      case 'realtimeProjects':
        return {
          title: 'Realtime Projects Access Required',
          description: 'You need administrator permission to access realtime projects.',
          icon: <FiLock className="w-12 h-12 text-orange-600" />
        };
      default:
        return {
          title: 'Access Denied',
          description: 'You do not have permission to access this feature.',
          icon: <FiLock className="w-12 h-12 text-gray-600" />
        };
    }
  };

  const featureInfo = getFeatureInfo(feature);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gray-100 rounded-full">
              {featureInfo.icon}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {featureInfo.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {featureInfo.description}
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Contact your administrator to request access.
            </span>
          </p>

          {/* Contact Admin Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContactAdmin}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
          >
            <FiMail className="w-5 h-5" />
            <span>Contact Administrator</span>
          </motion.button>

          {/* Back to Dashboard */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="w-full mt-4 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200"
          >
            Go Back
          </motion.button>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-100 rounded">
                <FiShield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Need Help?
                </p>
                <p className="text-xs text-blue-700">
                  If you believe you should have access to this feature, please contact your administrator with your student ID and the feature you need access to.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AccessDenied;
