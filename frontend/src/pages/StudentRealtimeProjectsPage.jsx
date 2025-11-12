import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProjectGrid from '../components/projects/ProjectGrid';
import ProjectFilters from '../components/projects/ProjectFilters';
import AccessDenied from '../components/common/AccessDenied';
import { useRealtimeProjects } from '../hooks/useRealtimeProjects';

const StudentRealtimeProjectsPage = () => {
  const { 
    projects, 
    categories, 
    stats, 
    total, 
    isLoading, 
    error, 
    hasAccess,
    filters,
    updateFilters,
    clearFilters
  } = useRealtimeProjects();

  // Show access denied if no permission
  if (!hasAccess && !isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
          <AccessDenied 
            feature="realtimeProjects"
            onContactAdmin={() => {
              window.location.href = 'mailto:admin@gnanamai.com?subject=Request for Realtime Projects Access&body=Hello, I would like to request access to realtime projects.';
            }}
          />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Realtime Projects
          </h1>
          <p className="text-gray-600">
            Build real-world projects and learn by doing. {total > 0 && `${total} project${total !== 1 ? 's' : ''} available`}
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error.message || 'Failed to load projects. Please try again later.'}
          </div>
        )}

        {/* Filters */}
        {categories && categories.length > 0 && (
          <ProjectFilters
            filters={filters}
            categories={categories}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
          />
        )}

        {/* Projects Grid */}
        <ProjectGrid projects={projects} isLoading={isLoading} />

        {/* Empty State (when no projects after filtering) */}
        {!isLoading && projects.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Projects Found</h3>
            <p className="text-gray-500">
              {filters.category !== 'all' || filters.difficulty !== 'all' || filters.search
                ? 'Try adjusting your filters to see more projects.'
                : 'No projects are available at the moment.'}
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default StudentRealtimeProjectsPage;

