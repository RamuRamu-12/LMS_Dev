import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard'
import CourseListPage from './pages/CourseListPage'
import CourseDetailPage from './pages/CourseDetailPage'
import CreateCoursePage from './pages/CreateCoursePage'
import UserManagementPage from './pages/UserManagementPage'
import StudentListPage from './pages/StudentListPage'
import ProfilePage from './pages/ProfilePage'
import CertificatesPage from './pages/CertificatesPage'
import RealtimeProjectsPage from './pages/RealtimeProjectsPageSimple'
import HackathonPage from './pages/HackathonPage'
import BRDPhasePage from './pages/BRDPhasePage'
import UIUXPhasePage from './pages/UIUXPhasePage'
import ArchitecturalDesignPhasePage from './pages/ArchitecturalDesignPhasePage'
import CodeDevelopmentPhasePage from './pages/CodeDevelopmentPhasePage'
import TestingPhasePage from './pages/TestingPhasePage'
import DeploymentPhasePage from './pages/DeploymentPhasePage'
import AdminProjectsPage from './pages/AdminProjectsPage'
import AdminProjectManagementPage from './pages/AdminProjectManagementPage'
import ProjectManagementDetailPage from './pages/ProjectManagementDetailPage'
import AdminHackathonsPage from './pages/AdminHackathonsPage'
import CreateHackathonPage from './pages/CreateHackathonPage'
import NotFoundPage from './pages/NotFoundPage'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'
import ErrorBoundary from './components/common/ErrorBoundary'

// Hooks
import { useAuth } from './context/AuthContext'
import { ProjectProgressProvider } from './context/ProjectProgressContext'

function App() {
  console.log('App component is rendering')
  
  try {
    const { user, loading } = useAuth()
    console.log('Auth state:', { user, loading })

    if (loading) {
      console.log('App is in loading state')
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }

    console.log('App is rendering main content')

    return (
      <ErrorBoundary>
        <ProjectProgressProvider>
          <Helmet>
            <title>GNANAM AI - AI-Powered Learning Platform</title>
            <meta name="description" content="Experience the future of education with GNANAM AI - your intelligent learning companion" />
          </Helmet>
          
          <AnimatePresence mode="wait">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/student/*"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard"
              element={
                user ? (
                  <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            
            {/* Course Routes */}
            <Route path="/courses" element={<CourseListPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            
            {/* Realtime Projects Route */}
            <Route
              path="/realtime-projects"
              element={
                <ProtectedRoute>
                  <RealtimeProjectsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Hackathons Route */}
            <Route
              path="/hackathons"
              element={
                <ProtectedRoute>
                  <HackathonPage />
                </ProtectedRoute>
              }
            />
            
            {/* BRD Phase Route */}
            <Route
              path="/realtime-projects/:projectId/brd"
              element={
                <ProtectedRoute>
                  <BRDPhasePage />
                </ProtectedRoute>
              }
            />
            
            {/* UI/UX Phase Route */}
            <Route
              path="/realtime-projects/:projectId/uiux"
              element={
                <ProtectedRoute>
                  <UIUXPhasePage />
                </ProtectedRoute>
              }
            />
            
            {/* Architectural Design Phase Route */}
            <Route
              path="/realtime-projects/:projectId/architectural"
              element={
                <ProtectedRoute>
                  <ArchitecturalDesignPhasePage />
                </ProtectedRoute>
              }
            />
            
            {/* Code Development Phase Route */}
            <Route
              path="/realtime-projects/:projectId/code-development"
              element={
                <ProtectedRoute>
                  <CodeDevelopmentPhasePage />
                </ProtectedRoute>
              }
            />
            
            {/* Testing Phase Route */}
            <Route
              path="/realtime-projects/:projectId/testing"
              element={
                <ProtectedRoute>
                  <TestingPhasePage />
                </ProtectedRoute>
              }
            />
            
            {/* Deployment Phase Route */}
            <Route
              path="/realtime-projects/:projectId/deployment"
              element={
                <ProtectedRoute>
                  <DeploymentPhasePage />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/courses/create"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CreateCoursePage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute requiredRole="admin">
                  <StudentListPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProjectManagementPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/project-management"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProjectManagementPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/projects/:projectId"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProjectManagementDetailPage />
                </ProtectedRoute>
              }
            />
            
            {/* Hackathon Admin Routes */}
            <Route
              path="/admin/hackathons"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminHackathonsPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/hackathons/create"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CreateHackathonPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/project-management/:projectId"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProjectManagementDetailPage />
                </ProtectedRoute>
              }
            />
            
            {/* Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* Certificates Route */}
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <CertificatesPage />
                </ProtectedRoute>
              }
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
        </ProjectProgressProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Error in App component:', error)
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#fef2f2', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', color: '#dc2626', marginBottom: '1rem' }}>
            Error in App Component
          </h1>
          <p style={{ color: '#991b1b' }}>
            {error.message}
          </p>
        </div>
      </div>
    )
  }
}

export default App