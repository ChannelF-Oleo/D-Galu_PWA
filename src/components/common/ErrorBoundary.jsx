// src/components/common/ErrorBoundary.jsx

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Captura detalles del error
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log del error para debugging
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    
    // Aquí podrías enviar el error a un servicio de logging
    // como Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Componente de UI para mostrar cuando hay error
const ErrorFallback = ({ error, errorInfo, resetError }) => {
  const handleGoHome = () => {
    resetError();
    // Usar window.location en lugar de navigate para evitar errores de contexto
    window.location.href = '/';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icono de error */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Oops! Algo salió mal
        </h1>

        {/* Descripción */}
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y 
          estamos trabajando para solucionarlo.
        </p>

        {/* Detalles del error (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Ver detalles técnicos
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
              <div className="font-bold text-red-600 mb-2">Error:</div>
              <div className="mb-2">{error.toString()}</div>
              {errorInfo && (
                <>
                  <div className="font-bold text-red-600 mb-2">Stack Trace:</div>
                  <div className="whitespace-pre-wrap">{errorInfo.componentStack}</div>
                </>
              )}
            </div>
          </details>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReload}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar página
          </button>
          
          <button
            onClick={handleGoHome}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-rose-600 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir al inicio
          </button>
        </div>

        {/* Información de contacto */}
        <p className="mt-6 text-xs text-gray-500">
          Si el problema persiste, contáctanos en{' '}
          <a 
            href="mailto:soporte@dgalu.com" 
            className="text-rose-600 hover:text-rose-500"
          >
            soporte@dgalu.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundary;