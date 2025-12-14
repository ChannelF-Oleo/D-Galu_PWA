import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../utils/admin";
import { getResendClient, resendApiKey } from "../utils/resend";
import { BookingSchema } from "../utils/zodSchemas";
import { getBookingConfirmationTemplate } from "../utils/emailTemplates";

/**
 * Función Callable v2: Crea una nueva reserva.
 * - Valida input con Zod.
 * - Verifica disponibilidad y precios reales en BD.
 * - Envía email de confirmación.
 */
export const createBooking = onCall(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60,
    secrets: [resendApiKey],
    maxInstances: 20,
  },
  async (request) => {
    try {
      // 1. Validar Schema con Zod
      const validatedData = BookingSchema.parse(request.data);

      // 2. Validaciones de Negocio (Fechas)
      const bookingDate = new Date(validatedData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (bookingDate < today) {
        throw new HttpsError(
          "invalid-argument",
          "Cannot book appointments in the past"
        );
      }

      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      if (bookingDate > maxDate) {
        throw new HttpsError(
          "invalid-argument",
          "Cannot book appointments more than 6 months in advance"
        );
      }

      // 3. Validación de Servicios y Cálculo de Precios (Anti-Fraude)
      const validatedServices = [];
      let calculatedDuration = 0;
      let calculatedPrice = 0;

      for (const service of validatedData.services) {
        // Obtener datos reales de Firestore
        const serviceDoc = await db
          .collection("services")
          .doc(service.serviceId)
          .get();

        if (!serviceDoc.exists) {
          throw new HttpsError(
            "not-found",
            `Service ${service.serviceId} not found`
          );
        }

        const serviceData = serviceDoc.data();

        if (!serviceData?.active) {
          throw new HttpsError(
            "failed-precondition",
            `Service ${service.serviceName} is not available`
          );
        }

        // Parsear precio (Maneja "$50.00" string o 50 number)
        const priceString = String(serviceData.price || "0");
        const realPrice = parseFloat(priceString.replace("$", ""));
        const realDuration = Number(serviceData.duration);

        // Lógica de Subservicios
        let subservicePrice = 0;
        let subserviceDuration = 0;

        if (service.subserviceId && serviceData.subservices) {
          const subservice = serviceData.subservices.find(
            (sub: any) => sub.id === service.subserviceId
          );

          if (!subservice) {
            throw new HttpsError(
              "not-found",
              `Subservice ${service.subserviceId} not found`
            );
          }
          if (!subservice.active) {
            throw new HttpsError(
              "failed-precondition",
              `Subservice ${service.subserviceName} is not available`
            );
          }

          const subPriceString = String(subservice.price || "0");
          subservicePrice = parseFloat(subPriceString.replace("$", ""));
          subserviceDuration = Number(subservice.duration) || 0;
        }

        const totalServicePrice = realPrice + subservicePrice;
        const totalServiceDuration = realDuration + subserviceDuration;

        validatedServices.push({
          serviceId: service.serviceId,
          serviceName: serviceData.name,
          subserviceId: service.subserviceId || null,
          subserviceName: service.subserviceName || null,
          duration: totalServiceDuration,
          price: `$${totalServicePrice.toFixed(2)}`,
          realPrice: totalServicePrice,
        });

        calculatedDuration += totalServiceDuration;
        calculatedPrice += totalServicePrice;
      }

      // 4. Preparar Objeto Final
      const bookingData = {
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone || null,
        date: validatedData.date,
        time: validatedData.time,
        services: validatedServices,
        totalDuration: calculatedDuration,
        totalPrice: `$${calculatedPrice.toFixed(2)}`,
        notes: validatedData.notes || null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        status: "pending",
        userId: request.auth?.uid || null,
      };

      // 5. Guardar en Firestore
      const bookingRef = await db.collection("bookings").add(bookingData);
      const bookingId = bookingRef.id;

      logger.info(
        `✅ Booking created: ${bookingId} for ${validatedData.customerEmail}`
      );

      // 6. Enviar Email (Asíncrono)
      try {
        const resend = getResendClient();
        const bookingWithId = { ...bookingData, id: bookingId };
        const emailTemplate = getBookingConfirmationTemplate(bookingWithId);

        await resend.emails.send({
          from: "D'Galú Salón <noreply@dgalu.com>",
          to: [validatedData.customerEmail],
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        await db.collection("email_logs").add({
          type: "booking_confirmation",
          to: validatedData.customerEmail,
          bookingId: bookingId,
          sentAt: FieldValue.serverTimestamp(),
          status: "sent",
        });
      } catch (emailError: any) {
        logger.error(`⚠️ Email failed for booking ${bookingId}:`, emailError);

        await db.collection("email_logs").add({
          type: "booking_confirmation_error",
          error: emailError.message || "Unknown error",
          bookingId: bookingId,
          timestamp: FieldValue.serverTimestamp(),
        });
      }

      return {
        success: true,
        bookingId: bookingId,
        message: "Booking created successfully",
      };
    } catch (error) {
      logger.error("❌ Error creating booking:", error);

      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new HttpsError(
          "invalid-argument",
          `Validation failed: ${messages}`
        );
      }

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to create booking");
    }
  }
);
