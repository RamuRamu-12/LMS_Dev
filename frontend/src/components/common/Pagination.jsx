import { motion } from 'framer-motion'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  className = "" 
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1 || totalItems === 0) return null

  const getVisiblePages = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 ${className}`}
    >
      {/* Results info */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div className="text-gray-300 mb-4 sm:mb-0">
          <span className="font-medium">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} courses
          </span>
        </div>
        
        {/* Page size info */}
        <div className="text-sm text-gray-400">
          {itemsPerPage} courses per page
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 sm:px-4 py-3 rounded-xl font-medium transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center ${
            currentPage === 1
              ? 'bg-white/5 text-gray-500 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-2 sm:px-3 py-2 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-3 sm:px-4 py-3 rounded-xl font-medium transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    page === currentPage
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95'
                  }`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 sm:px-4 py-3 rounded-xl font-medium transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center ${
            currentPage === totalPages
              ? 'bg-white/5 text-gray-500 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Quick jump to page */}
      {totalPages > 10 && (
        <div className="mt-6 flex items-center justify-center space-x-3">
          <span className="text-gray-300 text-sm">Go to page:</span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              className="w-20 px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] text-base"
              placeholder="Page"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt(e.target.value)
                  if (page >= 1 && page <= totalPages) {
                    onPageChange(page)
                    e.target.value = ''
                  }
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling
                const page = parseInt(input.value)
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page)
                  input.value = ''
                }
              }}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 min-h-[44px]"
            >
              Go
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Pagination
