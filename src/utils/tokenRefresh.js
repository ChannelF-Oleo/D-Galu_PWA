// src/utils/tokenRefresh.js
// Utilidad para refrescar tokens cuando cambian roles/permisos

import { auth } from '../config/firebase';

/**
 * Fuerza el refresco del token del usuario actual
 * Necesario después de cambios de rol para actualizar custom claims
 */
export const forceTokenRefresh = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('No user logged in, cannot refresh token');
      return null;
    }

    // Forzar refresco del token (true = force refresh)
    const tokenResult = await user.getIdTokenResult(true);
    
    console.log('Token refreshed successfully', {
      role: tokenResult.claims.role,
      permissions: tokenResult.claims.permissions,
      lastUpdated: tokenResult.claims.lastUpdated
    });

    return tokenResult;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

/**
 * Verifica si el token necesita ser refrescado
 * basado en la última actualización de claims
 */
export const shouldRefreshToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const tokenResult = await user.getIdTokenResult(false); // No forzar refresco
    const lastUpdated = tokenResult.claims.lastUpdated;
    
    if (!lastUpdated) return true; // Si no hay timestamp, refrescar
    
    // Si el token tiene más de 5 minutos, considerar refresco
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return lastUpdated < fiveMinutesAgo;
  } catch (error) {
    console.error('Error checking token freshness:', error);
    return true; // En caso de error, refrescar por seguridad
  }
};

/**
 * Hook para refrescar token automáticamente cuando sea necesario
 */
export const useTokenRefresh = () => {
  const refreshIfNeeded = async () => {
    try {
      const needsRefresh = await shouldRefreshToken();
      if (needsRefresh) {
        await forceTokenRefresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in automatic token refresh:', error);
      return false;
    }
  };

  return { refreshIfNeeded, forceTokenRefresh };
};

/**
 * Middleware para refrescar token antes de operaciones críticas
 */
export const withTokenRefresh = (asyncFunction) => {
  return async (...args) => {
    try {
      // Refrescar token antes de la operación
      await forceTokenRefresh();
      
      // Ejecutar la función original
      return await asyncFunction(...args);
    } catch (error) {
      // Si falla el refresco, intentar la operación de todos modos
      console.warn('Token refresh failed, proceeding with operation:', error);
      return await asyncFunction(...args);
    }
  };
};