// src/types/schemas.js

import { z } from 'zod';

// Esquemas base reutilizables
const timestampSchema = z.date().or(z.object({
  seconds: z.number(),
  nanoseconds: z.number()
}));

const phoneSchema = z.string()
  .regex(/^(\+1|1)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{4}$/, 
    'Formato de teléfono inválido');

const emailSchema = z.string()
  .email('Email inválido')
  .min(1, 'Email es requerido');

// User Schema
export const userSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  email: emailSchema,
  displayName: z.string().min(1, 'Nombre es requerido'),
  role: z.enum(['admin', 'manager', 'staff', 'customer', 'student'], {
    errorMap: () => ({ message: 'Rol inválido' })
  }),
  phone: phoneSchema.optional(),
  avatar: z.string().url('URL de avatar inválida').optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});

// Subservice Schema
export const subserviceSchema = z.object({
  id: z.string().min(1, 'ID de subservicio es requerido'),
  name: z.string().min(1, 'Nombre del subservicio es requerido'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  duration: z.number().min(15, 'La duración mínima es 15 minutos'),
  description: z.string().optional()
});

// Service Schema
export const serviceSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  name: z.string().min(1, 'Nombre del servicio es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'Categoría es requerida'),
  basePrice: z.number().min(0, 'El precio base debe ser mayor o igual a 0'),
  duration: z.number().min(15, 'La duración mínima es 15 minutos'),
  image: z.string().url('URL de imagen inválida'),
  subservices: z.array(subserviceSchema).default([]),
  beforeAfterPhotos: z.array(z.string().url('URL de foto inválida')).default([]),
  isActive: z.boolean().default(true),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});

// Product Schema
export const productSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  name: z.string().min(1, 'Nombre del producto es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'Categoría es requerida'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  sku: z.string().min(1, 'SKU es requerido'),
  stock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0'),
  minStock: z.number().int().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  images: z.array(z.string().url('URL de imagen inválida')).min(1, 'Al menos una imagen es requerida'),
  isActive: z.boolean().default(true),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});

// Booking Schema
export const bookingSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  customerId: z.string().min(1, 'ID del cliente es requerido'),
  customerName: z.string().min(1, 'Nombre del cliente es requerido'),
  customerPhone: phoneSchema,
  customerEmail: emailSchema,
  serviceId: z.string().min(1, 'ID del servicio es requerido'),
  subserviceId: z.string().optional(),
  date: timestampSchema,
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  duration: z.number().min(15, 'La duración mínima es 15 minutos'),
  totalPrice: z.number().min(0, 'El precio total debe ser mayor o igual a 0'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Estado de reserva inválido' })
  }),
  notes: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});

// Course Facilitator Schema
export const facilitatorSchema = z.object({
  name: z.string().min(1, 'Nombre del facilitador es requerido'),
  bio: z.string().min(10, 'La biografía debe tener al menos 10 caracteres'),
  photo: z.string().url('URL de foto inválida')
});

// Course Schedule Schema
export const scheduleSchema = z.object({
  startDate: timestampSchema,
  endDate: timestampSchema,
  days: z.array(z.enum(['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']))
    .min(1, 'Al menos un día es requerido'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
});

// Course Schema
export const courseSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  name: z.string().min(1, 'Nombre del curso es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  facilitator: facilitatorSchema,
  schedule: scheduleSchema,
  modality: z.enum(['presencial', 'online', 'hibrido'], {
    errorMap: () => ({ message: 'Modalidad inválida' })
  }),
  maxStudents: z.number().int().min(1, 'Debe permitir al menos 1 estudiante'),
  currentStudents: z.number().int().min(0, 'El número actual de estudiantes debe ser mayor o igual a 0'),
  materials: z.array(z.string()).default([]),
  image: z.string().url('URL de imagen inválida'),
  isActive: z.boolean().default(true),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});

// Order Item Schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'ID del producto es requerido'),
  name: z.string().min(1, 'Nombre del producto es requerido'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  total: z.number().min(0, 'El total debe ser mayor o igual a 0')
});

// Customer Info Schema
export const customerInfoSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres')
});

// Order Schema
export const orderSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  customerId: z.string().min(1, 'ID del cliente es requerido'),
  customerInfo: customerInfoSchema,
  items: z.array(orderItemSchema).min(1, 'Al menos un producto es requerido'),
  subtotal: z.number().min(0, 'El subtotal debe ser mayor o igual a 0'),
  tax: z.number().min(0, 'El impuesto debe ser mayor o igual a 0'),
  total: z.number().min(0, 'El total debe ser mayor o igual a 0'),
  paymentId: z.string().min(1, 'ID de pago es requerido'),
  paymentMethod: z.enum(['paypal'], {
    errorMap: () => ({ message: 'Método de pago inválido' })
  }),
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: 'Estado de orden inválido' })
  }),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});

// Esquemas para formularios (sin campos auto-generados)
export const createServiceSchema = serviceSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const createProductSchema = productSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const createBookingSchema = bookingSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const createCourseSchema = courseSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const createOrderSchema = orderSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Esquemas para login y registro
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmar contraseña es requerido'),
  displayName: z.string().min(1, 'Nombre es requerido'),
  phone: phoneSchema.optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

// Utilidades de validación
export const validateData = (schema, data) => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    // Si es un error de Zod, tiene la propiedad 'issues'
    if (error.issues) {
      return { 
        success: false, 
        error: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    
    // Si es un error de Zod con 'errors' (versión anterior)
    if (error.errors) {
      return { 
        success: false, 
        error: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    
    // Error genérico
    return { 
      success: false, 
      error: [{ field: 'unknown', message: error.message }]
    };
  }
};

export const validatePartialData = (schema, data) => {
  try {
    return { success: true, data: schema.partial().parse(data) };
  } catch (error) {
    return { 
      success: false, 
      error: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    };
  }
};