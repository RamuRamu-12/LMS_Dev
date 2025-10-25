import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { analyzeUrl, getUrlTypeDisplayName, supportsEmbedding } from '../../utils/urlAnalyzer'
import { FiPlay, FiExternalLink, FiDownload, FiAlertCircle } from 'react-icons/fi'

const VideoPlayer = ({ 
  url, 
  title = 'Video Content', 
  className = '',
  showControls = true,
  autoplay = false 
}) => {
  const [urlAnalysis, setUrlAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url) {
      setError('No URL provided')
      setIsLoading(false)
      return
    }

    const analysis = analyzeUrl(url)
    setUrlAnalysis(analysis)
    setIsLoading(false)

    if (!analysis.isValid) {
      setError(analysis.error || 'Invalid URL')
    }
  }, [url])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading video...</p>
        </div>
      </div>
    )
  }

  if (error || !urlAnalysis?.isValid) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Unable to load video</h3>
            <p className="text-sm text-red-600 mt-1">
              {error || urlAnalysis?.error || 'Invalid video URL'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderVideoContent = () => {
    if (supportsEmbedding(urlAnalysis.type)) {
      return (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          {urlAnalysis.type === 'google_colab' ? (
            // Special handling for Google Colab notebooks
            <iframe
              src={urlAnalysis.embedUrl}
              title={title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          ) : (
            // Standard iframe for other embeddable content
            <iframe
              src={urlAnalysis.embedUrl}
              title={title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      )
    }

    // For non-embeddable content, show a preview card
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiPlay className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {getUrlTypeDisplayName(urlAnalysis.type)} content
          </p>
        </div>
        
        <div className="space-y-2">
          <a
            href={urlAnalysis.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <FiExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </a>
          
          {urlAnalysis.type === 'dropbox' && (
            <button
              onClick={() => window.open(urlAnalysis.originalUrl, '_blank')}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 ml-2"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Download
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {renderVideoContent()}
    </div>
  )
}

export default VideoPlayer