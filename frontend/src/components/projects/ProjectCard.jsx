import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCode, FiClock, FiTag } from 'react-icons/fi';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    if (category?.toLowerCase().includes('web')) return '🌐';
    if (category?.toLowerCase().includes('mobile')) return '📱';
    if (category?.toLowerCase().includes('data')) return '📊';
    return '💻';
  };

  const thumbnailUrl = project.thumbnail 
    ? `${apiUrl}/api/realtime-projects/${project.id}/files/${project.thumbnail}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
      onClick={() => navigate(`/student/realtime-projects/${project.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={project.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiCode className="w-16 h-16 text-indigo-400" />
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
            <span>{getCategoryIcon(project.category)}</span>
            {project.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {project.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                <FiTag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{project.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
              {project.difficulty || 'Intermediate'}
            </span>
            {project.estimatedHours && (
              <span className="flex items-center text-xs text-gray-500">
                <FiClock className="w-3 h-3 mr-1" />
                {project.estimatedHours}h
              </span>
            )}
          </div>
          
          <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center">
            View Project →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;

