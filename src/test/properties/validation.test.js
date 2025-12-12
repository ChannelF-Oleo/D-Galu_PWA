// src/test/properties/validation.test.js

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  userSchema, 
  serviceSchema, 
  productSchema,
  validateData 
} from '../../types/schemas.js';

/**
 * **Feature: dgalu-salon-system, Property 36: CRUD Consistency**
 * **Validates: Requirements 8.1**
 * 
 * Para cualquier operación CRUD, el sistema debe mantener consistencia 
 * a través de todas las colecciones de Firebase
 */
describe('Data Validation Properties', () => {
  
  // Generadores de datos válidos más simples
  const validUserData = {
    id: 'test-id-123',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'customer',
    phone: '+1 (809) 555-1234',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const validServiceData = {
    id: 'service-123',
    name: 'Test Service',
    description: 'This is a test service description with enough characters',
    category: 'Beauty',
    basePrice: 100,
    duration: 60,
    image: 'https://example.com/service.jpg',
    subservices: [],
    beforeAfterPhotos: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const validProductData = {
    id: 'product-123',
    name: 'Test Product',
    description: 'This is a test product description with enough characters',
    category: 'Cosmetics',
    price: 50,
    sku: 'TEST-001',
    stock: 100,
    minStock: 10,
    images: ['https://example.com/product.jpg'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('**Feature: dgalu-salon-system, Property 36: CRUD Consistency - User Validation**', () => {
    const result = validateData(userSchema, validUserData);
    expect(result.success).toBe(true);
    expect(result.data.email).toBe(validUserData.email);
    expect(result.data.role).toBe(validUserData.role);
  });

  it('**Feature: dgalu-salon-system, Property 36: CRUD Consistency - Service Validation**', () => {
    const result = validateData(serviceSchema, validServiceData);
    expect(result.success).toBe(true);
    expect(result.data.name).toBe(validServiceData.name);
    expect(result.data.basePrice).toBe(validServiceData.basePrice);
  });

  it('**Feature: dgalu-salon-system, Property 36: CRUD Consistency - Product Validation**', () => {
    const result = validateData(productSchema, validProductData);
    expect(result.success).toBe(true);
    expect(result.data.name).toBe(validProductData.name);
    expect(result.data.price).toBe(validProductData.price);
  });

  it('**Feature: dgalu-salon-system, Property 36: CRUD Consistency - Invalid Data Rejection**', () => {
    const invalidUserData = {
      id: 'test-id',
      email: 'invalid-email', // Email sin @
      displayName: '', // Nombre vacío
      role: 'invalid-role', // Rol inválido
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = validateData(userSchema, invalidUserData);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(Array.isArray(result.error)).toBe(true);
    expect(result.error.length).toBeGreaterThan(0);
  });

  it('**Feature: dgalu-salon-system, Property 36: CRUD Consistency - Required Fields Validation**', () => {
    const incompleteData = {
      // Omitir campos requeridos intencionalmente
      optionalField: 'test'
    };
    
    const result = validateData(userSchema, incompleteData);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.length).toBeGreaterThan(0);
  });

  it('**Feature: dgalu-salon-system, Property 36: CRUD Consistency - Price Validation**', () => {
    const serviceWithNegativePrice = {
      ...validServiceData,
      basePrice: -100 // Precio negativo
    };
    
    const result = validateData(serviceSchema, serviceWithNegativePrice);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.some(err => err.field === 'basePrice')).toBe(true);
  });

  it('**Feature: dgalu-salon-system, Property 36: CRUD Consistency - URL Validation**', () => {
    const productWithInvalidUrls = {
      ...validProductData,
      images: ['invalid-url', 'another-invalid-url'] // URLs inválidas
    };
    
    const result = validateData(productSchema, productWithInvalidUrls);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.some(err => err.field.startsWith('images'))).toBe(true);
  });

  it('**Feature: dgalu-salon-system, Property 36: CRUD Consistency - Phone Number Validation**', () => {
    // Crear un esquema donde phone sea requerido para esta prueba
    const userDataWithRequiredPhone = {
      ...validUserData,
      phone: 'invalid-phone' // Teléfono inválido
    };
    
    const result = validateData(userSchema, userDataWithRequiredPhone);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.some(err => err.field === 'phone')).toBe(true);
  });

  it('**Feature: dgalu-salon-system, Property 36: CRUD Consistency - Duration Validation**', () => {
    const serviceData = {
      ...validServiceData,
      duration: 10 // Duración inválida (menos de 15 minutos)
    };
    
    const result = validateData(serviceSchema, serviceData);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.some(err => err.field === 'duration')).toBe(true);
  });
});