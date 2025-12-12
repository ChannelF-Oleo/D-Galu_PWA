// src/pages/UploadServices.jsx
// Página temporal para subir servicios (solo desarrollo)

import React, { useState } from 'react';

const UploadServices = () => {
  const [message, setMessage] = useState('');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Página de Desarrollo
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Esta página solo está disponible en modo desarrollo para subir servicios de prueba.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Subir Servicios</h1>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo JSON de Servicios
                </label>
                <input
                  type="file"
                  accept=".json"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato esperado
                </label>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "services": [
    {
      "id": "service-1",
      "name": "Corte de Cabello",
      "description": "Corte profesional",
      "duration": 45,
      "price": "$25.00",
      "category": "cabello",
      "active": true
    }
  ]
}`}
                </pre>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setMessage('Funcionalidad en desarrollo...')}
                >
                  Subir Servicios
                </button>
                
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={() => setMessage('')}
                >
                  Limpiar
                </button>
              </div>

              {message && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{message}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Instrucciones</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Esta página solo funciona en modo desarrollo</li>
            <li>Sube un archivo JSON con la estructura mostrada arriba</li>
            <li>Los servicios se validarán antes de guardarse en Firestore</li>
            <li>En producción, usa el panel de administración para gestionar servicios</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadServices;