import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiExternalLink, FiFile, FiAlertCircle, FiLoader, FiEye } from 'react-icons/fi'

const ExternalPDFViewer = ({ 
  pdfUrl, 
  title = 'PDF Document', 
  className = '',
  showControls = true 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pdfInfo, setPdfInfo] = useState(null)

  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided')
      setIsLoading(false)
      return
    }

    // Check if PDF is accessible
    checkPDFAccessibility()
  }, [pdfUrl])

  const checkPDFAccessibility = async () => {
    try {
      setIsLoading(true)
      
      // Try to get PDF info from our backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/pdf/info?url=${encodeURIComponent(pdfUrl)}`)
      
      if (response.ok) {
        const data = await response.json()
        setPdfInfo(data.data)
        setIsLoading(false)
      } else {
        throw new Error('PDF not accessible')
      }
    } catch (err) {
      console.warn('PDF accessibility check failed:', err)
      // Still allow user to try opening the PDF
      setPdfInfo({ url: pdfUrl, accessible: false })
      setIsLoading(false)
    }
  }

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer')
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

  const handleOpenWithProxy = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const proxyUrl = `${apiUrl}/api/pdf/proxy?url=${encodeURIComponent(pdfUrl)}`
    window.open(proxyUrl, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Checking PDF accessibility...</p>
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
      <div className="bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 border-b border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiFile className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              {pdfInfo && (
                <p className="text-xs text-gray-600">
                  {pdfInfo.size && `Size: ${pdfInfo.size}`}
                  {pdfInfo.accessible === false && ' • May require external access'}
                </p>
              )}
            </div>
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
                onClick={handleOpenWithProxy}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                <FiEye className="w-3 h-3 mr-1" />
                View
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                <FiDownload className="w-3 h-3 mr-1" />
                Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview Area */}
      <div className="relative w-full bg-gray-50" style={{ height: '400px' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFile className="w-10 h-10 text-red-500" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">External PDF Document</h4>
            <p className="text-sm text-gray-600 mb-4 max-w-md">
              This PDF is hosted externally and cannot be embedded due to CORS restrictions. 
              Click the buttons above to view or download the document.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={handleOpenInNewTab}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <FiExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          External PDF document • Click buttons above to access
        </p>
      </div>
    </motion.div>
  )
}

export default ExternalPDFViewer
