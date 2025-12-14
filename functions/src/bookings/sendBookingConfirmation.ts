import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../utils/admin";
import { getResendClient, resendApiKey } from "../utils/resend";
import { getBookingConfirmationTemplate } from "../utils/emailTemplates";

/**
 * Función Callable v2: Envía manualmente el email de confirmación.
 * Útil para reintentos o administración.
 */
export const sendBookingConfirmation = onCall(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 30,
    secrets: [resendApiKey],
  },
  async (request) => {
    // 1. Validar Autenticación
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { bookingData } = request.data;

    // 2. Validar Datos
    if (!bookingData || !bookingData.customerEmail) {
      throw new HttpsError("invalid-argument", "Booking data and customer email are required");
    }

    try {
      // 3. Obtener Cliente de Email
      const resend = getResendClient();
      const emailTemplate = getBookingConfirmationTemplate(bookingData);

      // 4. Enviar Email
      await resend.emails.send({
        from: "D'Galú Salón <noreply@dgalu.com>",
        to: [bookingData.customerEmail],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      logger.info(`📧 Manual confirmation sent to ${bookingData.customerEmail} for booking ${bookingData.id}`);

      // 5. Log de Auditoría
      await db.collection("email_logs").add({
        type: "booking_confirmation_manual",
        to: bookingData.customerEmail,
        bookingId: bookingData.id || "unknown",
        triggeredBy: request.auth.uid,
        sentAt: FieldValue.serverTimestamp(),
        status: "sent",
      });

      return { success: true, message: "Email sent successfully" };

    } catch (error: any) {
      logger.error("❌ Error sending booking confirmation:", error);

      // Log de Error
      await db.collection("email_logs").add({
        type: "booking_confirmation_error",
        error: error.message || "Unknown error",
        bookingData: bookingData,
        timestamp: FieldValue.serverTimestamp(),
      });

      throw new HttpsError("internal", "Failed to send confirmation email");
    }
  }
);