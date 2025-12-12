// src/hooks/useUserPermissions.js
// Hook especializado para manejar permisos y roles

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCustomClaims } from './useCustomClaims';
import { ROLES, hasPermission } from '../utils/rolePermissions';

export const useUserPermissions = () => {
  const { user } = useAuth();
  const { claims, refreshClaims, loading: claimsLoading } = useCustomClaims();

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return claims?.role === role || user?.role === role;
  };

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   * @param {string[]} roles - Array de roles a verificar
   * @returns {boolean}
   */
  const hasAnyRole = (roles) => {
    const userRole = claims?.role || user?.role;
    return roles.includes(userRole);
  };

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string} permission - Permiso a verificar
   * @returns {boolean}
   */
  const hasUserPermission = (permission) => {
    // Primero verificar en custom claims (más actualizado)
    if (claims?.permissions?.[permission] !== undefined) {
      return claims.permissions[permission];
    }
    
    // Fallback a datos del usuario
    if (user?.permissions?.[permission] !== undefined) {
      return user.permissions[permission];
    }
    
    // Fallback a verificación por rol
    const userRole = claims?.role || user?.role;
    return hasPermission(userRole, permission);
  };

  /**
   * Obtener el rol actual del usuario
   * @returns {string}
   */
  const getCurrentRole = () => {
    return claims?.role || user?.role || 'customer';
  };

  /**
   * Obtener todos los permisos del usuario
   * @returns {Object}
   */
  const getAllPermissions = () => {
    return claims?.permissions || user?.permissions || {};
  };

  // Roles específicos
  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isManager = () => hasRole(ROLES.MANAGER);
  const isStaff = () => hasRole(ROLES.STAFF);
  const isCustomer = () => hasRole(ROLES.CUSTOMER);
  const isStudent = () => hasRole(ROLES.STUDENT);

  // Grupos de roles
  const isManagerOrAbove = () => hasAnyRole([ROLES.ADMIN, ROLES.MANAGER]);
  const isStaffOrAbove = () => hasAnyRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]);

  // Permisos específicos comunes
  const canManageUsers = () => hasUserPermission('canManageUsers');
  const canEditServices = () => hasUserPermission('canEditServices');
  const canManageBookings = () => hasUserPermission('canManageBookings');
  const canManageProducts = () => hasUserPermission('canManageProducts');
  const canManageCourses = () => hasUserPermission('canManageCourses');
  const canViewReports = () => hasUserPermission('canViewReports');
  const canManageInventory = () => hasUserPermission('canManageInventory');

  return {
    // Estado
    loading: claimsLoading,
    
    // Métodos de verificación
    hasRole,
    hasAnyRole,
    hasPermission: hasUserPermission,
    
    // Datos
    currentRole: getCurrentRole(),
    allPermissions: getAllPermissions(),
    
    // Roles específicos
    isAdmin,
    isManager,
    isStaff,
    isCustomer,
    isStudent,
    
    // Grupos de roles
    isManagerOrAbove,
    isStaffOrAbove,
    
    // Permisos específicos
    canManageUsers,
    canEditServices,
    canManageBookings,
    canManageProducts,
    canManageCourses,
    canViewReports,
    canManageInventory,
    
    // Utilidades
    refreshPermissions: refreshClaims,
    
    // Información de debugging
    debugInfo: {
      userRole: user?.role,
      claimsRole: claims?.role,
      userPermissions: user?.permissions,
      claimsPermissions: claims?.permissions
    }
  };
};