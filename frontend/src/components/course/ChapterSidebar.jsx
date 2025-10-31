import { useState } from 'react'
import { motion } from 'framer-motion'

const ChapterSidebar = ({ chapters = [], selectedChapterId, onChapterSelect, courseTitle, progressionData = null }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Filter out test chapters to ensure they don't appear in the chapter list
  const regularChapters = chapters.filter(chapter => 
    !chapter.test_id && 
    !chapter.test && 
    chapter.type !== 'test'
  )

  const getChapterContentType = (chapter) => {
    // Check for preview mode flags or actual URLs
    const hasVideo = chapter.video_url || chapter.has_video
    const hasPDF = chapter.pdf_url || chapter.has_pdf
    const hasTest = chapter.test_id || chapter.test || chapter.has_test
    
    if (hasTest) return 'test'
    if (hasVideo && hasPDF) return 'both'
    if (hasVideo) return 'video'
    if (hasPDF) return 'pdf'
    return 'none'
  }

  const getContentTypeIcon = (chapter) => {
    const contentType = getChapterContentType(chapter)
    switch (contentType) {
      case 'test':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
          </svg>
        )
      case 'pdf':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'both':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const getContentTypeColor = (chapter) => {
    const contentType = getChapterContentType(chapter)
    switch (contentType) {
      case 'test':
        return 'text-purple-600'
      case 'video':
        return 'text-red-600'
      case 'pdf':
        return 'text-blue-600'
      case 'both':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const getChapterStatus = (chapter) => {
    if (!progressionData?.chapters) {
      return { isAccessible: true, isCompleted: false }
    }
    
    const chapterProgress = progressionData.chapters.find(ch => ch.id === chapter.id)
    return {
      isAccessible: chapterProgress?.is_accessible || false,
      isCompleted: chapterProgress?.is_completed || false
    }
  }

  const formatDuration = (minutes) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-64'
    }`}>
      {/* Compact Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Course Content</h3>
              <p className="text-xs text-gray-600 truncate">{courseTitle}</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto">
        {regularChapters.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No chapters available</p>
          </div>
        ) : (
          <div className="p-1">
            {regularChapters.map((chapter, index) => {
              const { isAccessible, isCompleted } = getChapterStatus(chapter)
              
              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`mb-1 rounded-md transition-all duration-200 ${
                    selectedChapterId === chapter.id
                      ? 'bg-indigo-50 border-indigo-200'
                      : isAccessible
                        ? 'hover:bg-gray-50 border-transparent'
                        : 'opacity-50 cursor-not-allowed'
                  } border`}
                >
                  <button
                    onClick={() => isAccessible && onChapterSelect(chapter)}
                    disabled={!isAccessible}
                    className={`w-full p-2 text-left rounded-md transition-colors ${
                      selectedChapterId === chapter.id
                        ? 'text-indigo-900'
                        : isAccessible
                          ? 'text-gray-700 hover:text-gray-900'
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                  <div className="flex items-start space-x-2">
                    {/* Chapter Number */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      selectedChapterId === chapter.id
                        ? 'bg-indigo-600 text-white'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : isAccessible
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : chapter.chapter_order}
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 mb-0.5">
                          <h4 className="text-xs font-medium truncate">{chapter.title}</h4>
                          <span className={`${getContentTypeColor(chapter)}`}>
                            {getContentTypeIcon(chapter)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center space-x-1">
                            {chapter.test_id || chapter.test ? (
                              <span className="flex items-center space-x-0.5 text-purple-500">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Test</span>
                              </span>
                            ) : chapter.video_url && chapter.pdf_url ? (
                              <>
                                <span className="flex items-center space-x-0.5">
                                  <svg className="w-2.5 h-2.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                  <span>1 video</span>
                                </span>
                                <span>,</span>
                                <span className="flex items-center space-x-0.5">
                                  <svg className="w-2.5 h-2.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                  </svg>
                                  <span>1 PDF</span>
                                </span>
                              </>
                            ) : chapter.video_url ? (
                              <span className="flex items-center space-x-0.5">
                                <svg className="w-2.5 h-2.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                                <span>1 video</span>
                              </span>
                            ) : chapter.pdf_url ? (
                              <span className="flex items-center space-x-0.5">
                                <svg className="w-2.5 h-2.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                </svg>
                                <span>1 PDF</span>
                              </span>
                            ) : (
                              <span>No content</span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Compact Footer */}
      {!isCollapsed && (
        <div className="p-2 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            {regularChapters.length} chapter{regularChapters.length !== 1 ? 's' : ''} available
          </div>
        </div>
      )}
    </div>
  )
}

export default ChapterSidebar
