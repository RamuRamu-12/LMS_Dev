import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import useCourseLogo from '../../hooks/useCourseLogo'

const CourseCard = ({ course, showInstructor = true, showRating = true }) => {
  const { logoUrl, loading: logoLoading, error: logoError } = useCourseLogo(course.id, !!course.logo)
  
  // Debug logging
  console.log(`CourseCard - Course ${course.id} (${course.title}):`, {
    hasLogo: !!course.logo,
    logoUrl,
    logoLoading,
    logoError
  })
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 overflow-hidden group border border-white/20 shadow-2xl hover:shadow-purple-500/20 w-full"
    >
      <Link to={`/courses/${course.id}`} className="block">
        <div className="relative overflow-hidden">
          {course.logo && logoUrl ? (
            <img
              src={logoUrl}
              alt={course.title}
              className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : course.logo && logoLoading ? (
            <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <div className="animate-pulse text-white text-2xl font-bold">
                {course.title?.charAt(0)}
              </div>
            </div>
          ) : course.logo && logoError ? (
            <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
              <div className="text-white text-2xl font-bold">
                {course.title?.charAt(0)}
              </div>
            </div>
          ) : (
            <img
              src={course.thumbnail || `https://via.placeholder.com/400x225/6366f1/ffffff?text=${course.title?.charAt(0)}`}
              alt={course.title}
              className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${
              course.difficulty === 'beginner' 
                ? 'bg-green-500/80 text-white'
                : course.difficulty === 'intermediate'
                ? 'bg-yellow-500/80 text-white'
                : 'bg-red-500/80 text-white'
            }`}>
              {course.difficulty}
            </span>
          </div>
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${
              course.is_published 
                ? 'bg-blue-500/80 text-white'
                : 'bg-gray-500/80 text-white'
            }`}>
              {course.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {course.logo && (
                <>
                  {logoLoading && (
                    <div className="w-8 h-8 rounded-lg border border-white/20 bg-gray-600 animate-pulse flex items-center justify-center">
                      <span className="text-xs text-white">...</span>
                    </div>
                  )}
                  {logoUrl && !logoLoading && (
                    <img
                      src={logoUrl}
                      alt={`${course.title} logo`}
                      className="w-8 h-8 rounded-lg object-cover border border-white/20"
                      onLoad={() => console.log('Logo loaded successfully for course:', course.title)}
                    />
                  )}
                  {logoError && !logoLoading && (
                    <div className="w-8 h-8 rounded-lg border border-white/20 bg-gray-600 flex items-center justify-center">
                      <span className="text-xs text-white" title={`Logo error: ${logoError}`}>!</span>
                    </div>
                  )}
                </>
              )}
              <span className="text-sm text-purple-400 font-semibold bg-purple-500/20 px-3 py-1 rounded-full">
                {course.category}
              </span>
            </div>
            <span className="text-sm text-gray-300 bg-white/10 px-3 py-1 rounded-full">
              {course.enrollment_count || 0} students
            </span>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
          
          {showInstructor && course.instructor && (
            <div className="flex items-center mb-4">
              <img
                src={course.instructor.avatar || `https://ui-avatars.com/api/?name=${course.instructor.name}&background=6366f1&color=fff`}
                alt={course.instructor.name}
                className="w-8 h-8 rounded-full mr-3 border-2 border-white/20"
              />
              <span className="text-sm text-gray-300">
                {course.instructor.name}
              </span>
            </div>
          )}
          
          {showRating && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => {
                    const rating = course.average_rating;
                    const numericRating = rating && typeof rating === 'number' && !isNaN(rating) ? rating : 0;
                    return (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(numericRating)
                            ? 'text-yellow-400'
                            : 'text-gray-500'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    );
                  })}
                  <span className="ml-2 text-sm text-gray-300 font-medium">
                    {(() => {
                      const rating = course.average_rating;
                      if (rating && typeof rating === 'number' && !isNaN(rating)) {
                        return rating.toFixed(1);
                      }
                      return '0.0';
                    })()}
                  </span>
                </div>
                <span className="text-sm text-gray-400 ml-3">
                  ({course.total_ratings || 0})
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default CourseCard
