import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { db } from "../utils/admin"; // Tu instancia de Firestore
import { getResendClient, resendApiKey } from "../utils/resend";
import { getBookingReminderTemplate } from "../utils/emailTemplates"; // Asumimos esta ruta

/**
 * Función programada v2 para enviar recordatorios de citas.
 * Se ejecuta todos los días a las 9:00 AM hora de Rep. Dom.
 */
export const sendBookingReminders = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "America/Santo_Domingo",
    region: "us-central1",
    memory: "256MiB",
    secrets: [resendApiKey], // Inyectamos el secreto aquí
    retryCount: 3, // Reintentar si falla la ejecución completa (ej. error de red en Firestore)
  },
  async (event) => {
    logger.info("⏰ Starting booking reminders job", { timestamp: event.scheduleTime });

    // Calcular fecha de mañana "YYYY-MM-DD"
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    try {
      // 1. Obtener citas confirmadas para mañana
      const bookingsSnapshot = await db
        .collection("bookings")
        .where("date", "==", tomorrowStr)
        .where("status", "==", "confirmed")
        .get();

      if (bookingsSnapshot.empty) {
        logger.info("✅ No confirmed bookings found for tomorrow", { date: tomorrowStr });
        return;
      }

      logger.info(`Found ${bookingsSnapshot.size} bookings for ${tomorrowStr}`);

      // 2. Inicializar Resend
      const resend = getResendClient();

      // 3. Preparar promesas de envío
      const emailPromises = bookingsSnapshot.docs.map(async (doc) => {
        const booking = doc.data();
        
        // Validación básica de datos
        if (!booking.customerEmail) {
          logger.warn(`Skipping booking ${doc.id}: No email address`);
          return;
        }

        const emailTemplate = getBookingReminderTemplate(booking);

        try {
          const { data, error } = await resend.emails.send({
            from: "D'Galú Salón <noreply@dgalu.com>",
            to: [booking.customerEmail],
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
            tags: [{ name: "category", value: "reminder" }],
          });

          if (error) throw new Error(error.message);

          logger.info(`📧 Reminder sent to ${booking.customerEmail}`, { 
            bookingId: doc.id, 
            emailId: data?.id 
          });

        } catch (emailError: any) {
          logger.error(`❌ Failed to send reminder to ${booking.customerEmail}`, {
            bookingId: doc.id,
            error: emailError.message
          });
          // No lanzamos error aquí para no afectar otros correos
        }
      });

      // 4. Ejecutar todos los envíos en paralelo
      await Promise.allSettled(emailPromises);
      
      logger.info("✅ Booking reminders job completed");

    } catch (error) {
      logger.error("❌ Critical error in sendBookingReminders", error);
      // Lanzar error aquí provocará un reintento según 'retryCount'
      throw error;
    }
  }
);
