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
      const courseDuration = certificateData.metadata?.courseDuration || certificateData.course?.estimated_duration || null
      const courseNameWithDuration = courseDuration ? `${courseName} (${courseDuration} Hrs)` : courseName
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
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap');
          
          .download-wrapper {
            width: 1200px;
            padding: 40px;
            font-family: 'Inter', 'Arial', sans-serif;
            background: #f5f5f5;
          }
          .certificate {
            background: #ffffff;
            padding: 80px 100px;
            text-align: center;
            max-width: 1120px;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
            min-height: 900px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 180px;
            font-weight: 900;
            color: #e5e7eb;
            opacity: 0.15;
            z-index: 0;
            pointer-events: none;
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
            letter-spacing: 20px;
          }
          .logo-section {
            margin-bottom: 50px;
            position: relative;
            z-index: 2;
            text-align: left;
          }
          .logo-section img {
            height: 80px;
            width: auto;
            display: block;
          }
          .certificate-title {
            font-size: 42px;
            font-weight: 900;
            color: #1e293b;
            margin-bottom: 50px;
            position: relative;
            z-index: 2;
            letter-spacing: 6px;
            text-transform: uppercase;
            font-family: 'Playfair Display', serif;
            line-height: 1.2;
            white-space: nowrap;
          }
          .certify-text {
            font-size: 22px;
            color: #475569;
            margin: 40px 0;
            position: relative;
            z-index: 2;
            line-height: 1.8;
            font-weight: 400;
            font-style: italic;
          }
          .student-name {
            font-size: 48px;
            font-weight: 700;
            color: #1e293b;
            margin: 50px 0 40px 0;
            position: relative;
            z-index: 2;
            font-family: 'Playfair Display', serif;
            text-decoration: underline;
            text-decoration-color: #6366f1;
            text-decoration-thickness: 3px;
            text-underline-offset: 10px;
          }
          .course-text {
            font-size: 24px;
            color: #475569;
            margin: 30px 0;
            position: relative;
            z-index: 2;
            line-height: 1.8;
            font-weight: 400;
          }
          .course-name {
            font-size: 32px;
            font-weight: 700;
            color: #1e293b;
            margin: 30px 0;
            position: relative;
            z-index: 2;
            line-height: 1.6;
          }
          .score-display {
            font-size: 36px;
            font-weight: 700;
            color: #1e293b;
            margin: 50px 0;
            position: relative;
            z-index: 2;
            font-family: 'Playfair Display', serif;
          }
          .issue-date {
            font-size: 20px;
            color: #64748b;
            margin-top: 70px;
            position: relative;
            z-index: 2;
            font-weight: 500;
          }
          .certificate-id {
            font-size: 14px;
            color: #94a3b8;
            margin-top: 30px;
            font-family: 'Courier New', monospace;
            position: relative;
            z-index: 2;
            font-weight: 400;
          }
          .verification-code {
            font-size: 14px;
            color: #94a3b8;
            margin-top: 10px;
            font-family: 'Courier New', monospace;
            position: relative;
            z-index: 2;
            font-weight: 400;
          }
        </style>
        <div class="download-wrapper">
          <div class="certificate certificate-download">
            <div class="watermark">GNANAM AI</div>
            <div class="logo-section">
              <img src="${logoUrl}" alt="GNANAM AI" onerror="this.style.display='none'">
            </div>
            <div class="certificate-title">CERTIFICATE OF COMPLETION</div>
            <div class="certify-text">This is to certify that</div>
            <div class="student-name">${studentName}</div>
            <div class="course-text">has successfully completed the course</div>
            <div class="course-name">${courseNameWithDuration}</div>
            ${score ? `<div class="score-display">with a score of ${Math.round(score)}%</div>` : ''}
            <div class="issue-date">Issued on ${issuedDate}</div>
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

            <div className="relative bg-white px-16 md:px-20 py-16 md:py-20 shadow-lg overflow-hidden text-center" style={{ minHeight: '900px' }}>
              {/* Watermark Background - Text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 text-[180px] font-black text-gray-200 opacity-20 z-0 whitespace-nowrap tracking-[20px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                GNANAM AI
              </div>
              
              <div className="relative z-10">
                {/* Logo */}
                <div className="mb-12 text-left">
                  <img src="/lms_logo.svg" alt="GNANAM AI" className="h-[80px] w-auto" onError={(e) => e.target.style.display = 'none'} />
                </div>

                {/* Certificate Title */}
                <div className="text-[42px] font-black text-slate-800 mb-12 tracking-[6px] uppercase leading-tight whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif" }}>
                  CERTIFICATE OF COMPLETION
                </div>

                {/* Certify Text */}
                <div className="text-[22px] text-slate-600 my-10 leading-relaxed italic">
                  This is to certify that
                </div>

                {/* Student Name */}
                <div className="text-[48px] font-bold text-slate-800 my-12 underline decoration-indigo-600 decoration-[3px] underline-offset-[10px]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {selectedCertificate.metadata?.studentName || 'Learner Name'}
                </div>

                {/* Course Text */}
                <div className="text-[24px] text-slate-600 my-8 leading-relaxed">
                  has successfully completed the course
                </div>

                {/* Course Name */}
                <div className="text-[32px] font-bold text-slate-800 my-8 leading-relaxed">
                  {(() => {
                    const courseName = selectedCertificate.metadata?.courseName || 'Course'
                    const courseDuration = selectedCertificate.metadata?.courseDuration || selectedCertificate.course?.estimated_duration
                    return courseDuration ? `${courseName} (${courseDuration} Hrs)` : courseName
                  })()}
                </div>

                {/* Score */}
                {selectedCertificate.metadata?.score && (
                  <div className="text-[36px] font-bold text-slate-800 my-12" style={{ fontFamily: "'Playfair Display', serif" }}>
                    with a score of {Math.round(selectedCertificate.metadata.score)}%
                  </div>
                )}

                {/* Issue Date */}
                <div className="text-xl text-slate-600 mt-20 font-medium">
                  Issued on {formatDate(selectedCertificate.issued_date)}
                </div>

                {/* Certificate ID */}
                <div className="text-sm text-slate-400 mt-8 font-mono">
                  Certificate ID: {selectedCertificate.certificate_number}
                </div>

                {/* Verification Code */}
                <div className="text-sm text-slate-400 mt-3 font-mono">
                  Verification Code: {selectedCertificate.verification_code}
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
