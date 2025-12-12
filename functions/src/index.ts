import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
// import * as cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize SendGrid
const sendGridApiKey = functions.config().sendgrid?.api_key;
if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

// Initialize CORS (for future use)
// const corsHandler = cors({ origin: true });

// Email Templates
const getBookingConfirmationTemplate = (bookingData: any) => {
  const servicesHtml = bookingData.services.map((service: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        ${service.serviceName}${service.subserviceName ? ` - ${service.subserviceName}` : ''}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        ${service.duration} min
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        $${service.price}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de Cita - D'Galú</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">D'Galú</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Salón • Uñas • Spa • Masajes</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #667eea; margin-top: 0;">¡Tu cita ha sido confirmada!</h2>
        
        <p>Hola <strong>${bookingData.customerName}</strong>,</p>
        
        <p>Nos complace confirmar tu cita en D'Galú. Aquí tienes todos los detalles:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Detalles de tu cita</h3>
          <p><strong>Fecha:</strong> ${new Date(bookingData.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
          <p><strong>Hora:</strong> ${bookingData.time}</p>
          <p><strong>Duración total:</strong> ${bookingData.totalDuration} minutos</p>
        </div>
        
        <h3>Servicios seleccionados:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Servicio</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Duración</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${servicesHtml}
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td style="padding: 12px; border-top: 2px solid #dee2e6;">Total</td>
              <td style="padding: 12px; text-align: right; border-top: 2px solid #dee2e6;">${bookingData.totalDuration} min</td>
              <td style="padding: 12px; text-align: right; border-top: 2px solid #dee2e6;">$${bookingData.totalPrice}</td>
            </tr>
          </tbody>
        </table>
        
        ${bookingData.notes ? `<p><strong>Notas:</strong> ${bookingData.notes}</p>` : ''}
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1976d2;">Información importante:</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Por favor llega 10 minutos antes de tu cita</li>
            <li>Si necesitas cancelar o reprogramar, contáctanos con al menos 24 horas de anticipación</li>
            <li>Trae una identificación válida</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <h3>¿Necesitas contactarnos?</h3>
          <p>📍 Av. Principal #123, Ensanche Ozama, Santo Domingo Este</p>
          <p>📞 +1 (809) 555-1234</p>
          <p>📧 contacto@dgalu.com</p>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <p style="margin: 0; color: #6c757d;">¡Esperamos verte pronto en D'Galú!</p>
          <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">
            Este es un email automático, por favor no respondas a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Cloud Function: Send Booking Confirmation Email
export const sendBookingConfirmation = functions.https.onCall(async (data, context) => {
  try {
    // Validate authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { bookingData } = data;

    if (!bookingData || !bookingData.customerEmail) {
      throw new functions.https.HttpsError('invalid-argument', 'Booking data and customer email are required');
    }

    // Prepare email
    const msg = {
      to: bookingData.customerEmail,
      from: {
        email: 'noreply@dgalu.com',
        name: "D'Galú Salón"
      },
      subject: `Confirmación de Cita - ${new Date(bookingData.date).toLocaleDateString('es-ES')} a las ${bookingData.time}`,
      html: getBookingConfirmationTemplate(bookingData)
    };

    // Send email
    await sgMail.send(msg);

    // Log the booking
    await admin.firestore().collection('email_logs').add({
      type: 'booking_confirmation',
      to: bookingData.customerEmail,
      bookingId: bookingData.id || 'unknown',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent'
    });

    return { success: true, message: 'Email sent successfully' };

  } catch (error: any) {
    console.error('Error sending booking confirmation:', error);
    
    // Log the error
    await admin.firestore().collection('email_logs').add({
      type: 'booking_confirmation_error',
      error: error.message || 'Unknown error',
      bookingData: data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    throw new functions.https.HttpsError('internal', 'Failed to send confirmation email');
  }
});

// Cloud Function: Create Booking (with email notification)
export const createBooking = functions.https.onCall(async (data, context) => {
  try {
    // Validate authentication (optional for public bookings)
    const bookingData = {
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    };

    // Create booking in Firestore
    const bookingRef = await admin.firestore().collection('bookings').add(bookingData);
    
    // Send confirmation email
    try {
      const bookingWithId = { ...bookingData, id: bookingRef.id };
      
      // Prepare email directly instead of calling the callable function
      const msg = {
        to: bookingWithId.customerEmail,
        from: {
          email: 'noreply@dgalu.com',
          name: "D'Galú Salón"
        },
        subject: `Confirmación de Cita - ${new Date(bookingWithId.date).toLocaleDateString('es-ES')} a las ${bookingWithId.time}`,
        html: getBookingConfirmationTemplate(bookingWithId)
      };

      // Send email
      if (sendGridApiKey) {
        await sgMail.send(msg);
        
        // Log the booking
        await admin.firestore().collection('email_logs').add({
          type: 'booking_confirmation',
          to: bookingWithId.customerEmail,
          bookingId: bookingRef.id,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'sent'
        });
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the booking creation if email fails
      
      // Log the error
      await admin.firestore().collection('email_logs').add({
        type: 'booking_confirmation_error',
        error: (emailError as Error).message || 'Unknown error',
        bookingId: bookingRef.id,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return { 
      success: true, 
      bookingId: bookingRef.id,
      message: 'Booking created successfully'
    };

  } catch (error) {
    console.error('Error creating booking:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create booking');
  }
});

// Cloud Function: Send Booking Reminder (scheduled)
export const sendBookingReminders = functions.pubsub.schedule('0 9 * * *').onRun(async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  try {
    const bookingsSnapshot = await admin.firestore()
      .collection('bookings')
      .where('date', '==', tomorrowStr)
      .where('status', '==', 'confirmed')
      .get();

    const reminderPromises = bookingsSnapshot.docs.map(async (doc: any) => {
      const booking = doc.data();
      
      const reminderMsg = {
        to: booking.customerEmail,
        from: {
          email: 'noreply@dgalu.com',
          name: "D'Galú Salón"
        },
        subject: `Recordatorio: Tu cita mañana a las ${booking.time} - D'Galú`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>¡Hola ${booking.customerName}!</h2>
            <p>Te recordamos que tienes una cita mañana:</p>
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Fecha:</strong> ${new Date(booking.date).toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> ${booking.time}</p>
              <p><strong>Servicios:</strong> ${booking.services?.map((s: any) => s.serviceName).join(', ')}</p>
            </div>
            <p>¡Te esperamos en D'Galú!</p>
          </div>
        `
      };

      return sgMail.send(reminderMsg);
    });

    await Promise.all(reminderPromises);
    console.log(`Sent ${reminderPromises.length} booking reminders`);

  } catch (error) {
    console.error('Error sending booking reminders:', error);
  }
});

// Cloud Function: Update Booking Status
export const updateBookingStatus = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change: any) => {
    const before = change.before.data();
    const after = change.after.data();

    // If status changed to confirmed, send confirmation
    if (before.status !== 'confirmed' && after.status === 'confirmed') {
      try {
        const msg = {
          to: after.customerEmail,
          from: {
            email: 'noreply@dgalu.com',
            name: "D'Galú Salón"
          },
          subject: '✅ Tu cita ha sido confirmada - D\'Galú',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">¡Tu cita ha sido confirmada!</h2>
              <p>Hola ${after.customerName},</p>
              <p>Nos complace informarte que tu cita ha sido confirmada oficialmente.</p>
              <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Fecha:</strong> ${new Date(after.date).toLocaleDateString('es-ES')}</p>
                <p><strong>Hora:</strong> ${after.time}</p>
              </div>
              <p>¡Te esperamos en D'Galú!</p>
            </div>
          `
        };

        await sgMail.send(msg);
      } catch (error) {
        console.error('Error sending confirmation email:', error);
      }
    }
  });