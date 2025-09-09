import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { courseService } from '../../services/courseService'
import { enrollmentService } from '../../services/enrollmentService'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const AllCoursesModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient()
  const [enrollingCourseId, setEnrollingCourseId] = useState(null)

  // Fetch all courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery(
    'all-courses-modal',
    () => courseService.getCourses({ limit: 50 }),
    {
      enabled: isOpen,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Fetch user enrollments
  const { data: enrollmentsData } = useQuery(
    'student-enrollments-modal',
    () => enrollmentService.getMyEnrollments(),
    {
      enabled: isOpen,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Enrollment mutation
  const enrollMutation = useMutation(
    (courseId) => courseService.enrollInCourse(courseId),
    {
      onSuccess: (response) => {
        toast.success('Successfully enrolled in course!')
        // Refresh enrollments and courses data
        queryClient.invalidateQueries('student-enrollments')
        queryClient.invalidateQueries('student-enrollments-modal')
        queryClient.invalidateQueries('student-courses')
        queryClient.invalidateQueries('all-courses-modal')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to enroll in course')
      }
    }
  )

  const courses = coursesData?.data?.courses || []
  const enrollments = enrollmentsData?.data?.enrollments || []

  // Check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.course?.id === courseId)
  }

  // Handle enrollment
  const handleEnroll = async (courseId) => {
    setEnrollingCourseId(courseId)
    try {
      await enrollMutation.mutateAsync(courseId)
      // Force refresh the data
      await queryClient.refetchQueries('student-enrollments')
      await queryClient.refetchQueries('student-enrollments-modal')
    } finally {
      setEnrollingCourseId(null)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
          >
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  All Available Courses
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {coursesLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    >
                      <div className="relative">
                        <img
                          src={course.thumbnail || `https://via.placeholder.com/400x225/6366f1/ffffff?text=${course.title?.charAt(0)}`}
                          alt={course.title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            course.difficulty === 'beginner' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : course.difficulty === 'intermediate'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {course.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                            {course.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {course.enrollment_count || 0} students
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                          {course.title}
                        </h4>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        
                        {course.instructor && (
                          <div className="flex items-center mb-4">
                            <img
                              src={course.instructor.avatar || `https://ui-avatars.com/api/?name=${course.instructor.name}&background=6366f1&color=fff`}
                              alt={course.instructor.name}
                              className="w-5 h-5 rounded-full mr-2"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {course.instructor.name}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => {
                                const rating = course.average_rating;
                                const numericRating = rating && typeof rating === 'number' && !isNaN(rating) ? rating : 0;
                                return (
                                  <svg
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(numericRating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                );
                              })}
                              <span className="ml-1 text-xs text-gray-600 dark:text-gray-300">
                                {(() => {
                                  const rating = course.average_rating;
                                  if (rating && typeof rating === 'number' && !isNaN(rating)) {
                                    return rating.toFixed(1);
                                  }
                                  return '0.0';
                                })()}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({course.total_ratings || 0})
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <button
                            onClick={() => handleEnroll(course.id)}
                            disabled={isEnrolled(course.id) || enrollingCourseId === course.id}
                            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                              isEnrolled(course.id)
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : enrollingCourseId === course.id
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'
                            }`}
                          >
                            {isEnrolled(course.id)
                              ? 'Enrolled'
                              : enrollingCourseId === course.id
                              ? 'Enrolling...'
                              : 'Enroll'
                            }
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AllCoursesModal
