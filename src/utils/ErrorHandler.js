// src/utils/ErrorHandler.js

/**
 * Utility class para manejo centralizado de errores
 */
export class ErrorHandler {
  /**
   * Maneja diferentes tipos de errores y devuelve un estado normalizado
   * @param {Error} error - El error a manejar
   * @param {string} context - Contexto donde ocurrió el error
   * @returns {ErrorState} Estado normalizado del error
   */
  static handle(error, context = 'unknown') {
    const timestamp = new Date();
    
    // Errores de Firebase Auth
    if (error.code?.startsWith('auth/')) {
      return {
        type: 'auth',
        message: this.getAuthErrorMessage(error.code),
        code: error.code,
        retryable: false,
        timestamp,
        context
      };
    }
    
    // Errores de Firebase Firestore
    if (error.code?.startsWith('firestore/')) {
      return {
        type: 'network',
        message: this.getFirestoreErrorMessage(error.code),
        code: error.code,
        retryable: true,
        timestamp,
        context
      };
    }
    
    // Errores de red
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return {
        type: 'network',
        message: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
        code: error.code,
        retryable: true,
        timestamp,
        context
      };
    }
    
    // Errores de validación (Zod)
    if (error.name === 'ZodError') {
      return {
        type: 'validation',
        message: this.getValidationErrorMessage(error),
        code: 'VALIDATION_ERROR',
        retryable: false,
        timestamp,
        context
      };
    }
    
    // Errores de negocio personalizados
    if (error.type === 'business') {
      return {
        type: 'business',
        message: error.message,
        code: error.code,
        retryable: error.retryable || false,
        timestamp,
        context
      };
    }
    
    // Error genérico
    return {
      type: 'unknown',
      message: error.message || 'Ha ocurrido un error inesperado',
      code: 'UNKNOWN_ERROR',
      retryable: false,
      timestamp,
      context
    };
  }

  /**
   * Reintenta una operación con backoff exponencial
   * @param {Function} operation - Función a reintentar
   * @param {number} maxRetries - Número máximo de reintentos
   * @param {number} baseDelay - Delay base en ms
   * @returns {Promise} Resultado de la operación
   */
  static async retry(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw this.handle(lastError, 'retry-exhausted');
        }
        
        // Backoff exponencial: 1s, 2s, 4s, 8s...
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Muestra mensaje amigable al usuario
   * @param {ErrorState} errorState - Estado del error
   */
  static showUserFriendlyMessage(errorState) {
    // Esta función será implementada con el sistema de notificaciones
    // Por ahora, solo console.error para debugging
    console.error(`[${errorState.type.toUpperCase()}] ${errorState.message}`, {
      code: errorState.code,
      context: errorState.context,
      timestamp: errorState.timestamp
    });
  }

  // Métodos privados para mensajes específicos
  static getAuthErrorMessage(code) {
    const authErrors = {
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/email-already-in-use': 'Ya existe una cuenta con este email',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-credential': 'Credenciales inválidas'
    };
    
    return authErrors[code] || 'Error de autenticación';
  }

  static getFirestoreErrorMessage(code) {
    const firestoreErrors = {
      'firestore/permission-denied': 'No tienes permisos para esta operación',
      'firestore/not-found': 'El documento solicitado no existe',
      'firestore/already-exists': 'El documento ya existe',
      'firestore/unavailable': 'Servicio temporalmente no disponible'
    };
    
    return firestoreErrors[code] || 'Error en la base de datos';
  }

  static getValidationErrorMessage(zodError) {
    const firstError = zodError.errors[0];
    return `${firstError.path.join('.')}: ${firstError.message}`;
  }
}

/**
 * Hook personalizado para manejo de estados de carga y errores
 */
export const useAsyncState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (asyncFunction, context = 'async-operation') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setLoading(false);
      return result;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, context);
      setError(errorState);
      setLoading(false);
      ErrorHandler.showUserFriendlyMessage(errorState);
      throw errorState;
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
  };

  return { loading, error, execute, reset };
};

// Tipos de errores personalizados para el negocio
export class BusinessError extends Error {
  constructor(message, code, retryable = false) {
    super(message);
    this.name = 'BusinessError';
    this.type = 'business';
    this.code = code;
    this.retryable = retryable;
  }
}

// Errores específicos del dominio
export class BookingConflictError extends BusinessError {
  constructor(message = 'El horario seleccionado ya no está disponible') {
    super(message, 'BOOKING_CONFLICT', false);
  }
}

export class InsufficientStockError extends BusinessError {
  constructor(message = 'Stock insuficiente para completar la operación') {
    super(message, 'INSUFFICIENT_STOCK', false);
  }
}

export class PaymentFailedError extends BusinessError {
  constructor(message = 'Error en el procesamiento del pago') {
    super(message, 'PAYMENT_FAILED', true);
  }
}