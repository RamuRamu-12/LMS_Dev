import { useState } from 'react'
import { motion } from 'framer-motion'
import VideoPlayer from './VideoPlayer'
import UniversalPDFViewer from './UniversalPDFViewer'
import { analyzeUrl, getUrlTypeDisplayName, supportsEmbedding } from '../../utils/urlAnalyzer'
import { FiExternalLink, FiFile, FiYoutube, FiPlay, FiAlertCircle } from 'react-icons/fi'

const ContentViewer = ({ 
  content, 
  title = 'Course Content',
  className = '' 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [urlAnalysis, setUrlAnalysis] = useState(null)

  // Add error boundary for this component
  if (!content) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
        <p className="text-gray-600">This course doesn't have any introduction content yet.</p>
      </div>
    )
  }

  // Analyze URL if it's a video or external URL
  const analyzeContent = () => {
    if (!content?.url) return

    setIsAnalyzing(true)
    const analysis = analyzeUrl(content.url)
    setUrlAnalysis(analysis)
    setIsAnalyzing(false)
  }

  // Determine content type and render appropriate component
  const renderContent = () => {
    if (!content) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
          <p className="text-gray-600">This course doesn't have any introduction content yet.</p>
        </div>
      )
    }

    // Handle PDF content
    if (content.type === 'pdf' && content.file_url) {
      return (
        <UniversalPDFViewer
          pdfUrl={content.file_url}
          title={title}
          className={className}
        />
      )
    }

    // Handle video content
    if (content.type === 'video' && content.url) {
      return (
        <VideoPlayer
          url={content.url}
          title={title}
          className={className}
        />
      )
    }

    // Handle external URL content
    if (content.type === 'url' && content.url) {
      // If we have URL analysis data, use it
      if (content.url_analysis) {
        return (
          <VideoPlayer
            url={content.url}
            title={title}
            className={className}
          />
        )
      }

      // Otherwise, analyze the URL
      if (!urlAnalysis && !isAnalyzing) {
        analyzeContent()
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing content...</p>
          </div>
        )
      }

      if (isAnalyzing) {
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing URL...</p>
          </div>
        )
      }

      if (urlAnalysis && urlAnalysis.isValid) {
        return (
          <VideoPlayer
            url={content.url}
            title={title}
            className={className}
          />
        )
      }

      // Fallback for invalid URLs
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Invalid Content URL</h3>
              <p className="text-sm text-red-600 mt-1">
                The provided URL is not accessible or valid.
              </p>
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-sm text-red-700 hover:text-red-800"
              >
                <FiExternalLink className="w-4 h-4 mr-1" />
                Try opening in new tab
              </a>
            </div>
          </div>
        </div>
      )
    }

    // Fallback for unknown content types
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center">
          <FiFile className="w-5 h-5 text-gray-500 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-gray-800">Unsupported Content Type</h3>
            <p className="text-sm text-gray-600 mt-1">
              This content type is not supported yet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {renderContent()}
    </motion.div>
  )
}

export default ContentViewer
