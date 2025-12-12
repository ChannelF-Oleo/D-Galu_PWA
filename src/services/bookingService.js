// src/services/bookingService.js

import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

// Cloud Functions
const createBookingFunction = httpsCallable(functions, 'createBooking');
const updateBookingFunction = httpsCallable(functions, 'updateBooking');
const refreshUserClaimsFunction = httpsCallable(functions, 'refreshUserClaims');

/**
 * Create a new booking using Cloud Function (with validation)
 * @param {Object} bookingData - The booking data
 * @returns {Promise<Object>} - Result with bookingId
 */
export const createBooking = async (bookingData) => {
  try {
    const result = await createBookingFunction(bookingData);
    return result.data;
  } catch (error) {
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
 * @param {string} bookingId - The booking ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} - Result
 */
export const updateBooking = async (bookingId, updateData) => {
  try {
    const result = await updateBookingFunction({
      bookingId,
      ...updateData
    });
    return result.data;
  } catch (error) {
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
 * @param {string} userId - Optional user ID (defaults to current user)
 * @returns {Promise<Object>} - Result with updated claims
 */
export const refreshUserClaims = async (userId = null) => {
  try {
    const result = await refreshUserClaimsFunction({ userId });
    return result.data;
  } catch (error) {
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
 * @param {Object} bookingData - The booking data to validate
 * @returns {Object} - Validation result
 */
export const validateBookingData = (bookingData) => {
  const errors = [];
  
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
 * @param {Object} booking - The booking object
 * @returns {Object} - Formatted booking data
 */
export const formatBookingForDisplay = (booking) => {
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
    statusText: {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada'
    }[booking.status] || booking.status
  };
};