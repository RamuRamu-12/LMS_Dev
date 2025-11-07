import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiExternalLink, FiFile, FiAlertCircle, FiLoader } from 'react-icons/fi'
import {
  normalizePdfSource,
  getDownloadUrl,
  getOpenInNewTabUrl,
  getProxyUrl,
  isAbsoluteUrl
} from '../../utils/pdfUrlUtils'

const PDFViewer = ({ 
  pdfUrl, 
  title = 'PDF Document', 
  className = '',
  showControls = true 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [proxyUrl, setProxyUrl] = useState(null)
  const [isExternal, setIsExternal] = useState(false)
  const [normalizedSource, setNormalizedSource] = useState(null)

  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided')
      setIsLoading(false)
      return
    }

    const normalized = normalizePdfSource(pdfUrl)
    setNormalizedSource(normalized)

    const absoluteUrl = normalized.previewUrl || normalized.originalUrl || pdfUrl
    const sameOrigin = absoluteUrl && absoluteUrl.startsWith(window.location.origin)
    const looksExternal = isAbsoluteUrl(absoluteUrl) && !sameOrigin

    setIsExternal(looksExternal)

    if (looksExternal) {
      const infoUrl = `/api/pdf/info?url=${encodeURIComponent(normalized.proxySourceUrl || absoluteUrl)}`
      fetch(infoUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('PDF not accessible')
          }
          setProxyUrl(getProxyUrl(normalized))
          setPdfLoaded(true)
          setIsLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setIsLoading(false)
        })
    } else {
      fetch(absoluteUrl, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            throw new Error('PDF not accessible')
          }
          setPdfLoaded(true)
          setIsLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setIsLoading(false)
        })
    }
  }, [pdfUrl])

  const handleDownload = () => {
    const normalized = normalizedSource || normalizePdfSource(pdfUrl)
    const downloadUrl = getDownloadUrl(normalized) || pdfUrl
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = title || 'document.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    const normalized = normalizedSource || normalizePdfSource(pdfUrl)
    const targetUrl = getOpenInNewTabUrl(normalized) || pdfUrl
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error || !pdfLoaded) {
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
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiFile className="w-5 h-5 text-red-500 mr-2" />
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
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                <FiDownload className="w-3 h-3 mr-1" />
                Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PDF Embed */}
      <div className="relative w-full" style={{ height: '600px' }}>
        <iframe
          src={`${proxyUrl || getOpenInNewTabUrl(normalizedSource) || pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          title={title}
          className="w-full h-full border-0"
          frameBorder="0"
        />
      </div>

      {/* PDF Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {isExternal ? 'PDF document loaded via proxy' : 'PDF document loaded from storage'}
        </p>
      </div>
    </motion.div>
  )
}

export default PDFViewer