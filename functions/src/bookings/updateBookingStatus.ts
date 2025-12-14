import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { getResendClient, resendApiKey } from "../utils/resend";
import { getBookingStatusUpdateTemplate } from "../utils/emailTemplates";

/**
 * Trigger Firestore v2: Detecta cambios de estado en una reserva
 * y notifica al cliente por email.
 */
export const updateBookingStatus = onDocumentUpdated(
  {
    document: "bookings/{bookingId}",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 60,
    secrets: [resendApiKey],
  },
  async (event) => {
    if (!event.data) return;

    const before = event.data.before.data();
    const after = event.data.after.data();

    // Si no hay datos o el estado no cambió, salir
    if (!before || !after || before.status === after.status) {
      return;
    }

    logger.info(`🔄 Status changed for booking ${event.params.bookingId}: ${before.status} -> ${after.status}`);

    try {
      const resend = getResendClient();
      const emailTemplate = getBookingStatusUpdateTemplate(after, after.status);

      await resend.emails.send({
        from: "D'Galú Salón <noreply@dgalu.com>",
        to: [after.customerEmail],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      logger.info(`📧 Status update email sent to ${after.customerEmail}`);

    } catch (error) {
      logger.error("❌ Error sending status update email:", error);
      // No lanzamos error para evitar reintentos infinitos en triggers de Firestore
      // a menos que configuremos política de reintentos con 'retry: true'
    }
  }
);