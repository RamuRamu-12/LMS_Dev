import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiExternalLink, FiFile, FiAlertCircle, FiLoader, FiRefreshCw, FiCheckCircle } from 'react-icons/fi'

const SmartPDFViewer = ({ 
  pdfUrl, 
  title = 'PDF Document', 
  className = '',
  showControls = true 
}) => {
  const [currentMethod, setCurrentMethod] = useState('iframe')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)

  const methods = [
    { id: 'iframe', name: 'Direct Embed', description: 'Try to embed PDF directly' },
    { id: 'googledrive', name: 'Google Drive', description: 'Use Google Drive viewer' },
    { id: 'proxy', name: 'Proxy Server', description: 'Use backend proxy to avoid CORS' },
    { id: 'external', name: 'External View', description: 'Open in new tab with options' }
  ]

  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided')
      setIsLoading(false)
      return
    }

    tryNextMethod()
  }, [pdfUrl])

  const tryNextMethod = () => {
    if (attemptCount >= methods.length) {
      setError('All viewing methods failed. Please try downloading the PDF.')
      setIsLoading(false)
      return
    }

    const method = methods[attemptCount]
    setCurrentMethod(method.id)
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    // Simulate trying the method
    setTimeout(() => {
      if (method.id === 'iframe') {
        tryIframeMethod()
      } else if (method.id === 'googledrive') {
        tryGoogleDriveMethod()
      } else if (method.id === 'proxy') {
        tryProxyMethod()
      } else {
        tryExternalMethod()
      }
    }, 1000)
  }

  const tryIframeMethod = () => {
    // Check if iframe can load the PDF
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = `${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`
    
    iframe.onload = () => {
      setSuccess(true)
      setIsLoading(false)
      document.body.removeChild(iframe)
    }
    
    iframe.onerror = () => {
      document.body.removeChild(iframe)
      setAttemptCount(prev => prev + 1)
      setTimeout(tryNextMethod, 500)
    }
    
    document.body.appendChild(iframe)
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
        setAttemptCount(prev => prev + 1)
        setTimeout(tryNextMethod, 500)
      }
    }, 5000)
  }

  const tryGoogleDriveMethod = () => {
    // Convert URL to Google Drive format
    const googleDriveUrl = convertToGoogleDriveUrl(pdfUrl)
    if (googleDriveUrl && googleDriveUrl.includes('drive.google.com')) {
      // Test if Google Drive URL is accessible
      const testIframe = document.createElement('iframe')
      testIframe.style.display = 'none'
      testIframe.src = googleDriveUrl
      
      testIframe.onload = () => {
        setSuccess(true)
        setIsLoading(false)
        document.body.removeChild(testIframe)
      }
      
      testIframe.onerror = () => {
        document.body.removeChild(testIframe)
        setAttemptCount(prev => prev + 1)
        setTimeout(tryNextMethod, 500)
      }
      
      document.body.appendChild(testIframe)
      
      // Timeout after 3 seconds
      setTimeout(() => {
        if (document.body.contains(testIframe)) {
          document.body.removeChild(testIframe)
          setAttemptCount(prev => prev + 1)
          setTimeout(tryNextMethod, 500)
        }
      }, 3000)
    } else {
      setAttemptCount(prev => prev + 1)
      setTimeout(tryNextMethod, 500)
    }
  }

  const tryProxyMethod = () => {
    // Try using backend proxy
    const proxyUrl = `/api/pdf/proxy?url=${encodeURIComponent(pdfUrl)}`
    fetch(proxyUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          setSuccess(true)
          setIsLoading(false)
        } else {
          throw new Error('Proxy failed')
        }
      })
      .catch(() => {
        setAttemptCount(prev => prev + 1)
        setTimeout(tryNextMethod, 500)
      })
  }

  const tryExternalMethod = () => {
    // External method always works (just shows options)
    setSuccess(true)
    setIsLoading(false)
  }

  const convertToGoogleDriveUrl = (url) => {
    try {
      // Try to convert various URLs to Google Drive embeddable format
      let fileId = null
      
      // Handle different Google Drive URL formats
      const match1 = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
      const match2 = url.match(/[?&]id=([a-zA-Z0-9-_]+)/)
      const match3 = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)
      
      if (match1) fileId = match1[1]
      else if (match2) fileId = match2[1]
      else if (match3) fileId = match3[1]
      
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`
      }
      
      // For other URLs, try Google Docs viewer
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
    } catch (error) {
      return null
    }
  }

  const handleRetry = () => {
    setAttemptCount(0)
    setError(null)
    setSuccess(false)
    tryNextMethod()
  }

  const handleMethodChange = (methodId) => {
    const methodIndex = methods.findIndex(m => m.id === methodId)
    setAttemptCount(methodIndex)
    tryNextMethod()
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <FiLoader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Trying {methods[attemptCount]?.name}...</p>
            <p className="text-xs text-gray-500 mt-1">
              {methods[attemptCount]?.description}
            </p>
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

    if (currentMethod === 'iframe' && success) {
      return (
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          title={title}
          className="w-full h-full border-0"
          frameBorder="0"
        />
      )
    }

    if (currentMethod === 'googledrive' && success) {
      const googleDriveUrl = convertToGoogleDriveUrl(pdfUrl)
      return (
        <div className="w-full h-full">
          <iframe
            src={googleDriveUrl}
            title={title}
            className="w-full h-full border-0"
            frameBorder="0"
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onLoad={(e) => {
              // Check if loaded content shows permission error
              const iframe = e.target
              try {
                // If we can access the iframe content, check for permission errors
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
                if (iframeDoc) {
                  const bodyText = iframeDoc.body?.innerText || ''
                  if (bodyText.includes('You need access') || bodyText.includes('permission')) {
                    setError('This file requires permission to view. Please download or open in new tab.')
                    setSuccess(false)
                    setCurrentMethod('external')
                  }
                }
              } catch (err) {
                // Cross-origin error is expected for Google Drive
              }
            }}
          />
          <div className="absolute top-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-b border-l border-gray-200 rounded-bl-lg">
            <p className="text-xs text-gray-600 max-w-xs">
              If you see "You need access", click "Open" or "Download" to view the PDF
            </p>
          </div>
        </div>
      )
    }

    if (currentMethod === 'proxy' && success) {
      const proxyUrl = `/api/pdf/proxy?url=${encodeURIComponent(pdfUrl)}`
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
              This PDF is hosted externally. Choose how you'd like to view it:
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
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

      {/* Content */}
      <div className="relative w-full" style={{ height: 'calc(100vh - 200px)' }}>
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Smart PDF Viewer • Method: {methods.find(m => m.id === currentMethod)?.name}
        </p>
      </div>
    </motion.div>
  )
}

export default SmartPDFViewer
