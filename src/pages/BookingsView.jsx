// src/pages/BookingsView.jsx
import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { hasPermission } from "../utils/rolePermissions";
import BookingDetailModal from "../components/bookings/BookingDetailModal";
import "./BookingsView.css";

const BookingsView = ({ userRole }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Inicializar fecha usando formato local YYYY-MM-DD seguro
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("en-CA"); // Formato YYYY-MM-DD
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const canManage = hasPermission(userRole, "canManageBookings");

  useEffect(() => {
    fetchBookings();
  }, [selectedDate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookingsRef = collection(db, "bookings");

      // Traemos ordenado por creación para tener consistencia
      const q = query(bookingsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // LÓGICA CORREGIDA DE FILTRADO
      const filteredByDate = bookingsData.filter((booking) => {
        if (!booking.date) return false;

        let bookingDateObj;

        // 1. Normalizar la fecha de la cita (Soporte para Timestamp y String)
        if (booking.date.toDate) {
          // Es un Timestamp de Firestore
          bookingDateObj = booking.date.toDate();
        } else {
          // Es un String o Date estándar
          // Agregamos "T00:00" si es string simple para evitar conversión a UTC anterior
          const dateStr =
            typeof booking.date === "string" && booking.date.length === 10
              ? booking.date + "T12:00:00" // Forzar mediodía para evitar cambios de día por zona horaria
              : booking.date;
          bookingDateObj = new Date(dateStr);
        }

        // 2. Convertir a string YYYY-MM-DD local
        const bookingDateStr = bookingDateObj.toLocaleDateString("en-CA");

        // 3. Comparación directa de strings (mucho más segura)
        return bookingDateStr === selectedDate;
      });

      setBookings(filteredByDate);
    } catch (error) {
      console.error("Error al cargar citas:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      // Actualizar localmente sin recargar
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (error) {
      console.error("Error al actualizar cita:", error);
      alert("Error al actualizar la cita");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Pendiente", class: "status--pending", icon: Clock },
      confirmed: {
        label: "Confirmada",
        class: "status--confirmed",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelada",
        class: "status--cancelled",
        icon: XCircle,
      },
      completed: {
        label: "Completada",
        class: "status--completed",
        icon: CheckCircle,
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`status-badge ${badge.class}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString;
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.services?.some(
        (service) =>
          service.serviceName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.subserviceName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      filterStatus === "all" || booking.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (!canManage) {
    return (
      <div className="bookings-view__no-access">
        <CalendarIcon size={48} />
        <h2>Acceso Restringido</h2>
        <p>No tienes permisos para gestionar citas.</p>
      </div>
    );
  }

  return (
    <div className="bookings-view">
      {/* Header con filtros */}
      <div className="bookings-view__header">
        <div className="bookings-view__filters">
          <div className="filter-group">
            <CalendarIcon size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="filter-group">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <Filter size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>

        <button className="bookings-view__add-btn">
          <Plus size={20} />
          Nueva Cita
        </button>
      </div>

      {/* Lista de citas */}
      {loading ? (
        <div className="bookings-view__loading">
          <div className="spinner"></div>
          <p>Cargando citas...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bookings-view__empty">
          <CalendarIcon size={48} />
          <h3>No hay citas</h3>
          <p>
            {searchTerm || filterStatus !== "all"
              ? "No se encontraron citas con ese criterio"
              : `No hay citas programadas para el ${selectedDate}`}
          </p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card__header">
                <div className="booking-card__time">
                  <Clock size={16} />
                  {formatTime(booking.time)}
                </div >
                
                {getStatusBadge(booking.status)}
                
              </div>

              <div className="booking-card__content">
                <h3 className="booking-card__client">{booking.customerName}</h3>
                <div className="booking-card__services">
                  {booking.services?.map((service, index) => (
                    <p key={index} className="booking-card__service">
                      {service.serviceName}
                      {service.subserviceName && ` - ${service.subserviceName}`}
                      {service.price && ` • $${service.price}`}
                    </p>
                  ))}
                </div>
                <p className="booking-card__total">
                  Total: ${booking.totalPrice} • {booking.totalDuration} min
                </p>
                {booking.notes && (
                  <p className="booking-card__notes">📝 {booking.notes}</p>
                )}
              </div>

              <div className="booking-card__actions">
                <button
                  className="btn-action btn-action--view"
                  onClick={() => handleViewBooking(booking)}
                >
                  <Eye size={16} />
                  Ver
                </button>
                {booking.status === "pending" && (
                  <>
                    <button
                      className="btn-action btn-action--confirm"
                      onClick={() =>
                        updateBookingStatus(booking.id, "confirmed")
                      }
                    >
                      <CheckCircle size={16} />
                      Confirmar
                    </button>
                    <button
                      className="btn-action btn-action--cancel"
                      onClick={() =>
                        updateBookingStatus(booking.id, "cancelled")
                      }
                    >
                      <XCircle size={16} />
                      Cancelar
                    </button>
                  </>
                )}
                {booking.status === "confirmed" && (
                  <button
                    className="btn-action btn-action--complete"
                    onClick={() => updateBookingStatus(booking.id, "completed")}
                  >
                    <CheckCircle size={16} />
                    Completar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />
    </div>
  );
};

export default BookingsView;
