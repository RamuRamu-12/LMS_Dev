import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import realtimeProjectsService from '../services/realtimeProjectsService';
import { usePermissions } from './usePermissions';

export const useRealtimeProjects = (filters = {}) => {
  const { hasAccess, isAdmin } = usePermissions();
  const [localFilters, setLocalFilters] = useState(filters);

  // Fetch projects with filters
  const { data, isLoading, error, refetch } = useQuery(
    ['realtime-projects', localFilters],
    () => realtimeProjectsService.getProjects(localFilters),
    {
      enabled: hasAccess('realtimeProjects') || isAdmin,
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        console.error('Error fetching projects:', error);
      }
    }
  );

  // Filter projects client-side for additional filtering
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    if (data?.success && data.data?.projects) {
      let projects = [...data.data.projects];

      // Apply additional client-side filters if needed
      if (localFilters.search) {
        const searchLower = localFilters.search.toLowerCase();
        projects = projects.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }

      setFilteredProjects(projects);
    } else {
      setFilteredProjects([]);
    }
  }, [data, localFilters.search]);

  const updateFilters = useCallback((newFilters) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setLocalFilters({
      category: 'all',
      difficulty: 'all',
      search: '',
      sort: 'name'
    });
  }, []);

  return {
    projects: filteredProjects.length > 0 ? filteredProjects : (data?.data?.projects || []),
    categories: data?.data?.categories || [],
    stats: data?.data?.stats || {},
    total: data?.data?.total || 0,
    isLoading,
    error,
    hasAccess: hasAccess('realtimeProjects') || isAdmin,
    filters: localFilters,
    updateFilters,
    clearFilters,
    refetch
  };
};

