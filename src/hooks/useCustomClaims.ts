// src/hooks/useCustomClaims.ts
// Hook personalizado para manejar custom claims - Versión TypeScript

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { refreshUserClaims } from '../services/bookingService';

interface CustomClaims {
  role?: string;
  permissions?: Record<string, boolean>;
  lastUpdated?: number;
  [key: string]: any;
}

interface UseCustomClaimsReturn {
  claims: CustomClaims | null;
  loading: boolean;
  error: string | null;
  refreshClaims: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  getUserRole: () => string | null;
  getUserPermissions: () => Record<string, boolean> | null;
  isAdmin: () => boolean;
  isManagerOrAbove: () => boolean;
  isStaffOrAbove: () => boolean;
  canManageUsers: boolean;
  canEditServices: boolean;
  canManageBookings: boolean;
  canManageProducts: boolean;
  canManageCourses: boolean;
}

/**
 * Custom hook to manage user custom claims
 */
export const useCustomClaims = (): UseCustomClaimsReturn => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<CustomClaims | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Extract claims from user token
  useEffect(() => {
    const extractClaims = async (): Promise<void> => {
      if (user) {
        try {
          // Get fresh token to ensure we have latest claims
          const token = await user.getIdTokenResult(true);
          setClaims(token.claims as CustomClaims);
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
  const refreshClaims = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Call Cloud Function to refresh claims
      await refreshUserClaims();
      
      // Get fresh token with updated claims
      const token = await user.getIdTokenResult(true);
      setClaims(token.claims as CustomClaims);
      
    } catch (err: any) {
      console.error('Error refreshing claims:', err);
      setError(err.message || 'Failed to refresh permissions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return claims?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(claims?.role || '');
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return claims?.permissions?.[permission] === true;
  };

  /**
   * Get user role
   */
  const getUserRole = (): string | null => {
    return claims?.role || null;
  };

  /**
   * Get all user permissions
   */
  const getUserPermissions = (): Record<string, boolean> | null => {
    return claims?.permissions || null;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => hasRole('admin');

  /**
   * Check if user is manager or above
   */
  const isManagerOrAbove = (): boolean => hasAnyRole(['admin', 'manager']);

  /**
   * Check if user is staff or above
   */
  const isStaffOrAbove = (): boolean => hasAnyRole(['admin', 'manager', 'staff']);

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