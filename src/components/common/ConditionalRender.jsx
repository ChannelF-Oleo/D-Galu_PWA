// src/components/common/ConditionalRender.jsx

import React from "react";
import { usePermissions } from "../../hooks/usePermissions";

/**
 * Componente para renderizar condicionalmente basado en permisos
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene permisos
 * @param {string|string[]} props.permission - Permiso(s) requerido(s)
 * @param {string|string[]} props.role - Rol(es) requerido(s)
 * @param {string} props.action - Acción específica a verificar
 * @param {string} props.section - Sección específica a verificar
 * @param {React.ReactNode} props.fallback - Contenido alternativo si no tiene permisos
 * @param {boolean} props.requireAll - Si requiere todos los permisos (default: true)
 */
const ConditionalRender = ({
  children,
  permission = null,
  role = null,
  action = null,
  section = null,
  fallback = null,
  requireAll = true
}) => {
  const {
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
    canPerformAction,
    canAccessSection
  } = usePermissions();

  let hasAccess = true;

  // Verificar permisos específicos
  if (permission) {
    if (Array.isArray(permission)) {
      hasAccess = requireAll 
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission);
    } else {
      hasAccess = hasPermission(permission);
    }
  }

  // Verificar roles
  if (role && hasAccess) {
    if (Array.isArray(role)) {
      hasAccess = hasAnyRole(role);
    } else {
      hasAccess = hasRole(role);
    }
  }

  // Verificar acción específica
  if (action && hasAccess) {
    hasAccess = canPerformAction(action);
  }

  // Verificar sección específica
  if (section && hasAccess) {
    hasAccess = canAccessSection(section);
  }

  return hasAccess ? children : fallback;
};

/**
 * Componente específico para mostrar/ocultar elementos del admin
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <ConditionalRender role="admin" fallback={fallback}>
    {children}
  </ConditionalRender>
);

/**
 * Componente para mostrar elementos solo a staff (admin, manager, staff)
 */
export const StaffOnly = ({ children, fallback = null }) => (
  <ConditionalRender role={['admin', 'manager', 'staff']} fallback={fallback}>
    {children}
  </ConditionalRender>
);

/**
 * Componente para mostrar elementos solo a managers y admins
 */
export const ManagerOnly = ({ children, fallback = null }) => (
  <ConditionalRender role={['admin', 'manager']} fallback={fallback}>
    {children}
  </ConditionalRender>
);

/**
 * Componente para mostrar elementos solo a customers
 */
export const CustomerOnly = ({ children, fallback = null }) => (
  <ConditionalRender role="customer" fallback={fallback}>
    {children}
  </ConditionalRender>
);

/**
 * Componente para mostrar elementos basado en acciones específicas
 */
export const ActionGuard = ({ action, children, fallback = null }) => (
  <ConditionalRender action={action} fallback={fallback}>
    {children}
  </ConditionalRender>
);

/**
 * Componente para mostrar elementos basado en secciones específicas
 */
export const SectionGuard = ({ section, children, fallback = null }) => (
  <ConditionalRender section={section} fallback={fallback}>
    {children}
  </ConditionalRender>
);

export default ConditionalRender;