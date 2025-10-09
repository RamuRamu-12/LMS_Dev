import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Header from '../components/common/Header'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gradient mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary inline-block"
          >
            Go Home
          </Link>
          <div>
            <Link
              to="/courses"
              className="btn-secondary inline-block"
            >
              Browse Courses
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <div className="w-32 h-32 mx-auto mb-4 opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="url(#gradient)" opacity="0.3" />
              <circle cx="100" cy="100" r="60" fill="url(#gradient)" opacity="0.5" />
              <circle cx="100" cy="100" r="40" fill="url(#gradient)" opacity="0.7" />
              <circle cx="100" cy="100" r="20" fill="url(#gradient)" />
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFoundPage
