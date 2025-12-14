import { z } from "zod";

// Esquema para servicios individuales dentro de una cita
export const ServiceSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  serviceName: z.string().min(1, "Service name is required"),
  subserviceId: z.string().optional(),
  subserviceName: z.string().optional(),
  duration: z
    .number()
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration cannot exceed 8 hours"),
  // SECURITY: No validamos price aquí - se obtiene de la BD para prevenir fraude
});

// Esquema para crear una cita nueva
export const BookingSchema = z.object({
  customerName: z
    .string()
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name too long"),
  customerEmail: z.string().email("Invalid email format"),
  customerPhone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
  services: z
    .array(ServiceSchema)
    .min(1, "At least one service is required")
    .max(10, "Too many services"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  status: z
    .enum(["pending", "confirmed", "cancelled", "completed"])
    .default("pending"),
});

// Esquema para actualizar una cita existente
export const UpdateBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  customerPhone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .optional(),
});

// Tipos inferidos para usar en TS
export type BookingInput = z.infer<typeof BookingSchema>;
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;
