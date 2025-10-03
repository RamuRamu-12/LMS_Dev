import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { testService } from '../../services/testService'
import toast from 'react-hot-toast'

const TestManagement = ({ courseId, courseTitle }) => {
  const queryClient = useQueryClient()
  const [showTestForm, setShowTestForm] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [selectedTest, setSelectedTest] = useState(null)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [testFormData, setTestFormData] = useState({
    title: '',
    description: '',
    passing_score: 70,
    time_limit_minutes: null,
    max_attempts: null,
    instructions: ''
  })
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  })

  // Fetch tests for this course
  const { data: testsData, isLoading: testsLoading } = useQuery(
    ['course-tests', courseId],
    () => testService.getTestsByCourse(courseId),
    {
      enabled: !!courseId,
      refetchOnWindowFocus: false
    }
  )

  // Fetch questions for selected test
  const { data: questionsData, isLoading: questionsLoading } = useQuery(
    ['test-questions', selectedTest],
    () => testService.getQuestionsByTest(selectedTest),
    {
      enabled: !!selectedTest,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log('=== FRONTEND QUESTIONS DATA ===');
        console.log('Questions data received:', data);
        if (data?.data?.questions) {
          data.data.questions.forEach((q, index) => {
            console.log(`Question ${index + 1}: ${q.question_text}`);
            console.log(`  Options: ${q.options ? q.options.length : 0}`);
            if (q.options) {
              q.options.forEach((opt, optIndex) => {
                console.log(`    Option ${optIndex + 1}: ${opt.option_text} (Correct: ${opt.is_correct})`);
              });
            }
          });
        }
        console.log('==============================');
      }
    }
  )

  const tests = testsData?.data?.tests || []
  const questions = questionsData?.data?.questions || []

  // Create test mutation
  const createTestMutation = useMutation(
    (testData) => testService.createTest({ ...testData, course_id: courseId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course-tests', courseId])
        toast.success('Test created successfully!')
        setShowTestForm(false)
        resetTestForm()
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create test')
      }
    }
  )

  // Update test mutation
  const updateTestMutation = useMutation(
    ({ testId, testData }) => testService.updateTest(testId, testData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course-tests', courseId])
        toast.success('Test updated successfully!')
        setShowTestForm(false)
        setEditingTest(null)
        resetTestForm()
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update test')
      }
    }
  )

  // Delete test mutation
  const deleteTestMutation = useMutation(
    (testId) => testService.deleteTest(testId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course-tests', courseId])
        toast.success('Test deleted successfully!')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete test')
      }
    }
  )

  // Create question mutation
  const createQuestionMutation = useMutation(
    (questionData) => testService.createQuestion(questionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['test-questions', selectedTest])
        toast.success('Question added successfully!')
        resetQuestionForm()
        // Keep form open so admin can add more questions
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create question')
      }
    }
  )

  // Update question mutation
  const updateQuestionMutation = useMutation(
    ({ questionId, questionData }) => testService.updateQuestion(questionId, questionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['test-questions', selectedTest])
        toast.success('Question updated successfully!')
        setEditingQuestion(null)
        resetQuestionForm()
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update question')
      }
    }
  )

  // Delete question mutation
  const deleteQuestionMutation = useMutation(
    (questionId) => testService.deleteQuestion(questionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['test-questions', selectedTest])
        toast.success('Question deleted successfully!')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete question')
      }
    }
  )

  const resetTestForm = () => {
    setTestFormData({
      title: '',
      description: '',
      passing_score: 70,
      time_limit_minutes: null,
      max_attempts: null,
      instructions: ''
    })
  }

  const resetQuestionForm = () => {
    setQuestionFormData({
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false }
      ]
    })
  }

  const handleEditTest = (test) => {
    setEditingTest(test)
    setTestFormData({
      title: test.title,
      description: test.description,
      passing_score: test.passing_score,
      time_limit_minutes: test.time_limit_minutes,
      max_attempts: test.max_attempts,
      instructions: test.instructions || ''
    })
    setShowTestForm(true)
  }

  const handleDeleteTest = (testId, testTitle) => {
    if (window.confirm(`Are you sure you want to delete "${testTitle}"? This will also delete all questions and student attempts.`)) {
      deleteTestMutation.mutate(testId)
    }
  }

  const handleSubmitTest = (e) => {
    e.preventDefault()
    if (editingTest) {
      updateTestMutation.mutate({ testId: editingTest.id, testData: testFormData })
    } else {
      createTestMutation.mutate(testFormData)
    }
  }

  const handleAddQuestion = (testId) => {
    setSelectedTest(testId)
    setEditingQuestion(null)
    resetQuestionForm()
    setShowQuestionForm(true)
  }

  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setSelectedTest(question.test_id)
    setQuestionFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      points: question.points,
      options: question.options ? question.options.map(opt => ({
        option_text: opt.option_text,
        is_correct: opt.is_correct
      })) : [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false }
      ]
    })
    setShowQuestionForm(true)
  }

  const handleDeleteQuestion = (questionId, questionText) => {
    if (window.confirm(`Are you sure you want to delete this question?\n\n"${questionText}"\n\nThis action cannot be undone.`)) {
      deleteQuestionMutation.mutate(questionId)
    }
  }

  const handleSubmitQuestion = (e) => {
    e.preventDefault()
    
    // Filter out empty options
    const validOptions = questionFormData.options.filter(opt => opt.option_text && opt.option_text.trim() !== '')
    
    console.log('Original options:', questionFormData.options);
    console.log('Valid options after filtering:', validOptions);
    
    // Validate at least one correct answer
    const hasCorrectAnswer = validOptions.some(opt => opt.is_correct)
    if (!hasCorrectAnswer) {
      toast.error('Please mark at least one option as correct')
      return
    }

    // Validate at least 2 options
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options')
      return
    }
    
    // Validate that all options have unique text
    const optionTexts = validOptions.map(opt => opt.option_text.trim().toLowerCase())
    const uniqueTexts = [...new Set(optionTexts)]
    if (optionTexts.length !== uniqueTexts.length) {
      toast.error('All options must have different text')
      return
    }

    const dataToSend = {
      test_id: selectedTest,
      ...questionFormData,
      options: validOptions
    }

    console.log('=== FRONTEND SUBMIT QUESTION ===');
    console.log('Question form data:', questionFormData);
    console.log('Valid options:', validOptions);
    console.log('Selected test ID:', selectedTest);
    console.log('Data to send:', dataToSend);
    console.log('===============================');

    if (editingQuestion) {
      updateQuestionMutation.mutate({
        questionId: editingQuestion.id,
        questionData: dataToSend
      })
    } else {
      createQuestionMutation.mutate(dataToSend)
    }
  }

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...questionFormData.options]
    newOptions[index][field] = value
    setQuestionFormData({ ...questionFormData, options: newOptions })
  }

  const addOption = () => {
    setQuestionFormData({
      ...questionFormData,
      options: [...questionFormData.options, { option_text: '', is_correct: false }]
    })
  }

  const removeOption = (index) => {
    if (questionFormData.options.length > 2) {
      const newOptions = questionFormData.options.filter((_, i) => i !== index)
      setQuestionFormData({ ...questionFormData, options: newOptions })
    } else {
      toast.error('Must have at least 2 options')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Course Tests</h3>
          <p className="text-sm text-gray-600">
            Manage tests for "{courseTitle}"
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTest(null)
            resetTestForm()
            setShowTestForm(true)
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
        >
          + Add Test
        </button>
      </div>

      {/* Test List */}
      {testsLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : tests.length === 0 && !showTestForm ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tests Yet</h3>
          <p className="text-gray-600 mb-4">Add a test to assess student learning</p>
          <button
            onClick={() => setShowTestForm(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create First Test
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{test.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                          Passing: {test.passing_score}%
                        </span>
                        {test.time_limit_minutes && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Time: {test.time_limit_minutes} min
                          </span>
                        )}
                        {test.max_attempts && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            Max Attempts: {test.max_attempts}
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          test.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {test.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleAddQuestion(test.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        + Add Question
                      </button>
                      <button
                        onClick={() => handleEditTest(test)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Edit Test
                      </button>
                      <button
                        onClick={() => handleDeleteTest(test.id, test.title)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete Test
                      </button>
                    </div>
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Test Form */}
      <AnimatePresence>
        {showTestForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6 bg-indigo-50 border border-indigo-200"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTest ? 'Edit Test' : 'Add New Test'}
            </h4>
            <form onSubmit={handleSubmitTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={testFormData.title}
                  onChange={(e) => setTestFormData({ ...testFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={testFormData.description}
                  onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%) *
                  </label>
                  <input
                    type="number"
                    value={testFormData.passing_score}
                    onChange={(e) => setTestFormData({ ...testFormData, passing_score: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={testFormData.time_limit_minutes || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, time_limit_minutes: e.target.value ? parseInt(e.target.value) : null })}
                    min="1"
                    placeholder="No limit"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    value={testFormData.max_attempts || ''}
                    onChange={(e) => setTestFormData({ ...testFormData, max_attempts: e.target.value ? parseInt(e.target.value) : null })}
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={testFormData.instructions}
                  onChange={(e) => setTestFormData({ ...testFormData, instructions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="2"
                  placeholder="Special instructions for students..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowTestForm(false)
                    setEditingTest(null)
                    resetTestForm()
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTestMutation.isLoading || updateTestMutation.isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {editingTest ? 'Update Test' : 'Create Test'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Form */}
      <AnimatePresence>
        {showQuestionForm && selectedTest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6 bg-green-50 border border-green-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {editingQuestion ? 'Edit Question' : 'Add Questions'}
                </h4>
                {questionsLoading ? (
                  <p className="text-sm text-gray-600">Loading questions...</p>
                ) : (
                  <p className="text-sm text-gray-600">
                    {editingQuestion ? 'Edit the question below' : `${questions.length} questions added so far`}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowQuestionForm(false)
                  setSelectedTest(null)
                  setEditingQuestion(null)
                  resetQuestionForm()
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                {editingQuestion ? 'Cancel Edit' : '✓ Done Adding Questions'}
              </button>
            </div>
            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={questionFormData.question_text}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type
                  </label>
                  <select
                    value={questionFormData.question_type}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={questionFormData.points}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, points: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              {questionFormData.question_type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer Options * (Check the correct answer)
                  </label>
                  <div className="space-y-2">
                    {questionFormData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={option.is_correct}
                          onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={option.option_text}
                          onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                          placeholder={`Enter option ${index + 1} text here...`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                        {questionFormData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={createQuestionMutation.isLoading || updateQuestionMutation.isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {createQuestionMutation.isLoading || updateQuestionMutation.isLoading 
                    ? (editingQuestion ? 'Updating...' : 'Adding...') 
                    : (editingQuestion ? 'Update Question' : '+ Add This Question')
                  }
                </button>
              </div>
            </form>

            {/* List of Added Questions */}
            {questions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-green-300">
                <h5 className="text-md font-semibold text-gray-900 mb-3 flex items-center justify-between">
                  <span>Questions Added ({questions.length})</span>
                  <span className="text-sm text-gray-600 font-normal">Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}</span>
                </h5>
                {questionsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {questions.map((question, qIndex) => (
                      <div key={question.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-bold">
                              Q{qIndex + 1}
                            </span>
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                              {question.points} {question.points === 1 ? 'point' : 'points'}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs capitalize">
                              {question.question_type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                              title="Edit question"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id, question.question_text)}
                              disabled={deleteQuestionMutation.isLoading}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                              title="Delete question"
                            >
                              {deleteQuestionMutation.isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-800 font-medium mb-2">{question.question_text}</p>
                        {question.options && question.options.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {question.options.map((opt) => (
                              <div key={opt.id} className="text-sm flex items-center space-x-2">
                                {opt.is_correct ? (
                                  <span className="text-green-600 font-bold text-base">✓</span>
                                ) : (
                                  <span className="text-gray-400">○</span>
                                )}
                                <span className={opt.is_correct ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                                  {opt.option_text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TestManagement
