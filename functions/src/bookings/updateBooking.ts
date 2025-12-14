import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../utils/admin";
import { UpdateBookingSchema } from "../utils/zodSchemas";

/**
 * Función Callable v2: Actualiza una reserva existente.
 * - Requiere autenticación y rol específico (admin, manager, staff).
 */
export const updateBooking = onCall(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 30,
  },
  async (request) => {
    // 1. Validar Autenticación
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
      // 2. Validar Input
      const validatedData = UpdateBookingSchema.parse(request.data);
      const { bookingId, ...updateFields } = validatedData;

      // 3. Validar Permisos (RBAC)
      const userRole = request.auth.token.role || "customer";
      const allowedRoles = ["admin", "manager", "staff"];

      // Permitir que el usuario cancele su propia reserva podría ser una regla adicional aquí
      // pero seguimos la lógica original estricta para actualizaciones generales.
      if (!allowedRoles.includes(userRole)) {
        throw new HttpsError("permission-denied", "Insufficient permissions to update bookings");
      }

      // 4. Verificar existencia
      const bookingRef = db.collection("bookings").doc(bookingId);
      const bookingDoc = await bookingRef.get();

      if (!bookingDoc.exists) {
        throw new HttpsError("not-found", "Booking not found");
      }

      // 5. Actualizar
      const updateData = {
        ...updateFields,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: request.auth.uid,
      };

      await bookingRef.update(updateData);

      logger.info(`🔄 Booking ${bookingId} updated by ${request.auth.uid}`);

      // 6. Log de Auditoría
      await db.collection("system_logs").add({
        type: "booking_updated",
        bookingId: bookingId,
        updatedBy: request.auth.uid,
        userRole: userRole,
        changes: updateFields,
        timestamp: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "Booking updated successfully",
        bookingId: bookingId,
      };

    } catch (error) {
      logger.error("❌ Error updating booking:", error);

      if (error instanceof z.ZodError) {
        throw new HttpsError("invalid-argument", "Validation failed", error.errors);
      }

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to update booking");
    }
  }
);