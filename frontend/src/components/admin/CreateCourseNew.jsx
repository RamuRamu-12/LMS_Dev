import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { courseService } from '../../services/courseService'
import { api } from '../../services/api'
import { analyzeUrl, getUrlTypeDisplayName, supportsEmbedding } from '../../utils/urlAnalyzer'
import toast from 'react-hot-toast'
import ChapterManagement from './ChapterManagement'
import { FiCheck, FiAlertCircle, FiExternalLink, FiYoutube, FiFile, FiPlus, FiTrash2 } from 'react-icons/fi'
import Header from '../common/Header'

const CreateCourseNew = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCourseId, setCreatedCourseId] = useState(null)
  const [chapters, setChapters] = useState([])
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control
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

  // Create course mutation
  const createCourseMutation = useMutation(courseService.createCourse, {
    onSuccess: (data) => {
      setCreatedCourseId(data.data.course.id)
      toast.success('Course created successfully!')
      queryClient.invalidateQueries('courses')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create course')
    }
  })

  // Add learning objective
  const addLearningObjective = () => {
    const currentObjectives = watch('learning_objectives') || []
    setValue('learning_objectives', [...currentObjectives, ''])
  }

  // Remove learning objective
  const removeLearningObjective = (index) => {
    const currentObjectives = watch('learning_objectives') || []
    const newObjectives = currentObjectives.filter((_, i) => i !== index)
    setValue('learning_objectives', newObjectives)
  }

  // Add chapter
  const addChapter = () => {
    const newChapter = {
      id: Date.now(), // Temporary ID for frontend
      title: '',
      description: '',
      video_url: '',
      pdf_url: '',
      chapter_order: chapters.length + 1,
      duration_minutes: 0,
      is_published: true
    }
    setChapters([...chapters, newChapter])
  }

  // Update chapter
  const updateChapter = useCallback((index, updatedChapter) => {
    setChapters(prevChapters => {
      const newChapters = [...prevChapters]
      newChapters[index] = { ...newChapters[index], ...updatedChapter }
      return newChapters
    })
  }, [])

  // Remove chapter
  const removeChapter = useCallback((index) => {
    setChapters(prevChapters => {
      const newChapters = prevChapters.filter((_, i) => i !== index)
      // Reorder chapters
      const reorderedChapters = newChapters.map((chapter, i) => ({
        ...chapter,
        chapter_order: i + 1
      }))
      return reorderedChapters
    })
  }, [])

  // Form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const filteredData = {
        ...data,
        learning_objectives: data.learning_objectives.filter(obj => obj && obj.trim() !== ''),
        tags: Array.isArray(data.tags) ? data.tags : []
      }

      const courseResponse = await createCourseMutation.mutateAsync(filteredData)
      const courseId = courseResponse.data.course.id

      // Handle logo upload if provided
      if (logoFile) {
        try {
          const formData = new FormData()
          formData.append('logo', logoFile)
          
          console.log('Uploading logo for course:', courseId)
          
          const logoResponse = await api.post(`/courses/${courseId}/logo`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          
          console.log('Logo upload response status:', logoResponse.status)
          
          if (logoResponse.data) {
            const logoData = logoResponse.data
            console.log('Logo upload response:', logoData)
            
            // Update course with logo URL
            const updateResponse = await api.put(`/courses/${courseId}`, {
              logo: logoData.data.logoUrl
            })
            
            if (updateResponse.data) {
              toast.success('Course and logo uploaded successfully!')
            } else {
              console.error('Failed to update course with logo URL')
              toast.error('Course created but failed to update logo URL')
            }
          } else {
            console.error('Logo upload error response:', logoResponse)
            throw new Error('Logo upload failed')
          }
        } catch (logoError) {
          console.error('Logo upload error:', logoError)
          toast.error(`Course created but logo upload failed: ${logoError.message}`)
        }
      }

      // Create chapters
      if (chapters.length > 0) {
        for (const chapter of chapters) {
          if (chapter.title.trim()) {
            // Create chapter with URL-based content
            const chapterData = {
              title: chapter.title,
              description: chapter.description,
              video_url: chapter.video_url || null,
              pdf_url: chapter.pdf_url || null,
              chapter_order: chapter.chapter_order,
              duration_minutes: chapter.duration_minutes,
              is_published: chapter.is_published
            }
            
            await courseService.createChapter(courseId, chapterData)
          }
        }
      }

      toast.success('Course and chapters created successfully!')
      navigate('/admin/courses')
    } catch (error) {
      console.error('Course creation error:', error)
      toast.error('Failed to create course')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
            <p className="text-gray-600">Build and publish your course content</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card 1: Basic Information */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                
                <div className="space-y-6">
                  {/* Course Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: 'Course title is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter course title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe what students will learn in this course"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Course Logo */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Upload a logo for your course (PNG, JPG, GIF, WebP, SVG, etc.)
                    </p>
                    
                    {logoPreview && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2 font-medium">Preview:</p>
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Course Settings */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Settings</h2>
                
                <div className="space-y-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="programming">Programming</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                      <option value="marketing">Marketing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      {...register('difficulty')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration (hours)
                    </label>
                    <input
                      type="number"
                      {...register('estimated_duration', { min: 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  {/* Publish */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('is_published')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Publish course immediately
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 3: Learning Objectives */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Objectives</h2>
                <p className="text-sm text-gray-600 mb-4">
                  What will students be able to do after completing this course?
                </p>
                
                <div className="space-y-4">
                  {learningObjectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register(`learning_objectives.${index}`)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder={`Learning objective ${index + 1}`}
                        />
                      </div>
                      {learningObjectives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLearningObjective(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addLearningObjective}
                    className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Objective</span>
                  </button>
                </div>
              </div>

              {/* Card 4: Tags */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tags</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Add tags to help students find your course
                </p>
                
                <div className="space-y-3">
                  {['React', 'Javascript', 'Web-Development', 'Node.js', 'Python', 'Data Science'].map((tag) => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        value={tag}
                        {...register('tags')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Card 5: Add Chapters */}
              <div className="card p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Add Chapters</h2>
                  <button
                    type="button"
                    onClick={addChapter}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Chapter</span>
                  </button>
                </div>
                
                {chapters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiFile className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No chapters added yet. Click "Add Chapter" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chapters.map((chapter, index) => (
                      <ChapterCard
                        key={chapter.id}
                        chapter={chapter}
                        index={index}
                        onUpdate={updateChapter}
                        onRemove={removeChapter}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Card 6: Course Preview */}
              <div className="card p-6 lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Preview</h2>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {watch('title') || 'Course Title'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {watch('description') || 'Course description will appear here'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {watch('difficulty') || 'beginner'}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {watch('category') || 'other'}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {watch('estimated_duration') || 0} hours
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} • {learningObjectives.filter(obj => obj && obj.trim()).length} learning objective{learningObjectives.filter(obj => obj && obj.trim()).length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/courses')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

// Chapter Card Component
const ChapterCard = ({ chapter, index, onUpdate, onRemove }) => {
  const [videoUrl, setVideoUrl] = useState(chapter.video_url || '')
  const [pdfUrl, setPdfUrl] = useState(chapter.pdf_url || '')
  const [title, setTitle] = useState(chapter.title || '')
  const [description, setDescription] = useState(chapter.description || '')
  const [videoAnalysis, setVideoAnalysis] = useState(null)
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false)
  const onUpdateRef = useRef(onUpdate)
  
  // Update the ref when onUpdate changes
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  // Analyze video URL when it changes
  useEffect(() => {
    if (videoUrl) {
      setIsAnalyzingVideo(true)
      try {
        const analysis = analyzeUrl(videoUrl)
        setVideoAnalysis(analysis)
      } catch (error) {
        setVideoAnalysis(null)
      } finally {
        setIsAnalyzingVideo(false)
      }
    } else {
      setVideoAnalysis(null)
    }
  }, [videoUrl])

  // Update parent when chapter data changes (with debouncing to prevent infinite loops)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdateRef.current(index, {
        title,
        description,
        video_url: videoUrl,
        pdf_url: pdfUrl,
        video_analysis: videoAnalysis
      })
    }, 100) // 100ms debounce

    return () => clearTimeout(timeoutId)
  }, [title, description, videoUrl, pdfUrl, videoAnalysis, index])

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Chapter {index + 1}</h3>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Chapter Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chapter Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter chapter title"
          />
        </div>

        {/* Chapter Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter chapter description"
          />
        </div>

        {/* Video URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video URL (YouTube/Google Drive Video)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://youtube.com/watch?v=... or https://drive.google.com/file/..."
          />
          
          {/* Video URL Analysis */}
          {isAnalyzingVideo && (
            <p className="mt-1 text-sm text-blue-600">Analyzing video URL...</p>
          )}
          
          {videoAnalysis && videoAnalysis.isValid && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiCheck className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-800">
                  {getUrlTypeDisplayName(videoAnalysis.type)}
                </span>
              </div>
              {videoAnalysis.thumbnail && (
                <img
                  src={videoAnalysis.thumbnail}
                  alt="Video Preview"
                  className="mt-2 w-16 h-12 object-cover rounded"
                />
              )}
            </div>
          )}
          
          {videoAnalysis && !videoAnalysis.isValid && (
            <p className="mt-1 text-sm text-red-600">
              Invalid video URL format
            </p>
          )}
        </div>

        {/* PDF URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PDF URL (Google Drive PDF)
          </label>
          <input
            type="url"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://drive.google.com/file/..."
          />
          
          {pdfUrl && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiFile className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-800">
                  PDF URL added
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateCourseNew
