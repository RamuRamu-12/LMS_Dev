import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiExternalLink, FiFile, FiAlertCircle, FiLoader, FiRefreshCw } from 'react-icons/fi'
import { analyzeUrl, getUrlTypeDisplayName, supportsEmbedding } from '../../utils/urlAnalyzer'
import GoogleDrivePDFViewer from './GoogleDrivePDFViewer'
import ExternalPDFViewer from './ExternalPDFViewer'
import VideoPlayer from './VideoPlayer'

const UniversalPDFViewer = ({ 
  pdfUrl, 
  title = 'PDF Document', 
  className = '',
  showControls = true 
}) => {
  const [viewMethod, setViewMethod] = useState('auto')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [urlAnalysis, setUrlAnalysis] = useState(null)

  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided')
      setIsLoading(false)
      return
    }

    detectBestMethod()
  }, [pdfUrl])

  const detectBestMethod = () => {
    setIsLoading(true)
    setError(null)

    // First analyze the URL to understand its type
    const analysis = analyzeUrl(pdfUrl)
    setUrlAnalysis(analysis)

    if (!analysis.isValid) {
      setError(analysis.error || 'Invalid URL')
      setIsLoading(false)
      return
    }

    // Check if it's a Google Drive URL
    if (analysis.type === 'google_drive') {
      setViewMethod('googledrive')
      setIsLoading(false)
      return
    }

    // Check if it's a Google Colab URL
    if (analysis.type === 'google_colab') {
      setViewMethod('colab')
      setIsLoading(false)
      return
    }

    // Check if it's a video URL (YouTube, Vimeo, etc.)
    if (analysis.type === 'youtube' || analysis.type === 'vimeo') {
      setViewMethod('video')
      setIsLoading(false)
      return
    }

    // For external URLs, try iframe first (might work with some PDFs)
    if (isExternalUrl(pdfUrl)) {
      setViewMethod('iframe')
      setIsLoading(false)
      return
    }

    // For internal URLs, try iframe
    setViewMethod('iframe')
    setIsLoading(false)
  }

  const isGoogleDriveUrl = (url) => {
    return url.includes('drive.google.com') || url.includes('docs.google.com')
  }

  const isExternalUrl = (url) => {
    return !url.startsWith(window.location.origin) && 
           !url.startsWith('/') && 
           (url.startsWith('http://') || url.startsWith('https://'))
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    detectBestMethod()
  }

  const handleMethodChange = (method) => {
    setViewMethod(method)
    setError(null)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = title || 'document.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Detecting best viewing method...</p>
        </div>
      </div>
    )
  }

  const renderViewer = () => {
    switch (viewMethod) {
      case 'googledrive':
        return (
          <GoogleDrivePDFViewer
            pdfUrl={pdfUrl}
            title={title}
            className="h-full"
            showControls={showControls}
          />
        )
      
      case 'colab':
        return (
          <VideoPlayer
            url={pdfUrl}
            title={title}
            className="h-full"
            showControls={showControls}
          />
        )
      
      case 'video':
        return (
          <VideoPlayer
            url={pdfUrl}
            title={title}
            className="h-full"
            showControls={showControls}
          />
        )
      
      case 'external':
        return (
          <ExternalPDFViewer
            pdfUrl={pdfUrl}
            title={title}
            className="h-full"
            showControls={showControls}
          />
        )
      
       case 'iframe':
         return (
           <div className="h-full flex flex-col">
             {/* Method Selector */}
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 border-b border-blue-200">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                   <span className="text-xs text-gray-600">Viewing method:</span>
                   <select
                     value={viewMethod}
                     onChange={(e) => handleMethodChange(e.target.value)}
                     className="text-xs border border-gray-300 rounded px-2 py-1"
                   >
                     <option value="iframe">Direct Embed (Trying...)</option>
                     <option value="googledrive">Google Drive Viewer</option>
                     <option value="colab">Google Colab Notebook</option>
                     <option value="video">Video Player</option>
                     <option value="external">External Viewer</option>
                   </select>
                 </div>
                 <div className="flex items-center space-x-2">
                   <button
                     onClick={() => handleMethodChange('googledrive')}
                     className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                   >
                     <FiRefreshCw className="w-3 h-3 mr-1" />
                     Try Google Drive
                   </button>
                   <button
                     onClick={handleRetry}
                     className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center"
                   >
                     <FiRefreshCw className="w-3 h-3 mr-1" />
                     Retry
                   </button>
                 </div>
               </div>
             </div>

             {/* Iframe Viewer with Error Handling */}
             <div className="flex-1 relative">
               <iframe
                 src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                 title={title}
                 className="w-full h-full border-0"
                 frameBorder="0"
                 onLoad={() => {
                   // If iframe loads successfully, clear any previous errors
                   setError(null)
                 }}
                 onError={() => {
                   setError('CORS Error: Cannot embed external PDF directly')
                   // Auto-fallback to Google Drive viewer after 3 seconds
                   setTimeout(() => {
                     if (viewMethod === 'iframe') {
                       handleMethodChange('googledrive')
                     }
                   }, 3000)
                 }}
               />
               
               {/* Loading overlay */}
               <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                 <div className="text-center">
                   <FiLoader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                   <p className="text-sm text-gray-600">Loading PDF...</p>
                   <p className="text-xs text-gray-500 mt-1">
                     If this fails, we'll try Google Drive viewer automatically
                   </p>
                 </div>
               </div>
             </div>
           </div>
         )
      
      default:
        return (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to display PDF</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please try a different viewing method or download the PDF.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                >
                  <FiExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      {renderViewer()}
    </motion.div>
  )
}

export default UniversalPDFViewer
