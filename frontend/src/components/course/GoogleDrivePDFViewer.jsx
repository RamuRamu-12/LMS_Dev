import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiExternalLink, FiFile, FiAlertCircle, FiLoader } from 'react-icons/fi'

const GoogleDrivePDFViewer = ({ 
  pdfUrl, 
  title = 'PDF Document', 
  className = '',
  showControls = true 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewerUrl, setViewerUrl] = useState(null)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided')
      setIsLoading(false)
      return
    }

    // Convert various Google Drive URLs to embeddable format
    const embeddableUrl = convertToEmbeddableUrl(pdfUrl)
    setViewerUrl(embeddableUrl)
    setIsLoading(false)
    
    // Set up fallback timer
    const fallbackTimer = setTimeout(() => {
      if (!useFallback) {
        console.log('Switching to Google Docs viewer fallback')
        setUseFallback(true)
        const fallbackUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`
        setViewerUrl(fallbackUrl)
      }
    }, 5000) // Try fallback after 5 seconds
    
    return () => clearTimeout(fallbackTimer)
  }, [pdfUrl])

  const convertToEmbeddableUrl = (url) => {
    try {
      console.log('Original URL:', url)
      
      // Handle different Google Drive URL formats
      let fileId = null
      
      // Format 1: https://drive.google.com/file/d/FILE_ID/view
      const match1 = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
      if (match1) {
        fileId = match1[1]
        console.log('Extracted fileId from format 1:', fileId)
      }
      
      // Format 2: https://drive.google.com/open?id=FILE_ID
      const match2 = url.match(/[?&]id=([a-zA-Z0-9-_]+)/)
      if (match2) {
        fileId = match2[1]
        console.log('Extracted fileId from format 2:', fileId)
      }
      
      // Format 3: https://docs.google.com/document/d/FILE_ID/edit
      const match3 = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)
      if (match3) {
        fileId = match3[1]
        console.log('Extracted fileId from format 3:', fileId)
      }

      if (fileId) {
        // Convert to Google Drive preview URL for embedding (works with public sharing)
        const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
        console.log('Generated embed URL:', embedUrl)
        return embedUrl
      }

      console.log('No fileId found, using Google Docs viewer')
      // For other URLs, try to use Google Docs viewer
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
    } catch (error) {
      console.error('Error converting URL:', error)
      return url
    }
  }

  const handleDownload = () => {
    // Convert to direct download URL for Google Drive
    const downloadUrl = convertToDownloadUrl(pdfUrl)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = title || 'document.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const convertToDownloadUrl = (url) => {
    try {
      // Extract file ID from various Google Drive URL formats
      let fileId = null
      
      const match1 = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
      if (match1) {
        fileId = match1[1]
      }
      
      const match2 = url.match(/[?&]id=([a-zA-Z0-9-_]+)/)
      if (match2) {
        fileId = match2[1]
      }
      
      if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`
      }
      
      return url
    } catch (error) {
      console.error('Error converting download URL:', error)
      return url
    }
  }

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Preparing PDF viewer...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Unable to load PDF</h3>
            <p className="text-sm text-red-600 mt-1">
              {error || 'PDF file is not accessible'}
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
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      {/* PDF Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiFile className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenInNewTab}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <FiExternalLink className="w-3 h-3 mr-1" />
                Open
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <FiDownload className="w-3 h-3 mr-1" />
                Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Google Drive PDF Embed */}
      <div className="relative w-full" style={{ height: '600px' }}>
        <iframe
          src={viewerUrl}
          title={title}
          className="w-full h-full border-0"
          frameBorder="0"
          allowFullScreen
          onLoad={() => {
            console.log('Iframe loaded successfully')
          }}
          onError={(e) => {
            console.error('Iframe load error:', e)
          }}
        />
        
        {/* Fallback message and controls */}
        <div className="absolute bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
          <p className="text-xs text-blue-800 mb-2">
            <strong>Note:</strong> If you see "You need access", make sure the Google Drive file is set to "Anyone with the link can view"
          </p>
          <button
            onClick={() => {
              console.log('Manual fallback triggered')
              setUseFallback(true)
              const fallbackUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`
              setViewerUrl(fallbackUrl)
            }}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Try Alternative Viewer
          </button>
        </div>
      </div>

      {/* PDF Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          PDF viewed through Google Drive • No CORS issues
        </p>
      </div>
    </motion.div>
  )
}

export default GoogleDrivePDFViewer
