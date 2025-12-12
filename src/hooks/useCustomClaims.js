// src/hooks/useCustomClaims.js

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { refreshUserClaims } from '../services/bookingService';

/**
 * Custom hook to manage user custom claims
 * @returns {Object} - Claims data and utilities
 */
export const useCustomClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract claims from user token
  useEffect(() => {
    const extractClaims = async () => {
      if (user) {
        try {
          // Get fresh token to ensure we have latest claims
          const token = await user.getIdTokenResult(true);
          setClaims(token.claims);
        } catch (err) {
          console.error('Error extracting claims:', err);
          setError('Failed to load user permissions');
        }
      } else {
        setClaims(null);
      }
    };

    extractClaims();
  }, [user]);

  /**
   * Manually refresh user claims
   */
  const refreshClaims = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Call Cloud Function to refresh claims
      await refreshUserClaims();
      
      // Get fresh token with updated claims
      const token = await user.getIdTokenResult(true);
      setClaims(token.claims);
      
    } catch (err) {
      console.error('Error refreshing claims:', err);
      setError(err.message || 'Failed to refresh permissions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return claims?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Array of roles to check
   * @returns {boolean}
   */
  const hasAnyRole = (roles) => {
    return roles.includes(claims?.role);
  };

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    return claims?.permissions?.[permission] === true;
  };

  /**
   * Get user role
   * @returns {string|null}
   */
  const getUserRole = () => {
    return claims?.role || null;
  };

  /**
   * Get all user permissions
   * @returns {Object|null}
   */
  const getUserPermissions = () => {
    return claims?.permissions || null;
  };

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isAdmin = () => hasRole('admin');

  /**
   * Check if user is manager or above
   * @returns {boolean}
   */
  const isManagerOrAbove = () => hasAnyRole(['admin', 'manager']);

  /**
   * Check if user is staff or above
   * @returns {boolean}
   */
  const isStaffOrAbove = () => hasAnyRole(['admin', 'manager', 'staff']);

  return {
    claims,
    loading,
    error,
    refreshClaims,
    hasRole,
    hasAnyRole,
    hasPermission,
    getUserRole,
    getUserPermissions,
    isAdmin,
    isManagerOrAbove,
    isStaffOrAbove,
    // Convenience flags
    canManageUsers: hasPermission('canManageUsers'),
    canEditServices: hasPermission('canEditServices'),
    canManageBookings: hasPermission('canManageBookings'),
    canManageProducts: hasPermission('canManageProducts'),
    canManageCourses: hasPermission('canManageCourses')
  };
};