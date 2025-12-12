// src/components/bookings/BookingDetailModal.jsx

import React from 'react';
import { X, Calendar, Clock, User, Phone, Mail, MessageSquare, DollarSign, Timer } from 'lucide-react';

const BookingDetailModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada'
    };
    return labels[status] || 'Pendiente';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Detalles de la Cita
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                ID: {booking.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Estado:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="text-purple-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Fecha</p>
                  <p className="text-gray-900">{formatDate(booking.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="text-purple-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Hora</p>
                  <p className="text-gray-900">{booking.time}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="text-purple-600" size={20} />
                Información del Cliente
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Nombre</p>
                  <p className="text-gray-900">{booking.customerName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Teléfono</p>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <p className="text-gray-900">{booking.customerPhone}</p>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <p className="text-gray-900">{booking.customerEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Servicios Solicitados
              </h3>
              
              <div className="space-y-3">
                {booking.services?.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {service.serviceName}
                      </p>
                      {service.subserviceName && (
                        <p className="text-sm text-gray-600">
                          {service.subserviceName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${service.price}
                      </p>
                      <p className="text-sm text-gray-600">
                        {service.duration} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="text-purple-600" size={16} />
                    <span className="font-medium text-gray-700">Duración Total:</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {booking.totalDuration} minutos
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-purple-600" size={16} />
                    <span className="font-medium text-gray-700">Total:</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    ${booking.totalPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="text-purple-600" size={20} />
                  Notas Adicionales
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {booking.notes}
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Creada:</span>
                  <p>{booking.createdAt?.toDate?.()?.toLocaleString('es-ES') || 'No disponible'}</p>
                </div>
                {booking.updatedAt && (
                  <div>
                    <span className="font-medium">Actualizada:</span>
                    <p>{booking.updatedAt?.toDate?.()?.toLocaleString('es-ES')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            
            <button
              onClick={() => {
                // TODO: Implementar edición de cita
                console.log('Editar cita:', booking.id);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Editar Cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;