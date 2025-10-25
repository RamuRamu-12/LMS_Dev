import { motion } from 'framer-motion'
import useCourseLogo from '../../hooks/useCourseLogo'

const EnrolledCourseCard = ({ enrollment, index, onContinue }) => {
  const { logoUrl, loading: logoLoading, error: logoError } = useCourseLogo(enrollment.course?.id, !!enrollment.course?.logo)
  
  // Debug logging to check logo status
  console.log(`EnrolledCourseCard - Enrollment ${enrollment.id} for Course ${enrollment.course?.id} (${enrollment.course?.title}):`, {
    hasCourseLogoField: !!enrollment.course?.logo,
    courseLogoValue: enrollment.course?.logo,
    logoUrl,
    logoLoading,
    logoError
  })
  
  return (
    <motion.div
      key={enrollment.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-indigo-200"
    >
      <div className="flex items-center space-x-4">
        {/* Course Image */}
        <div className="relative flex-shrink-0">
          {enrollment.course?.logo && logoUrl ? (
            <img
              src={logoUrl}
              alt={enrollment.course?.title}
              className="w-16 h-16 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300"
            />
          ) : enrollment.course?.logo && logoLoading ? (
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
              <div className="animate-pulse text-white text-sm font-bold">
                {enrollment.course?.title?.charAt(0)}
              </div>
            </div>
          ) : enrollment.course?.logo && logoError ? (
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-pink-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {enrollment.course?.title?.charAt(0)}
              </span>
            </div>
          ) : (
            <img
              src={enrollment.course?.thumbnail || `https://via.placeholder.com/64x64/6366f1/ffffff?text=${enrollment.course?.title?.charAt(0)}`}
              alt={enrollment.course?.title}
              className="w-16 h-16 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300"
            />
          )}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 leading-tight mb-1">
            {enrollment.course?.title}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            by {enrollment.course?.instructor?.name}
          </p>
          
          {/* Progress Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="font-semibold text-indigo-600">{enrollment.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${enrollment.progress || 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                enrollment.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
              </span>
              <span>{enrollment.course?.estimated_duration || 0}h</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <button 
            onClick={() => onContinue(enrollment.course?.id)}
            className="inline-flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default EnrolledCourseCard
