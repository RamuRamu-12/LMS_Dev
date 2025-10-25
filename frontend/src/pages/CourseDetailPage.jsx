import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { courseService } from '../services/courseService'
import { enrollmentService } from '../services/enrollmentService'
import { useAuth } from '../context/AuthContext'
import useCourseLogo from '../hooks/useCourseLogo'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ChapterSidebar from '../components/course/ChapterSidebar'
import StudentChapterView from '../components/course/StudentChapterView'
import ChapterNavigation from '../components/course/ChapterNavigation'
import TestSection from '../components/course/TestSection'
import { FiAlertCircle } from 'react-icons/fi'

const CourseDetailPage = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [chapterProgression, setChapterProgression] = useState(null)
  const [showTestSection, setShowTestSection] = useState(false)

  // Use content endpoint for enrolled students to get enrollment data
  const { data: courseData, isLoading, error } = useQuery(
    ['course', id],
    () => {
      // Try to get course content first (includes enrollment data)
      return courseService.getCourseContent(id)
    },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // If content endpoint fails (user not enrolled), fall back to general course info
        if (error?.response?.status === 403 || error?.response?.status === 401) {
          return false // Don't retry, we'll handle this in the component
        }
        return failureCount < 3
      }
    }
  )
  console.log(courseData)
  // Get chapter progression for students (only if enrolled)
  const { data: progressionData } = useQuery(
    ['chapterProgression', courseData?.data?.enrollment?.id],
    () => enrollmentService.getChapterProgression(courseData.data.enrollment.id),
    {
      enabled: !!courseData?.data?.enrollment?.id && user?.role === 'student' && courseData?.data?.enrollment?.status === 'enrolled',
      refetchOnWindowFocus: false
    }
  )

  // Mutation for updating progress
  const updateProgressMutation = useMutation(
    (progress) => enrollmentService.updateMyProgress(enrollment?.id, { progress }),
    {
      onSuccess: () => {
        // Refetch course data to get updated progress
        queryClient.invalidateQueries(['course', id])
        queryClient.invalidateQueries('student-enrollments')
        queryClient.invalidateQueries(['chapterProgression', courseData?.data?.enrollment?.id])
      }
    }
  )

  // Handle progress update from video player
  const handleProgressUpdate = (progress) => {
    if (user?.role === 'student' && progress > 0) {
      updateProgressMutation.mutate(progress)
    }
  }

  const course = courseData?.data?.course
  const enrollment = courseData?.data?.enrollment // For enrolled students
  const chapters = course?.chapters || []
  
  // Check if user has enrollment data (means they're enrolled)
  const isEnrolled = !!enrollment?.id
  
  // Debug enrollment data
  console.log('=== ENROLLMENT DEBUG ===')
  console.log('User:', user)
  console.log('User role:', user?.role)
  console.log('Is authenticated:', isAuthenticated)
  console.log('Course data:', courseData)
  console.log('Enrollment data:', enrollment)
  console.log('Progress condition:', user?.role === 'student' && enrollment)
  console.log('========================')

  // Get course logo
  const { logoUrl, loading: logoLoading, error: logoError } = useCourseLogo(course?.id, !!course?.logo)


  // Set first accessible chapter as selected when chapters are loaded
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapter) {
      if (progressionData?.data?.chapters) {
        // Use progression data to find first accessible chapter
        const firstAccessibleChapter = progressionData.data.chapters.find(ch => ch.is_accessible)
        if (firstAccessibleChapter) {
          const fullChapter = chapters.find(ch => ch.id === firstAccessibleChapter.id)
          if (fullChapter) {
            setSelectedChapter(fullChapter)
            return
          }
        }
      }
      // Fallback to first chapter
      setSelectedChapter(chapters[0])
    }
  }, [chapters, progressionData, selectedChapter])

  // Listen for test section display event
  useEffect(() => {
    const handleShowTestSection = (event) => {
      setShowTestSection(true)
    }

    window.addEventListener('showTestSection', handleShowTestSection)
    return () => {
      window.removeEventListener('showTestSection', handleShowTestSection)
    }
  }, [])

  // Update progression data when it changes
  useEffect(() => {
    if (progressionData?.data) {
      setChapterProgression(progressionData.data)
    }
  }, [progressionData])

  // Handle chapter change
  const handleChapterChange = (chapterOrId) => {
    if (chapterOrId) {
      // If it's a chapter object, use it directly
      if (typeof chapterOrId === 'object') {
        setSelectedChapter(chapterOrId)
      } else {
        // If it's a chapter ID, find the chapter in the chapters array
        const chapter = chapters.find(ch => ch.id === chapterOrId)
        if (chapter) {
          setSelectedChapter(chapter)
        }
      }
    }
  }


  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Handle API errors
  if (error) {
    console.error('Course loading error:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Course</h1>
            <p className="text-gray-600 mb-6">
              {error.message?.includes('401') 
                ? 'Authentication required. Please log in to view this course.'
                : error.message?.includes('404')
                ? 'Course not found.'
                : 'Unable to load course content. Please try again later.'
              }
            </p>
            <button 
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Add safety checks for course data
  if (course && typeof course !== 'object') {
    console.error('Invalid course data structure:', course)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Course Data</h1>
            <p className="text-gray-600">The course data is not in the expected format.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600">The course you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Check if user is authenticated for course content access
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-2xl mx-auto px-4">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Login Required</h1>
            <p className="text-lg text-gray-600 mb-8">
              You need to be logged in to access course content. Please sign in or create an account to continue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Check if user is enrolled in the course (for students)
  if (user?.role === 'student' && !isEnrolled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-2xl mx-auto px-4">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Enrollment Required</h1>
            <p className="text-lg text-gray-600 mb-8">
              You need to enroll in this course to access its content. Please enroll first to continue learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Browse Courses
              </Link>
              <Link
                to="/student"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

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
            {/* Compact Course Header */}
            <div className="relative overflow-hidden bg-white rounded-xl shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200 to-yellow-200 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
              
              <div className="relative p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                        {course.title}
                      </h1>
                      <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                        {course.description}
                      </p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-wrap gap-3"
                    >
                      <span className={`inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg shadow-sm ${
                        course.difficulty === 'beginner' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : course.difficulty === 'intermediate'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                          : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                      }`}>
                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {course.difficulty}
                      </span>
                      <span className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg shadow-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {course.category}
                      </span>
                      <span className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg shadow-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.estimated_duration || 0} hours
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center space-x-6 text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{course.enrollment_count || 0}</div>
                          <div className="text-xs text-gray-600">Students</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-md">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{course.average_rating || 0}</div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                      </div>
                      
                    </motion.div>

                    {/* Compact Enrollment Status for Students */}
                    {user?.role === 'student' && enrollment && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-green-800">You're enrolled in this course!</h3>
                              <p className="text-xs text-green-600">
                                Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-800 mb-1">
                              {enrollment.progress || 0}%
                            </div>
                            <div className="w-20 bg-green-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                                style={{ width: `${enrollment.progress || 0}%` }}
                              />
                            </div>
                            <div className="text-xs text-green-600 mt-0.5">Progress</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                  >
                    {course.logo && logoUrl ? (
                      <div className="relative group">
                        <img
                          src={logoUrl}
                          alt={course.title}
                          className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                      </div>
                    ) : course.logo && logoLoading ? (
                      <div className="relative group">
                        <div className="w-full h-48 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <div className="animate-pulse text-white text-4xl font-bold">
                            {course.title.charAt(0)}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                      </div>
                    ) : course.logo && logoError ? (
                      <div className="relative group">
                        <div className="w-full h-48 bg-gradient-to-br from-red-500 via-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-white text-4xl font-bold">
                            {course.title.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                      </div>
                    ) : course.thumbnail ? (
                      <div className="relative group">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                      </div>
                    ) : (
                      <div className="relative group">
                        <div className="w-full h-48 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-white text-4xl font-bold">
                            {course.title.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Compact Course Content - Chapter-based layout for all users */}
            {chapters.length > 0 ? (
              <div className="relative overflow-hidden bg-white rounded-xl shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50"></div>
                <div className="relative flex h-[calc(100vh-200px)] overflow-hidden">
                  {/* Compact Chapter Sidebar */}
                  <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 overflow-y-auto">
                    <ChapterSidebar
                      chapters={chapters}
                      selectedChapterId={selectedChapter?.id}
                      onChapterSelect={setSelectedChapter}
                      courseTitle={course.title}
                      progressionData={chapterProgression}
                    />
                  </div>
                  
                    {/* Large Chapter Content Area */}
                    <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50">
                    
                    {/* Video/Content Area - Fixed height, no scrolling */}
                    <div className="flex-1 flex flex-col">
                      {showTestSection ? (
                        <div className="h-full overflow-y-auto p-6">
                          <div className="flex items-center justify-between mb-6">
                            <button
                              onClick={() => setShowTestSection(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              <span>Back to Chapters</span>
                            </button>
                          </div>
                          <TestSection 
                            courseId={course.id}
                            enrollment={isEnrolled ? enrollment : null}
                            progress={enrollment?.progress || 0}
                          />
                        </div>
                      ) : (
                        <StudentChapterView 
                          chapter={selectedChapter}
                          enrollmentId={isEnrolled ? enrollment.id : null}
                          chapters={chapters}
                          onChapterChange={handleChapterChange}
                          showNavigation={false}
                        />
                      )}
                    </div>
                    
                    {/* Chapter Navigation - Always visible at bottom */}
                  </div>
                </div>
              </div>
            ) : (
              /* No chapters available */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* No Content Section */}
                  <div className="card p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Content</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
                      <p className="text-gray-600">
                        This course doesn't have any chapters yet. Check back later for updates.
                      </p>
                    </div>
                  </div>

                  {/* Learning Objectives */}
                  {course.learning_objectives && course.learning_objectives.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                      <ul className="space-y-3">
                        {course.learning_objectives.map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Course Files */}
                  {course.files && course.files.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Materials</h3>
                      <div className="space-y-3">
                        {course.files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.original_name}</p>
                                <p className="text-xs text-gray-500">{file.file_type.toUpperCase()}</p>
                              </div>
                            </div>
                            <button className="btn-primary text-sm px-4 py-2">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                {/* Course Info */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{course.estimated_duration || 0} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level</span>
                      <span className="font-medium capitalize">{course.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium capitalize">{course.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students</span>
                      <span className="font-medium">{course.enrollment_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating</span>
                      <span className="font-medium">{course.average_rating || 0}/5</span>
                    </div>
                  </div>
                </div>

                {/* Instructor */}
                {course.instructor && (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
                    <div className="flex items-center space-x-3">
                      <img
                        src={course.instructor.avatar || `https://ui-avatars.com/api/?name=${course.instructor.name}&background=6366f1&color=fff`}
                        alt={course.instructor.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{course.instructor.name}</p>
                        <p className="text-sm text-gray-500">Course Instructor</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Test Section - Shows for enrolled students */}
            {user?.role === 'student' && isEnrolled && (
              <TestSection 
                courseId={course.id}
                enrollment={enrollment}
                progress={enrollment.progress || 0}
              />
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CourseDetailPage
