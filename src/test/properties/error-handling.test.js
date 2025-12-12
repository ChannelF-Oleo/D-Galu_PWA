// src/test/properties/error-handling.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { ErrorHandler, BusinessError, BookingConflictError, InsufficientStockError, PaymentFailedError } from '../../utils/ErrorHandler.js';

/**
 * **Feature: dgalu-salon-system, Property 38: Network Error Recovery**
 * **Validates: Requirements 8.3**
 * 
 * Para cualquier error de red, el sistema debe manejar la reconexión automática
 */
describe('Error Handling Properties', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Generadores de errores
  const authErrorGen = fc.constantFrom(
    'auth/user-not-found',
    'auth/wrong-password', 
    'auth/invalid-email',
    'auth/user-disabled',
    'auth/too-many-requests',
    'auth/email-already-in-use',
    'auth/weak-password',
    'auth/invalid-credential'
  );

  const firestoreErrorGen = fc.constantFrom(
    'firestore/permission-denied',
    'firestore/not-found',
    'firestore/already-exists',
    'firestore/unavailable'
  );

  const networkErrorGen = fc.record({
    name: fc.constant('NetworkError'),
    code: fc.constant('NETWORK_ERROR'),
    message: fc.string({ minLength: 1, maxLength: 100 })
  });

  it('**Feature: dgalu-salon-system, Property 38: Network Error Recovery - Auth Error Handling**', () => {
    fc.assert(fc.property(
      authErrorGen,
      fc.string({ minLength: 1, maxLength: 100 }),
      (errorCode, errorMessage) => {
        const error = { code: errorCode, message: errorMessage };
        const result = ErrorHandler.handle(error, 'test-auth');
        
        expect(result.type).toBe('auth');
        expect(result.code).toBe(errorCode);
        expect(result.retryable).toBe(false);
        expect(result.context).toBe('test-auth');
        expect(result.timestamp).toBeInstanceOf(Date);
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    ), { numRuns: 100 });
  });

  it('**Feature: dgalu-salon-system, Property 38: Network Error Recovery - Firestore Error Handling**', () => {
    fc.assert(fc.property(
      firestoreErrorGen,
      fc.string({ minLength: 1, maxLength: 100 }),
      (errorCode, errorMessage) => {
        const error = { code: errorCode, message: errorMessage };
        const result = ErrorHandler.handle(error, 'test-firestore');
        
        expect(result.type).toBe('network');
        expect(result.code).toBe(errorCode);
        expect(result.retryable).toBe(true);
        expect(result.context).toBe('test-firestore');
        expect(result.timestamp).toBeInstanceOf(Date);
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    ), { numRuns: 100 });
  });

  it('**Feature: dgalu-salon-system, Property 38: Network Error Recovery - Network Error Handling**', () => {
    fc.assert(fc.property(
      networkErrorGen,
      (networkError) => {
        const result = ErrorHandler.handle(networkError, 'test-network');
        
        expect(result.type).toBe('network');
        expect(result.retryable).toBe(true);
        expect(result.context).toBe('test-network');
        expect(result.message).toContain('conexión');
        expect(result.timestamp).toBeInstanceOf(Date);
      }
    ), { numRuns: 100 });
  });

  it('**Feature: dgalu-salon-system, Property 38: Network Error Recovery - Business Error Handling**', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 100 }),
      fc.string({ minLength: 1, maxLength: 50 }),
      fc.boolean(),
      (message, code, retryable) => {
        const businessError = new BusinessError(message, code, retryable);
        const result = ErrorHandler.handle(businessError, 'test-business');
        
        expect(result.type).toBe('business');
        expect(result.message).toBe(message);
        expect(result.code).toBe(code);
        expect(result.retryable).toBe(retryable);
        expect(result.context).toBe('test-business');
        expect(result.timestamp).toBeInstanceOf(Date);
      }
    ), { numRuns: 100 });
  });

  it('**Feature: dgalu-salon-system, Property 38: Network Error Recovery - Retry Mechanism**', async () => {
    let attemptCount = 0;
    
    const mockOperation = vi.fn().mockImplementation(() => {
      attemptCount++;
      if (attemptCount <= 2) {
        throw new Error(`Attempt ${attemptCount} failed`);
      }
      return `Success on attempt ${attemptCount}`;
    });

    // Debería tener éxito eventualmente
    const result = await ErrorHandler.retry(mockOperation, 3, 10);
    expect(result).toBe(`Success on attempt 3`);
    expect(mockOperation).toHaveBeenCalledTimes(3);
  }, 10000); // 10 segundos de timeout

  it('**Feature: dgalu-salon-system, Property 38: Network Error Recovery - Exponential Backoff**', async () => {
    const startTime = Date.now();
    let attemptCount = 0;
    
    const mockOperation = vi.fn().mockImplementation(() => {
      attemptCount++;
      throw new Error(`Attempt ${attemptCount} failed`);
    });

    try {
      await ErrorHandler.retry(mockOperation, 2, 50); // 50ms base delay
    } catch (error) {
      // Verificar que el tiempo total sea aproximadamente correcto
      // Delays esperados: 50ms, 100ms = 150ms total (más tiempo de ejecución)
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeGreaterThan(100); // Al menos 100ms
      expect(totalTime).toBeLessThan(500); // Menos de 500ms (más tolerante)
      expect(attemptCount).toBe(3); // Intento inicial + 2 reintentos
    }
  }, 5000); // 5 segundos de timeout

  it('**Feature: dgalu-salon-system, Property 38: Network Error Recovery - Specific Business Errors**', () => {
    fc.assert(fc.property(
      fc.constantFrom(
        new BookingConflictError(),
        new InsufficientStockError(),
        new PaymentFailedError()
      ),
      (businessError) => {
        const result = ErrorHandler.handle(businessError, 'test-specific');
        
        expect(result.type).toBe('business');
        expect(result.message).toBe(businessError.message);
        expect(result.code).toBe(businessError.code);
        expect(result.retryable).toBe(businessError.retryable);
        
        // Verificar códigos específicos
        if (businessError instanceof BookingConflictError) {
          expect(result.code).toBe('BOOKING_CONFLICT');
          expect(result.retryable).toBe(false);
        } else if (businessError instanceof InsufficientStockError) {
          expect(result.code).toBe('INSUFFICIENT_STOCK');
          expect(result.retryable).toBe(false);
        } else if (businessError instanceof PaymentFailedError) {
          expect(result.code).toBe('PAYMENT_FAILED');
          expect(result.retryable).toBe(true);
        }
      }
    ), { numRuns: 100 });
  });

  it('**Feature: dgalu-salon-system, Property 38: Network Error Recovery - Zod Validation Error Handling**', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        path: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
        message: fc.string({ minLength: 1, maxLength: 100 })
      }), { minLength: 1, maxLength: 5 }),
      (zodErrors) => {
        const zodError = {
          name: 'ZodError',
          errors: zodErrors
        };
        
        const result = ErrorHandler.handle(zodError, 'test-validation');
        
        expect(result.type).toBe('validation');
        expect(result.code).toBe('VALIDATION_ERROR');
        expect(result.retryable).toBe(false);
        expect(result.context).toBe('test-validation');
        expect(result.message).toContain(zodErrors[0].path.join('.'));
        expect(result.message).toContain(zodErrors[0].message);
      }
    ), { numRuns: 100 });
  });

  it('**Feature: dgalu-salon-system, Property 38: Network Error Recovery - Unknown Error Handling**', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 100 }),
      (errorMessage) => {
        const unknownError = new Error(errorMessage);
        const result = ErrorHandler.handle(unknownError, 'test-unknown');
        
        expect(result.type).toBe('unknown');
        expect(result.code).toBe('UNKNOWN_ERROR');
        expect(result.retryable).toBe(false);
        expect(result.context).toBe('test-unknown');
        expect(result.message).toBe(errorMessage);
        expect(result.timestamp).toBeInstanceOf(Date);
      }
    ), { numRuns: 100 });
  });

  it('**Feature: dgalu-salon-system, Property 38: Network Error Recovery - Error Message Consistency**', () => {
    const error = { code: 'auth/invalid-credential' };
    const result = ErrorHandler.handle(error, 'test-consistency');
    
    // Verificar que los mensajes de error sean consistentes y útiles
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe('string');
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.message).not.toContain('undefined');
    expect(result.message).not.toContain('null');
    
    // Verificar que el mensaje sea en español y amigable
    expect(result.message).toBe('Credenciales inválidas');
  });
});