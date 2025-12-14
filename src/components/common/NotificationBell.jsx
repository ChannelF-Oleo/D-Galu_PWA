// src/components/common/NotificationBell.jsx

import React, { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck } from "lucide-react"; // Eliminé 'Check' que no se usaba
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../context/AuthContext";
import "../layout/TopBar.css";

const NotificationBell = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markAllAsRead, markAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. MOVER EL USEEFFECT AQUÍ (ANTES DEL RETURN)
  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el componente no se renderizó (ref null), no pasa nada
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. AHORA SÍ PUEDES HACER EL RETURN CONDICIONAL
  // Solo mostrar para roles administrativos
  if (!user || !["admin", "manager", "staff"].includes(user.role)) {
    return null;
  }

  // --- Funciones auxiliares ---
  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);

    // Navegar según el tipo de notificación
    if (notification.type === "new_booking" && notification.bookingId) {
      console.log("Navigate to booking:", notification.bookingId);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    // Soporte tanto para Timestamp de Firestore como para Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    // Cálculo seguro evitando divisiones por cero o negativos extraños
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_booking":
        return "📅";
      case "booking_cancelled":
        return "❌";
      case "booking_confirmed":
        return "✅";
      case "payment_received":
        return "💰";
      default:
        return "📢";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Campana */}
      <button onClick={() => setIsOpen(!isOpen)} className="topbar__action-btn">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-[10px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notificaciones
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Cargando notificaciones...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No hay notificaciones
              </div>
            ) : (
              notifications.map((notification) => {
                const isRead =
                  notification.readBy && notification.readBy.includes(user.uid);

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${getPriorityColor(
                      notification.priority
                    )} ${!isRead ? "bg-blue-50" : "bg-white"}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-medium ${
                              !isRead ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {!isRead && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-blue-600 font-medium">
                              Nueva
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  window.dispatchEvent(
                    new CustomEvent("openNotificationsInbox")
                  );
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
