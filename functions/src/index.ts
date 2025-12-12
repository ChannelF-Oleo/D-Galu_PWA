import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';
import { z } from 'zod';
import { getBookingConfirmationTemplate, getBookingReminderTemplate, getBookingStatusUpdateTemplate } from './emailTemplates';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Resend
const resendApiKey = functions.config().resend?.api_key;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Zod Schemas for Data Validation
const ServiceSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  serviceName: z.string().min(1, 'Service name is required'),
  subserviceId: z.string().optional(),
  subserviceName: z.string().optional(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
  price: z.string().regex(/^\$?\d+(\.\d{2})?$/, 'Invalid price format')
});

const BookingSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name too long'),
  customerEmail: z.string().email('Invalid email format'),
  customerPhone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  services: z.array(ServiceSchema).min(1, 'At least one service is required').max(10, 'Too many services'),
  totalDuration: z.number().min(15, 'Total duration must be at least 15 minutes').max(480, 'Total duration cannot exceed 8 hours'),
  totalPrice: z.string().regex(/^\$?\d+(\.\d{2})?$/, 'Invalid total price format'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending')
});

const UpdateBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  customerPhone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format').optional()
});

// Cloud Function: Auto-create user profile on Auth user creation
export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'customer', // Default role
      permissions: {
        canBook: true,
        canViewBookings: true,
        canCancelBookings: true
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      preferences: {
        notifications: {
          email: true,
          sms: false,
          reminders: true
        },
        language: 'es'
      }
    };

    // Create user profile in Firestore
    await admin.firestore().collection('users').doc(user.uid).set(userProfile);

    // Set custom claims for role-based access
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'customer',
      permissions: userProfile.permissions
    });

    console.log(`User profile created for ${user.email} with UID: ${user.uid}`);

  } catch (error) {
    console.error('Error creating user profile:', error);
    
    // Log the error for monitoring
    await admin.firestore().collection('system_logs').add({
      type: 'user_creation_error',
      uid: user.uid,
      email: user.email,
      error: (error as Error).message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  }
});

// Cloud Function: Update Custom Claims when user role changes
export const updateUserClaims = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;

    try {
      // Check if role or permissions changed
      const roleChanged = before.role !== after.role;
      const permissionsChanged = JSON.stringify(before.permissions) !== JSON.stringify(after.permissions);

      if (roleChanged || permissionsChanged) {
        // Update custom claims
        const customClaims = {
          role: after.role,
          permissions: after.permissions || {},
          lastUpdated: Date.now()
        };

        await admin.auth().setCustomUserClaims(userId, customClaims);
        
        console.log(`Custom claims updated for user ${userId}: role=${after.role}`);

        // Log the update
        await admin.firestore().collection('system_logs').add({
          type: 'custom_claims_updated',
          userId: userId,
          oldRole: before.role,
          newRole: after.role,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }

    } catch (error) {
      console.error('Error updating custom claims:', error);
      
      // Log the error
      await admin.firestore().collection('system_logs').add({
        type: 'custom_claims_error',
        userId: userId,
        error: (error as Error).message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// Cloud Function: Manually refresh user claims (callable)
export const refreshUserClaims = functions.https.onCall(async (data, context) => {
  try {
    // Validate authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = data.userId || context.auth.uid;

    // Get user profile from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }

    const userData = userDoc.data();
    
    // Update custom claims
    const customClaims = {
      role: userData?.role || 'customer',
      permissions: userData?.permissions || {},
      lastUpdated: Date.now()
    };

    await admin.auth().setCustomUserClaims(userId, customClaims);

    return { 
      success: true, 
      message: 'Custom claims refreshed successfully',
      claims: customClaims
    };

  } catch (error) {
    console.error('Error refreshing custom claims:', error);
    throw new functions.https.HttpsError('internal', 'Failed to refresh custom claims');
  }
});

// Cloud Function: Create Booking (with validation and email notification)
export const createBooking = functions.https.onCall(async (data, context) => {
  try {
    // Validate input data with Zod
    const validatedData = BookingSchema.parse(data);
    
    // Additional business logic validations
    const bookingDate = new Date(validatedData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      throw new functions.https.HttpsError('invalid-argument', 'Cannot book appointments in the past');
    }
    
    // Check if the date is too far in the future (e.g., 6 months)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    if (bookingDate > maxDate) {
      throw new functions.https.HttpsError('invalid-argument', 'Cannot book appointments more than 6 months in advance');
    }
    
    // Validate total duration matches sum of services
    const calculatedDuration = validatedData.services.reduce((total, service) => total + service.duration, 0);
    if (calculatedDuration !== validatedData.totalDuration) {
      throw new functions.https.HttpsError('invalid-argument', 'Total duration does not match sum of service durations');
    }
    
    const bookingData = {
      ...validatedData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    };

    // Create booking in Firestore
    const bookingRef = await admin.firestore().collection('bookings').add(bookingData);
    
    // Send confirmation email
    try {
      const bookingWithId = { ...bookingData, id: bookingRef.id };
      
      // Prepare email using Resend
      if (resend) {
        const emailTemplate = getBookingConfirmationTemplate(bookingWithId);
        
        await resend.emails.send({
          from: "D'Galú Salón <noreply@dgalu.com>",
          to: [bookingWithId.customerEmail],
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });
        
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
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new functions.https.HttpsError('invalid-argument', `Validation failed: ${errorMessages}`);
    }
    
    // Handle Firebase Functions errors (re-throw)
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Handle other errors
    throw new functions.https.HttpsError('internal', 'Failed to create booking');
  }
});

// Cloud Function: Update Booking (with validation and authorization)
export const updateBooking = functions.https.onCall(async (data, context) => {
  try {
    // Validate authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate input data
    const validatedData = UpdateBookingSchema.parse(data);
    const { bookingId, ...updateFields } = validatedData;

    // Check user permissions
    const userRole = context.auth.token?.role || 'customer';
    const allowedRoles = ['admin', 'manager', 'staff'];
    
    if (!allowedRoles.includes(userRole)) {
      throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions to update bookings');
    }

    // Get existing booking
    const bookingRef = admin.firestore().collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();
    
    if (!bookingDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Booking not found');
    }

    // Prepare update data
    const updateData = {
      ...updateFields,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid
    };

    // Update booking
    await bookingRef.update(updateData);

    // Log the update
    await admin.firestore().collection('system_logs').add({
      type: 'booking_updated',
      bookingId: bookingId,
      updatedBy: context.auth.uid,
      userRole: userRole,
      changes: updateFields,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { 
      success: true, 
      message: 'Booking updated successfully',
      bookingId: bookingId
    };

  } catch (error) {
    console.error('Error updating booking:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new functions.https.HttpsError('invalid-argument', `Validation failed: ${errorMessages}`);
    }
    
    // Handle Firebase Functions errors (re-throw)
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Handle other errors
    throw new functions.https.HttpsError('internal', 'Failed to update booking');
  }
});

// Cloud Function: Send Booking Confirmation Email (callable)
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

    // Prepare email using Resend
    if (!resend) {
      throw new functions.https.HttpsError('failed-precondition', 'Email service not configured');
    }

    const emailTemplate = getBookingConfirmationTemplate(bookingData);
    
    // Send email with Resend
    await resend.emails.send({
      from: "D'Galú Salón <noreply@dgalu.com>",
      to: [bookingData.customerEmail],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

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

// Cloud Function: Send Booking Reminder (scheduled)
// Ejecutar a las 9:00 AM hora local (República Dominicana - AST)
export const sendBookingReminders = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('America/Santo_Domingo')
  .onRun(async () => {
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
        
        if (!resend) {
          console.error('Resend not configured, skipping reminder email');
          return;
        }

        const emailTemplate = getBookingReminderTemplate(booking);
        
        return resend.emails.send({
          from: "D'Galú Salón <noreply@dgalu.com>",
          to: [booking.customerEmail],
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });
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

    // If status changed, send status update email
    if (before.status !== after.status && resend) {
      try {
        const emailTemplate = getBookingStatusUpdateTemplate(after, after.status);
        
        await resend.emails.send({
          from: "D'Galú Salón <noreply@dgalu.com>",
          to: [after.customerEmail],
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });
      } catch (error) {
        console.error('Error sending status update email:', error);
      }
    }
  });