import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { projectService } from '../services/projectService';
import toast from 'react-hot-toast';

const AdminProjectManagementPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Use React Query to fetch projects
  const { data: projectsData, isLoading: loading, error } = useQuery(
    'admin-projects',
    () => projectService.getProjects(),
    {
      refetchOnWindowFocus: false,
      retry: 3
    }
  );

  // Seed projects mutation
  const seedProjectsMutation = useMutation(
    () => projectService.seedProjects(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-projects');
        toast.success('Projects seeded successfully!');
      },
      onError: (error) => {
        toast.error(`Failed to seed projects: ${error.message}`);
      }
    }
  );

  const projects = projectsData?.data?.projects || projectsData?.data || [];

  const handleProjectSelect = (project) => {
    navigate(`/admin/projects/${project.id}`);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Management</h1>
              <p className="text-gray-600">Manage projects and upload downloadable documents</p>
            </div>
            {projects.length === 0 && (
              <button
                onClick={() => seedProjectsMutation.mutate()}
                disabled={seedProjectsMutation.isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {seedProjectsMutation.isLoading ? 'Seeding...' : 'Seed Projects'}
              </button>
            )}
          </div>
        </div>


        {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No projects found. Please check:</p>
                <ul className="text-sm text-gray-400 mt-2">
                  <li>1. Backend server is running (npm start in backend folder)</li>
                  <li>2. Database is seeded with projects</li>
                  <li>3. Check browser console for errors</li>
                </ul>
              </div>
            ) : (
              projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="capitalize">{project.difficulty}</span>
                    <span>{project.estimatedDuration}h</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies?.slice(0, 3).map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                    {project.technologies?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleProjectSelect(project)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Manage
                  </button>
                </div>
              </motion.div>
              ))
            )}
          </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminProjectManagementPage;
