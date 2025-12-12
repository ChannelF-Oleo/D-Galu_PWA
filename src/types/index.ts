// src/types/index.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Base schemas
export const timestampSchema = z.custom<Timestamp>((val) => val instanceof Timestamp);

// User schemas
export const userRoleSchema = z.enum(['admin', 'manager', 'staff', 'customer', 'student']);

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1, 'Display name is required'),
  role: userRoleSchema,
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Service schemas
export const subserviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Subservice name is required'),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  description: z.string().optional(),
});

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Service name is required'),
  description: z.string(),
  category: z.string().min(1, 'Category is required'),
  basePrice: z.number().min(0, 'Base price must be positive'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  image: z.string().url(),
  subservices: z.array(subserviceSchema).default([]),
  beforeAfterPhotos: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Product schemas
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  minStock: z.number().min(0, 'Minimum stock cannot be negative'),
  images: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Booking schemas
export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled']);

export const bookingSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(1, 'Customer phone is required'),
  customerEmail: z.string().email(),
  serviceId: z.string(),
  subserviceId: z.string().optional(),
  date: timestampSchema,
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalPrice: z.number().min(0, 'Total price must be positive'),
  status: bookingStatusSchema,
  notes: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Course schemas
export const courseFacilitatorSchema = z.object({
  name: z.string().min(1, 'Facilitator name is required'),
  bio: z.string(),
  photo: z.string().url(),
});

export const courseScheduleSchema = z.object({
  startDate: timestampSchema,
  endDate: timestampSchema,
  days: z.array(z.string()).min(1, 'At least one day is required'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
});

export const courseModalitySchema = z.enum(['presencial', 'online', 'hibrido']);

export const courseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Course name is required'),
  description: z.string(),
  price: z.number().min(0, 'Price must be positive'),
  facilitator: courseFacilitatorSchema,
  schedule: courseScheduleSchema,
  modality: courseModalitySchema,
  maxStudents: z.number().min(1, 'Max students must be at least 1'),
  currentStudents: z.number().min(0, 'Current students cannot be negative'),
  materials: z.array(z.string().url()).default([]),
  image: z.string().url(),
  isActive: z.boolean().default(true),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Order schemas
export const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().min(0, 'Price must be positive'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  total: z.number().min(0, 'Total must be positive'),
});

export const customerInfoSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email(),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
});

export const orderStatusSchema = z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']);

export const orderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerInfo: customerInfoSchema,
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  tax: z.number().min(0, 'Tax cannot be negative'),
  total: z.number().min(0, 'Total must be positive'),
  paymentId: z.string(),
  paymentMethod: z.enum(['paypal']),
  status: orderStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Form validation schemas (for client-side validation)
// Schema flexible para el formulario de servicios
export const serviceFormSchema = z.object({
  name: z.string().min(1, 'El nombre del servicio es requerido'),
  description: z.string().optional().default(''),
  category: z.string().min(1, 'La categoría es requerida'),
  price: z.string().or(z.number()).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  }),
  duration: z.string().or(z.number()).transform((val) => {
    const num = typeof val === 'string' ? parseInt(val) : val;
    return isNaN(num) ? 0 : num;
  }),
  image: z.string().nullable().optional(),
  subservices: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    duration: z.number(),
    description: z.string().optional(),
  })).optional().default([]),
});

export const productFormSchema = productSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  price: z.string().transform((val) => parseFloat(val)),
  stock: z.string().transform((val) => parseInt(val)),
  minStock: z.string().transform((val) => parseInt(val)),
});

export const bookingFormSchema = bookingSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  date: true 
}).extend({
  date: z.string().transform((val) => new Date(val)),
  totalPrice: z.string().transform((val) => parseFloat(val)),
  duration: z.string().transform((val) => parseInt(val)),
});

export const courseFormSchema = courseSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  schedule: true 
}).extend({
  price: z.string().transform((val) => parseFloat(val)),
  maxStudents: z.string().transform((val) => parseInt(val)),
  currentStudents: z.string().transform((val) => parseInt(val)),
  schedule: courseScheduleSchema.extend({
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z.string().transform((val) => new Date(val)),
  }),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Subservice = z.infer<typeof subserviceSchema>;
export type Product = z.infer<typeof productSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type BookingStatus = z.infer<typeof bookingStatusSchema>;
export type Course = z.infer<typeof courseSchema>;
export type CourseModality = z.infer<typeof courseModalitySchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type CustomerInfo = z.infer<typeof customerInfoSchema>;

// Form type exports
export type ServiceFormData = {
  name: string;
  description?: string;
  category: string;
  price: number;
  duration: number;
  image?: string | null;
  subservices?: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  }>;
};
export type ProductFormData = z.infer<typeof productFormSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type CourseFormData = z.infer<typeof courseFormSchema>;