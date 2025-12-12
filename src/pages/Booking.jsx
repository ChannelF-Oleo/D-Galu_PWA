import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import BookingWidget from "../components/booking/BookingWidget";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { ErrorHandler } from "../utils/ErrorHandler";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Calendar, ArrowLeft, CheckCircle, Plus, Minus, Clock } from "lucide-react";

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedServices, setSelectedServices] = useState([]); // Cambio: array de servicios
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);
  const [showServiceSelection, setShowServiceSelection] = useState(true);

  // Obtener serviceId de los parámetros de URL si existe
  const serviceId = searchParams.get('serviceId');
  
  // Obtener servicio preseleccionado del state de navegación
  const preselectedService = location.state?.selectedService;

  // Cargar servicios disponibles
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const servicesRef = collection(db, "services");
        // Simplificar query para testing
        const querySnapshot = await getDocs(servicesRef);
        
        const servicesData = [];
        querySnapshot.forEach((doc) => {
          servicesData.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setServices(servicesData);

        // Priorizar servicio preseleccionado del state
        if (preselectedService) {
          setSelectedServices([preselectedService]);
          setShowServiceSelection(false);
        } else if (serviceId) {
          // Si hay un serviceId en la URL, obtener ese servicio específico
          const serviceRef = doc(db, "services", serviceId);
          const serviceSnap = await getDoc(serviceRef);
          
          if (serviceSnap.exists()) {
            const serviceData = { id: serviceSnap.id, ...serviceSnap.data() };
            setSelectedServices([serviceData]);
            setShowServiceSelection(false);
          } else {
            // Fallback: buscar en la lista cargada
            const service = servicesData.find(s => s.id === serviceId);
            if (service) {
              setSelectedServices([service]);
              setShowServiceSelection(false);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        const errorState = ErrorHandler.handle(err, 'fetchServices');
        setError(errorState);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [serviceId, preselectedService]);

  // Manejar selección de subservicio
  const handleSubserviceToggle = (service, subservice) => {
    const serviceKey = `${service.id}-${subservice.name}`;
    const existingIndex = selectedServices.findIndex(s => s.key === serviceKey);
    
    if (existingIndex >= 0) {
      // Remover si ya está seleccionado
      setSelectedServices(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      // Agregar nuevo subservicio
      const newService = {
        key: serviceKey,
        id: service.id,
        name: `${service.name} - ${subservice.name}`,
        serviceName: service.name,
        subserviceName: subservice.name,
        price: subservice.price || service.basePrice || service.price || 0,
        duration: subservice.duration || 20, // Cambio: duración por defecto 20 min
        description: subservice.description || service.description,
        image: service.image,
        category: service.category
      };
      setSelectedServices(prev => [...prev, newService]);
    }
  };

  // Calcular totales
  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + (service.price || 0), 0);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + (service.duration || 20), 0);
  };

  // Manejar completar reserva
  const handleBookingComplete = (bookingData) => {
    console.log("Booking completed:", bookingData);
    setCompletedBooking(bookingData);
    setBookingComplete(true);
    
    // Aquí se haría la llamada real a Firebase para guardar la reserva
    // Por ahora solo simulamos el éxito
  };

  // Reiniciar proceso de reserva
  const handleNewBooking = () => {
    setBookingComplete(false);
    setCompletedBooking(null);
    setSelectedServices([]);
    setShowServiceSelection(true);
  };

  // Continuar con servicios seleccionados
  const handleContinueWithServices = () => {
    if (selectedServices.length > 0) {
      setShowServiceSelection(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando servicios..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error al cargar
          </h2>
          <p className="text-gray-600 mb-4">
            No pudimos cargar los servicios disponibles.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de confirmación de reserva completada
  if (bookingComplete && completedBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Reserva Confirmada!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Tu cita ha sido agendada exitosamente. Recibirás una confirmación por email y WhatsApp.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Detalles de tu cita:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Servicios:</span>
                <div className="text-right">
                  {completedBooking.services ? (
                    completedBooking.services.map((service, index) => (
                      <div key={index} className="font-medium">
                        {service.serviceName}
                        {service.subserviceName && ` - ${service.subserviceName}`}
                      </div>
                    ))
                  ) : (
                    <span className="font-medium">{completedBooking.serviceName}</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">
                  {new Date(completedBooking.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hora:</span>
                <span className="font-medium">{completedBooking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium">{completedBooking.totalDuration || completedBooking.duration || 60} minutos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium">{completedBooking.customerName}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-purple-600">${completedBooking.totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleNewBooking}
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Agendar otra cita
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft size={20} />
            Volver al inicio
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Reservar Cita
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Selecciona un servicio y agenda tu cita de manera fácil y rápida. 
            Te confirmaremos por email y WhatsApp.
          </p>
        </div>

        {/* Selección de servicios múltiples - Flujo guiado */}
        {showServiceSelection && (
          <div className="max-w-6xl mx-auto mb-8">
            {/* Header con pasos */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div className="w-16 h-1 bg-purple-600 mx-2"></div>
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div className="w-16 h-1 bg-gray-200 mx-2"></div>
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Paso 1: Selecciona tus servicios
              </h2>
              <p className="text-gray-600">
                Elige uno o varios servicios para tu cita. Puedes combinar diferentes tratamientos.
              </p>
            </div>

            {/* Resumen de servicios seleccionados */}
            {selectedServices.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Servicios seleccionados ({selectedServices.length})
                  </h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      <Clock size={16} className="inline mr-1" />
                      {getTotalDuration()} min total
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      ${getTotalPrice()} total
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedServices.map((service, index) => (
                    <div key={service.key} className="flex items-center justify-between bg-purple-50 rounded-lg p-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{service.name}</div>
                        <div className="text-xs text-gray-600">
                          {service.duration} min • ${service.price}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedServices(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedServices([])}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Limpiar selección
                  </button>
                  <button
                    onClick={handleContinueWithServices}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg font-medium"
                  >
                    Continuar al Paso 2 →
                  </button>
                </div>
              </div>
            )}
            
            {/* Interfaz mejorada de selección por categorías */}
            <div className="space-y-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header del servicio */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-purple-600 font-medium">
                            {service.subservices?.length || 0} opciones
                          </span>
                          <span className="text-gray-500">
                            Desde ${Math.min(...(service.subservices?.map(s => s.price) || [service.basePrice || 0]))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de subservicios con checkboxes */}
                  <div className="p-6">
                    {service.subservices && service.subservices.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Selecciona los tratamientos que deseas:
                        </h4>
                        {service.subservices.map((subservice, index) => {
                          const serviceKey = `${service.id}-${subservice.name}`;
                          const isSelected = selectedServices.some(s => s.key === serviceKey);
                          
                          return (
                            <label
                              key={index}
                              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSubserviceToggle(service, subservice)}
                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium text-gray-900">
                                      {subservice.name}
                                    </h5>
                                    {subservice.description && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {subservice.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <div className="font-bold text-purple-600">
                                      ${subservice.price || service.basePrice || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {subservice.duration || 20} min
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <label className="flex items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-gray-50 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={selectedServices.some(s => s.id === service.id)}
                            onChange={() => handleSubserviceToggle(service, {
                              name: service.name,
                              price: service.basePrice || service.price || 0,
                              duration: 60,
                              description: service.description
                            })}
                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div className="ml-4">
                            <h5 className="font-medium text-gray-900">
                              Servicio completo: {service.name}
                            </h5>
                            <div className="text-purple-600 font-bold">
                              ${service.basePrice || service.price || 0}
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Widget de reserva cuando hay servicios seleccionados */}
        {!showServiceSelection && selectedServices.length > 0 && (
          <div className="max-w-4xl mx-auto">
            {/* Header del paso 2 */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <div className="w-16 h-1 bg-green-500 mx-2"></div>
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div className="w-16 h-1 bg-purple-600 mx-2"></div>
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Paso 2: Agenda tu cita
              </h2>
              <p className="text-gray-600">
                Selecciona fecha, hora y completa tus datos de contacto
              </p>
              <button
                onClick={() => setShowServiceSelection(true)}
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mt-4 text-sm"
              >
                <ArrowLeft size={16} />
                Cambiar servicios seleccionados
              </button>
            </div>
            
            <BookingWidget
              services={selectedServices}
              totalPrice={getTotalPrice()}
              totalDuration={getTotalDuration()}
              onBookingComplete={handleBookingComplete}
            />
          </div>
        )}

        {/* Mensaje cuando no hay servicios seleccionados y no se muestra la selección */}
        {!showServiceSelection && selectedServices.length === 0 && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Ups! No hay servicios seleccionados
              </h3>
              <p className="text-gray-600 mb-6">
                Para continuar con tu reserva, necesitas seleccionar al menos un servicio.
              </p>
              <button
                onClick={() => setShowServiceSelection(true)}
                className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Seleccionar servicios
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
