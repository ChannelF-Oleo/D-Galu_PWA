import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "../utils/admin";

/**
 * Trigger de Firestore v2: Actualiza los Custom Claims (Auth)
 * cuando cambian el rol o permisos en el documento del usuario.
 */
export const updateUserClaims = onDocumentUpdated(
  {
    document: "users/{userId}",
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (event) => {
    // Validación de existencia de datos
    if (!event.data) {
      logger.error("No data associated with the event");
      return;
    }

    const before = event.data.before.data();
    const after = event.data.after.data();
    const userId = event.params.userId;

    // Si el documento fue borrado, no hacemos nada
    if (!after || !before) return;

    try {
      // Verificar si cambiaron roles o permisos
      const roleChanged = before.role !== after.role;
      const permissionsChanged = JSON.stringify(before.permissions) !== JSON.stringify(after.permissions);

      if (roleChanged || permissionsChanged) {
        const customClaims = {
          role: after.role,
          permissions: after.permissions || {},
          lastUpdated: Date.now(),
        };

        // Actualizar Auth Claims
        await auth.setCustomUserClaims(userId, customClaims);
        
        logger.info(`🔄 Custom claims updated for user ${userId}: role=${after.role}`);

        // Log de auditoría
        await db.collection("system_logs").add({
          type: "custom_claims_updated",
          userId: userId,
          oldRole: before.role,
          newRole: after.role,
          timestamp: FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      logger.error(`❌ Error updating custom claims for ${userId}:`, error);

      await db.collection("system_logs").add({
        type: "custom_claims_error",
        userId: userId,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: FieldValue.serverTimestamp(),
      });
    }
  }
);