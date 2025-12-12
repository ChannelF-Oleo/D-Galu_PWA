// src/components/admin/CalendarView.jsx

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Phone } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar reservas del mes actual
  useEffect(() => {
    fetchMonthBookings();
  }, [currentDate]);

  // Cargar reservas del día seleccionado
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayBookings = bookings.filter(booking => booking.date === dateStr);
    setSelectedBookings(dayBookings.sort((a, b) => a.time.localeCompare(b.time)));
  }, [selectedDate, bookings]);

  const fetchMonthBookings = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = endOfMonth.toISOString().split('T')[0];

      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr),
        orderBy('date', 'asc'),
        orderBy('time', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const bookingsData = [];

      querySnapshot.forEach((doc) => {
        bookingsData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener días del mes para mostrar en el calendario
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior (para completar la primera semana)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        bookingsCount: 0
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayBookings = bookings.filter(booking => booking.date === dateStr);
      
      days.push({
        date,
        isCurrentMonth: true,
        bookingsCount: dayBookings.length,
        bookings: dayBookings
      });
    }

    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        bookingsCount: 0
      });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="text-purple-600" size={24} />
          Calendario de Reservas
        </h2>
        
        {/* Navegación del mes */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 min-w-[150px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  relative p-2 h-16 text-sm border rounded-lg transition-all hover:bg-gray-50
                  ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${isToday(day.date) ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                  ${isSelected(day.date) ? 'bg-purple-50 border-purple-300' : ''}
                `}
              >
                <div className="font-medium">{day.date.getDate()}</div>
                {day.bookingsCount > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {day.bookingsCount}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Panel de citas del día seleccionado */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4">
              Citas del {selectedDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </h4>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : selectedBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                <p>No hay citas programadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.status)}`}></div>
                        <span className="font-medium text-sm">{formatTime(booking.time)}</span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{booking.status}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-gray-400" />
                        <span className="font-medium">{booking.customerName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        <span>{booking.customerPhone}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {booking.services ? (
                          booking.services.map((service, idx) => (
                            <div key={idx}>
                              {service.serviceName}
                              {service.subserviceName && ` - ${service.subserviceName}`}
                            </div>
                          ))
                        ) : (
                          <div>{booking.serviceName}</div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-gray-400" />
                        <span>{booking.totalDuration || booking.duration || 60} min</span>
                        <span className="font-semibold text-purple-600">
                          ${booking.totalPrice || booking.price || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;