import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { testService } from '../../services/testService'
import toast from 'react-hot-toast'

const TestTakingModal = ({ 
  isOpen, 
  onClose, 
  test, 
  enrollmentId 
}) => {
  const queryClient = useQueryClient()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [testAttemptId, setTestAttemptId] = useState(null)

  // Debug: Log when modal opens and test data
  useEffect(() => {
    if (isOpen) {
      console.log('TestTakingModal opened:', {
        isOpen,
        testId: test?.id,
        test: test,
        enrollmentId,
        willFetchQuestions: !!test?.id && isOpen,
        queryEnabled: !!test?.id && isOpen
      })
      
      // If test doesn't have an ID, log an error
      if (!test?.id) {
        console.error('❌ Test object missing ID:', test)
      }
    }
  }, [isOpen, test, enrollmentId])

  // Fetch questions for the test
  const { data: questionsData, isLoading: questionsLoading } = useQuery(
    ['test-questions', test?.id],
    () => {
      if (!test?.id) {
        throw new Error('Test ID is required')
      }
      console.log('🔵 API CALL: Fetching test questions for test ID:', test.id)
      return testService.getTestQuestionsForStudent(test.id)
    },
    {
      enabled: !!test?.id && isOpen,
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (err) => {
        console.error('❌ Error fetching test questions:', err)
        if (err.message?.includes('already passed') || err.message?.includes('certificate')) {
          toast.error('You have already passed this test and received a certificate. No retakes allowed.')
        } else {
          toast.error(err.message || 'Failed to load questions')
        }
        onClose()
      },
      onSuccess: (data) => {
        console.log('✅ Test questions fetched successfully:', data)
      }
    }
  )

  const questions = questionsData?.data?.questions || []
  // Merge test data from questions response and prop to ensure all fields are available
  // The prop might have time_limit_minutes and max_attempts that getPublicInfo() doesn't return
  const testData = {
    ...test,
    ...(questionsData?.data?.test || {})
  }

  // Start test mutation
  const startTestMutation = useMutation(
    (testId) => testService.startTest(testId),
    {
      onSuccess: (data) => {
        setTestAttemptId(data.data.attempt.id)
        setTestStarted(true)
        if (testData?.time_limit_minutes) {
          setTimeLeft(testData.time_limit_minutes * 60) // Convert to seconds
        }
        toast.success('Test started! Good luck!')
      },
      onError: (error) => {
        if (error.message?.includes('already passed') || error.message?.includes('certificate')) {
          toast.error('You have already passed this test and received a certificate. No retakes allowed.')
          onClose()
        } else {
          toast.error(error.message || 'Failed to start test')
        }
      }
    }
  )

  // Submit test mutation
  const submitTestMutation = useMutation(
    (attemptData) => testService.submitTest(attemptData.attemptId, attemptData.answers),
    {
      onSuccess: async (data) => {
        setTestCompleted(true)
        setTestResults(data.data)
        toast.success('Test submitted successfully!')
        
        // Refresh all relevant data including test progress
        queryClient.invalidateQueries('student-enrollments')
        queryClient.invalidateQueries('student-activities')
        queryClient.invalidateQueries('user-achievements')
        // Invalidate course data to get updated enrollment progress
        queryClient.invalidateQueries(['course'])
        // Invalidate chapter progression to update test accessibility
        queryClient.invalidateQueries(['chapterProgression'])
        // Invalidate test-related queries
        queryClient.invalidateQueries(['course-tests'])
        queryClient.invalidateQueries(['test-attempts'])
        // Force refetch to immediately update UI including achievements
        await Promise.all([
          queryClient.refetchQueries('student-enrollments'),
          queryClient.refetchQueries(['course']),
          queryClient.refetchQueries(['chapterProgression']),
          queryClient.refetchQueries('user-achievements') // Refetch achievements immediately
        ])
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit test')
      }
    }
  )

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && testStarted && !testCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && testStarted && !testCompleted && !submitTestMutation.isLoading) {
      // Auto-submit when time runs out
      handleSubmitTest()
    }
  }, [timeLeft, testStarted, testCompleted])

  const handleStartTest = () => {
    startTestMutation.mutate(test.id)
  }

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitTest = () => {
    if (testAttemptId && !testCompleted && !submitTestMutation.isLoading) {
      submitTestMutation.mutate({
        attemptId: testAttemptId,
        answers: answers
      })
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100
  }

  const isPassing = testResults?.score >= testData?.passing_score

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY
      // Disable body scroll
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      
      return () => {
        // Re-enable body scroll when modal closes
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        // Restore scroll position
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black bg-opacity-75 z-[9999] overflow-hidden"
        style={{ margin: 0, padding: 0 }}
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          className="bg-white w-screen h-screen overflow-hidden flex flex-col"
          style={{ margin: 0, padding: 0 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{testData?.title || test?.title}</h2>
                <p className="text-indigo-100">{testData?.description || test?.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-indigo-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Close test"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {testStarted && !testCompleted && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                  <div className="w-32 bg-indigo-300 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
                {timeLeft !== null && (
                  <div className="text-lg font-mono bg-indigo-700 px-3 py-1 rounded">
                    {formatTime(timeLeft)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {!testStarted ? (
              // Test Start Screen
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start?</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  This test contains {questions.length} questions. You have {testData?.time_limit_minutes != null ? `${testData.time_limit_minutes} minutes` : 'unlimited time'} to complete it.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{testData?.passing_score || test?.passing_score}%</div>
                    <div className="text-sm text-gray-600">Passing Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{testData?.time_limit_minutes != null ? testData.time_limit_minutes : '∞'}</div>
                    <div className="text-sm text-gray-600">Time Limit (min)</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{testData?.max_attempts != null ? testData.max_attempts : '∞'}</div>
                    <div className="text-sm text-gray-600">Max Attempts</div>
                  </div>
                </div>
                <button
                  onClick={handleStartTest}
                  disabled={startTestMutation.isLoading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50"
                >
                  {startTestMutation.isLoading ? 'Starting...' : 'Start Test'}
                </button>
              </div>
            ) : testCompleted ? (
              // Test Results Screen
              <div className="text-center py-12">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  isPassing ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-pink-600'
                }`}>
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isPassing ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                </div>
                <h3 className={`text-3xl font-bold mb-4 ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                  {isPassing ? 'Congratulations!' : 'Keep Trying!'}
                </h3>
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {testResults?.score}%
                </div>
                <p className="text-gray-600 mb-6">
                  You scored {testResults?.earned_points} out of {testResults?.total_points} points
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{testResults?.correct_answers}</div>
                      <div className="text-sm text-gray-600">Correct</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{testResults?.incorrect_answers}</div>
                      <div className="text-sm text-gray-600">Incorrect</div>
                    </div>
                  </div>
                </div>
                {isPassing ? (
                  <div className="space-y-4">
                    <p className="text-green-600 font-semibold">🎉 You passed! You've earned a certificate!</p>
                    <p className="text-gray-600 text-sm">Check your profile achievements section to view and download your certificate.</p>
                    <button
                      onClick={onClose}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      View Achievements
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-red-600 font-semibold">
                      You need {testData?.passing_score || test?.passing_score}% to pass.
                    </p>
                    <button
                      onClick={onClose}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            ) : questionsLoading ? (
              // Loading Screen
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              // No Questions Screen
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Questions Available</h3>
                <p className="text-gray-600">This test doesn't have any questions yet.</p>
              </div>
            ) : (
              // Question Display
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {questions[currentQuestionIndex]?.question_text}
                  </h3>
                  <div className="space-y-3">
                    {questions[currentQuestionIndex]?.options?.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          answers[questions[currentQuestionIndex].id] === option.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${questions[currentQuestionIndex].id}`}
                          value={option.id}
                          checked={answers[questions[currentQuestionIndex].id] === option.id}
                          onChange={() => handleAnswerSelect(questions[currentQuestionIndex].id, option.id)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          answers[questions[currentQuestionIndex].id] === option.id
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[questions[currentQuestionIndex].id] === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-700">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-2">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-8 h-8 rounded-full text-sm font-medium ${
                          index === currentQuestionIndex
                            ? 'bg-indigo-600 text-white'
                            : answers[questions[index].id]
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={handleSubmitTest}
                      disabled={submitTestMutation.isLoading || testCompleted}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {submitTestMutation.isLoading ? 'Submitting...' : testCompleted ? 'Test Completed' : 'Submit Test'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default TestTakingModal
