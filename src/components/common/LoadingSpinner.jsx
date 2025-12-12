// src/components/common/LoadingSpinner.jsx

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente de spinner de carga reutilizable
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'rose', 
  text = null, 
  fullScreen = false,
  className = '' 
}) => {
  // Tamaños del spinner
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Colores del spinner
  const colors = {
    rose: 'text-rose-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const spinnerClasses = `animate-spin ${sizes[size]} ${colors[color]} ${className}`;

  // Contenido del spinner
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 className={spinnerClasses} />
      {text && (
        <p className="text-sm text-gray-600 font-medium">
          {text}
        </p>
      )}
    </div>
  );

  // Si es fullScreen, envolver en un overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

/**
 * Componente de skeleton loader para contenido
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  avatar = false,
  button = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Avatar skeleton */}
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}

      {/* Lines skeleton */}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div 
            key={index}
            className={`h-4 bg-gray-300 rounded ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          ></div>
        ))}
      </div>

      {/* Button skeleton */}
      {button && (
        <div className="mt-4">
          <div className="h-10 bg-gray-300 rounded w-32"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente de card skeleton para listas
 */
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          {/* Imagen */}
          <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
          
          {/* Título */}
          <div className="h-6 bg-gray-300 rounded mb-3 w-3/4"></div>
          
          {/* Descripción */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
          
          {/* Precio/Botón */}
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-300 rounded w-20"></div>
            <div className="h-8 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * HOC para envolver componentes con loading
 */
export const withLoading = (WrappedComponent) => {
  return function WithLoadingComponent({ loading, error, ...props }) {
    if (loading) {
      return <LoadingSpinner size="lg" text="Cargando..." />;
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default LoadingSpinner;