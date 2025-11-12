import { motion } from 'framer-motion'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { courseService } from '../services/courseService'
import { enrollmentService } from '../services/enrollmentService'
import { activityService } from '../services/activityService'
import { hackathonService } from '../services/hackathonService'
import { usePermissions } from '../hooks/usePermissions'
import { useRealtimeProjects } from '../hooks/useRealtimeProjects'
import ProjectCard from '../components/projects/ProjectCard'
// import { chatService } from '../services/chatService'
import Header from '../components/common/Header'
import LoadingSpinner from '../components/common/LoadingSpinner'
import AllCoursesModal from '../components/course/AllCoursesModal'
import EnrolledCoursesModal from '../components/course/EnrolledCoursesModal'
import StudentCourseCard from '../components/course/StudentCourseCard'
import EnrolledCourseCard from '../components/course/EnrolledCourseCard'
import StudentHackathonCard from '../components/hackathon/StudentHackathonCard'
import StudentHackathonDetailsModal from '../components/hackathon/StudentHackathonDetailsModal'
// import ChatRoomsList from '../components/chat/ChatRoomsList'
// import ChatRoom from '../components/chat/ChatRoom'
import toast from 'react-hot-toast'

const StudentDashboard = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useQuery(
    'student-courses',
    () => courseService.getCourses({ limit: 6 }),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
      onError: (error) => {
        console.error('Courses API error:', error)
      }
    }
  )

  const { data: enrollmentsData, isLoading: enrollmentsLoading, error: enrollmentsError } = useQuery(
    'student-enrollments',
    () => enrollmentService.getMyEnrollments(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
      onError: (error) => {
        console.error('Enrollments API error:', error)
      }
    }
  )

  const { data: activitiesData, isLoading: activitiesLoading, error: activitiesError } = useQuery(
    'student-activities',
    () => activityService.getMyActivities(5),
    {
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // Refresh every 2 minutes
      retry: 1,
      onError: (error) => {
        console.error('Activities API error:', error)
      }
    }
  )

  const { data: hackathonsData, isLoading: hackathonsLoading, error: hackathonsError } = useQuery(
    'student-hackathons',
    () => hackathonService.getMyHackathons(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
      onError: (error) => {
        console.error('Hackathons API error:', error)
      }
    }
  )

  // const { data: chatRoomsData, isLoading: chatRoomsLoading, error: chatRoomsError } = useQuery(
  //   'student-chat-rooms',
  //   () => chatService.getMyChatRooms(),
  //   {
  //     refetchOnWindowFocus: false,
  //     staleTime: 2 * 60 * 1000, // 2 minutes for chat rooms
  //     retry: 1,
  //     onError: (error) => {
  //       console.error('Chat rooms API error:', error)
  //     }
  //   }
  // )

  // Enrollment mutation
  const enrollMutation = useMutation(
    (courseId) => enrollmentService.enrollInCourse(courseId),
    {
      onSuccess: (response, courseId) => {
        toast.success('Successfully enrolled in course!')
        // Invalidate and refetch ALL related queries to ensure consistency
        Promise.all([
          queryClient.invalidateQueries('student-enrollments'),
          queryClient.invalidateQueries('student-courses'),
          queryClient.invalidateQueries(['course', courseId]), // Invalidate specific course
          queryClient.invalidateQueries(['courseContent', courseId]), // Invalidate course content
          queryClient.invalidateQueries('admin-users') // Also refresh admin data
        ]).then(() => {
          // Refetch enrollments immediately to update UI
          queryClient.refetchQueries('student-enrollments')
        })
      },
      onError: (error) => {
        const errorMessage = error.message || 'Failed to enroll in course'
        toast.error(errorMessage)
        console.error('Enrollment error:', error)
      }
    }
  )

  // Track which course is being enrolled
  const [enrollingCourseId, setEnrollingCourseId] = useState(null)
  
  // Modal state
  const [isAllCoursesModalOpen, setIsAllCoursesModalOpen] = useState(false)
  const [isEnrolledCoursesModalOpen, setIsEnrolledCoursesModalOpen] = useState(false)
  const [selectedHackathon, setSelectedHackathon] = useState(null)
  const [isHackathonDetailsModalOpen, setIsHackathonDetailsModalOpen] = useState(false)
  // const [selectedChatRoom, setSelectedChatRoom] = useState(null)
  // const [isChatModalOpen, setIsChatModalOpen] = useState(false)

  const { hasAccess } = usePermissions()
  const { projects: realtimeProjects = [], hasAccess: hasProjectsAccess = false } = useRealtimeProjects({ category: 'all', difficulty: 'all', sort: 'name' })
  
  const isLoading = coursesLoading || enrollmentsLoading || activitiesLoading || hackathonsLoading
  const courses = coursesData?.data?.courses || []
  const enrollments = enrollmentsData?.data?.enrollments || []
  const activities = activitiesData?.data?.activities || []
  // const chatRooms = chatRoomsData?.data?.chatRooms || []
  const hackathons = hackathonsData?.data?.hackathons || []

  // Helper function to get activity styling
  const getActivityStyle = (activityType) => {
    switch (activityType) {
      case 'enrollment':
        return {
          bgColor: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          iconBg: 'from-blue-500 to-indigo-600',
          icon: (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          badgeColor: 'bg-blue-100 text-blue-800',
          badgeText: 'Enrolled',
          dotColor: 'bg-blue-500'
        }
      case 'course_completed':
        return {
          bgColor: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconBg: 'from-green-500 to-emerald-600',
          icon: (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          badgeColor: 'bg-green-100 text-green-800',
          badgeText: 'Completed',
          dotColor: 'bg-green-500'
        }
      case 'test_passed':
        return {
          bgColor: 'from-purple-50 to-violet-50',
          borderColor: 'border-purple-200',
          iconBg: 'from-purple-500 to-violet-600',
          icon: (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          badgeColor: 'bg-purple-100 text-purple-800',
          badgeText: 'Passed',
          dotColor: 'bg-purple-500'
        }
      case 'test_attempted':
        return {
          bgColor: 'from-orange-50 to-red-50',
          borderColor: 'border-orange-200',
          iconBg: 'from-orange-500 to-red-600',
          icon: (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          badgeColor: 'bg-orange-100 text-orange-800',
          badgeText: 'Attempted',
          dotColor: 'bg-orange-500'
        }
      case 'certificate_earned':
        return {
          bgColor: 'from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-200',
          iconBg: 'from-yellow-500 to-amber-600',
          icon: (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ),
          badgeColor: 'bg-yellow-100 text-yellow-800',
          badgeText: 'Certificate',
          dotColor: 'bg-yellow-500'
        }
      default:
        return {
          bgColor: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-200',
          iconBg: 'from-gray-500 to-slate-600',
          icon: (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          badgeColor: 'bg-gray-100 text-gray-800',
          badgeText: 'Activity',
          dotColor: 'bg-gray-500'
        }
    }
  }

  // Debug logging
  console.log('Enrollments data:', enrollmentsData)
  console.log('Enrollments array:', enrollments)

  // Check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    const enrolled = (enrollments || []).some(enrollment => enrollment.course?.id === courseId)
    console.log(`Checking enrollment for course ${courseId}:`, enrolled)
    return enrolled
  }

  // Handle hackathon details view
  const handleViewHackathonDetails = async (hackathonId) => {
    try {
      const hackathon = await hackathonService.getHackathonById(hackathonId)
      setSelectedHackathon(hackathon.data)
      setIsHackathonDetailsModalOpen(true)
    } catch (error) {
      console.error('Error fetching hackathon details:', error)
      toast.error('Failed to load hackathon details')
    }
  }

  // const handleSelectChatRoom = (hackathon, group) => {
  //   setSelectedChatRoom({ hackathon, group })
  //   setIsChatModalOpen(true)
  // }

  // const handleCloseChat = () => {
  //   setSelectedChatRoom(null)
  //   setIsChatModalOpen(false)
  // }

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingCourseId(courseId);
      await enrollMutation.mutateAsync(courseId);
      toast.success('Successfully enrolled in course!');
      queryClient.invalidateQueries('student-enrollments');
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Handle API errors gracefully
  if (coursesError || enrollmentsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Dashboard</h1>
            <p className="text-gray-600 mb-6">There was an error loading your dashboard data. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  const completedCourses = (enrollments || []).filter(e => e.status === 'completed').length
  const inProgressCourses = (enrollments || []).filter(e => e.status === 'enrolled' && e.progress > 0 && e.progress < 100).length
  const totalProgress = (enrollments || []).reduce((sum, e) => sum + (e.progress || 0), 0) / Math.max((enrollments || []).length, 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Enhanced Welcome Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative px-6 py-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                        Welcome, <span className="text-yellow-300">{user?.name || 'Student'}!</span>
                      </h1>
                      <p className="text-lg text-indigo-100 mb-4 max-w-2xl">
                        Continue your learning journey and explore new courses.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => navigate('/courses')}
                          className="inline-flex items-center justify-center px-4 sm:px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                    Browse All Courses
                  </button>
                        <button 
                          onClick={() => navigate('/profile')}
                          className="inline-flex items-center justify-center px-4 sm:px-6 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/30"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          View Profile
                        </button>
                        <button 
                          onClick={() => navigate('/certificates')}
                          className="inline-flex items-center justify-center px-4 sm:px-6 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/30"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          My Certificates
                        </button>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="relative"
                    >
                      <div className="w-48 h-32 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <p className="text-white font-semibold text-sm">Learning Progress</p>
                          <p className="text-indigo-200 text-xs">Keep up the great work!</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-600">Enrolled</p>
                        <p className="text-xl font-bold text-gray-900">{enrollments.length}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">+{enrollments.length}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-600">Completed</p>
                        <p className="text-xl font-bold text-gray-900">{completedCourses}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{Math.round((completedCourses / Math.max(enrollments.length, 1)) * 100)}%</div>
                      <div className="text-xs text-gray-500">Success</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-600">In Progress</p>
                        <p className="text-xl font-bold text-gray-900">{inProgressCourses}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">{inProgressCourses > 0 ? 'Active' : 'None'}</div>
                      <div className="text-xs text-gray-500">Status</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-600">Avg. Progress</p>
                        <p className="text-xl font-bold text-gray-900">{Math.round(totalProgress)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                          style={{ width: `${totalProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Overall</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Enhanced My Courses */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 lg:col-span-1"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full -translate-y-8 translate-x-8 opacity-10"></div>
                <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">My Courses</h3>
                      <p className="text-sm text-gray-600">Continue learning</p>
                    </div>
                  <button 
                    onClick={() => setIsEnrolledCoursesModalOpen(true)}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors duration-200 font-medium text-sm"
                  >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {enrollments.slice(0, 3).map((enrollment, index) => (
                    <EnrolledCourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      index={index}
                      onContinue={(courseId) => navigate(`/courses/${courseId}`)}
                    />
                  ))}
                  
                  {enrollments.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses enrolled yet</h3>
                        <p className="text-gray-600 mb-6">Start your learning journey by enrolling in courses</p>
                      <button 
                        onClick={() => navigate('/courses')}
                          className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        Browse Courses
                      </button>
                    </div>
                  )}
                </div>
              </div>
              </motion.div>

              {/* Course Preview Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 lg:col-span-2"
              >
                <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full -translate-y-8 -translate-x-8 opacity-10"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Course Preview</h3>
                      <p className="text-sm text-gray-600">Start your learning journey</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                  </div>
                  
                  {/* Large Video Preview Area */}
                  <div className="relative">
                    {enrollments.length > 0 ? (
                      <div className="relative group">
                        <div className="aspect-video bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-xl overflow-hidden shadow-lg">
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                              <h4 className="text-xl font-bold text-white mb-2">
                                {enrollments[0]?.course?.title}
                              </h4>
                              <p className="text-indigo-200 text-sm">
                                Chapter 1: Introduction
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button 
                            onClick={() => navigate(`/courses/${enrollments[0]?.course?.id}`)}
                            className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            Start Learning
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">No courses enrolled yet</h4>
                          <p className="text-gray-600 mb-4">Enroll in a course to start learning</p>
                          <button 
                            onClick={() => navigate('/courses')}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Browse Courses
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Recommended Courses */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 lg:col-span-3"
              >
                <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full -translate-y-8 -translate-x-8 opacity-10"></div>
                <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Recommended for You</h3>
                      <p className="text-sm text-gray-600">Discover new learning opportunities</p>
                    </div>
                  <button 
                    onClick={() => setIsAllCoursesModalOpen(true)}
                      className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 font-medium text-sm"
                  >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    View All
                  </button>
                </div>
                
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {courses.slice(0, 6).map((course, index) => (
                       <StudentCourseCard
                         key={course.id}
                         course={course}
                         index={index}
                         isEnrolled={isEnrolled(course.id)}
                         enrollingCourseId={enrollingCourseId}
                         onEnroll={handleEnroll}
                       />
                     ))}
                   </div>
              </div>
              </motion.div>
            </div>

            {/* Enhanced Recent Activity - COMMENTED OUT */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full -translate-y-8 translate-x-8 opacity-10"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Recent Activity</h3>
                    <p className="text-sm text-gray-600">Your learning journey updates</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => {
                      const style = getActivityStyle(activity.type)
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className={`flex items-center space-x-4 p-4 bg-gradient-to-r ${style.bgColor} rounded-lg border ${style.borderColor} hover:shadow-sm transition-all duration-200`}
                        >
                          <div className={`p-3 bg-gradient-to-br ${style.iconBg} rounded-lg shadow-md`}>
                            {style.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-600">{activity.description}</p>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className={`px-2 py-1 ${style.badgeColor} text-xs font-medium rounded-full`}>
                                {style.badgeText}
                              </span>
                              {activity.pointsEarned > 0 && (
                                <span className="text-xs text-gray-500">+{activity.pointsEarned} XP</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`w-2 h-2 ${style.dotColor} rounded-full ${index === 0 ? 'animate-pulse' : ''}`}></div>
                          </div>
                        </motion.div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
                      <p className="text-gray-600 mb-4">Start learning to see your activity here</p>
                      <button 
                        onClick={() => navigate('/courses')}
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Browse Courses
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div> */}
          </motion.div>

          {/* Hackathons Section - COMMENTED OUT */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full -translate-y-8 translate-x-8 opacity-10"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">My Hackathons</h3>
                  <p className="text-sm text-gray-600">Participate in coding competitions</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hackathons.length > 0 ? (
                  hackathons.slice(0, 6).map((hackathon, index) => (
                    <StudentHackathonCard
                      key={hackathon.id}
                      hackathon={hackathon}
                      index={index}
                      onViewDetails={handleViewHackathonDetails}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hackathons available</h3>
                    <p className="text-gray-600 mb-6">You're not currently eligible for any hackathons. Check back later!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div> */}

          {/* Group Chats Section - COMMENTED OUT */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Group Chats</h3>
                <p className="text-sm text-gray-600">Connect with your hackathon teams</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
            
            <ChatRoomsList
              chatRooms={chatRooms}
              onSelectRoom={handleSelectChatRoom}
              loading={chatRoomsLoading}
            />
          </motion.div> */}
        </div>
      </main>
      
      {/* All Courses Modal */}
      <AllCoursesModal 
        isOpen={isAllCoursesModalOpen}
        onClose={() => setIsAllCoursesModalOpen(false)}
      />
      
      {/* Enrolled Courses Modal */}
      <EnrolledCoursesModal 
        isOpen={isEnrolledCoursesModalOpen}
        onClose={() => setIsEnrolledCoursesModalOpen(false)}
      />
      
      {/* Hackathon Details Modal */}
      <StudentHackathonDetailsModal
        hackathon={selectedHackathon}
        onClose={() => {
          setIsHackathonDetailsModalOpen(false)
          setSelectedHackathon(null)
        }}
      />

      {/* Chat Room Modal - COMMENTED OUT */}
      {/* {isChatModalOpen && selectedChatRoom && (
        <ChatRoom
          hackathon={selectedChatRoom.hackathon}
          group={selectedChatRoom.group}
          onClose={handleCloseChat}
        />
      )} */}
    </div>
  )
}

export default StudentDashboard
