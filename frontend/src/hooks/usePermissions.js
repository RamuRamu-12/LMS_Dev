import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  console.log('usePermissions hook called');
  const { user, loading: authLoading } = useAuth();
  console.log('usePermissions - user:', user, 'authLoading:', authLoading);
  const [permissions, setPermissions] = useState({
    courses: true,
    hackathons: false,
    realtimeProjects: false
  });
  const [loading, setLoading] = useState(true);

  const fetchStudentPermissions = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch permissions from backend API
      console.log('Attempting to fetch permissions from /api/rbac/my-permissions');
      const response = await fetch('/api/rbac/my-permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        if (data.success) {
          setPermissions(data.data.permissions);
          console.log('Fetched permissions for student:', data.data.permissions);
        } else {
          throw new Error(data.message || 'Failed to fetch permissions');
        }
      } else {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`Failed to fetch permissions from server: ${response.status} ${errorText}`);
      }
      
    } catch (error) {
      console.error('Error fetching student permissions:', error);
      // Use default permissions on error - deny access to hackathons and realtime projects
      const defaultPermissions = {
        courses: true,
        hackathons: false,
        realtimeProjects: false
      };
      setPermissions(defaultPermissions);
      console.log('Using default permissions for student:', defaultPermissions);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('usePermissions useEffect triggered, user:', user, 'authLoading:', authLoading);
    
    // Wait for auth loading to complete
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }
    
    if (user && user.role === 'student') {
      console.log('User is a student, fetching permissions...');
      fetchStudentPermissions();
    } else if (user && user.role === 'admin') {
      console.log('User is an admin, setting full permissions');
      // Admins have access to everything
      setPermissions({
        courses: true,
        hackathons: true,
        realtimeProjects: true
      });
      setLoading(false);
    } else {
      console.log('No user or unknown role, setting loading to false');
      setLoading(false);
    }
  }, [user, authLoading, fetchStudentPermissions]);

  const hasAccess = useCallback((feature) => {
    console.log(`hasAccess called for feature: ${feature}, user role: ${user?.role}, loading: ${loading}, permissions:`, permissions);
    if (user?.role === 'admin') {
      console.log('User is admin, granting access');
      return true; // Admins always have access
    }
    if (loading) {
      console.log('Still loading permissions, denying access');
      return false; // Don't allow access while loading
    }
    const hasPermission = permissions[feature] === true;
    console.log(`Permission check result for ${feature}: ${hasPermission}`);
    return hasPermission;
  }, [permissions, user?.role, loading]);

  const checkAccess = useCallback((feature, callback) => {
    if (hasAccess(feature)) {
      callback();
    } else {
      // Show access denied message
      alert('You do not have permission to access this feature. Please contact the administrator.');
    }
  }, [hasAccess]);

  return {
    permissions,
    loading,
    hasAccess,
    checkAccess,
    isAdmin: user?.role === 'admin'
  };
};
