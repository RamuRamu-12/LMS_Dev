import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { courseService } from '../../services/courseService'
import { chapterService } from '../../services/chapterService'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../common/LoadingSpinner'
import TestManagement from './TestManagement'

const EditCourse = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showChapterForm, setShowChapterForm] = useState(false)
  const [editingChapter, setEditingChapter] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
   const [chapterFormData, setChapterFormData] = useState({
     title: '',
     description: '',
     video_url: '',
     pdf_url: '',
     is_published: true
   })

  // Fetch course data
  const { data: courseData, isLoading, error } = useQuery(
    ['course', id],
    () => courseService.getCourseById(id),
    {
      enabled: !!id,
      refetchOnWindowFocus: false
    }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
   } = useForm({
     defaultValues: {
       title: '',
       description: '',
       category: 'other',
       difficulty: 'beginner',
       estimated_duration: 0,
       tags: [],
       learning_objectives: ['', '', ''],
       is_published: false
     }
   })

  const learningObjectives = watch('learning_objectives') || []

  // Handle logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check if file is an image
      if (file.type.startsWith('image/')) {
        setLogoFile(file)
        
        // Create preview URL
        const reader = new FileReader()
        reader.onload = (e) => {
          setLogoPreview(e.target.result)
        }
        reader.readAsDataURL(file)
        
        toast.success('Logo selected successfully!')
      } else {
        toast.error('Please select a valid image file (PNG, JPG, GIF, etc.)')
        setLogoFile(null)
        setLogoPreview(null)
      }
    }
  }

  // Populate form when course data is loaded
  useEffect(() => {
    if (courseData?.data?.course) {
      const course = courseData.data.course
       reset({
         title: course.title || '',
         description: course.description || '',
         category: course.category || 'other',
         difficulty: course.difficulty || 'beginner',
         estimated_duration: course.estimated_duration || 0,
         tags: course.tags || [],
         learning_objectives: course.learning_objectives?.length > 0 
           ? course.learning_objectives 
           : ['', '', ''],
         is_published: course.is_published || false
       })
    }
  }, [courseData, reset])

  // Add learning objective
  const addLearningObjective = () => {
    const currentObjectives = learningObjectives || []
    setValue('learning_objectives', [...currentObjectives, ''])
  }

  // Remove learning objective
  const removeLearningObjective = (index) => {
    const currentObjectives = learningObjectives || []
    const newObjectives = currentObjectives.filter((_, i) => i !== index)
    setValue('learning_objectives', newObjectives)
  }

  // Update course mutation
  const updateCourseMutation = useMutation(
    (courseData) => courseService.updateCourse(id, courseData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('admin-courses')
        queryClient.invalidateQueries(['course', id])
        toast.success('Course updated successfully!')
        navigate('/admin/courses')
      },
      onError: (error) => {
        toast.error(error.message)
      }
    }
  )

  // Chapter management functions
  const createChapterMutation = useMutation(
    (chapterData) => chapterService.createChapter(id, chapterData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course', id])
        setShowChapterForm(false)
         setChapterFormData({
           title: '',
           description: '',
           video_url: '',
           pdf_url: '',
           is_published: true
         })
        toast.success('Chapter created successfully!')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create chapter')
      }
    }
  )

  const updateChapterMutation = useMutation(
    ({ chapterId, chapterData }) => chapterService.updateChapter(id, chapterId, chapterData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course', id])
        setEditingChapter(null)
        setShowChapterForm(false)
        toast.success('Chapter updated successfully!')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update chapter')
      }
    }
  )

  const deleteChapterMutation = useMutation(
    (chapterId) => chapterService.deleteChapter(id, chapterId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course', id])
        toast.success('Chapter deleted successfully!')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete chapter')
      }
    }
  )

  // Chapter form handlers
  const handleChapterSubmit = (e) => {
    e.preventDefault()
    
    // Validate that at least one URL is provided
    if (!chapterFormData.video_url && !chapterFormData.pdf_url) {
      toast.error('Please provide either a video URL or PDF URL')
      return
    }

     const submitData = { ...chapterFormData }

    if (editingChapter) {
      updateChapterMutation.mutate({ chapterId: editingChapter.id, chapterData: submitData })
    } else {
      createChapterMutation.mutate(submitData)
    }
  }


  const deleteChapter = (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      deleteChapterMutation.mutate(chapterId)
    }
  }

  const openChapterForm = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter)
       setChapterFormData({
         title: chapter.title,
         description: chapter.description,
         video_url: chapter.video_url || '',
         pdf_url: chapter.pdf_url || '',
         is_published: chapter.is_published
       })
    } else {
      setEditingChapter(null)
         setChapterFormData({
           title: '',
           description: '',
           video_url: '',
           pdf_url: '',
           is_published: true
         })
    }
    setShowChapterForm(true)
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Filter out empty learning objectives and tags
      const filteredData = {
        ...data,
        learning_objectives: data.learning_objectives.filter(obj => obj && obj.trim() !== ''),
        tags: Array.isArray(data.tags) ? data.tags : []
      }
      
      await updateCourseMutation.mutateAsync(filteredData)

      // Handle logo upload if provided
      if (logoFile) {
        try {
          const formData = new FormData()
          formData.append('logo', logoFile)
          
          const logoResponse = await api.post(`/courses/${id}/logo`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          
          if (logoResponse.data) {
            // Update course with logo URL
            await api.put(`/courses/${id}`, {
              logo: logoResponse.data.data.logoUrl
            })
            
            toast.success('Course and logo updated successfully!')
          }
        } catch (logoError) {
          console.error('Logo upload error:', logoError)
          toast.error('Course updated but logo upload failed')
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    { value: 'programming', label: 'Programming' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'other', label: 'Other' }
  ]

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The course you're trying to edit doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/courses')}
            className="btn-primary"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Edit Course</h2>
          <p className="text-gray-600 mt-2">
            Update your course details and content.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="input w-full"
                  placeholder="Enter course title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="input w-full"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  {...register('difficulty')}
                  className="input w-full"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  {...register('estimated_duration', { min: 0 })}
                  className="input w-full"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="input w-full"
                placeholder="Describe what students will learn in this course"
              />
            </div>

            {/* Course Logo */}
            <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Logo
              </label>
              {courseData?.data?.course?.logo && !logoPreview && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/logo/${courseData.data.course.id}`}
                    alt="Current course logo"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Upload a new logo for your course (PNG, JPG, GIF, WebP, SVG, etc.)
              </p>
              
              {logoPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">New Logo Preview:</p>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                  />
                </div>
              )}
            </div>

           </div>

          {/* Learning Objectives */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Learning Objectives</h3>
              <button
                type="button"
                onClick={addLearningObjective}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                + Add Objective
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              What will students be able to do after completing this course?
            </p>
            
            <div className="space-y-3">
              {learningObjectives.map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    {...register(`learning_objectives.${index}`)}
                    className="input flex-1"
                    placeholder={`Learning objective ${index + 1}`}
                  />
                  {learningObjectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLearningObjective(index)}
                      className="text-red-600 hover:text-red-500 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add tags to help students find your course (comma-separated)
            </p>
            <input
              type="text"
              {...register('tags')}
              className="input w-full"
              placeholder="react, javascript, web development"
            />
          </div>

          {/* Publishing Options */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Options</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('is_published')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Publish this course immediately
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Unpublished courses are only visible to you and can be published later.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Course'}
            </button>
          </div>
        </form>

        {/* Chapter Management - Integrated into the form */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Course Chapters</h3>
              <p className="text-sm text-gray-600">
                Manage the content structure of "{courseData?.data?.course?.title || 'Course'}"
              </p>
            </div>
            <button
              type="button"
              onClick={() => openChapterForm()}
              className="btn-primary"
            >
              + Add Chapter
            </button>
          </div>

          {/* Chapters List */}
          <div className="space-y-3">
            {courseData?.data?.course?.chapters?.length > 0 ? (
              courseData.data.course.chapters
                .filter(chapter => chapter.title !== 'Final_Assignment' && !chapter.title.toLowerCase().includes('final assignment'))
                .map((chapter, index) => (
                <div key={chapter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {chapter.chapter_order}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{chapter.title}</h4>
                      <p className="text-xs text-gray-500">
                        {chapter.video_url && chapter.pdf_url ? 'Video + PDF' :
                         chapter.video_url ? 'Video' :
                         chapter.pdf_url ? 'PDF' : 'No Content'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => openChapterForm(chapter)}
                      className="text-indigo-600 hover:text-indigo-500 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChapter(chapter.id)}
                      className="text-red-600 hover:text-red-500 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No chapters added yet. Create your first chapter to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chapter Form Modal */}
        {showChapterForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowChapterForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleChapterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chapter Title *
                    </label>
                    <input
                      type="text"
                      value={chapterFormData.title}
                      onChange={(e) => setChapterFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input w-full"
                      placeholder="Enter chapter title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={chapterFormData.description}
                      onChange={(e) => setChapterFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input w-full"
                      rows={3}
                      placeholder="Describe what this chapter covers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video URL
                    </label>
                    <input
                      type="url"
                      value={chapterFormData.video_url}
                      onChange={(e) => setChapterFormData(prev => ({ ...prev, video_url: e.target.value }))}
                      className="input w-full"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Add a YouTube or Vimeo video URL for this chapter
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PDF URL
                    </label>
                    <input
                      type="url"
                      value={chapterFormData.pdf_url}
                      onChange={(e) => setChapterFormData(prev => ({ ...prev, pdf_url: e.target.value }))}
                      className="input w-full"
                      placeholder="https://drive.google.com/file/d/..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Add a Google Drive PDF URL for this chapter
                    </p>
                  </div>


                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={chapterFormData.is_published}
                      onChange={(e) => setChapterFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Publish this chapter immediately
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowChapterForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createChapterMutation.isLoading || updateChapterMutation.isLoading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createChapterMutation.isLoading || updateChapterMutation.isLoading 
                        ? 'Saving...' 
                        : (editingChapter ? 'Update Chapter' : 'Create Chapter')
                      }
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Test Management Section */}
      <div className="card p-6">
        <TestManagement 
          courseId={id} 
          courseTitle={courseData?.data?.course?.title || 'Course'} 
        />
      </div>
    </div>
  )
}

export default EditCourse
