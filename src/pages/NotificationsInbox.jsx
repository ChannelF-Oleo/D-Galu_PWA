// src/pages/NotificationsInbox.jsx

import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Filter, Search, ArrowLeft } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';

const NotificationsInbox = ({ onBack }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');

  const handleNotificationClick = async (notification) => {
    if (notification.readBy && !notification.readBy.includes(user.uid)) {
      await markAsRead(notification.id);
    }
    
    // Navegar según el tipo de notificación
    if (notification.type === 'new_booking' && notification.bookingId) {
      console.log('Navigate to booking:', notification.bookingId);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_booking':
        return '📅';
      case 'booking_cancelled':
        return '❌';
      case 'booking_confirmed':
        return '✅';
      case 'payment_received':
        return '💰';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const isRead = notification.readBy && notification.readBy.includes(user.uid);
    
    // Filtro por estado
    if (filter === 'unread' && isRead) return false;
    if (filter === 'read' && !isRead) return false;
    
    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title?.toLowerCase().includes(searchLower) ||
        notification.message?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  return (
    <div className="notifications-inbox max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          
          <div className="flex items-center gap-3">
            <Bell className="text-purple-600" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Buzón de Notificaciones
              </h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas las notificaciones leídas'}
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCheck size={16} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Todas</option>
            <option value="unread">Sin leer</option>
            <option value="read">Leídas</option>
          </select>
        </div>

        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar notificaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Cargando notificaciones...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filter !== 'all' ? 'No se encontraron notificaciones' : 'No hay notificaciones'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Las nuevas notificaciones aparecerán aquí'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const isRead = notification.readBy && notification.readBy.includes(user.uid);
            
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`border-l-4 rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all ${
                  getPriorityColor(notification.priority)
                } ${!isRead ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`font-medium ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {!isRead && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-blue-600 font-medium">Nueva</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-gray-500">
                          {formatTime(notification.createdAt)}
                        </p>
                        
                        {notification.priority === 'high' && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Urgente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsInbox;