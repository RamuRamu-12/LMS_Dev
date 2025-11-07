import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiExternalLink, FiFile, FiAlertCircle, FiLoader, FiRefreshCw, FiCheckCircle } from 'react-icons/fi'
import {
  normalizePdfSource,
  getDownloadUrl,
  getOpenInNewTabUrl,
  getProxyUrl
} from '../../utils/pdfUrlUtils'

const METHOD_METADATA = {
  iframe: { id: 'iframe', name: 'Direct Embed', description: 'Try to embed the PDF directly in the browser' },
  googledrive: { id: 'googledrive', name: 'Google Viewer', description: 'Use Google Drive / Docs viewer for better compatibility' },
  proxy: { id: 'proxy', name: 'Secure Proxy', description: 'Stream through LMS proxy to bypass CORS & Drive quirks' },
  external: { id: 'external', name: 'Open Externally', description: 'Let the user open or download using their browser' }
}

const DRIVE_METHOD_SEQUENCE = ['googledrive', 'proxy', 'external']
const DEFAULT_METHOD_SEQUENCE = ['iframe', 'googledrive', 'proxy', 'external']

const SmartPDFViewer = ({
  pdfUrl,
  title = 'PDF Document',
  className = '',
  showControls = true
}) => {
  const [normalizedSource, setNormalizedSource] = useState(null)
  const [methodSequence, setMethodSequence] = useState([])
  const [currentMethod, setCurrentMethod] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const retryTimerRef = useRef(null)

  const clearScheduledTimeout = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }

  const scheduleTimeout = (callback, delay) => {
    clearScheduledTimeout()
    const id = setTimeout(() => {
      retryTimerRef.current = null
      callback()
    }, delay)
    retryTimerRef.current = id
    return id
  }

  useEffect(() => {
    return () => {
      clearScheduledTimeout()
    }
  }, [])

  useEffect(() => {
    clearScheduledTimeout()

    if (!pdfUrl) {
      setNormalizedSource(null)
      setError('No PDF URL provided')
      setIsLoading(false)
      setSuccess(false)
      setMethodSequence([])
      setCurrentMethod(null)
      return
    }

    const normalized = normalizePdfSource(pdfUrl)
    const sequence = normalized.isGoogleDrive ? DRIVE_METHOD_SEQUENCE : DEFAULT_METHOD_SEQUENCE

    setNormalizedSource(normalized)
    setMethodSequence(sequence)
    setCurrentMethod(sequence[0] || null)
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    if (sequence.length > 0) {
      scheduleTimeout(() => {
        attemptMethod(0, normalized, sequence)
      }, 200)
    }
  }, [pdfUrl])

  const attemptMethod = (index, normalized, sequence) => {
    const info = normalized || normalizedSource
    const methods = sequence || methodSequence

    if (!info || !methods.length || index >= methods.length) {
      setError('All viewing strategies were blocked. Try downloading the PDF or adjust sharing permissions.')
      setIsLoading(false)
      setSuccess(false)
      return
    }

    const method = methods[index]
    setCurrentMethod(method)
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const onSuccess = () => {
      clearScheduledTimeout()
      setSuccess(true)
      setIsLoading(false)
    }

    const onFailure = () => {
      scheduleTimeout(() => {
        attemptMethod(index + 1, info, methods)
      }, 400)
    }

    if (method === 'iframe') {
      tryIframeMethod(info, onSuccess, onFailure)
    } else if (method === 'googledrive') {
      tryGoogleViewer(info, onSuccess, onFailure)
    } else if (method === 'proxy') {
      tryProxyMethod(info, onSuccess, onFailure)
    } else {
      tryExternalMethod(onSuccess)
    }
  }

  const tryIframeMethod = (info, onSuccess, onFailure) => {
    if (!info || !info.previewUrl || info.isGoogleDrive) {
      onFailure()
      return
    }

    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = `${info.previewUrl}#toolbar=1&navpanes=1&scrollbar=1`

    const cleanup = () => {
      if (iframe && document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    }

    iframe.onload = () => {
      clearScheduledTimeout()
      cleanup()
      onSuccess()
    }

    iframe.onerror = () => {
      clearScheduledTimeout()
      cleanup()
      onFailure()
    }

    document.body.appendChild(iframe)

    scheduleTimeout(() => {
      cleanup()
      onFailure()
    }, 5000)
  }

  const tryGoogleViewer = (info, onSuccess, onFailure) => {
    const viewerUrl = info?.isGoogleDrive ? info.previewUrl : info?.docsViewerUrl

    if (!viewerUrl) {
      onFailure()
      return
    }

    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = viewerUrl

    const cleanup = () => {
      if (iframe && document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    }

    iframe.onload = () => {
      clearScheduledTimeout()
      cleanup()
      onSuccess()
    }

    iframe.onerror = () => {
      clearScheduledTimeout()
      cleanup()
      onFailure()
    }

    document.body.appendChild(iframe)

    scheduleTimeout(() => {
      cleanup()
      onFailure()
    }, 4000)
  }

  const tryProxyMethod = async (info, onSuccess, onFailure) => {
    if (!info) {
      onFailure()
      return
    }

    try {
      const sourceUrl = info.proxySourceUrl || info.downloadUrl || info.originalUrl
      if (!sourceUrl) {
        throw new Error('Missing proxy source URL')
      }

      const response = await fetch(`/api/pdf/info?url=${encodeURIComponent(sourceUrl)}`)
      if (!response.ok) {
        throw new Error('Proxy info failed')
      }

      const payload = await response.json()
      if (payload?.success) {
        clearScheduledTimeout()
        onSuccess()
      } else {
        throw new Error('Proxy info rejected')
      }
    } catch (err) {
      onFailure()
    }
  }

  const tryExternalMethod = (onSuccess) => {
    onSuccess()
  }

  const handleRetry = () => {
    const refreshed = normalizedSource || normalizePdfSource(pdfUrl)
    const sequence = (normalizedSource && methodSequence.length)
      ? methodSequence
      : (refreshed.isGoogleDrive ? DRIVE_METHOD_SEQUENCE : DEFAULT_METHOD_SEQUENCE)

    setNormalizedSource(refreshed)
    setMethodSequence(sequence)
    setCurrentMethod(sequence[0] || null)
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    scheduleTimeout(() => {
      attemptMethod(0, refreshed, sequence)
    }, 150)
  }

  const handleDownload = () => {
    const normalized = normalizedSource || normalizePdfSource(pdfUrl)
    const downloadUrl = getDownloadUrl(normalized)

    const link = document.createElement('a')
    link.href = downloadUrl || pdfUrl
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

  const renderContent = () => {
    if (isLoading) {
      const meta = METHOD_METADATA[currentMethod]
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <FiLoader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Trying {meta?.name || 'next best method'}...</p>
            <p className="text-xs text-gray-500 mt-1">{meta?.description}</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full bg-red-50">
          <div className="text-center">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Unable to display PDF</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              <button
                onClick={handleOpenInNewTab}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                <FiExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )
    }

    const info = normalizedSource || normalizePdfSource(pdfUrl)

    if (currentMethod === 'iframe' && success) {
      return (
        <iframe
          src={`${info?.previewUrl || pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          title={title}
          className="w-full h-full border-0"
          frameBorder="0"
        />
      )
    }

    if (currentMethod === 'googledrive' && success) {
      const viewerUrl = info?.isGoogleDrive ? info.previewUrl : info?.docsViewerUrl
      return (
        <div className="w-full h-full">
          <iframe
            src={viewerUrl || info?.previewUrl || pdfUrl}
            title={title}
            className="w-full h-full border-0"
            frameBorder="0"
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      )
    }

    if (currentMethod === 'proxy' && success) {
      const proxyUrl = getProxyUrl(info)
      return (
        <iframe
          src={proxyUrl}
          title={title}
          className="w-full h-full border-0"
          frameBorder="0"
        />
      )
    }

    if (currentMethod === 'external') {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiFile className="w-10 h-10 text-blue-500" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">PDF Ready to View</h4>
            <p className="text-sm text-gray-600 mb-6 max-w-md">
              Choose how you would like to open this document.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
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

    return null
  }

  const activeMeta = METHOD_METADATA[currentMethod]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiFile className="w-5 h-5 text-indigo-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {success && (
              <div className="ml-2 flex items-center text-green-600">
                <FiCheckCircle className="w-4 h-4 mr-1" />
                <span className="text-xs">Working</span>
              </div>
            )}
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

      <div className="relative w-full" style={{ height: 'calc(100vh - 200px)' }}>
        {renderContent()}
      </div>

      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Smart PDF Viewer • Method: {activeMeta?.name || '—'}
        </p>
      </div>
    </motion.div>
  )
}

export default SmartPDFViewer
