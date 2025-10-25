import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { courseService } from '../services/courseService'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import CourseFilters from '../components/course/CourseFilters'
import CourseList from '../components/course/CourseList'
import Pagination from '../components/common/Pagination'
import ErrorBoundary from '../components/common/ErrorBoundary'

const CourseListPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const COURSES_PER_PAGE = 9

  const { data: coursesData, isLoading, error } = useQuery(
    ['courses', filters, currentPage],
    () => {
      // Only add parameters if they have values
      const params = {
        page: currentPage,
        limit: COURSES_PER_PAGE
      }
      
      if (filters.search && filters.search.trim()) {
        params.q = filters.search
      }
      if (filters.category && filters.category !== '') {
        params.category = filters.category
      }
      if (filters.difficulty && filters.difficulty !== '') {
        params.difficulty = filters.difficulty
      }
      
      return courseService.getCourses(params)
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000
    }
  )

  const { data: categoriesData } = useQuery(
    'categories',
    () => courseService.getCategories(),
    {
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000 // Cache for 10 minutes
    }
  )

  const courses = coursesData?.data?.courses || []
  const categories = categoriesData?.data?.categories || []
  const pagination = coursesData?.data?.pagination || {}

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-20"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                    Explore AI-Enhanced Courses
                  </h1>
                  <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                    Discover our comprehensive collection of AI-powered courses designed to accelerate your learning journey. 
                    From beginner to advanced levels, experience personalized education like never before.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <CourseFilters 
              onFilterChange={handleFilterChange}
              filters={filters}
              categories={categories}
            />

            {/* Courses List */}
            <CourseList 
              courses={courses}
              isLoading={isLoading}
              error={error}
              showInstructor={true}
              showRating={true}
            />

            {/* Pagination */}
            {!isLoading && !error && courses.length > 0 && (
              <Pagination
                currentPage={pagination.currentPage || currentPage}
                totalPages={pagination.totalPages || 1}
                onPageChange={handlePageChange}
                totalItems={pagination.totalItems || 0}
                itemsPerPage={pagination.itemsPerPage || COURSES_PER_PAGE}
                className="mt-8"
              />
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  )
}

export default CourseListPage
