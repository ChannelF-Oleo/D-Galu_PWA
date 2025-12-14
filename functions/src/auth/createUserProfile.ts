import { beforeUserCreated } from "firebase-functions/v2/identity";
import * as logger from "firebase-functions/logger";
import { FieldValue } from "firebase-admin/firestore";
import { db, auth } from "../utils/admin";

/**
 * Trigger de Auth V2 (Blocking): Crea el perfil de usuario en Firestore
 * cuando se registra un nuevo usuario en Authentication.
 */
export const createUserProfile = beforeUserCreated(
  {
    region: "us-central1",
  },
  async (event) => {
    const user = event.data;
    
    try {
      const userProfile = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        role: "customer",
        permissions: {
          canBook: true,
          canViewBookings: true,
          canCancelBookings: true,
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        isActive: true,
        preferences: {
          notifications: {
            email: true,
            sms: false,
            reminders: true,
          },
          language: "es",
        },
      };

      // 1. Crear perfil en Firestore
      await db.collection("users").doc(user.uid).set(userProfile);

      // 2. Establecer Custom Claims iniciales
      await auth.setCustomUserClaims(user.uid, {
        role: "customer",
        permissions: userProfile.permissions,
      });

      logger.info(`✅ User profile created for ${user.email} (${user.uid})`);

      // Retornar para permitir la creación del usuario
      return;

    } catch (error) {
      logger.error("❌ Error creating user profile:", error);

      // Log de error
      await db.collection("system_logs").add({
        type: "user_creation_error",
        uid: user.uid,
        email: user.email,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: FieldValue.serverTimestamp(),
      });
      
      // Permitir la creación del usuario aunque falle el perfil
      return;
    }
  }
);
