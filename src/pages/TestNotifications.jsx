// src/pages/TestNotifications.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationBell from '../components/common/NotificationBell';
import { Bell, User, Database, CheckCircle, AlertCircle } from 'lucide-react';

const TestNotifications = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, createNotification } = useNotifications();

  const handleCreateTestNotification = async () => {
    try {
      await createNotification({
        title: "Notificación de Prueba",
        message: `Creada a las ${new Date().toLocaleTimeString()}`,
        type: "system",
        priority: "medium",
        targetRoles: ["admin", "manager", "staff"]
      });
      alert("Notificación de prueba creada!");
    } catch (error) {
      alert("Error creando notificación: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <Bell className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Prueba de Notificaciones
              </h1>
              <p className="text-gray-600">
                Página de prueba para verificar el sistema de notificaciones
              </p>
            </div>

            {/* Estado del usuario */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Estado del Usuario
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>Email: {user?.email || 'No autenticado'}</div>
                  <div>Rol: {user?.role || 'No definido'}</div>
                  <div>UID: {user?.uid || 'N/A'}</div>
                  <div className="flex items-center gap-2">
                    {user && ['admin', 'manager', 'staff'].includes(user.role) ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">Puede ver notificaciones</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-700">No puede ver notificaciones</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Estado de Notificaciones
                </h3>
                <div className="text-sm text-green-800 space-y-1">
                  <div>Cargando: {loading ? 'Sí' : 'No'}</div>
                  <div>Total: {notifications.length}</div>
                  <div>No leídas: {unreadCount}</div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">Hook funcionando</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-700">Sin notificaciones</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Componente de notificaciones */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">
                Componente NotificationBell:
              </h3>
              <div className="flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <NotificationBell />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Haz clic en la campana para probar el dropdown
              </p>
            </div>

            {/* Acciones */}
            <div className="text-center space-y-4">
              <button
                onClick={handleCreateTestNotification}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Crear Notificación de Prueba
              </button>
              
              <div className="text-sm text-gray-500">
                <p>Esta página es solo para pruebas. Se puede remover después.</p>
              </div>
            </div>

            {/* Lista de notificaciones (debug) */}
            {notifications.length > 0 && (
              <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Debug - Lista de Notificaciones:
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <div key={notification.id || index} className="bg-white p-3 rounded border text-sm">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-gray-600">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Tipo: {notification.type} | Prioridad: {notification.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNotifications;