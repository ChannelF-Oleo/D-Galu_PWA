// functions/src/emailTemplates.ts
// Email templates for Resend service

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export const getBookingConfirmationTemplate = (bookingData: any): EmailTemplate => {
  const servicesHtml = bookingData.services.map((service: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">
        ${service.serviceName}${service.subserviceName ? ` - ${service.subserviceName}` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #6b7280;">
        ${service.duration} min
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #059669;">
        ${service.price}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Cita - D'Galú</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">D'Galú</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Salón • Uñas • Spa • Masajes</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background-color: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 16px;">
              ✅ CONFIRMADA
            </div>
            <h2 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 700;">¡Tu cita ha sido confirmada!</h2>
          </div>
          
          <p style="margin-bottom: 24px; font-size: 16px;">Hola <strong style="color: #8b5cf6;">${bookingData.customerName}</strong>,</p>
          
          <p style="margin-bottom: 32px; color: #6b7280;">Nos complace confirmar tu cita en D'Galú. Aquí tienes todos los detalles:</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px; font-weight: 600;">📅 Detalles de tu cita</h3>
            <p style="margin: 8px 0;"><span style="color: #64748b;">Fecha:</span> <span style="font-weight: 600;">${new Date(bookingData.date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span></p>
            <p style="margin: 8px 0;"><span style="color: #64748b;">Hora:</span> <span style="font-weight: 600;">${bookingData.time}</span></p>
            <p style="margin: 8px 0;"><span style="color: #64748b;">Duración:</span> <span style="font-weight: 600;">${bookingData.totalDuration} minutos</span></p>
          </div>
          
          <div style="margin: 32px 0;">
            <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px; font-weight: 600;">💅 Servicios seleccionados</h3>
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f1f5f9;">
                    <th style="padding: 16px; text-align: left; font-weight: 600; color: #475569;">Servicio</th>
                    <th style="padding: 16px; text-align: right; font-weight: 600; color: #475569;">Duración</th>
                    <th style="padding: 16px; text-align: right; font-weight: 600; color: #475569;">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${servicesHtml}
                  <tr style="background: #f8fafc; border-top: 2px solid #e2e8f0;">
                    <td style="padding: 16px; font-weight: 700; color: #1e293b;">Total</td>
                    <td style="padding: 16px; text-align: right; font-weight: 700; color: #1e293b;">${bookingData.totalDuration} min</td>
                    <td style="padding: 16px; text-align: right; font-weight: 700; color: #059669; font-size: 18px;">${bookingData.totalPrice}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          ${bookingData.notes ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #92400e;"><strong>📝 Notas:</strong> ${bookingData.notes}</p>
          </div>
          ` : ''}
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 32px 0;">
            <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">ℹ️ Información importante</h4>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li style="margin-bottom: 8px;">Por favor llega 10 minutos antes de tu cita</li>
              <li style="margin-bottom: 8px;">Si necesitas cancelar o reprogramar, contáctanos con al menos 24 horas de anticipación</li>
              <li>Trae una identificación válida</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 40px 0; padding: 24px; background: #f8fafc; border-radius: 12px;">
            <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px; font-weight: 600;">📞 ¿Necesitas contactarnos?</h3>
            <p style="margin: 8px 0; color: #64748b;">📍 Av. Principal #123, Ensanche Ozama, Santo Domingo Este</p>
            <p style="margin: 8px 0; color: #64748b;">📞 +1 (809) 555-1234</p>
            <p style="margin: 8px 0; color: #64748b;">📧 contacto@dgalu.com</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 24px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px 0; color: #8b5cf6; font-weight: 600; font-size: 16px;">¡Esperamos verte pronto en D'Galú!</p>
          <p style="margin: 0; color: #9ca3af; font-size: 14px;">Este es un email automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `¡Tu cita ha sido confirmada!

Hola ${bookingData.customerName},

Nos complace confirmar tu cita en D'Galú.

Detalles de tu cita:
- Fecha: ${new Date(bookingData.date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
- Hora: ${bookingData.time}
- Duración total: ${bookingData.totalDuration} minutos

Servicios seleccionados:
${bookingData.services.map((service: any) => 
  `- ${service.serviceName}${service.subserviceName ? ` - ${service.subserviceName}` : ''} (${service.duration} min) - ${service.price}`
).join('\n')}

Total: ${bookingData.totalPrice}

${bookingData.notes ? `Notas: ${bookingData.notes}` : ''}

Información importante:
- Por favor llega 10 minutos antes de tu cita
- Si necesitas cancelar o reprogramar, contáctanos con al menos 24 horas de anticipación
- Trae una identificación válida

Contacto:
📍 Av. Principal #123, Ensanche Ozama, Santo Domingo Este
📞 +1 (809) 555-1234
📧 contacto@dgalu.com

¡Esperamos verte pronto en D'Galú!`;

  return {
    subject: `✅ Cita confirmada - ${new Date(bookingData.date).toLocaleDateString('es-ES')} a las ${bookingData.time} - D'Galú`,
    html,
    text
  };
};

export const getBookingReminderTemplate = (bookingData: any): EmailTemplate => {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Cita - D'Galú</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">D'Galú</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0;">Recordatorio de Cita</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 16px;">
              ⏰ MAÑANA
            </div>
            <h2 style="color: #1f2937; margin: 0; font-size: 24px;">¡Hola ${bookingData.customerName}!</h2>
          </div>
          
          <p style="text-align: center; font-size: 18px; color: #6b7280; margin-bottom: 32px;">
            Te recordamos que tienes una cita <strong>mañana</strong> en D'Galú
          </p>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 24px; text-align: center;">
            <h3 style="margin: 0 0 16px 0; color: #92400e;">📅 Detalles de tu cita</h3>
            <p style="margin: 8px 0; color: #92400e;"><strong>Fecha:</strong> ${new Date(bookingData.date).toLocaleDateString('es-ES')}</p>
            <p style="margin: 8px 0; color: #92400e;"><strong>Hora:</strong> ${bookingData.time}</p>
            <p style="margin: 8px 0; color: #92400e;"><strong>Servicios:</strong> ${bookingData.services?.map((s: any) => s.serviceName).join(', ')}</p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <p style="color: #8b5cf6; font-size: 18px; font-weight: 600;">¡Te esperamos en D'Galú!</p>
            <p style="color: #6b7280; margin-top: 16px;">Recuerda llegar 10 minutos antes de tu cita</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `⏰ Recordatorio: Tu cita mañana a las ${bookingData.time} - D'Galú`,
    html,
    text: `¡Hola ${bookingData.customerName}!\n\nTe recordamos que tienes una cita mañana:\n\nFecha: ${new Date(bookingData.date).toLocaleDateString('es-ES')}\nHora: ${bookingData.time}\nServicios: ${bookingData.services?.map((s: any) => s.serviceName).join(', ')}\n\n¡Te esperamos en D'Galú!`
  };
};

export const getBookingStatusUpdateTemplate = (bookingData: any, newStatus: string): EmailTemplate => {
  const statusMessages = {
    confirmed: {
      title: '✅ Tu cita ha sido confirmada',
      message: 'Nos complace informarte que tu cita ha sido confirmada oficialmente.',
      color: '#059669',
      bgColor: '#dcfce7'
    },
    cancelled: {
      title: '❌ Tu cita ha sido cancelada',
      message: 'Lamentamos informarte que tu cita ha sido cancelada. Contáctanos para reprogramar.',
      color: '#dc2626',
      bgColor: '#fee2e2'
    },
    completed: {
      title: '🎉 ¡Gracias por visitarnos!',
      message: 'Esperamos que hayas disfrutado tu experiencia en D\'Galú. ¡Te esperamos pronto!',
      color: '#7c3aed',
      bgColor: '#ede9fe'
    }
  };

  const statusInfo = statusMessages[newStatus as keyof typeof statusMessages] || statusMessages.confirmed;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Cita - D'Galú</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">D'Galú</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0;">Actualización de Cita</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: ${statusInfo.bgColor}; color: ${statusInfo.color}; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 16px;">
              ${newStatus.toUpperCase()}
            </div>
            <h2 style="color: #1f2937; margin: 0; font-size: 24px;">${statusInfo.title}</h2>
          </div>
          
          <p style="margin-bottom: 24px; font-size: 16px;">Hola <strong style="color: #8b5cf6;">${bookingData.customerName}</strong>,</p>
          
          <p style="margin-bottom: 32px; color: #6b7280;">${statusInfo.message}</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px; font-weight: 600;">📅 Detalles de la cita</h3>
            <p style="margin: 8px 0;"><span style="color: #64748b;">Fecha:</span> <span style="font-weight: 600;">${new Date(bookingData.date).toLocaleDateString('es-ES')}</span></p>
            <p style="margin: 8px 0;"><span style="color: #64748b;">Hora:</span> <span style="font-weight: 600;">${bookingData.time}</span></p>
            <p style="margin: 8px 0;"><span style="color: #64748b;">Servicios:</span> <span style="font-weight: 600;">${bookingData.services?.map((s: any) => s.serviceName).join(', ')}</span></p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <p style="color: #6b7280;">Si tienes alguna pregunta, no dudes en contactarnos</p>
            <p style="color: #8b5cf6; font-weight: 600;">📞 +1 (809) 555-1234</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `${statusInfo.title} - D'Galú`,
    html,
    text: `${statusInfo.title}\n\nHola ${bookingData.customerName},\n\n${statusInfo.message}\n\nDetalles de la cita:\n- Fecha: ${new Date(bookingData.date).toLocaleDateString('es-ES')}\n- Hora: ${bookingData.time}\n- Servicios: ${bookingData.services?.map((s: any) => s.serviceName).join(', ')}\n\nSi tienes alguna pregunta, contáctanos al +1 (809) 555-1234`
  };
};