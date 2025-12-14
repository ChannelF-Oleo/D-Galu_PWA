/**
 * Entry Point - D'Galú Cloud Functions V2
 * Todas las funciones se exportan desde aquí.
 */

// 1. HTTP Functions
export { getGoogleReviews } from "./reviews/getGoogleReviews";

// 2. Scheduled Functions
export { sendBookingReminders } from "./scheduler/sendBookingReminders";

// 3. Auth Triggers (V2 Blocking)
export { createUserProfile } from "./auth/createUserProfile";

// 4. Firestore Triggers
export { updateUserClaims } from "./claims/updateUserClaims";
export { updateBookingStatus } from "./bookings/updateBookingStatus";

// 5. Callable Functions (Admin & User Actions)
export { refreshUserClaims } from "./claims/refreshUserClaims";
export { createBooking } from "./bookings/createBooking";
export { updateBooking } from "./bookings/updateBooking";
export { sendBookingConfirmation } from "./bookings/sendBookingConfirmation";
