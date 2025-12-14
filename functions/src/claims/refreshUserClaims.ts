import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db, auth } from "../utils/admin";

interface RefreshClaimsData {
  userId?: string;
}

/**
 * Función Callable v2: Permite forzar la actualización de claims.
 * Útil cuando el frontend detecta inconsistencias.
 */
export const refreshUserClaims = onCall<RefreshClaimsData>(
  {
    region: "us-central1",
    memory: "128MiB",
    timeoutSeconds: 30,
    maxInstances: 10,
  },
  async (request) => {
    // 1. Validar autenticación
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Permitir que un admin refresque a otros, o el propio usuario a sí mismo
    const targetUserId = request.data.userId || request.auth.uid;
    
    // Si intenta refrescar a otro, verificar si es admin (opcional, aquí simplificado)
    // if (targetUserId !== request.auth.uid && request.auth.token.role !== 'admin') ...

    try {
      // 2. Obtener perfil actual de Firestore
      const userDoc = await db.collection("users").doc(targetUserId).get();

      if (!userDoc.exists) {
        throw new HttpsError("not-found", "User profile not found");
      }

      const userData = userDoc.data();

      // 3. Definir claims
      const customClaims = {
        role: userData?.role || "customer",
        permissions: userData?.permissions || {},
        lastUpdated: Date.now(),
      };

      // 4. Aplicar claims
      await auth.setCustomUserClaims(targetUserId, customClaims);

      logger.info(`✅ Claims refreshed manually for user ${targetUserId}`);

      return {
        success: true,
        message: "Custom claims refreshed successfully",
        claims: customClaims,
      };

    } catch (error) {
      logger.error("Error refreshing claims:", error);
      
      if (error instanceof HttpsError) throw error;
      
      throw new HttpsError("internal", "Failed to refresh custom claims");
    }
  }
);