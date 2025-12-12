// src/hooks/usePermissions.js

import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../utils/rolePermissions";

/**
 * Hook personalizado para manejar permisos de usuario
 * Proporciona funciones útiles para verificar permisos en componentes
 */
export const usePermissions = () => {
  const { user, checkPermission } = useAuth();

  // Verificar si el usuario tiene un permiso específico
  const hasUserPermission = (permission) => {
    if (!user || !user.role) return false;
    return checkPermission(permission);
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Verificar si el usuario tiene alguno de los roles especificados
  const hasAnyRole = (roles) => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  // Verificar múltiples permisos (debe tener todos)
  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return hasUserPermission(permissions);
    return permissions.every(permission => hasUserPermission(permission));
  };

  // Verificar múltiples permisos (debe tener al menos uno)
  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return hasUserPermission(permissions);
    return permissions.some(permission => hasUserPermission(permission));
  };

  // Funciones de conveniencia para roles específicos
  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole('manager');
  const isStaff = () => hasRole('staff');
  const isCustomer = () => hasRole('customer');
  const isStudent = () => hasRole('student');

  // Verificar si puede acceder a una sección específica
  const canAccessSection = (section) => {
    const sectionPermissions = {
      dashboard: ['admin', 'manager', 'staff'],
      users: ['admin'],
      services: ['admin', 'manager'],
      products: ['admin', 'manager'],
      bookings: ['admin', 'manager', 'staff'],
      academy: ['admin'],
      reports: ['admin', 'manager']
    };

    const allowedRoles = sectionPermissions[section];
    return allowedRoles ? hasAnyRole(allowedRoles) : false;
  };

  // Verificar permisos específicos de acciones
  const canPerformAction = (action) => {
    const actionPermissions = {
      // Usuarios
      createUser: 'canManageUsers',
      editUser: 'canManageUsers',
      deleteUser: 'canManageUsers',
      
      // Servicios
      createService: 'canEditServices',
      editService: 'canEditServices',
      deleteService: 'canDeleteServices',
      
      // Productos
      createProduct: 'canManageProducts',
      editProduct: 'canManageProducts',
      deleteProduct: 'canManageProducts',
      manageInventory: 'canManageInventory',
      
      // Reservas
      createBooking: 'canManageBookings',
      editBooking: 'canManageBookings',
      cancelBooking: 'canManageBookings',
      
      // Cursos
      createCourse: 'canManageCourses',
      editCourse: 'canManageCourses',
      deleteCourse: 'canManageCourses',
      
      // Finanzas
      viewFinancials: 'canViewFinancials',
      viewReports: 'canViewAllStats'
    };

    const requiredPermission = actionPermissions[action];
    return requiredPermission ? hasUserPermission(requiredPermission) : false;
  };

  return {
    user,
    hasPermission: hasUserPermission,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isManager,
    isStaff,
    isCustomer,
    isStudent,
    canAccessSection,
    canPerformAction,
    
    // Información del usuario
    userRole: user?.role,
    userName: user?.displayName || user?.email,
    isAuthenticated: !!user
  };
};

export default usePermissions;