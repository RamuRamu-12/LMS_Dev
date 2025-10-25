import { useState } from 'react'
import { motion } from 'framer-motion'
import UniversalPDFViewer from './UniversalPDFViewer'
import VideoPlayer from './VideoPlayer'

const ChapterContentViewer = ({ chapter }) => {
  const [isLoading, setIsLoading] = useState(false)

  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 font-medium">No content selected</p>
          <p className="text-gray-500 text-sm">Choose a chapter from the sidebar to view its content</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    // Check if chapter has video URL
    if (chapter.video_url) {
      return (
        <VideoPlayer
          videoUrl={chapter.video_url}
          title={chapter.title}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      )
    }
    
    // Check if chapter has PDF URL
    if (chapter.pdf_url) {
      return (
        <UniversalPDFViewer
          pdfUrl={chapter.pdf_url}
          title={chapter.title}
        />
      )
    }
    
    // No content available
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 font-medium">No content available</p>
          <p className="text-gray-500 text-sm">This chapter has no video or PDF content</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Chapter Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{chapter.title}</h2>
            {chapter.description && (
              <p className="text-gray-600 mb-4">{chapter.description}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {chapter.duration_minutes ? `${chapter.duration_minutes} minutes` : 'Duration not specified'}
              </div>
              
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  chapter.video_url 
                    ? 'bg-red-100 text-red-800'
                    : chapter.pdf_url
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {chapter.video_url ? 'VIDEO' : 
                   chapter.pdf_url ? 'PDF' : 'NONE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading content...</p>
            </div>
          </div>
        )}
        
        {renderContent()}
      </div>
    </motion.div>
  )
}

export default ChapterContentViewer
