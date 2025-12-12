// src/components/booking/BookingWidget.jsx

import React, { useState } from "react";
import BookingCalendar from "./BookingCalendar";
import { useBookingAvailability } from "../../hooks/useBookingAvailability";
import { useNotifications } from "../../hooks/useNotifications";
import { Calendar, Clock, User } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

/**
 * Widget completo de reservas que incluye calendario y formulario
 */
const BookingWidget = ({ 
  service = null, // Para compatibilidad con uso anterior
  services = null, // Nuevo: array de servicios
  totalPrice = null,
  totalDuration = null,
  onBookingComplete = null,
  className = ""
}) => {
  // Determinar si estamos usando servicio único o múltiples servicios
  const isMultipleServices = services && Array.isArray(services);
  const serviceData = isMultipleServices ? services[0] : service; // Para el hook de disponibilidad
  const displayServices = isMultipleServices ? services : (service ? [service] : []);
  // Estados del formulario
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });
  const [step, setStep] = useState(1); // 1: calendario, 2: información, 3: confirmación

  // Hook de disponibilidad (usar el primer servicio para disponibilidad)
  const {
    bookedSlots,
    loading: availabilityLoading,
    error,
    reserveSlotTemporarily
  } = useBookingAvailability(serviceData?.id, selectedDate);

  // Hook de notificaciones
  const { createNotification } = useNotifications();

  // Estado de carga para el booking
  const [bookingLoading, setBookingLoading] = useState(false);

  // Manejar cambio de fecha
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Limpiar hora seleccionada
  };

  // Manejar cambio de hora
  const handleTimeChange = (time) => {
    setSelectedTime(time);
    
    // Reservar temporalmente el slot por 5 minutos
    if (time && selectedDate) {
      reserveSlotTemporarily(selectedDate, time, 300000); // 5 minutos
    }
  };

  // Manejar cambios en información del cliente
  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Continuar al siguiente paso
  const handleNextStep = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2);
    } else if (step === 2 && isCustomerInfoValid()) {
      setStep(3);
    }
  };

  // Volver al paso anterior
  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Validar información del cliente
  const isCustomerInfoValid = () => {
    return customerInfo.name.trim() && 
           customerInfo.phone.trim() && 
           customerInfo.email.trim() &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email);
  };

  // Confirmar reserva
  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);
      
      const bookingData = {
        services: displayServices.map(s => ({
          serviceId: s.id,
          serviceName: s.serviceName || s.name,
          subserviceName: s.subserviceName,
          price: s.price,
          duration: s.duration
        })),
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        totalDuration: totalDuration || displayServices.reduce((sum, s) => sum + (s.duration || 20), 0),
        totalPrice: totalPrice || displayServices.reduce((sum, s) => sum + (s.price || 0), 0),
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        notes: customerInfo.notes,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Guardar reserva en Firebase
      console.log("Saving booking to Firebase:", bookingData);
      const docRef = await addDoc(collection(db, "bookings"), bookingData);
      
      // Agregar el ID generado a los datos
      const savedBooking = {
        id: docRef.id,
        ...bookingData
      };
      
      console.log("Booking saved successfully:", savedBooking);
      
      // Crear notificación para administradores
      await createNotification({
        type: 'new_booking',
        title: 'Nueva Reserva',
        message: `${customerInfo.name} ha hecho una reserva para ${selectedDate.toLocaleDateString()}`,
        bookingId: docRef.id,
        priority: 'high'
      });

      // Enviar email de confirmación usando Cloud Functions
      try {
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions();
        const sendConfirmation = httpsCallable(functions, 'sendBookingConfirmation');
        
        await sendConfirmation({ bookingData: savedBooking });
        console.log('Confirmation email sent successfully to:', savedBooking.customerEmail);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // No fallar la reserva si el email falla
        alert('Reserva creada exitosamente, pero hubo un problema enviando el email de confirmación. Te contactaremos pronto.');
      }
      
      if (onBookingComplete) {
        onBookingComplete(savedBooking);
      }

      // Resetear formulario
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setCustomerInfo({ name: "", phone: "", email: "", notes: "" });

    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Error al crear la reserva. Por favor intenta nuevamente.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className={`booking-widget max-w-4xl mx-auto ${className}`}>
      {/* Header con información de los servicios */}
      {displayServices.length > 0 && (
        <div className="service-info bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isMultipleServices ? `Cita múltiple (${displayServices.length} servicios)` : displayServices[0].name}
            </h2>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <Clock size={16} />
                {totalDuration || displayServices.reduce((sum, s) => sum + (s.duration || 20), 0)} min total
              </span>
              <span className="font-bold text-purple-600 text-lg">
                ${totalPrice || displayServices.reduce((sum, s) => sum + (s.price || 0), 0)} total
              </span>
            </div>
          </div>

          {/* Lista de servicios */}
          <div className="space-y-2">
            {displayServices.map((service, index) => (
              <div key={service.key || index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{service.name}</div>
                  {service.description && (
                    <div className="text-sm text-gray-600">{service.description}</div>
                  )}
                </div>
                <div className="text-right text-sm">
                  <div className="text-gray-600">{service.duration || 20} min</div>
                  <div className="font-semibold text-purple-600">${service.price || 0}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de pasos */}
      <div className="steps-indicator mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className={`
                step-circle w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= stepNumber 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`
                  step-line w-16 h-1 mx-2
                  ${step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <div className="flex gap-16 text-sm text-gray-600">
            <span className={step >= 1 ? 'text-purple-600 font-medium' : ''}>
              Fecha y Hora
            </span>
            <span className={step >= 2 ? 'text-purple-600 font-medium' : ''}>
              Información
            </span>
            <span className={step >= 3 ? 'text-purple-600 font-medium' : ''}>
              Confirmación
            </span>
          </div>
        </div>
      </div>

      {/* Contenido según el paso */}
      <div className="step-content bg-white rounded-lg shadow-sm border p-6">
        {step === 1 && (
          <div className="calendar-step">
            <BookingCalendar
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={handleDateChange}
              onTimeChange={handleTimeChange}
              serviceId={serviceData?.id}
              serviceDuration={totalDuration || displayServices.reduce((sum, s) => sum + (s.duration || 20), 0)}
              bookedSlots={bookedSlots}
              loading={availabilityLoading}
            />
            
            {error && (
              <div className="error-message mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">
                  Error al cargar disponibilidad: {error.message}
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="customer-info-step">
            <div className="flex items-center gap-2 mb-6">
              <User className="text-purple-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Información de contacto
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={customerInfo.notes}
                  onChange={(e) => handleCustomerInfoChange('notes', e.target.value)}
                  placeholder="Alguna información adicional que quieras compartir..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="confirmation-step">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="text-purple-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar reserva
              </h3>
            </div>

            <div className="confirmation-details space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Detalles de la cita</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Servicios:</span>
                    <div className="text-right">
                      {displayServices.map((service, index) => (
                        <div key={service.key || index} className="font-medium">
                          {service.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">
                      {selectedDate?.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración total:</span>
                    <span className="font-medium">
                      {totalDuration || displayServices.reduce((sum, s) => sum + (s.duration || 20), 0)} minutos
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-purple-600">
                      ${totalPrice || displayServices.reduce((sum, s) => sum + (s.price || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Información de contacto</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">{customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="font-medium">{customerInfo.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{customerInfo.email}</span>
                  </div>
                  {customerInfo.notes && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-600">Notas:</span>
                      <p className="text-gray-900 mt-1">{customerInfo.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="step-navigation flex justify-between mt-8">
          <button
            onClick={handlePreviousStep}
            disabled={step === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={
                (step === 1 && (!selectedDate || !selectedTime)) ||
                (step === 2 && !isCustomerInfoValid())
              }
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={handleConfirmBooking}
              disabled={bookingLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingLoading ? "Guardando..." : "Confirmar Reserva"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;