import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const CourseFilters = ({ onFilterChange, filters = {}, categories = [] }) => {
  const [localFilters, setLocalFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  })

  // Sync local filters with parent filters
  useEffect(() => {
    setLocalFilters({
      category: filters.category || '',
      difficulty: filters.difficulty || '',
      search: filters.search || ''
    })
  }, [filters])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (handleFilterChange.searchTimeout) {
        clearTimeout(handleFilterChange.searchTimeout)
      }
    }
  }, [])

  // Add "All Categories" option to the beginning of the categories array
  const categoryOptions = ['All Categories', ...categories]

  const difficulties = [
    'All Levels',
    'Beginner',
    'Intermediate',
    'Advanced'
  ]


  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    
    // Debounce search input to prevent too many API calls
    if (key === 'search') {
      clearTimeout(handleFilterChange.searchTimeout)
      handleFilterChange.searchTimeout = setTimeout(() => {
        onFilterChange(newFilters)
      }, 300) // 300ms delay for search
    } else {
      onFilterChange(newFilters)
    }
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      difficulty: '',
      search: ''
    }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(localFilters).some(value => value !== '')

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-2xl"
    >
      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Search Courses
          </label>
          <div className="relative">
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title, instructor, or keywords..."
              className="w-full px-4 py-4 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm min-h-[44px] text-base"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Category
            </label>
            <select
              value={localFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm min-h-[44px] text-base"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category === 'All Categories' ? '' : category} className="bg-gray-800 text-white">
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Difficulty
            </label>
            <select
              value={localFilters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm min-h-[44px] text-base"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty === 'All Levels' ? '' : difficulty.toLowerCase()} className="bg-gray-800 text-white">
                  {difficulty}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter Actions */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center justify-between pt-6 border-t border-white/20"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-300">Active filters:</span>
              {localFilters.category && (
                <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                  {localFilters.category}
                </span>
              )}
              {localFilters.difficulty && (
                <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">
                  {localFilters.difficulty}
                </span>
              )}
              {localFilters.search && (
                <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full">
                  "{localFilters.search}"
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 min-h-[44px] px-3 py-2 rounded-lg hover:bg-purple-500/10"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default CourseFilters
