import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useQuery } from 'react-query'
import { enrollmentService } from '../services/enrollmentService'
import { courseService } from '../services/courseService'
import { achievementService } from '../services/achievementService'
import Header from '../components/common/Header'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  })

  // Update form data when user data changes
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
    })
  }, [user])

  // Fetch user statistics - use stats API for accurate data
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'student-stats',
    () => enrollmentService.getMyStats(),
    {
      refetchOnWindowFocus: true,
      staleTime: 30 * 1000, // 30 seconds - shorter stale time for stats
      cacheTime: 2 * 60 * 1000 // Keep in cache for 2 minutes
    }
  )

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery(
    'student-enrollments',
    () => enrollmentService.getMyEnrollments(),
    {
      refetchOnWindowFocus: true,
      staleTime: 30 * 1000 // 30 seconds - shorter stale time
    }
  )

  const { data: coursesData, isLoading: coursesLoading } = useQuery(
    'student-courses',
    () => courseService.getCourses({ limit: 100 }),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000
    }
  )

  const { data: achievementsData, isLoading: achievementsLoading } = useQuery(
    'user-achievements',
    () => achievementService.getMyAchievements(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000
    }
  )

  const enrollments = enrollmentsData?.data?.enrollments || []
  const courses = coursesData?.data?.courses || []
  const achievements = achievementsData?.data?.achievements || []

  // Use stats from API, fallback to calculated stats if API is not available
  const apiStats = statsData?.data?.stats || {}
  const stats = {
    totalEnrolled: apiStats.totalCourses || enrollments.length,
    completedCourses: apiStats.completedCourses || enrollments.filter(e => e.status === 'completed').length,
    inProgressCourses: apiStats.inProgressCourses || enrollments.filter(e => e.status === 'in-progress').length,
    totalHours: Math.round((apiStats.totalTimeSpent || 0) / 60), // Convert minutes to hours
    averageProgress: apiStats.averageProgress || (enrollments.length > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Use the AuthContext's updateProfile function which handles API call and state update
      const result = await updateProfile(formData)
      
      if (result.success) {
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(result.error || 'Failed to update profile. Please try again.')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  const handleDownloadCertificate = async (achievementId) => {
    try {
      const response = await achievementService.downloadCertificate(achievementId)
      const certificate = response.data.certificate
      
      // Create certificate HTML content with logo
      const certificateHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Certificate - ${certificate.title}</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                .no-print { display: none; }
              }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 40px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              }
              .certificate { 
                background: white; 
                padding: 60px; 
                border-radius: 20px; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
                text-align: center; 
                position: relative;
                min-height: 600px;
                overflow: hidden;
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
                position: absolute;
                top: 30px;
                left: 30px;
                width: 200px;
                height: 100px;
                z-index: 2;
              }
              .logo-container img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
              }
              .header { 
                color: #4a5568; 
                margin-bottom: 40px; 
                margin-top: 20px;
                position: relative;
                z-index: 1;
              }
              .title { 
                font-size: 36px; 
                font-weight: bold; 
                color: #2d3748; 
                margin-bottom: 20px; 
              }
              .subtitle { 
                font-size: 18px; 
                color: #718096; 
                margin-bottom: 40px; 
              }
              .student-name { 
                font-size: 28px; 
                font-weight: bold; 
                color: #2d3748; 
                margin-bottom: 20px;
                position: relative;
                z-index: 1;
              }
              .course-title { 
                font-size: 24px; 
                color: #4a5568; 
                margin-bottom: 30px;
                position: relative;
                z-index: 1;
              }
              .details { 
                display: flex; 
                justify-content: space-between; 
                margin-top: 40px; 
                font-size: 14px; 
                color: #718096;
                position: relative;
                z-index: 1;
              }
              .certificate-id { 
                font-size: 12px; 
                color: #a0aec0; 
                margin-top: 20px;
                position: relative;
                z-index: 1;
              }
              .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 24px;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .print-button:hover {
                background: #4f46e5;
              }
            </style>
          </head>
          <body>
            <button class="print-button no-print" onclick="window.print()">Download as PDF</button>
            <div class="certificate">
              <div class="watermark">
                <img src="/lms_logo.svg" alt="GNANAM AI" onerror="this.style.display='none'">
              </div>
              <div class="logo-container">
                <img src="/lms_logo.svg" alt="GNANAM AI" onerror="this.style.display='none'">
              </div>
              <div class="header">
                <h1>CERTIFICATE OF COMPLETION</h1>
                <p class="subtitle">This is to certify that</p>
              </div>
              <div class="student-name">${certificate.studentName}</div>
              <div class="course-title">has successfully completed the course</div>
              <div class="course-title" style="font-weight: bold; color: #2d3748;">${certificate.courseTitle}</div>
              <div class="details">
                <div>Issued by: ${certificate.issuedBy}</div>
                <div>Date: ${new Date(certificate.completionDate).toLocaleDateString()}</div>
              </div>
              <div class="certificate-id">Certificate ID: ${certificate.certificateId}</div>
            </div>
            <script>
              // Auto-trigger print dialog for download
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `
      
      // Open in new window and write HTML directly, then trigger print for PDF download
      const certificateWindow = window.open('', '_blank')
      certificateWindow.document.write(certificateHTML)
      certificateWindow.document.close()
      
      // After window loads, trigger print dialog (which allows Save as PDF)
      certificateWindow.addEventListener('load', function() {
        setTimeout(function() {
          certificateWindow.print()
        }, 500)
      }, true)
      
      // Fallback: trigger print after a delay if load event doesn't fire
      setTimeout(function() {
        try {
          certificateWindow.print()
        } catch (e) {
          console.log('Print dialog will appear when certificate loads')
        }
      }, 1000)
      
      toast.success('Certificate opened! Use "Save as PDF" in the print dialog to download.')
    } catch (error) {
      console.error('Error downloading certificate:', error)
      toast.error('Failed to download certificate. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
    })
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'stats', name: 'Statistics', icon: '📊' },
    { id: 'achievements', name: 'Achievements', icon: '🏆' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center space-x-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                        alt={user.name}
                        className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </motion.div>
              <div>
                      <h1 className="text-3xl font-bold">{user.name}</h1>
                      <p className="text-indigo-100 text-lg">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/30 text-purple-100'
                            : 'bg-blue-500/30 text-blue-100'
                        }`}>
                          {user.role === 'admin' ? '👑 Admin' : '🎓 Student'}
                        </span>
                        <span className="text-sm text-indigo-200">
                          Member since {new Date().getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="mt-4 lg:mt-0 px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-300"
                    >
                      ✏️ Edit Profile
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex space-x-0">
                {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="text-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative inline-block"
                        >
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                      alt={user.name}
                            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-100"
                          />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{user.name}</h3>
                        <p className="text-gray-500 mb-3">{user.email}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center text-sm text-gray-600">
                            <span className="mr-2">📧</span>
                            {user.email}
                          </div>
                        </div>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        placeholder="Tell us about yourself..."
                      />
                    </div>


                    {isEditing && (
                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handleCancel}
                              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          {isLoading ? (
                            <div className="flex items-center">
                              <LoadingSpinner size="sm" />
                              <span className="ml-2">Saving...</span>
                            </div>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Courses Enrolled</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalEnrolled}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Completed</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">In Progress</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.inProgressCourses}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Hours</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Progress Chart */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Overall Progress</span>
                          <span>{stats.averageProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.averageProgress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                      <div className="text-sm text-gray-500">
                        {achievements.filter(a => a.isUnlocked).length} of {achievements.length} unlocked
                      </div>
                    </div>
                    
                    {achievements.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map((achievement, index) => (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className={`p-4 border rounded-lg text-center transition-all duration-200 ${
                              achievement.isUnlocked 
                                ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="text-4xl mb-2">{achievement.icon}</div>
                            <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            
                            {achievement.course && (
                              <div className="mt-2 text-xs text-gray-500">
                                Course: {achievement.course.title}
                              </div>
                            )}
                            
                            <div className="mt-3 flex items-center justify-between">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                achievement.isUnlocked 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {achievement.isUnlocked ? 'Unlocked' : 'Locked'}
                              </div>
                              
                              {achievement.pointsEarned > 0 && (
                                <div className="text-xs text-gray-500">
                                  +{achievement.pointsEarned} XP
                                </div>
                              )}
                            </div>
                            
                            {achievement.isUnlocked && achievement.type === 'course_completion' && (
                              <button
                                onClick={() => handleDownloadCertificate(achievement.id)}
                                className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Certificate
                              </button>
                            )}
                            
                            {achievement.isUnlocked && (
                              <div className="mt-2 text-xs text-gray-400">
                                Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements yet</h3>
                        <p className="text-gray-600 mb-4">Complete courses to unlock achievements and earn certificates</p>
                        <button 
                          onClick={() => window.location.href = '/courses'}
                          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Browse Courses
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Security Settings */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      {/* Change Password */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg mr-4">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                            <p className="text-sm text-gray-500">Update your account password</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => alert('Password change functionality will be implemented soon!')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Change
                        </button>
                      </div>

                      {/* Sign Out */}
                      <div className="flex items-center justify-between py-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-orange-100 rounded-lg mr-4">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Sign Out</h4>
                            <p className="text-sm text-gray-500">Sign out of your account on this device</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                          }}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      {/* Profile Visibility */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg mr-4">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Profile Visibility</h4>
                            <p className="text-sm text-gray-500">Control who can see your profile information</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Email Notifications */}
                      <div className="flex items-center justify-between py-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Receive updates about courses and activities</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Management */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h3>
                    <div className="space-y-4">
                      {/* Contact Support */}
                      <div className="flex items-center justify-between py-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-4">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Contact Support</h4>
                            <p className="text-sm text-gray-500">Get help with your account or courses</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => window.open('mailto:support@gnanamai.com?subject=Support Request', '_blank')}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
