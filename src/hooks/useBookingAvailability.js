// src/hooks/useBookingAvailability.js

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import { ErrorHandler } from "../utils/ErrorHandler";

/**
 * Hook personalizado para manejar la disponibilidad de reservas
 * Obtiene y gestiona los slots disponibles y reservados
 */
export const useBookingAvailability = (serviceId, selectedDate) => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configuración de horarios de trabajo
  const workingHours = {
    start: 9,    // 9:00 AM
    end: 18,     // 6:00 PM
    interval: 30, // intervalos de 30 minutos
    closedDays: [0] // Domingo = 0
  };

  // Obtener reservas existentes para una fecha específica
  const fetchBookedSlots = async (date) => {
    if (!date) return;

    try {
      setLoading(true);
      setError(null);

      const dateStr = date.toISOString().split('T')[0];
      
      // Query real para obtener reservas de la fecha seleccionada
      console.log("Fetching real availability for date:", dateStr);
      
      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("date", "==", dateStr),
          where("status", "in", ["pending", "confirmed"]),
          orderBy("time", "asc")
        );

        const querySnapshot = await getDocs(q);
        const slots = [];

        querySnapshot.forEach((doc) => {
          const booking = doc.data();
          slots.push({
            id: doc.id,
            date: booking.date,
            time: booking.time,
            duration: booking.totalDuration || booking.duration || 60,
            serviceId: booking.serviceId,
            customerId: booking.customerId,
            customerName: booking.customerName,
            status: booking.status
          });
        });

        console.log("Found booked slots:", slots);
        setBookedSlots(slots);
      } catch (queryError) {
        console.warn("Error querying bookings, using fallback:", queryError);
        // Fallback: simular algunos slots ocupados
        const mockBookedSlots = [];
        const today = new Date().toISOString().split('T')[0];
        if (dateStr === today) {
          mockBookedSlots.push(
            {
              id: 'mock-1',
              date: dateStr,
              time: '09:00',
              duration: 60,
              status: 'confirmed'
            }
          );
        }
        setBookedSlots(mockBookedSlots);
      }
    } catch (err) {
      console.error("Error fetching booked slots:", err);
      const errorState = ErrorHandler.handle(err, 'fetchBookedSlots');
      setError(errorState);
    } finally {
      setLoading(false);
    }
  };

  // Generar todos los slots de tiempo posibles para una fecha
  const generateAllTimeSlots = (date) => {
    if (!date) return [];

    const slots = [];
    const { start, end, interval } = workingHours;

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, minute, 0, 0);

        // Solo incluir slots futuros
        const now = new Date();
        if (slotDateTime > now) {
          slots.push({
            time: timeSlot,
            datetime: slotDateTime,
            available: true
          });
        }
      }
    }

    return slots;
  };

  // Verificar si un slot específico está disponible
  const isSlotAvailable = (date, time, duration = 60) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Verificar si el slot está directamente reservado
    const directConflict = bookedSlots.some(slot => 
      slot.date === dateStr && slot.time === time
    );

    if (directConflict) return false;

    // Verificar conflictos con la duración del servicio
    const [hours, minutes] = time.split(':').map(Number);
    const slotStart = hours * 60 + minutes;
    const slotEnd = slotStart + duration;

    const hasConflict = bookedSlots.some(slot => {
      if (slot.date !== dateStr) return false;
      
      const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
      const bookedStart = slotHours * 60 + slotMinutes;
      const bookedEnd = bookedStart + (slot.duration || 60);

      // Verificar solapamiento
      return (slotStart < bookedEnd && slotEnd > bookedStart);
    });

    return !hasConflict;
  };

  // Obtener slots disponibles para una fecha
  const getAvailableSlots = (date) => {
    if (!date) return [];

    const allSlots = generateAllTimeSlots(date);
    
    return allSlots.map(slot => ({
      ...slot,
      available: isSlotAvailable(date, slot.time)
    }));
  };

  // Verificar si una fecha tiene slots disponibles
  const hasAvailableSlots = (date) => {
    if (!date) return false;
    
    // Verificar si es un día cerrado
    if (workingHours.closedDays.includes(date.getDay())) {
      return false;
    }

    const availableSlots = getAvailableSlots(date);
    return availableSlots.some(slot => slot.available);
  };

  // Obtener el próximo slot disponible
  const getNextAvailableSlot = (fromDate = new Date()) => {
    const maxDays = 30; // Buscar hasta 30 días adelante
    
    for (let i = 0; i < maxDays; i++) {
      const checkDate = new Date(fromDate);
      checkDate.setDate(checkDate.getDate() + i);
      
      if (hasAvailableSlots(checkDate)) {
        const availableSlots = getAvailableSlots(checkDate);
        const firstAvailable = availableSlots.find(slot => slot.available);
        
        if (firstAvailable) {
          return {
            date: checkDate,
            time: firstAvailable.time,
            datetime: firstAvailable.datetime
          };
        }
      }
    }
    
    return null;
  };

  // Reservar temporalmente un slot (para evitar doble reserva)
  const reserveSlotTemporarily = (date, time, duration = 300000) => {
    const dateStr = date.toISOString().split('T')[0];
    const tempSlot = {
      id: `temp_${Date.now()}`,
      date: dateStr,
      time: time,
      duration: 60,
      status: 'temp',
      expiresAt: Date.now() + duration
    };

    setBookedSlots(prev => [...prev, tempSlot]);

    // Limpiar reserva temporal después del tiempo especificado
    setTimeout(() => {
      setBookedSlots(prev => prev.filter(slot => slot.id !== tempSlot.id));
    }, duration);

    return tempSlot.id;
  };

  // Limpiar reservas temporales expiradas
  const cleanExpiredTempSlots = () => {
    const now = Date.now();
    setBookedSlots(prev => 
      prev.filter(slot => 
        slot.status !== 'temp' || (slot.expiresAt && slot.expiresAt > now)
      )
    );
  };

  // Efecto para cargar slots cuando cambia la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
    }
  }, [selectedDate, serviceId]);

  // Limpiar reservas temporales expiradas cada minuto
  useEffect(() => {
    const interval = setInterval(cleanExpiredTempSlots, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    bookedSlots,
    loading,
    error,
    workingHours,
    
    // Funciones
    fetchBookedSlots,
    isSlotAvailable,
    getAvailableSlots,
    hasAvailableSlots,
    getNextAvailableSlot,
    reserveSlotTemporarily,
    
    // Utilidades
    generateAllTimeSlots,
    cleanExpiredTempSlots
  };
};

export default useBookingAvailability;