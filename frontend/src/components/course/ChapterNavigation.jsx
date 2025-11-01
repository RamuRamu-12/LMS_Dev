import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiCheck, FiStar, FiMessageSquare } from 'react-icons/fi'
import { useMutation, useQueryClient } from 'react-query'
import { enrollmentService } from '../../services/enrollmentService'
import toast from 'react-hot-toast'

const ChapterNavigation = ({ 
  enrollmentId, 
  currentChapter, 
  chapters, 
  onChapterChange,
  isLastChapter = false,
  isCourseCompleted = false 
}) => {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState({ rating: 0, review: '' })
  const queryClient = useQueryClient()

  const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id)
  const hasNext = currentIndex < chapters.length - 1
  const hasPrevious = currentIndex > 0

  const completeChapterMutation = useMutation(
    () => enrollmentService.completeChapter(enrollmentId, currentChapter.id),
    {
      onSuccess: async (data) => {
        toast.success('Chapter completed!')
        queryClient.invalidateQueries(['course', currentChapter.course_id])
        queryClient.invalidateQueries(['enrollment', enrollmentId])
        queryClient.invalidateQueries(['chapterProgression', enrollmentId])
        queryClient.invalidateQueries(['chapterProgression'])
        queryClient.invalidateQueries('student-enrollments') // Refetch enrollment to get updated progress
        queryClient.invalidateQueries('student-stats') // Refetch stats to update progress and hours
        queryClient.invalidateQueries(['course-tests']) // Refetch tests to update unlock status
        // Force refetch of progression data, enrollment, and stats to get updated completion status
        // IMPORTANT: Wait for chapterProgression to refetch so tests unlock immediately
        await Promise.all([
          queryClient.refetchQueries(['course', currentChapter.course_id]),
          queryClient.refetchQueries(['chapterProgression', enrollmentId]),
          queryClient.refetchQueries('student-enrollments'),
          queryClient.refetchQueries('student-stats'), // Refetch stats immediately
          queryClient.refetchQueries(['course-tests', currentChapter.course_id]) // Explicitly refetch tests
        ])
        
        // If there's a next chapter, navigate to it
        if (data.data.nextChapter) {
          onChapterChange(data.data.nextChapter.id)
        }
      },
      onError: (error) => {
        toast.error(error.message)
      }
    }
  )

  const submitFeedbackMutation = useMutation(
    (feedbackData) => enrollmentService.submitCourseFeedback(enrollmentId, feedbackData),
    {
      onSuccess: () => {
        toast.success('Thank you for your feedback!')
        setShowFeedback(false)
        // Invalidate all course-related queries to update ratings everywhere
        queryClient.invalidateQueries(['course', currentChapter.course_id])
        queryClient.invalidateQueries(['courses'])
        queryClient.invalidateQueries(['student-enrollments'])
        queryClient.invalidateQueries(['my-completed-courses'])
      },
      onError: (error) => {
        toast.error(error.message)
      }
    }
  )

  const handleNext = () => {
    if (hasNext) {
      const nextChapter = chapters[currentIndex + 1]
      onChapterChange(nextChapter.id)
    }
  }

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevChapter = chapters[currentIndex - 1]
      onChapterChange(prevChapter.id)
    }
  }

  const handleCompleteChapter = () => {
    completeChapterMutation.mutate()
  }

  const handleSubmitFeedback = () => {
    if (feedback.rating === 0) {
      toast.error('Please select a rating')
      return
    }
    submitFeedbackMutation.mutate(feedback)
  }

  const renderStars = () => {
    return (
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
            <FiStar className="fill-current" />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white border-t-2 border-indigo-200 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all font-semibold ${
            hasPrevious
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FiChevronLeft className="w-5 h-5" />
          <span className="text-sm">Previous</span>
        </button>

        {/* Chapter Info */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Chapter {currentIndex + 1} of {chapters.length}
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {currentChapter.title}
          </p>
        </div>

        {/* Next/Complete Button */}
        <div className="flex items-center space-x-2">
          {isLastChapter && !isCourseCompleted ? (
            <button
              onClick={handleCompleteChapter}
              disabled={completeChapterMutation.isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:opacity-50 font-semibold shadow-md"
            >
              {completeChapterMutation.isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiCheck className="w-5 h-5" />
              )}
              <span className="text-sm">Complete Course</span>
            </button>
          ) : isCourseCompleted ? (
            <button
              onClick={() => setShowFeedback(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              <FiMessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Submit Feedback</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all font-semibold ${
                hasNext
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="text-sm">Next</span>
              <FiChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

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
                {renderStars()}
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

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submitFeedbackMutation.isLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {submitFeedbackMutation.isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default ChapterNavigation
