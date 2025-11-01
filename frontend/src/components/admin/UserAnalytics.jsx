import { motion } from 'framer-motion'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { userService } from '../../services/userService'
import { courseService } from '../../services/courseService'
import { enrollmentService } from '../../services/enrollmentService'
import { useAuth } from '../../context/AuthContext'

const UserAnalytics = () => {
  const { user, isAuthenticated } = useAuth()
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  
  const { data: usersData, isLoading, error } = useQuery(
    'admin-users-analytics',
    () => userService.getUsers(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      enabled: isAuthenticated && user?.role === 'admin'
    }
  )

  const { data: coursesData } = useQuery(
    'admin-courses-analytics',
    () => courseService.getCourses({ limit: 100 }),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      enabled: isAuthenticated && user?.role === 'admin'
    }
  )

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery(
    ['course-enrollments', selectedCourseId],
    () => courseService.getCourseEnrollments(selectedCourseId),
    {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
      enabled: isAuthenticated && user?.role === 'admin' && selectedCourseId !== null
    }
  )

  const { data: certificatesData, isLoading: certificatesLoading } = useQuery(
    ['course-certificates', selectedCourseId],
    () => courseService.getCourseCertificates(selectedCourseId),
    {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
      enabled: isAuthenticated && user?.role === 'admin' && selectedCourseId !== null
    }
  )

  const { data: adminStatsData } = useQuery(
    'admin-stats-analytics',
    () => enrollmentService.getAdminStats(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      enabled: isAuthenticated && user?.role === 'admin'
    }
  )

  // Debug logging
  console.log('UserAnalytics - user:', user)
  console.log('UserAnalytics - isAuthenticated:', isAuthenticated)
  console.log('UserAnalytics - usersData:', usersData)
  console.log('UserAnalytics - error:', error)

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="card p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">You need admin privileges to view user analytics.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading analytics</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Error details: {JSON.stringify(error, null, 2)}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const users = usersData?.data?.users || []
  
  // Debug logging
  console.log('UserAnalytics - users array:', users)
  console.log('UserAnalytics - users length:', users.length)
  
  // Calculate analytics - focus on students only
  const totalUsers = users.length
  const adminUsers = users.filter(user => user.role === 'admin').length
  const studentUsers = users.filter(user => user.role === 'student').length
  const activeStudents = users.filter(user => user.role === 'student' && user.is_active).length
  
  console.log('UserAnalytics - calculated stats:', {
    totalUsers,
    adminUsers,
    studentUsers,
    activeStudents
  })
  
  // Recent student registrations (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentStudentRegistrations = users.filter(user => 
    user.role === 'student' && new Date(user.created_at) >= sevenDaysAgo
  ).length
  
  // Students who logged in recently (last 24 hours)
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  const recentStudentLogins = users.filter(user => 
    user.role === 'student' && user.last_login && new Date(user.last_login) >= oneDayAgo
  ).length
  
  // Students who never logged in
  const studentsNeverLoggedIn = users.filter(user => 
    user.role === 'student' && !user.last_login
  ).length

  // Calculate enrollment statistics
  const courses = coursesData?.data?.courses || []
  const adminStats = adminStatsData?.data?.stats || {}
  
  // Calculate meaningful enrollment insights
  const totalEnrollments = adminStats.totalEnrolled || 0
  const completedEnrollments = adminStats.totalCompleted || 0
  const activeEnrollments = adminStats.totalActive || 0
  const completionRate = adminStats.completionRate || 0
  
  // Average enrollments per course
  const avgEnrollmentsPerCourse = courses.length > 0 
    ? Math.round((totalEnrollments / courses.length) * 10) / 10 
    : 0
  
  // Average enrollments per student
  const avgCoursesPerStudent = studentUsers > 0 
    ? Math.round((totalEnrollments / studentUsers) * 10) / 10 
    : 0
  
  // Enrollment rate (percentage of students who have enrolled in at least one course)
  // Estimate based on total enrollments vs total students
  const enrollmentRate = studentUsers > 0 
    ? Math.round(Math.min((totalEnrollments / studentUsers) * 100, 100))
    : 0
  
  // Most popular courses (by enrollment count)
  const popularCourses = [...courses]
    .sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0))
    .slice(0, 5)
  
  // Calculate engagement rate (active students / total students)
  const engagementRate = studentUsers > 0 
    ? Math.round((activeStudents / studentUsers) * 100)
    : 0
  
  // Students who logged in last 7 days
  const sevenDaysAgoLogin = new Date()
  sevenDaysAgoLogin.setDate(sevenDaysAgoLogin.getDate() - 7)
  const activeStudentsLast7Days = users.filter(user => 
    user.role === 'student' && user.last_login && new Date(user.last_login) >= sevenDaysAgoLogin
  ).length
  
  // Calculate registration growth (compare this week vs last week)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const registrationsLastWeek = users.filter(user => 
    user.role === 'student' && 
    new Date(user.created_at) >= fourteenDaysAgo && 
    new Date(user.created_at) < sevenDaysAgo
  ).length
  const registrationGrowth = registrationsLastWeek > 0
    ? Math.round(((recentStudentRegistrations - registrationsLastWeek) / registrationsLastWeek) * 100)
    : recentStudentRegistrations > 0 ? 100 : 0

  // Calculate additional useful metrics
  const publishedCoursesCount = adminStats.publishedCourses || 0
  const totalCoursesCount = courses.length
  const inProgressEnrollments = activeEnrollments
  
  // Calculate students enrolled in at least one course
  const enrolledStudentsCount = studentUsers > 0 ? Math.min(totalEnrollments, studentUsers) : 0
  
  // Calculate average completion rate across all enrollments
  const avgCompletionRate = totalEnrollments > 0 
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0

  const stats = [
    {
      title: 'Course Completion Rate',
      value: `${Math.round(completionRate)}%`,
      change: `${completedEnrollments} of ${totalEnrollments} completed`,
      changeType: completionRate >= 50 ? 'positive' : completionRate >= 30 ? 'neutral' : 'negative',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Total Enrollments',
      value: totalEnrollments,
      change: `${inProgressEnrollments} in progress`,
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: 'Published Courses',
      value: publishedCoursesCount,
      change: `${totalCoursesCount} total courses`,
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      title: 'Avg Courses/Student',
      value: avgCoursesPerStudent,
      change: `${enrolledStudentsCount} students enrolled`,
      changeType: avgCoursesPerStudent >= 2 ? 'positive' : 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Enrollment Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Total Enrollments</span>
              <span className="font-bold text-indigo-600">{totalEnrollments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{completedEnrollments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">In Progress</span>
              <span className="font-semibold text-yellow-600">{activeEnrollments}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-blue-200">
              <span className="text-xs font-medium text-gray-700">Completion Rate</span>
              <span className="font-bold text-indigo-700">{Math.round(completionRate)}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Engagement Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Active Students (7d)</span>
              <span className="font-bold text-green-600">{activeStudentsLast7Days}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Recent Logins (24h)</span>
              <span className="font-semibold text-green-600">{recentStudentLogins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Never Logged In</span>
              <span className="font-semibold text-orange-600">{studentsNeverLoggedIn}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-green-200">
              <span className="text-xs font-medium text-gray-700">Engagement Rate</span>
              <span className="font-bold text-green-700">{engagementRate}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Growth Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">New This Week</span>
              <span className="font-bold text-purple-600">+{recentStudentRegistrations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Growth Rate</span>
              <span className={`font-semibold ${registrationGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {registrationGrowth >= 0 ? '+' : ''}{registrationGrowth}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Avg Courses/Student</span>
              <span className="font-semibold text-purple-600">{avgCoursesPerStudent}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-purple-200">
              <span className="text-xs font-medium text-gray-700">Enrollment Rate</span>
              <span className="font-bold text-purple-700">{enrollmentRate}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Platform Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Total Courses</span>
              <span className="font-bold text-amber-600">{courses.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Published Courses</span>
              <span className="font-semibold text-amber-600">{adminStats.publishedCourses || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Avg Enrollments/Course</span>
              <span className="font-semibold text-amber-600">{avgEnrollmentsPerCourse}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-amber-200">
              <span className="text-xs font-medium text-gray-700">Total Admins</span>
              <span className="font-bold text-amber-700">{adminUsers}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-full">
        {/* Registration Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New student registrations this week</span>
              <span className="font-semibold text-green-600">+{recentStudentRegistrations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Students who never logged in</span>
              <span className="font-semibold text-orange-600">{studentsNeverLoggedIn}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Admin accounts</span>
              <span className="font-semibold text-purple-600">{adminUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active students</span>
              <span className="font-semibold text-blue-600">{activeStudents}</span>
            </div>
          </div>
        </motion.div>

        {/* Most Popular Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Courses</h3>
          <div className="space-y-3">
            {popularCourses.length > 0 ? (
              popularCourses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.category || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-indigo-600">{course.enrollment_count || 0}</span>
                    <span className="text-xs text-gray-500">enrollments</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No courses available</p>
            )}
          </div>
        </motion.div>

        {/* Recent Student Registrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Student Registrations</h3>
          <div className="space-y-3">
            {users
              .filter(user => user.role === 'student')
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 5)
              .map((user, index) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    student
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Unified Course Enrollments & Certificates Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Enrollments & Certificates</h3>
        <div className="mb-4">
          <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select a course to view all enrollment and certification details
          </label>
          <select
            id="course-select"
            value={selectedCourseId || ''}
            onChange={(e) => setSelectedCourseId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Select a course --</option>
            {coursesData?.data?.courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} ({course.enrollment_count || 0} enrollments)
              </option>
            ))}
          </select>
        </div>

        {selectedCourseId && (
          <div className="mt-6">
            {(enrollmentsLoading || certificatesLoading) ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading enrollment and certificate data...</p>
              </div>
            ) : enrollmentsData?.data?.enrollments && enrollmentsData.data.enrollments.length > 0 ? (
              <div>
                <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{enrollmentsData.data.totalEnrollments}</span> users enrolled in{' '}
                    <span className="font-semibold text-indigo-600">{enrollmentsData.data.course.title}</span>
                    {certificatesData?.data?.certificates && certificatesData.data.certificates.length > 0 && (
                      <span className="ml-2">
                        • <span className="font-semibold text-green-600">{certificatesData.data.totalCertificates}</span> certificate{certificatesData.data.totalCertificates !== 1 ? 's' : ''} issued
                      </span>
                    )}
                  </p>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrolled Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Accessed
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Certificate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cert #
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {enrollmentsData.data.enrollments.map((enrollment) => {
                        // Find matching certificate for this enrollment
                        const certificate = certificatesData?.data?.certificates?.find(
                          cert => cert.student?.id === enrollment.student?.id || cert.student?.email === enrollment.student?.email
                        )
                        
                        return (
                          <tr key={enrollment.enrollmentId} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center min-w-0">
                                <img
                                  src={enrollment.student?.avatar || `https://ui-avatars.com/api/?name=${enrollment.student?.name}&background=6366f1&color=fff`}
                                  alt={enrollment.student?.name}
                                  className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {enrollment.student?.name || 'Unknown'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {enrollment.student?.isActive ? (
                                      <span className="text-green-600">Active</span>
                                    ) : (
                                      <span className="text-gray-400">Inactive</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-900 truncate max-w-xs">{enrollment.student?.email || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                enrollment.status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : enrollment.status === 'in-progress'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {enrollment.status || 'enrolled'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2 flex-shrink-0">
                                  <div
                                    className={`h-2 rounded-full ${
                                      enrollment.progress === 100 ? 'bg-green-600' : 'bg-indigo-600'
                                    }`}
                                    style={{ width: `${enrollment.progress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900 whitespace-nowrap">{enrollment.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {enrollment.enrolledAt 
                                ? new Date(enrollment.enrolledAt).toLocaleDateString() 
                                : 'N/A'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {enrollment.completedAt || certificate?.completedAt
                                ? new Date(enrollment.completedAt || certificate.completedAt).toLocaleDateString() 
                                : enrollment.status === 'completed' 
                                  ? 'Completed'
                                  : '-'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {enrollment.lastAccessedAt 
                                ? new Date(enrollment.lastAccessedAt).toLocaleDateString() 
                                : 'Never'}
                            </td>
                            <td className="px-4 py-4">
                              {certificate ? (
                                <div className="flex items-center min-w-0">
                                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                  </svg>
                                  <span className="text-xs text-green-700 font-medium truncate">
                                    {certificate.issuedDate 
                                      ? new Date(certificate.issuedDate).toLocaleDateString() 
                                      : 'Issued'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">No certificate</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {certificate ? (
                                <div className="text-xs text-gray-900 font-mono truncate max-w-32">
                                  {certificate.certificateNumber || 'N/A'}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No enrollments found for this course.</p>
              </div>
            )}
          </div>
        )}

        {!selectedCourseId && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm">Select a course from the dropdown above to view enrollment and certificate details</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default UserAnalytics
