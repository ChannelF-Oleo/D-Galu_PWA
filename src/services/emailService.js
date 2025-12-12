// src/services/emailService.js

import { getFunctions, httpsCallable } from 'firebase/functions';
import { ErrorHandler } from '../utils/ErrorHandler';

// Configuración de Resend
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com/emails';

// Templates de email
const emailTemplates = {
  bookingConfirmation: (data) => ({
    subject: `Confirmación de Cita - D'Galú`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 28px; margin: 0;">D'Galú</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">Salón • Uñas • Spa • Masajes</p>
          </div>
          
          <h2 style="color: #1e293b; margin-bottom: 20px;">¡Hola ${data.customerName}!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Tu cita ha sido confirmada exitosamente. Aquí tienes los detalles:
          </p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Detalles de tu Cita</h3>
            <p style="margin: 8px 0;"><strong>Servicio:</strong> ${data.serviceName}</p>
            <p style="margin: 8px 0;"><strong>Fecha:</strong> ${new Date(data.date).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p style="margin: 8px 0;"><strong>Hora:</strong> ${data.time}</p>
            <p style="margin: 8px 0;"><strong>Duración:</strong> ${data.duration} minutos</p>
            <p style="margin: 8px 0;"><strong>Precio:</strong> $${data.price}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>Recordatorio:</strong> Por favor llega 10 minutos antes de tu cita.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #475569; margin-bottom: 15px;">¿Necesitas hacer cambios?</p>
            <a href="tel:+1234567890" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Llamar al Salón
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              D'Galú - Tu salón de confianza<br>
              📍 Dirección del salón • 📞 +1 (234) 567-890<br>
              💌 info@dgalu.com
            </p>
          </div>
        </div>
      </div>
    `
  }),

  bookingReminder: (data) => ({
    subject: `Recordatorio: Tu cita es mañana - D'Galú`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 28px; margin: 0;">D'Galú</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">Recordatorio de Cita</p>
          </div>
          
          <h2 style="color: #1e293b; margin-bottom: 20px;">¡Hola ${data.customerName}!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Te recordamos que tienes una cita programada para mañana:
          </p>
          
          <div style="background-color: #ddd6fe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #5b21b6; margin-top: 0;">${data.serviceName}</h3>
            <p style="margin: 8px 0; font-size: 18px;"><strong>${new Date(data.date).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</strong></p>
            <p style="margin: 8px 0; font-size: 18px;"><strong>${data.time}</strong></p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>Importante:</strong> Llega 10 minutos antes. Si necesitas cancelar o reprogramar, contáctanos con al menos 24 horas de anticipación.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:+1234567890" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Llamar al Salón
            </a>
            <a href="mailto:info@dgalu.com" style="background-color: #64748b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Enviar Email
            </a>
          </div>
        </div>
      </div>
    `
  }),

  courseEnrollment: (data) => ({
    subject: `Inscripción Confirmada - ${data.courseTitle} - D'Galú Academy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 28px; margin: 0;">D'Galú Academy</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">Educación Profesional en Belleza</p>
          </div>
          
          <h2 style="color: #1e293b; margin-bottom: 20px;">¡Felicidades ${data.studentName}!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Te has inscrito exitosamente en nuestro curso. Pronto nos pondremos en contacto contigo con los detalles de pago y el cronograma de clases.
          </p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Detalles del Curso</h3>
            <p style="margin: 8px 0;"><strong>Curso:</strong> ${data.courseTitle}</p>
            <p style="margin: 8px 0;"><strong>Instructor:</strong> ${data.instructor}</p>
            <p style="margin: 8px 0;"><strong>Duración:</strong> ${data.duration}</p>
            <p style="margin: 8px 0;"><strong>Precio:</strong> $${data.price}</p>
            <p style="margin: 8px 0;"><strong>Fecha de inicio:</strong> ${new Date(data.startDate).toLocaleDateString('es-ES')}</p>
          </div>
          
          <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #166534;">
              <strong>Próximos pasos:</strong> Te contactaremos en las próximas 24 horas para coordinar el pago y enviarte el material del curso.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #475569; margin-bottom: 15px;">¿Tienes preguntas?</p>
            <a href="mailto:academy@dgalu.com" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Contactar Academy
            </a>
          </div>
        </div>
      </div>
    `
  })
};

// Servicio de email con Resend
export const emailService = {
  // Función base para enviar emails con Resend
  sendEmail: async (emailData) => {
    try {
      if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured, email will be simulated');
        return { success: true, messageId: 'simulated-' + Date.now() };
      }

      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'D\'Galú <noreply@dgalu.com>',
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Email sent successfully via Resend:', result);
      return { success: true, messageId: result.id };

    } catch (error) {
      console.error('Error sending email via Resend:', error);
      
      // Fallback: simular envío exitoso en desarrollo
      if (import.meta.env.DEV) {
        console.log('Development mode: simulating email send');
        return { success: true, messageId: 'dev-simulated-' + Date.now() };
      }
      
      throw error;
    }
  },

  // Enviar email de confirmación de reserva
  sendBookingConfirmation: async (bookingData) => {
    try {
      console.log('Sending booking confirmation email to:', bookingData.customerEmail);
      
      if (!bookingData.customerEmail || !bookingData.customerName) {
        throw new Error('Email y nombre del cliente son requeridos');
      }

      const template = emailTemplates.bookingConfirmation(bookingData);
      
      const result = await emailService.sendEmail({
        to: bookingData.customerEmail,
        subject: template.subject,
        html: template.html,
      });
      
      console.log('Booking confirmation email sent successfully');
      return result;
      
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      const errorState = ErrorHandler.handle(error, 'sendBookingConfirmation');
      throw errorState;
    }
  },

  // Enviar recordatorio de cita
  sendBookingReminder: async (bookingData) => {
    try {
      console.log('Sending booking reminder email to:', bookingData.customerEmail);
      
      const template = emailTemplates.bookingReminder(bookingData);
      
      const result = await emailService.sendEmail({
        to: bookingData.customerEmail,
        subject: template.subject,
        html: template.html,
      });

      console.log('Booking reminder email sent successfully');
      return result;
      
    } catch (error) {
      console.error('Error sending booking reminder email:', error);
      return { success: false, error: error.message };
    }
  },

  // Enviar confirmación de inscripción a curso
  sendCourseEnrollmentConfirmation: async (enrollmentData) => {
    try {
      console.log('Sending course enrollment confirmation to:', enrollmentData.userEmail);
      
      const template = emailTemplates.courseEnrollment(enrollmentData);
      
      const result = await emailService.sendEmail({
        to: enrollmentData.userEmail,
        subject: template.subject,
        html: template.html,
      });

      console.log('Course enrollment confirmation sent successfully');
      return result;
      
    } catch (error) {
      console.error('Error sending course enrollment confirmation:', error);
      return { success: false, error: error.message };
    }
  },

  // Notificar cancelación
  sendBookingCancellation: async (bookingData) => {
    try {
      console.log('Sending booking cancellation email to:', bookingData.customerEmail);
      
      const result = await emailService.sendEmail({
        to: bookingData.customerEmail,
        subject: `Cancelación de Cita - D'Galú`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Cita Cancelada</h2>
            <p>Hola ${bookingData.customerName},</p>
            <p>Tu cita del ${new Date(bookingData.date).toLocaleDateString()} a las ${bookingData.time} ha sido cancelada.</p>
            <p>Si deseas reprogramar, no dudes en contactarnos.</p>
            <p>Saludos,<br>Equipo D'Galú</p>
          </div>
        `,
      });

      return result;
    } catch (error) {
      console.error('Error sending booking cancellation email:', error);
      return { success: false, error: error.message };
    }
  },

  // Notificar a administradores sobre nueva reserva
  notifyAdminsNewBooking: async (bookingData) => {
    try {
      console.log('Notifying admins about new booking:', bookingData.id);
      
      const adminEmails = ['admin@dgalu.com', 'manager@dgalu.com'];
      
      const result = await emailService.sendEmail({
        to: adminEmails,
        subject: `Nueva Reserva Recibida - D'Galú`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Nueva Reserva Recibida</h2>
            <p><strong>Cliente:</strong> ${bookingData.customerName}</p>
            <p><strong>Email:</strong> ${bookingData.customerEmail}</p>
            <p><strong>Servicio:</strong> ${bookingData.serviceName}</p>
            <p><strong>Fecha:</strong> ${new Date(bookingData.date).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${bookingData.time}</p>
            <p><strong>Teléfono:</strong> ${bookingData.phone || 'No proporcionado'}</p>
          </div>
        `,
      });

      return result;
    } catch (error) {
      console.error('Error notifying admins about new booking:', error);
      return { success: false, error: error.message };
    }
  },

  // Crear reserva con envío automático de email (mantener compatibilidad)
  createBookingWithEmail: async (bookingData) => {
    try {
      console.log('Creating booking with email notification');
      
      // Si hay Cloud Functions configuradas, usar esas
      if (typeof getFunctions !== 'undefined') {
        const functions = getFunctions();
        const createBooking = httpsCallable(functions, 'createBooking');
        const result = await createBooking(bookingData);
        return result.data;
      }
      
      // Fallback: solo enviar email de confirmación
      await emailService.sendBookingConfirmation(bookingData);
      return { success: true, bookingId: 'local-' + Date.now() };
      
    } catch (error) {
      console.error('Error creating booking with email:', error);
      const errorState = ErrorHandler.handle(error, 'createBookingWithEmail');
      throw errorState;
    }
  }
};

export default emailService;