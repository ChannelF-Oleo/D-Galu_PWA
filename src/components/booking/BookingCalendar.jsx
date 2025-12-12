// src/components/booking/BookingCalendar.jsx

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { Clock, Calendar as CalendarIcon, AlertCircle, CheckCircle } from "lucide-react";
import "react-calendar/dist/Calendar.css";

/**
 * Componente de calendario interactivo para reservas
 * Muestra disponibilidad en tiempo real y permite selección de fecha y hora
 */
const BookingCalendar = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  serviceId,
  serviceDuration = 60, // duración en minutos
  availableSlots = [],
  bookedSlots = [],
  loading = false,
  className = ""
}) => {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [calendarValue, setCalendarValue] = useState(selectedDate || new Date());

  // Horarios de trabajo (se pueden hacer configurables)
  const workingHours = {
    start: 9, // 9:00 AM
    end: 18,  // 6:00 PM
    interval: 30 // intervalos de 30 minutos
  };

  // Convertir hora 24h a formato 12h (República Dominicana)
  const formatTo12Hour = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // Generar slots de tiempo disponibles para una fecha
  const generateTimeSlots = (date) => {
    const slots = [];
    const startHour = workingHours.start;
    const endHour = workingHours.end;
    const interval = workingHours.interval;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeSlot24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const timeSlot12 = formatTo12Hour(hour, minute);
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, minute, 0, 0);

        // Verificar si el slot no está en el pasado
        const now = new Date();
        if (slotDateTime > now) {
          slots.push({
            time: timeSlot24, // Mantener formato 24h para comparaciones
            displayTime: timeSlot12, // Formato 12h para mostrar
            datetime: slotDateTime,
            available: !isSlotBooked(date, timeSlot24)
          });
        }
      }
    }

    return slots;
  };

  // Verificar si un slot está reservado
  const isSlotBooked = (date, time) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedSlots.some(slot => 
      slot.date === dateStr && slot.time === time
    );
  };

  // Verificar si una fecha tiene slots disponibles
  const hasAvailableSlots = (date) => {
    const slots = generateTimeSlots(date);
    return slots.some(slot => slot.available);
  };

  // Deshabilitar fechas pasadas y días sin disponibilidad
  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Deshabilitar fechas pasadas
    if (date < today) return true;
    
    // Deshabilitar domingos (día 0)
    if (date.getDay() === 0) return true;
    
    // Verificar disponibilidad (opcional, puede ser costoso)
    // return !hasAvailableSlots(date);
    
    return false;
  };

  // Agregar clases CSS personalizadas a las fechas
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const classes = [];
    
    // Fecha seleccionada
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      classes.push('selected-date');
    }
    
    // Fechas con disponibilidad limitada
    if (hasAvailableSlots(date)) {
      const slots = generateTimeSlots(date);
      const availableCount = slots.filter(slot => slot.available).length;
      
      if (availableCount <= 3) {
        classes.push('limited-availability');
      } else {
        classes.push('good-availability');
      }
    } else {
      classes.push('no-availability');
    }
    
    return classes.join(' ');
  };

  // Manejar cambio de fecha
  const handleDateChange = (date) => {
    setCalendarValue(date);
    onDateChange(date);
    
    // Limpiar selección de hora cuando cambia la fecha
    if (onTimeChange) {
      onTimeChange(null);
    }
  };

  // Manejar selección de hora
  const handleTimeSelect = (timeSlot) => {
    if (timeSlot.available && onTimeChange) {
      onTimeChange(timeSlot.time);
    }
  };

  // Actualizar slots disponibles cuando cambia la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate);
      setAvailableTimes(slots);
    }
  }, [selectedDate, bookedSlots]);

  return (
    <div className={`booking-calendar ${className}`}>
      {/* Calendario */}
      <div className="calendar-container mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="text-purple-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">
            Selecciona una fecha
          </h3>
        </div>
        
        <div className="calendar-wrapper">
          <Calendar
            onChange={handleDateChange}
            value={calendarValue}
            tileDisabled={tileDisabled}
            tileClassName={tileClassName}
            locale="es-ES"
            minDate={new Date()}
            maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 días adelante
            className="custom-calendar"
          />
        </div>

        {/* Leyenda */}
        <div className="calendar-legend mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <span>Buena disponibilidad</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-200 rounded"></div>
              <span>Disponibilidad limitada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-200 rounded"></div>
              <span>No disponible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selección de hora */}
      {selectedDate && (
        <div className="time-selection">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-purple-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">
              Selecciona una hora
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Cargando horarios...</span>
            </div>
          ) : availableTimes.length > 0 ? (
            <div className="time-slots-grid grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {availableTimes.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSelect(slot)}
                  disabled={!slot.available}
                  className={`
                    time-slot p-3 rounded-lg border text-sm font-medium transition-all duration-200
                    ${slot.available 
                      ? 'border-gray-300 hover:border-purple-500 hover:bg-purple-50 text-gray-700 cursor-pointer' 
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                    ${selectedTime === slot.time 
                      ? 'border-purple-600 bg-purple-600 text-white' 
                      : ''
                    }
                  `}
                >
                  {slot.displayTime || slot.time}
                </button>
              ))}
            </div>
          ) : (
            <div className="no-slots-available text-center py-8">
              <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600">
                No hay horarios disponibles para esta fecha.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Por favor selecciona otra fecha.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmación de selección */}
      {selectedDate && selectedTime && (
        <div className="selection-summary mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <div>
              <p className="font-medium text-green-800">
                Fecha y hora seleccionadas
              </p>
              <p className="text-green-700">
                {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} a las {availableTimes.find(slot => slot.time === selectedTime)?.displayTime || selectedTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        .custom-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        
        .custom-calendar .react-calendar__tile {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #374151;
          padding: 8px;
          margin: 2px;
          transition: all 0.2s;
        }
        
        .custom-calendar .react-calendar__tile:hover {
          background: #f3f4f6;
          border-color: #9333ea;
        }
        
        .custom-calendar .react-calendar__tile--active {
          background: #9333ea !important;
          color: white !important;
          border-color: #9333ea !important;
        }
        
        .custom-calendar .react-calendar__tile:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        .custom-calendar .good-availability {
          background: #dcfce7 !important;
          border-color: #16a34a !important;
        }
        
        .custom-calendar .limited-availability {
          background: #fef3c7 !important;
          border-color: #d97706 !important;
        }
        
        .custom-calendar .no-availability {
          background: #fee2e2 !important;
          border-color: #dc2626 !important;
        }
        
        .custom-calendar .selected-date {
          background: #9333ea !important;
          color: white !important;
          border-color: #9333ea !important;
        }
      `}</style>
    </div>
  );
};

export default BookingCalendar;