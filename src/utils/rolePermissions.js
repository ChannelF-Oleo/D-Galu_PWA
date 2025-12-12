/**
 * Definición de Roles del Sistema
 */
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager", 
  STAFF: "staff",
  CUSTOMER: "customer",
  STUDENT: "student",
};

/**
 * 1. Configuración de Menús (Para el Sidebar)
 */
const MENU_CONFIG = [
  {
    id: "dashboard",
    label: "Panel Principal",
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
  },
  {
    id: "bookings",
    label: "Gestión de Citas",
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
  },
  {
    id: "services",
    label: "Servicios",
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: "products",
    label: "Tienda / Productos",
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    id: "academy",
    label: "Academia",
    allowedRoles: [ROLES.ADMIN, ROLES.STUDENT],
  },
  {
    id: "users",
    label: "Usuarios & Roles",
    allowedRoles: [ROLES.ADMIN],
  },
];

/**
 * 2. Configuración de Permisos Específicos (Acciones dentro de las vistas)
 */
const ACTION_PERMISSIONS = {
  // --- Permisos de Citas ---
  canManageBookings: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],

  // --- Permisos de Servicios (NUEVO) ---
  canEditServices: [ROLES.ADMIN, ROLES.MANAGER], // Crear y editar
  canDeleteServices: [ROLES.ADMIN], // Solo admin borra

  // --- Permisos de Productos (NUEVO) ---
  canManageProducts: [ROLES.ADMIN, ROLES.MANAGER], // Crear, editar, borrar productos
  canManageInventory: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF], // Ajustar stock

  // --- Permisos de Academia ---
  canManageCourses: [ROLES.ADMIN],
  canViewOwnCourses: [ROLES.STUDENT, ROLES.ADMIN],

  // --- Permisos de Finanzas y Dashboard ---
  canViewFinancials: [ROLES.ADMIN, ROLES.MANAGER],
  canViewAllStats: [ROLES.ADMIN, ROLES.MANAGER],

  // --- Permisos de Usuarios ---
  canManageUsers: [ROLES.ADMIN],
};

/**
 * Retorna los ítems de menú para el Sidebar
 */
export const getMenuItemsByRole = (role) => {
  const currentRole = role?.toLowerCase() || "guest";
  return MENU_CONFIG.filter((item) => item.allowedRoles.includes(currentRole));
};

/**
 * Verifica permisos híbridos:
 * 1. Busca si es un ID de menú
 * 2. Si no, busca si es una acción específica
 */
export const hasPermission = (role, resourceOrAction) => {
  const currentRole = role?.toLowerCase() || "guest";

  // Paso A: ¿Es un ID de menú?
  const menuItem = MENU_CONFIG.find((i) => i.id === resourceOrAction);
  if (menuItem) {
    return menuItem.allowedRoles.includes(currentRole);
  }

  // Paso B: ¿Es una acción específica?
  const allowedRolesForAction = ACTION_PERMISSIONS[resourceOrAction];
  if (allowedRolesForAction) {
    return allowedRolesForAction.includes(currentRole);
  }

  // Debugging: Ayuda a ver qué permiso falta si vuelve a pasar
  console.warn(
    `⚠️ Permiso denegado o no definido: ${resourceOrAction} para rol ${currentRole}`
  );
  return false;
};
