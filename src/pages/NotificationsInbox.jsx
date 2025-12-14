// src/pages/NotificationsInbox.jsx

import React, { useState, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../context/AuthContext";

// Componente interno para manejar el Swipe (Deslizar)
const SwipeableNotification = ({ children, onDelete, isRead }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const itemRef = useRef(null);

  // Manejadores de eventos táctiles
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentTouchX = e.touches[0].clientX;
    const diff = currentTouchX - startX;

    // Solo permitir deslizar hacia la izquierda (valores negativos)
    // Limitar el deslizamiento a -150px visualmente
    if (diff < 0 && diff > -200) {
      setCurrentX(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Si se deslizó más de 100px, confirmar borrado
    if (currentX < -100) {
      setCurrentX(-1000); // Animación de salida
      setTimeout(() => {
        onDelete();
      }, 300); // Esperar animación
    } else {
      setCurrentX(0); // Regresar a posición original
    }
  };

  return (
    <div className="relative overflow-hidden mb-3 select-none">
      {/* Fondo Rojo (Acción de Borrar) */}
      <div className="absolute inset-0 bg-red-500 rounded-lg flex items-center justify-end px-6">
        <span className="text-white font-bold flex items-center gap-2">
          <Trash2 size={20} /> Borrar
        </span>
      </div>

      {/* Tarjeta de Notificación (Frente) */}
      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${currentX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        className={`relative bg-white rounded-lg shadow-sm border border-gray-100 z-10 ${
          !isRead
            ? "border-l-4 border-l-blue-500"
            : "border-l-4 border-l-transparent"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const NotificationsInbox = ({ onBack }) => {
  const { user } = useAuth();
  // ASUMIMOS que deleteNotification existe en tu hook. Si no, agrégalo.
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState("all"); // all, unread, read
  const [searchTerm, setSearchTerm] = useState("");

  // Lógica de filtrado
  const filteredNotifications = notifications.filter((notification) => {
    const isRead =
      notification.readBy && notification.readBy.includes(user.uid);

    // Filtro por estado
    if (filter === "unread" && isRead) return false;
    if (filter === "read" && !isRead) return false;

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        notification.title?.toLowerCase().includes(term) ||
        notification.message?.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const handleNotificationClick = async (notification) => {
    if (notification.readBy && !notification.readBy.includes(user.uid)) {
      await markAsRead(notification.id);
    }

    if (notification.type === "new_booking" && notification.bookingId) {
      console.log("Navigate to booking:", notification.bookingId);
    }
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation(); // Evitar abrir la notificación
    await markAsRead(id);
  };

  const handleDelete = async (id) => {
    // Si deleteNotification no viene del hook, esto fallará.
    // Asegúrate de implementarlo o usar un console.log temporalmente.
    if (deleteNotification) {
      await deleteNotification(id);
    } else {
      console.warn(
        "La función deleteNotification no está disponible en el hook useNotifications"
      );
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Notificaciones
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </h1>
            <p className="text-gray-500 text-sm">
              Gestiona tus avisos y alertas
            </p>
          </div>
        </div>

        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          disabled={unreadCount === 0}
        >
          <CheckCheck size={18} />
          <span className="hidden sm:inline">Marcar todas como leídas</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Filtros */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {["all", "unread", "read"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "all" ? "Todas" : f === "unread" ? "No leídas" : "Leídas"}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar notificaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Lista de Notificaciones */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p>Cargando...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Bell size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-500">
              No tienes notificaciones
            </p>
            <p className="text-sm">
              {filter !== "all" || searchTerm
                ? "Prueba cambiando los filtros"
                : "Te avisaremos cuando haya novedades"}
            </p>
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {filteredNotifications.map((notification) => {
              const isRead =
                notification.readBy && notification.readBy.includes(user.uid);

              return (
                <SwipeableNotification
                  key={notification.id}
                  isRead={isRead}
                  onDelete={() => handleDelete(notification.id)}
                >
                  <div
                    onClick={() => handleNotificationClick(notification)}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex gap-4">
                      {/* Icono */}
                      <div
                        className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          notification.priority === "high"
                            ? "bg-red-100 text-red-600"
                            : notification.type === "booking"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {notification.type === "new_booking" ? "📅" : "📢"}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className={`text-base font-medium truncate ${
                              !isRead ? "text-gray-900" : "text-gray-600"
                            }`}
                          >
                            {notification.title}
                          </h3>

                          {/* Botones de acción (Visible en Hover/Desktop) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isRead && (
                              <button
                                onClick={(e) =>
                                  handleMarkAsRead(e, notification.id)
                                }
                                title="Marcar como leída"
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              title="Eliminar"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <p
                          className={`mt-1 text-sm ${
                            !isRead ? "text-gray-800" : "text-gray-500"
                          }`}
                        >
                          {notification.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {!isRead && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Nueva
                              </span>
                            )}
                            {notification.priority === "high" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Urgente
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwipeableNotification>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsInbox;
