// src/components/common/ProtectedRoute.jsx

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { AlertTriangle, Lock } from "lucide-react";

/**
 * Componente para proteger rutas basado en autenticación y permisos
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si tiene permisos
 * @param {string|string[]} props.requiredPermission - Permiso(s) requerido(s) para acceder
 * @param {string[]} props.allowedRoles - Roles permitidos para acceder
 * @param {string} props.redirectTo - Ruta de redirección si no tiene permisos
 * @param {boolean} props.requireAuth - Si requiere autenticación (default: true)
 */
const ProtectedRoute = ({ 
  children, 
  requiredPermission = null,
  allowedRoles = null,
  redirectTo = "/login",
  requireAuth = true
}) => {
  const { user, loading, checkPermission } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner fullScreen text="Verificando permisos..." />;
  }

  // Si requiere autenticación y no hay usuario, redirigir al login
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si no requiere autenticación, renderizar directamente
  if (!requireAuth) {
    return children;
  }

  // Verificar roles permitidos
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.role || !allowedRoles.includes(user.role)) {
      return <UnauthorizedAccess />;
    }
  }

  // Verificar permisos específicos
  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission) 
      ? requiredPermission 
      : [requiredPermission];
    
    const hasAllPermissions = permissions.every(permission => 
      checkPermission(permission)
    );

    if (!hasAllPermissions) {
      return <UnauthorizedAccess />;
    }
  }

  // Si pasa todas las validaciones, renderizar el componente
  return children;
};

/**
 * Componente para mostrar cuando el usuario no tiene permisos
 */
const UnauthorizedAccess = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-red-600" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Acceso Denegado
        </h2>
        
        <p className="text-gray-600 mb-4">
          No tienes permisos para acceder a esta página.
        </p>

        {user && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Usuario:</strong> {user.email}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Rol actual:</strong> {user.role || 'Sin rol asignado'}
            </p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
            <p className="text-yellow-800 text-sm">
              Si crees que esto es un error, contacta al administrador del sistema.
            </p>
          </div>
        </div>

        <button
          onClick={() => window.history.back()}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Volver atrás
        </button>
      </div>
    </div>
  );
};

/**
 * Hook personalizado para verificar permisos en componentes
 */
export const usePermissions = () => {
  const { user, checkPermission } = useAuth();

  const hasPermission = (permission) => {
    return checkPermission(permission);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  return {
    user,
    hasPermission,
    hasRole,
    hasAnyRole,
    isAdmin: () => hasRole('admin'),
    isManager: () => hasRole('manager'),
    isStaff: () => hasRole('staff'),
    isCustomer: () => hasRole('customer'),
    isStudent: () => hasRole('student')
  };
};

export default ProtectedRoute;