import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import VideoPlayer from './VideoPlayer'
import SmartPDFViewer from './SmartPDFViewer'
import ChapterNavigation from './ChapterNavigation'
import TestTakingModal from './TestTakingModal'
import { enrollmentService } from '../../services/enrollmentService'
import { FiFile, FiPlay, FiEye, FiClipboard } from 'react-icons/fi'
import toast from 'react-hot-toast'

const StudentChapterView = ({ 
  chapter, 
  enrollmentId, 
  chapters = [], 
  onChapterChange, 
  showNavigation = true,
  isPreviewMode = false,
  isAuthenticatedNotEnrolled = false,
  courseId = null,
  hasAdminAccess = false
}) => {
  const [viewMode, setViewMode] = useState('video') // 'video', 'pdf', or 'test'
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState({ rating: 0, review: '' })
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const queryClient = useQueryClient()
  
  // Check if user has full access
  const hasFullAccess = hasAdminAccess || (!isPreviewMode && !isAuthenticatedNotEnrolled && !!enrollmentId)

  // Debug enrollmentId
  console.log('=== StudentChapterView DEBUG ===')
  console.log('enrollmentId received:', enrollmentId)
  console.log('chapter received:', chapter)
  console.log('chapters array:', chapters)
  console.log('isPreviewMode:', isPreviewMode)
  console.log('hasFullAccess:', hasFullAccess)
  console.log('hasAdminAccess:', hasAdminAccess)
  console.log('================================')


  // Complete course mutation
  const completeCourseMutation = useMutation(
    () => {
      if (!enrollmentId) {
        throw new Error('Enrollment ID is required')
      }
      return enrollmentService.completeCourse(enrollmentId)
    },
    {
      onSuccess: (data) => {
        toast.success('Course completed successfully!')
        setShowFeedback(true) // Show feedback modal after completion
        // Invalidate all relevant queries to ensure UI updates
        queryClient.invalidateQueries(['course', chapter.course_id])
        queryClient.invalidateQueries(['course'])
        queryClient.invalidateQueries(['enrollment', enrollmentId])
        queryClient.invalidateQueries(['enrollment'])
        queryClient.invalidateQueries(['chapterProgression', enrollmentId])
        queryClient.invalidateQueries(['chapterProgression'])
        // Force refetch of course data to get updated progress
        queryClient.refetchQueries(['course', chapter.course_id])
      },
      onError: (error) => {
        console.error('Complete course error:', error)
        toast.error(error.message)
      }
    }
  )

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation(
    (feedbackData) => {
      if (!enrollmentId) {
        throw new Error('Enrollment ID is required')
      }
      return enrollmentService.submitCourseFeedback(enrollmentId, feedbackData)
    },
    {
      onSuccess: () => {
        toast.success('Thank you for your feedback!')
        setShowFeedback(false)
        // Invalidate all course-related queries to update ratings everywhere
        queryClient.invalidateQueries(['course', chapter.course_id])
        queryClient.invalidateQueries(['courses'])
        queryClient.invalidateQueries(['student-enrollments'])
        queryClient.invalidateQueries(['my-completed-courses'])
      },
      onError: (error) => {
        console.error('Submit feedback error:', error)
        toast.error(error.message)
      }
    }
  )

  // Complete chapter mutation (for progress tracking)
  const completeChapterMutation = useMutation(
    () => {
      if (!enrollmentId) {
        throw new Error('Enrollment ID is required')
      }
      return enrollmentService.completeChapter(enrollmentId, chapter.id)
    },
    {
      onSuccess: async (data) => {
        toast.success('Chapter completed!')
        // Invalidate all relevant queries to ensure UI updates
        queryClient.invalidateQueries(['course', chapter.course_id])
        queryClient.invalidateQueries(['course'])
        queryClient.invalidateQueries(['enrollment', enrollmentId])
        queryClient.invalidateQueries(['enrollment'])
        queryClient.invalidateQueries(['chapterProgression', enrollmentId])
        queryClient.invalidateQueries(['chapterProgression'])
        queryClient.invalidateQueries('student-enrollments') // Refetch enrollment to get updated progress
        queryClient.invalidateQueries('student-stats') // Refetch stats to update progress and hours
        queryClient.invalidateQueries(['course-tests']) // Refetch tests to update unlock status
        // Force refetch of course data, progression, enrollment, and stats to get updated progress
        // IMPORTANT: Wait for chapterProgression to refetch so tests unlock immediately
        await Promise.all([
          queryClient.refetchQueries(['course', chapter.course_id]),
          queryClient.refetchQueries(['chapterProgression', enrollmentId]),
          queryClient.refetchQueries('student-enrollments'),
          queryClient.refetchQueries('student-stats'), // Refetch stats immediately
          queryClient.refetchQueries(['course-tests', chapter.course_id]) // Explicitly refetch tests
        ])
      },
      onError: (error) => {
        console.error('Complete chapter error:', error)
        toast.error(error.message)
      }
    }
  )

  // Auto-set view mode based on available content
  useEffect(() => {
    if (chapter) {
      // In preview mode, use has_video/has_pdf flags; otherwise use actual URLs
      const hasVideo = isPreviewMode ? !!chapter.has_video : !!chapter.video_url
      const hasPDF = isPreviewMode ? !!chapter.has_pdf : !!chapter.pdf_url
      const hasTest = !!chapter.test_id || !!chapter.test || !!chapter.has_test
      
      if (hasTest) {
        setViewMode('test')
      } else if (hasVideo && hasPDF) {
        // If both are available, keep current selection or default to video
        setViewMode(prev => prev === 'video' || prev === 'pdf' ? prev : 'video')
      } else if (hasVideo) {
        setViewMode('video')
      } else if (hasPDF) {
        setViewMode('pdf')
      }
    }
  }, [chapter, isPreviewMode])

  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <FiFile className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Chapter Selected</h3>
          <p className="text-gray-600">Select a chapter from the sidebar to view its content.</p>
        </div>
      </div>
    )
  }

  // In preview mode, check flags instead of URLs
  const hasVideo = isPreviewMode ? !!chapter.has_video : !!chapter.video_url
  const hasPDF = isPreviewMode ? !!chapter.has_pdf : !!chapter.pdf_url
  const hasTest = !!chapter.test_id || !!chapter.test || !!chapter.has_test

  const handleTakeTest = () => {
    if (!enrollmentId) {
      if (hasAdminAccess) {
        toast('Tests require an enrollment to track attempts.', { icon: 'ℹ️' })
      } else {
        toast.error('You must be enrolled to take this test')
      }
      return
    }
    setIsTestModalOpen(true)
  }

  const handleCloseTestModal = () => {
    setIsTestModalOpen(false)
    // Refresh the chapter data and enrollment after test completion
    queryClient.invalidateQueries(['course', chapter.course_id])
    queryClient.invalidateQueries(['chapterProgression', enrollmentId])
    queryClient.invalidateQueries('student-enrollments')
    queryClient.invalidateQueries(['course-tests'])
    // Force refetch to update test progress immediately
    Promise.all([
      queryClient.refetchQueries(['course', chapter.course_id]),
      queryClient.refetchQueries(['chapterProgression', enrollmentId]),
      queryClient.refetchQueries('student-enrollments')
    ])
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-gray-50">
      {/* Compact Content Type Selector with Navigation */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200 px-4 py-2">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50"></div>
        <div className="relative flex items-center justify-between">
          {/* Left side - Previous button */}
          <div className="flex items-center space-x-3">
            {chapters.length > 0 && (() => {
              // Filter out test chapters to get only regular content chapters
              const regularChapters = chapters.filter(ch => 
                !ch.test_id && 
                !ch.test && 
                ch.type !== 'test'
              )
              
              const currentIndex = regularChapters.findIndex(ch => ch.id === chapter.id)
              
              return (
                <button
                  onClick={() => {
                    if (currentIndex > 0) {
                      onChapterChange(regularChapters[currentIndex - 1].id)
                    }
                  }}
                  disabled={currentIndex === 0}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentIndex > 0
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
              )
            })()}
          </div>
          
          {/* Compact View Mode Toggle */}
          {(hasVideo || hasPDF || hasTest) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-1 shadow-sm">
                {hasVideo && (
                  <button
                    onClick={() => setViewMode('video')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      viewMode === 'video'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <FiPlay className="w-3 h-3" />
                    <span>Video</span>
                  </button>
                )}
                {hasPDF && (
                  <button
                    onClick={() => setViewMode('pdf')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      viewMode === 'pdf'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <FiEye className="w-3 h-3" />
                    <span>PDF</span>
                  </button>
                )}
                {hasTest && (
                  <button
                    onClick={() => setViewMode('test')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      viewMode === 'test'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <FiClipboard className="w-3 h-3" />
                    <span>Test</span>
                  </button>
                )}
              </div>
              
              {/* Compact Content Status Indicator */}
              <div className="flex items-center space-x-2">
                {hasTest ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <FiClipboard className="w-3 h-3 text-purple-500" />
                    <span className="text-xs font-medium text-purple-700">Test</span>
                  </div>
                ) : hasVideo && hasPDF ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-red-50 to-blue-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <span className="text-xs font-medium text-red-700">1 video</span>
                    </div>
                    <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      <span className="text-xs font-medium text-blue-700">1 PDF</span>
                    </div>
                  </div>
                ) : hasVideo ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span className="text-xs font-medium text-red-700">1 video</span>
                  </div>
                ) : hasPDF ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    <span className="text-xs font-medium text-blue-700">1 PDF</span>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

          {/* Right side - Next/Complete button */}
          <div className="flex items-center space-x-3">
            {chapters.length > 0 && (
              <>
                {(() => {
                  // Filter out test chapters to get only regular content chapters
                  const regularChapters = chapters.filter(ch => 
                    !ch.test_id && 
                    !ch.test && 
                    ch.type !== 'test'
                  )
                  
                  // Check if current chapter is the last regular chapter
                  const isLastRegularChapter = regularChapters.findIndex(ch => ch.id === chapter.id) === regularChapters.length - 1
                  
                  return isLastRegularChapter
                })() ? (
                  // Last chapter - Show Complete Course button only if enrolled
                  enrollmentId ? (
                    <button
                      onClick={() => completeCourseMutation.mutate()}
                      disabled={completeCourseMutation.isLoading}
                      className="flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {completeCourseMutation.isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span>{completeCourseMutation.isLoading ? 'Completing Course...' : 'Complete Course'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-500">
                      <span>Course Preview</span>
                    </div>
                  )
                ) : (
                  // Not last chapter - Show Next button
                  <button
                    onClick={() => {
                      // Filter out test chapters to get only regular content chapters
                      const regularChapters = chapters.filter(ch => 
                        !ch.test_id && 
                        !ch.test && 
                        ch.type !== 'test'
                      )
                      
                      const currentIndex = regularChapters.findIndex(ch => ch.id === chapter.id)
                      if (currentIndex < regularChapters.length - 1) {
                        if (enrollmentId) {
                          // Complete current chapter first, then navigate
                          completeChapterMutation.mutate(undefined, {
                            onSuccess: () => {
                              onChapterChange(regularChapters[currentIndex + 1].id)
                            }
                          })
                        } else {
                          // Just navigate without completion tracking
                          onChapterChange(regularChapters[currentIndex + 1].id)
                        }
                      }
                    }}
                    disabled={completeChapterMutation.isLoading}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-indigo-100 hover:bg-indigo-200 text-indigo-700 disabled:opacity-50"
                  >
                    <span>{completeChapterMutation.isLoading ? 'Completing...' : 'Next'}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Large Video/Content Area */}
      <div className="flex-1 bg-gradient-to-br from-white to-gray-50">
        {viewMode === 'test' && hasTest ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-indigo-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center p-12 max-w-2xl"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                <FiClipboard className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {chapter.test?.title || 'Chapter Test'}
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                {chapter.test?.description || 'Complete this test to demonstrate your understanding of the chapter material.'}
              </p>
              
              {chapter.test && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="text-2xl font-bold text-purple-600">{chapter.test.passing_score}%</div>
                    <div className="text-sm text-gray-600">Passing Score</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="text-2xl font-bold text-indigo-600">
                      {chapter.test.time_limit_minutes || '∞'}
                    </div>
                    <div className="text-sm text-gray-600">Time Limit (min)</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <div className="text-2xl font-bold text-blue-600">
                      {chapter.test.max_attempts || '∞'}
                    </div>
                    <div className="text-sm text-gray-600">Max Attempts</div>
                  </div>
                </div>
              )}

              {hasFullAccess && enrollmentId ? (
                <button
                  onClick={handleTakeTest}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FiClipboard className="inline w-5 h-5 mr-2" />
                  Take Test
                </button>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-yellow-800 mb-4">
                    {isPreviewMode 
                      ? 'Login and enroll in this course to take the test.'
                      : 'You must be enrolled in this course to take the test.'
                    }
                  </p>
                  {isPreviewMode ? (
                    <Link
                      to={`/login?redirect=/courses/${courseId}`}
                      className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      Login to Access
                    </Link>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          await enrollmentService.enrollInCourse(courseId)
                          window.location.reload()
                        } catch (err) {
                          toast.error('Failed to enroll. Please try again.')
                        }
                      }}
                      className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              )}

              {chapter.test?.instructions && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                  <p className="text-sm text-blue-800">{chapter.test.instructions}</p>
                </div>
              )}
            </motion.div>
          </div>
        ) : viewMode === 'video' && hasVideo ? (
          hasFullAccess && chapter.video_url ? (
            <VideoPlayer
              url={chapter.video_url}
              title={chapter.title}
              className="h-full w-full"
              showControls={true}
              autoplay={false}
            />
          ) : (
            // Preview mode - show locked video player
            <div className="relative h-full bg-black flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90"></div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 text-center p-8 max-w-2xl"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <FiPlay className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Video Content</h3>
                <p className="text-gray-300 mb-6">
                  {isPreviewMode 
                    ? 'Login and enroll to access this video content.'
                    : 'Enroll in this course to access video content.'
                  }
                </p>
                {isPreviewMode ? (
                  <Link
                    to={`/login?redirect=/courses/${courseId}`}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                  >
                    Login to Access
                  </Link>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        await enrollmentService.enrollInCourse(courseId)
                        window.location.reload()
                      } catch (err) {
                        toast.error('Failed to enroll. Please try again.')
                      }
                    }}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg"
                  >
                    Enroll Now
                  </button>
                )}
              </motion.div>
            </div>
          )
         ) : viewMode === 'pdf' && hasPDF ? (
           hasFullAccess && chapter.pdf_url ? (
             <SmartPDFViewer
               pdfUrl={chapter.pdf_url}
               title={chapter.title}
               className="h-full"
             />
           ) : (
             // Preview mode - show locked PDF viewer
             <div className="relative h-full bg-gray-100 flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 opacity-90"></div>
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="relative z-10 text-center p-8 max-w-2xl"
               >
                 <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                   <FiEye className="w-12 h-12 text-white" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">PDF Content</h3>
                 <p className="text-gray-600 mb-6">
                   {isPreviewMode 
                     ? 'Login and enroll to view and download this PDF material.'
                     : 'Enroll in this course to view and download PDF materials.'
                   }
                 </p>
                 {isPreviewMode ? (
                   <Link
                     to={`/login?redirect=/courses/${courseId}`}
                     className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                   >
                     Login to Access
                   </Link>
                 ) : (
                   <button
                     onClick={async () => {
                       try {
                         await enrollmentService.enrollInCourse(courseId)
                         window.location.reload()
                       } catch (err) {
                         toast.error('Failed to enroll. Please try again.')
                       }
                     }}
                     className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg"
                   >
                     Enroll Now
                   </button>
                 )}
               </motion.div>
             </div>
           )
         ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center p-12"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiFile className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Content Available</h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                {!hasVideo && !hasPDF && !hasTest
                  ? 'This chapter doesn\'t have any content yet.'
                  : viewMode === 'video' 
                    ? 'This chapter doesn\'t have video content yet.'
                    : 'This chapter doesn\'t have PDF content yet.'}
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Chapter Navigation */}
      {showNavigation && enrollmentId && chapter && chapters.length > 0 && (
        <ChapterNavigation
          enrollmentId={enrollmentId}
          currentChapter={chapter}
          chapters={chapters}
          onChapterChange={onChapterChange}
          isLastChapter={chapters.findIndex(ch => ch.id === chapter.id) === chapters.length - 1}
          isCourseCompleted={false} // This will be updated based on enrollment status
        />
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rate this Course
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl transition-colors ${
                        star <= feedback.rating 
                          ? 'text-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={feedback.review}
                  onChange={(e) => setFeedback(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Share your thoughts about this course..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={4}
                />
              </div>
            </div>

            {/* Mandatory Test Notice */}
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-purple-900">Test Required</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    You must complete the course test to finish this course. The review above is optional.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  // Skip only the review, but still require test taking
                  setShowFeedback(false)
                  // Automatically trigger test taking after skipping review
                  if (window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('showTestSection', { 
                      detail: { courseId: chapter.course_id } 
                    }))
                  }
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Skip Review
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (feedback.rating === 0) {
                      toast.error('Please select a rating')
                      return
                    }
                    submitFeedbackMutation.mutate(feedback, {
                      onSuccess: () => {
                        // After submitting review, automatically trigger test taking
                        setShowFeedback(false)
                        if (window.dispatchEvent) {
                          window.dispatchEvent(new CustomEvent('showTestSection', { 
                            detail: { courseId: chapter.course_id } 
                          }))
                        }
                      }
                    })
                  }}
                  disabled={submitFeedbackMutation.isLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitFeedbackMutation.isLoading ? 'Submitting...' : 'Submit Review & Take Test'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Test Taking Modal */}
      {hasTest && chapter.test && (
        <TestTakingModal
          isOpen={isTestModalOpen}
          onClose={handleCloseTestModal}
          test={chapter.test}
          enrollmentId={enrollmentId}
        />
      )}

    </div>
  )
}

export default StudentChapterView
