// src/services/bookingService.ts
// Servicio para manejar reservas - Versión TypeScript

import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from '../config/firebase';

// Interfaces
interface Service {
  serviceId: string;
  serviceName: string;
  subserviceId?: string;
  subserviceName?: string;
  duration: number;
  price: string;
}

interface BookingData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  time: string;
  services: Service[];
  totalDuration: number;
  totalPrice: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface BookingUpdateData {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  customerPhone?: string;
}

interface CloudFunctionResponse {
  success: boolean;
  message: string;
  bookingId?: string;
  claims?: any;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface FormattedBooking extends BookingData {
  formattedDate: string;
  formattedTime: string;
  servicesText: string;
  statusText: string;
}

// Cloud Functions
const createBookingFunction = httpsCallable<BookingData, CloudFunctionResponse>(functions, 'createBooking');
const updateBookingFunction = httpsCallable<{bookingId: string} & BookingUpdateData, CloudFunctionResponse>(functions, 'updateBooking');
const refreshUserClaimsFunction = httpsCallable<{userId?: string}, CloudFunctionResponse>(functions, 'refreshUserClaims');

/**
 * Create a new booking using Cloud Function (with validation)
 */
export const createBooking = async (bookingData: BookingData): Promise<CloudFunctionResponse> => {
  try {
    const result: HttpsCallableResult<CloudFunctionResponse> = await createBookingFunction(bookingData);
    return result.data;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Failed to create booking';
    
    if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Invalid booking data';
    } else if (error.code === 'functions/unauthenticated') {
      errorMessage = 'Please log in to create a booking';
    } else if (error.code === 'functions/permission-denied') {
      errorMessage = 'You do not have permission to create bookings';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing booking using Cloud Function
 */
export const updateBooking = async (bookingId: string, updateData: BookingUpdateData): Promise<CloudFunctionResponse> => {
  try {
    const result: HttpsCallableResult<CloudFunctionResponse> = await updateBookingFunction({
      bookingId,
      ...updateData
    });
    return result.data;
  } catch (error: any) {
    console.error('Error updating booking:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Failed to update booking';
    
    if (error.code === 'functions/invalid-argument') {
      errorMessage = error.message || 'Invalid update data';
    } else if (error.code === 'functions/unauthenticated') {
      errorMessage = 'Please log in to update bookings';
    } else if (error.code === 'functions/permission-denied') {
      errorMessage = 'You do not have permission to update bookings';
    } else if (error.code === 'functions/not-found') {
      errorMessage = 'Booking not found';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Refresh user custom claims
 */
export const refreshUserClaims = async (userId?: string): Promise<CloudFunctionResponse> => {
  try {
    const result: HttpsCallableResult<CloudFunctionResponse> = await refreshUserClaimsFunction({ userId });
    return result.data;
  } catch (error: any) {
    console.error('Error refreshing user claims:', error);
    
    let errorMessage = 'Failed to refresh user permissions';
    
    if (error.code === 'functions/unauthenticated') {
      errorMessage = 'Please log in to refresh permissions';
    } else if (error.code === 'functions/not-found') {
      errorMessage = 'User profile not found';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Validate booking data on the client side (basic validation)
 */
export const validateBookingData = (bookingData: Partial<BookingData>): ValidationResult => {
  const errors: string[] = [];
  
  // Basic client-side validation
  if (!bookingData.customerName || bookingData.customerName.length < 2) {
    errors.push('Customer name must be at least 2 characters');
  }
  
  if (!bookingData.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.customerEmail)) {
    errors.push('Valid email address is required');
  }
  
  if (!bookingData.date || !/^\d{4}-\d{2}-\d{2}$/.test(bookingData.date)) {
    errors.push('Valid date is required (YYYY-MM-DD)');
  }
  
  if (!bookingData.time || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(bookingData.time)) {
    errors.push('Valid time is required (HH:MM)');
  }
  
  if (!bookingData.services || bookingData.services.length === 0) {
    errors.push('At least one service is required');
  }
  
  // Check if booking date is in the past
  if (bookingData.date) {
    const bookingDate = new Date(bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      errors.push('Cannot book appointments in the past');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format booking data for display
 */
export const formatBookingForDisplay = (booking: BookingData): FormattedBooking => {
  const statusTranslations: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada'
  };

  return {
    ...booking,
    formattedDate: new Date(booking.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    formattedTime: booking.time,
    servicesText: booking.services?.map(s => 
      s.subserviceName ? `${s.serviceName} - ${s.subserviceName}` : s.serviceName
    ).join(', ') || '',
    statusText: statusTranslations[booking.status || 'pending'] || booking.status || 'pending'
  };
};

// Export types for use in other files
export type { BookingData, Service, BookingUpdateData, ValidationResult, FormattedBooking };