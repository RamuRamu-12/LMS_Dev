import { motion } from 'framer-motion'
import useCourseLogo from '../../hooks/useCourseLogo'

const StudentCourseCard = ({ course, index, isEnrolled, enrollingCourseId, onEnroll }) => {
  const { logoUrl, loading: logoLoading, error: logoError } = useCourseLogo(course.id, !!course.logo)
  
  return (
    <motion.div
      key={course.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-teal-50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-green-200"
    >
      <div className="flex items-center space-x-4">
        {/* Course Image */}
        <div className="relative flex-shrink-0">
          {course.logo && logoUrl ? (
            <img
              src={logoUrl}
              alt={course.title}
              className="w-16 h-16 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300"
            />
          ) : course.logo && logoLoading ? (
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
              <div className="animate-pulse text-white text-sm font-bold">
                {course.title?.charAt(0)}
              </div>
            </div>
          ) : course.logo && logoError ? (
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-pink-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {course.title?.charAt(0)}
              </span>
            </div>
          ) : (
            <img
              src={course.thumbnail || `https://via.placeholder.com/64x64/10b981/ffffff?text=${course.title?.charAt(0)}`}
              alt={course.title}
              className="w-16 h-16 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300"
            />
          )}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
        
        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200 leading-tight mb-1">
            {course.title}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            by {course.instructor?.name}
          </p>
          
          {/* Rating and Meta Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(course.average_rating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-xs text-gray-600 ml-1">
                  {course.average_rating || 0} ({course.total_ratings || 0})
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-700">
                {course.difficulty}
              </span>
              <span className="text-xs text-gray-500">{course.estimated_duration || 0}h</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <button 
            onClick={() => onEnroll(course.id)}
            disabled={isEnrolled || enrollingCourseId === course.id}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
              isEnrolled 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : enrollingCourseId === course.id 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isEnrolled ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : enrollingCourseId === course.id ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default StudentCourseCard
