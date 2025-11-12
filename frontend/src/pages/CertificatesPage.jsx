import { motion } from 'framer-motion'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { certificateService } from '../services/certificateService'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const CertificatesPage = () => {
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  // Fetch student's certificates
  const { data: certificatesData, isLoading, error } = useQuery(
    'my-certificates',
    () => certificateService.getMyCertificates(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Certificates API error:', error)
      }
    }
  )

  const certificates = certificatesData?.data?.certificates || []

  const handleViewCertificate = async (certificate) => {
    try {
      setSelectedCertificate(certificate)
      setShowCertificateModal(true)
    } catch (error) {
      console.error('Error viewing certificate:', error)
      toast.error('Failed to load certificate details')
    }
  }

  const handleDownloadCertificate = async (certificate) => {
    let downloadContainer = null
    try {
      const response = await certificateService.downloadCertificate(certificate.id)
      const certificateData = response.data.certificate

      const studentName = certificateData.metadata?.studentName || certificateData.studentName || 'Student'
      const courseName = certificateData.metadata?.courseName || certificateData.course?.title || 'Course'
      const score = certificateData.metadata?.score
      const certificateNumber = certificateData.certificate_number
      const verificationCode = certificateData.verification_code
      const issuedDate = new Date(certificateData.issued_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const logoUrl = `${window.location.origin}/lms_logo.svg`

      downloadContainer = document.createElement('div')
      downloadContainer.style.position = 'fixed'
      downloadContainer.style.top = '0'
      downloadContainer.style.left = '0'
      downloadContainer.style.width = '100vw'
      downloadContainer.style.height = '100vh'
      downloadContainer.style.pointerEvents = 'none'
      downloadContainer.style.opacity = '0'
      downloadContainer.style.zIndex = '-1'
      downloadContainer.innerHTML = `
        <style>
          .download-wrapper {
            width: 960px;
            padding: 40px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .certificate {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            text-align: center;
            max-width: 860px;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
            min-height: 600px;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            width: 1000px;
            height: 1000px;
            opacity: 0.05;
            z-index: 0;
            pointer-events: none;
          }
          .watermark img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .logo-container {
            width: 180px;
            margin: 0 auto 30px auto;
            position: relative;
            z-index: 3;
          }
          .logo-container img {
            width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
            filter: drop-shadow(0 6px 12px rgba(56, 189, 248, 0.25));
          }
          .header {
            color: #4a5568;
            margin-bottom: 40px;
            position: relative;
            z-index: 1;
            margin-top: 20px;
          }
          .header h1 {
            font-size: 42px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .header .subtitle {
            font-size: 20px;
            color: #718096;
            margin-bottom: 40px;
            font-style: italic;
          }
          .student-name {
            font-size: 32px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 20px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
          }
          .course-title {
            font-size: 28px;
            color: #4a5568;
            margin-bottom: 10px;
            font-weight: 500;
            position: relative;
            z-index: 1;
          }
          .details {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            font-size: 16px;
            color: #718096;
            border-top: 2px solid #e2e8f0;
            padding-top: 30px;
            position: relative;
            z-index: 1;
          }
          .certificate-id {
            font-size: 14px;
            color: #a0aec0;
            margin-top: 30px;
            font-family: 'Courier New', monospace;
            position: relative;
            z-index: 1;
          }
          .verification-code {
            font-size: 12px;
            color: #a0aec0;
            margin-top: 10px;
            font-family: 'Courier New', monospace;
            position: relative;
            z-index: 1;
          }
          .score {
            background: linear-gradient(135deg, #48bb78, #38a169);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
            font-size: 18px;
            position: relative;
            z-index: 1;
          }
        </style>
        <div class="download-wrapper">
          <div class="certificate certificate-download">
            <div class="watermark">
              <img src="/lms_logo.svg" alt="GNANAM AI" onerror="this.style.display='none'">
            </div>
            <div class="logo-container">
              <img src="/lms_logo.svg" alt="GNANAM AI" onerror="this.style.display='none'">
            </div>
            <div class="logo-container">
              <img src="${logoUrl}" alt="GNANAM AI">
            </div>
            <div class="header">
              <h1>CERTIFICATE OF COMPLETION</h1>
              <p class="subtitle">This is to certify that</p>
            </div>
            <div class="student-name">${studentName}</div>
            <div class="course-title">has successfully completed the course</div>
            <div class="course-title" style="font-weight: bold; color: #2d3748;">${courseName}</div>
            ${score ? `<div class="score">Score: ${Math.round(score)}%</div>` : ''}
            <div class="details">
              <div>Issued by: GNANAM AI Learning Platform</div>
              <div>Date: ${issuedDate}</div>
            </div>
            <div class="certificate-id">Certificate ID: ${certificateNumber}</div>
            <div class="verification-code">Verification Code: ${verificationCode}</div>
          </div>
        </div>
      `

      document.body.appendChild(downloadContainer)

      const templateElement = downloadContainer.querySelector('.certificate-download')
      if (!templateElement) {
        throw new Error('Certificate template not found')
      }

      await new Promise((resolve) => setTimeout(resolve, 100))

      const canvas = await html2canvas(templateElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('landscape', 'pt', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const imgY = (pdfHeight - imgHeight) / 2

      pdf.addImage(imgData, 'PNG', 0, imgY, imgWidth, imgHeight)

      const safeStudentName = studentName.replace(/\s+/g, '_')
      const safeCourseName = courseName.replace(/\s+/g, '_')
      const fileName = `${safeStudentName}_${safeCourseName}_certificate.pdf`
      pdf.save(fileName)

      toast.success('Certificate downloaded successfully!')
    } catch (error) {
      console.error('Error downloading certificate:', error)
      toast.error('Failed to download certificate. Please try again.')
    } finally {
      if (downloadContainer && document.body.contains(downloadContainer)) {
        document.body.removeChild(downloadContainer)
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Certificates</h1>
            <p className="text-gray-600 mb-6">
              {error.message?.includes('401') 
                ? 'Authentication required. Please log in to view your certificates.'
                : 'Unable to load certificates. Please try again later.'
              }
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Certificates</h1>
          <p className="text-lg text-gray-600">
            View and download your course completion certificates
          </p>
        </motion.div>

        {certificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Certificates Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Complete courses and pass their tests to earn certificates. Your certificates will appear here once you've successfully completed a course.
            </p>
            <button 
              onClick={() => window.location.href = '/student'}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Browse Courses
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate, index) => (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Completed
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {certificate.metadata?.courseName || 'Course Certificate'}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm">
                    Issued on {formatDate(certificate.issued_date)}
                  </p>
                  
                  {certificate.metadata?.score && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Score</span>
                        <span className="font-semibold">{Math.round(certificate.metadata.score)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${certificate.metadata.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewCertificate(certificate)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      View Certificate
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(certificate)}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Download PDF
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Certificate ID: {certificate.certificate_number}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && selectedCertificate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCertificateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 md:p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Certificate Preview</h3>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-[32px] px-8 md:px-16 py-10 md:py-14 shadow-lg overflow-hidden">
              <div className="absolute -top-20 -left-10 w-64 h-64 bg-indigo-100/60 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-32 -right-10 w-80 h-80 bg-purple-100/60 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-10">
                  <div>
                    <p className="text-sm uppercase tracking-[0.4em] text-indigo-400 font-semibold">Certificate of Completion</p>
                    <h4 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-800">
                      {selectedCertificate.metadata?.courseName || 'Course Certificate'}
                    </h4>
                    <p className="mt-3 text-base md:text-lg text-slate-500 max-w-xl">
                      This certificate is proudly presented to the learner for successfully completing the course requirements with outstanding performance.
                    </p>
                  </div>
                  <div className="mt-8 md:mt-0 text-left md:text-right">
                    <p className="text-sm text-slate-500">Issued Date</p>
                    <p className="text-lg font-semibold text-slate-700">{formatDate(selectedCertificate.issued_date)}</p>
                    <p className="mt-4 text-sm text-slate-500">Verification Code</p>
                    <p className="text-lg font-mono text-slate-700 break-all">{selectedCertificate.verification_code}</p>
                  </div>
                </div>

                <div className="text-center my-12">
                  <p className="text-sm uppercase tracking-[0.6em] text-indigo-300 font-semibold">Awarded To</p>
                  <p className="mt-6 text-4xl md:text-5xl font-black text-slate-800">
                    {selectedCertificate.metadata?.studentName || 'Learner Name'}
                  </p>
                  {selectedCertificate.metadata?.score && (
                    <p className="mt-3 text-lg font-semibold text-emerald-500">
                      Completed with a score of {Math.round(selectedCertificate.metadata.score)}%
                    </p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                  <div>
                    <p className="text-sm text-slate-500">Certificate Number</p>
                    <p className="text-lg font-mono text-slate-700">{selectedCertificate.certificate_number}</p>
                  </div>
                  <div className="border-t border-slate-200 pt-6 md:pt-4 md:border-none md:text-right">
                    <p className="text-base font-semibold text-slate-700">GNANAM AI</p>
                    <p className="text-sm text-slate-500">Authorized Signature</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  )
}

export default CertificatesPage
