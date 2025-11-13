import { motion } from 'framer-motion'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { testService } from '../../services/testService'
import TestTakingModal from './TestTakingModal'
import toast from 'react-hot-toast'

const TestSection = ({ courseId, enrollment, progress, progressionData }) => {
  const [selectedTest, setSelectedTest] = useState(null)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  // Fetch tests for this course
  const { data: testsData, isLoading: testsLoading } = useQuery(
    ['course-tests', courseId],
    () => testService.getTestsByCourse(courseId),
    {
      enabled: !!courseId && !!enrollment,
      refetchOnWindowFocus: false,
      staleTime: 0 // Always fetch fresh data to get updated test status
    }
  )

  const tests = testsData?.data?.tests || []
  
  // Check if student has completed all chapters
  // Use progression data if available (more reliable), otherwise fall back to progress percentage
  let hasCompletedAllChapters = false
  if (progressionData?.chapters && progressionData?.stats) {
    // Check if all regular chapters (non-assignment) are completed
    const regularChapters = progressionData.chapters.filter(ch => !ch.is_assignment)
    const completedRegularChapters = regularChapters.filter(ch => ch.is_completed)
    hasCompletedAllChapters = regularChapters.length > 0 && completedRegularChapters.length === regularChapters.length
  } else {
    // Fallback to progress percentage
    hasCompletedAllChapters = progress >= 100
  }

  const handleTakeTest = (test) => {
    if (!hasCompletedAllChapters) {
      toast.error('You must complete all course chapters before taking the test')
      return
    }
    if (!test || !test.id) {
      console.error('Invalid test object:', test)
      toast.error('Test data is invalid. Please try again.')
      return
    }
    console.log('🟢 Take Test clicked:', { testId: test.id, test })
    setSelectedTest(test)
    setIsTestModalOpen(true)
  }

  const handleCloseTestModal = () => {
    setIsTestModalOpen(false)
    setSelectedTest(null)
  }

  if (!enrollment) {
    return null
  }

  if (testsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (tests.length === 0) {
    return null
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Course Tests
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {hasCompletedAllChapters 
                ? 'Complete the test to earn your certificate'
                : 'Complete all chapters to unlock the course test'}
            </p>
          </div>
          {!hasCompletedAllChapters && (
            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
              🔒 Locked
            </div>
          )}
        </div>

        <div className="space-y-4">
          {tests.map((test) => (
            <motion.div
              key={test.id}
              whileHover={{ scale: hasCompletedAllChapters ? 1.02 : 1 }}
              className={`p-5 border-2 rounded-xl transition-all duration-300 ${
                hasCompletedAllChapters
                  ? 'border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 hover:border-indigo-300 hover:shadow-lg cursor-pointer'
                  : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
              onClick={() => hasCompletedAllChapters && handleTakeTest(test)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{test.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{test.description}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">
                        Passing Score: <span className="font-semibold text-indigo-600">{test.passing_score}%</span>
                      </span>
                    </div>
                    
                    {test.time_limit_minutes && (
                      <div className="flex items-center space-x-2 text-sm">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700">
                          Time Limit: <span className="font-semibold text-yellow-600">{test.time_limit_minutes} min</span>
                        </span>
                      </div>
                    )}
                    
                    {test.max_attempts && (
                      <div className="flex items-center space-x-2 text-sm">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-gray-700">
                          Max Attempts: <span className="font-semibold text-purple-600">{test.max_attempts}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {hasCompletedAllChapters && (
                  <button
                    className="ml-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTakeTest(test)
                    }}
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    Take Test
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {!hasCompletedAllChapters && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">Complete all chapters first</p>
                <p className="text-sm text-yellow-700 mt-1">
                  You need to complete all course chapters before you can take the test. Current progress: {progress}%
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {selectedTest && (
        <TestTakingModal
          isOpen={isTestModalOpen}
          onClose={handleCloseTestModal}
          test={selectedTest}
          enrollmentId={enrollment.id}
        />
      )}
    </>
  )
}

export default TestSection
