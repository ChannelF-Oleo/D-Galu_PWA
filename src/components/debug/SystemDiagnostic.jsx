// src/components/debug/SystemDiagnostic.jsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Database, 
  Bell, 
  User, 
  Settings,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const SystemDiagnostic = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotifications();
  
  const [diagnostics, setDiagnostics] = useState({
    firebase: { status: 'checking', message: 'Verificando conexión...' },
    services: { status: 'checking', message: 'Verificando servicios...' },
    products: { status: 'checking', message: 'Verificando productos...' },
    auth: { status: 'checking', message: 'Verificando autenticación...' },
    notifications: { status: 'checking', message: 'Verificando notificaciones...' },
    permissions: { status: 'checking', message: 'Verificando permisos...' }
  });

  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    
    // Reset diagnostics
    setDiagnostics({
      firebase: { status: 'checking', message: 'Verificando conexión...' },
      services: { status: 'checking', message: 'Verificando servicios...' },
      products: { status: 'checking', message: 'Verificando productos...' },
      auth: { status: 'checking', message: 'Verificando autenticación...' },
      notifications: { status: 'checking', message: 'Verificando notificaciones...' },
      permissions: { status: 'checking', message: 'Verificando permisos...' }
    });

    // Test Firebase Connection
    try {
      const testDoc = await getDoc(doc(db, 'test', 'connection'));
      setDiagnostics(prev => ({
        ...prev,
        firebase: { 
          status: 'success', 
          message: 'Conexión Firebase exitosa' 
        }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        firebase: { 
          status: 'error', 
          message: `Error Firebase: ${error.message}` 
        }
      }));
    }

    // Test Services Collection
    try {
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const servicesCount = servicesSnapshot.size;
      
      if (servicesCount > 0) {
        setDiagnostics(prev => ({
          ...prev,
          services: { 
            status: 'success', 
            message: `${servicesCount} servicios encontrados` 
          }
        }));
      } else {
        setDiagnostics(prev => ({
          ...prev,
          services: { 
            status: 'warning', 
            message: 'No hay servicios en la base de datos' 
          }
        }));
      }
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        services: { 
          status: 'error', 
          message: `Error cargando servicios: ${error.message}` 
        }
      }));
    }

    // Test Products Collection
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsCount = productsSnapshot.size;
      
      if (productsCount > 0) {
        setDiagnostics(prev => ({
          ...prev,
          products: { 
            status: 'success', 
            message: `${productsCount} productos encontrados` 
          }
        }));
      } else {
        setDiagnostics(prev => ({
          ...prev,
          products: { 
            status: 'warning', 
            message: 'No hay productos en la base de datos' 
          }
        }));
      }
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        products: { 
          status: 'error', 
          message: `Error cargando productos: ${error.message}` 
        }
      }));
    }

    // Test Authentication
    if (user) {
      setDiagnostics(prev => ({
        ...prev,
        auth: { 
          status: 'success', 
          message: `Usuario autenticado: ${user.displayName || user.email}` 
        }
      }));
    } else {
      setDiagnostics(prev => ({
        ...prev,
        auth: { 
          status: 'warning', 
          message: 'No hay usuario autenticado' 
        }
      }));
    }

    // Test Notifications
    try {
      const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
      const notificationsCount = notificationsSnapshot.size;
      
      setDiagnostics(prev => ({
        ...prev,
        notifications: { 
          status: notificationsCount > 0 ? 'success' : 'warning', 
          message: `${notificationsCount} notificaciones en BD. Hook: ${notifications.length} cargadas, ${unreadCount} no leídas` 
        }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        notifications: { 
          status: 'error', 
          message: `Error notificaciones: ${error.message}` 
        }
      }));
    }

    // Test Permissions
    if (user?.role) {
      const adminRoles = ['admin', 'manager', 'staff'];
      const isAdmin = adminRoles.includes(user.role);
      
      setDiagnostics(prev => ({
        ...prev,
        permissions: { 
          status: isAdmin ? 'success' : 'warning', 
          message: `Rol: ${user.role} ${isAdmin ? '(Admin)' : '(Cliente)'}` 
        }
      }));
    } else {
      setDiagnostics(prev => ({
        ...prev,
        permissions: { 
          status: 'error', 
          message: 'No se pudo determinar el rol del usuario' 
        }
      }));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [user, notifications, unreadCount]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const diagnosticItems = [
    { key: 'firebase', icon: Database, title: 'Conexión Firebase' },
    { key: 'services', icon: Settings, title: 'Servicios' },
    { key: 'products', icon: ShoppingBag, title: 'Productos' },
    { key: 'auth', icon: User, title: 'Autenticación' },
    { key: 'notifications', icon: Bell, title: 'Notificaciones' },
    { key: 'permissions', icon: Settings, title: 'Permisos' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🔍 Diagnóstico del Sistema
              </h2>
              <p className="text-gray-600 mt-1">
                Verificación automática de componentes críticos
              </p>
            </div>
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Verificando...' : 'Verificar Nuevamente'}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {diagnosticItems.map(({ key, icon: Icon, title }) => {
              const diagnostic = diagnostics[key];
              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(diagnostic.status)}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        {getStatusIcon(diagnostic.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {diagnostic.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              📊 Información del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Proyecto Firebase:</strong> {process.env.VITE_FIREBASE_PROJECT_ID || 'No configurado'}
              </div>
              <div>
                <strong>Usuario Actual:</strong> {user?.email || 'No autenticado'}
              </div>
              <div>
                <strong>Rol:</strong> {user?.role || 'No definido'}
              </div>
              <div>
                <strong>Notificaciones Hook:</strong> {notificationsLoading ? 'Cargando...' : `${notifications.length} cargadas`}
              </div>
            </div>
          </div>

          {/* Acciones recomendadas */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">
              🎯 Acciones Recomendadas
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {diagnostics.services.status === 'warning' && (
                <li>• Ir a /upload-services para cargar servicios</li>
              )}
              {diagnostics.products.status === 'warning' && (
                <li>• Ir a /upload-services para cargar productos</li>
              )}
              {diagnostics.notifications.status === 'error' && (
                <li>• Ir a /upload-services para crear notificaciones</li>
              )}
              {diagnostics.auth.status === 'warning' && (
                <li>• Iniciar sesión para acceder a funcionalidades completas</li>
              )}
              {diagnostics.firebase.status === 'error' && (
                <li>• Verificar configuración en .env y Firebase Console</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDiagnostic;