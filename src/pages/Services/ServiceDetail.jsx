// src/pages/Services/ServiceDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { 
  ArrowLeft, Clock, Calendar, Sparkles, Star, DollarSign
} from "lucide-react";


const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubservice, setSelectedSubservice] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        console.log("Fetching service with ID:", id);
        const docRef = doc(db, "services", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const serviceData = { id: docSnap.id, ...docSnap.data() };
          console.log("Service data loaded:", serviceData);
          setService(serviceData);
          
          // Si hay subservicios, seleccionar el primero por defecto
          if (serviceData.subservices && serviceData.subservices.length > 0) {
            setSelectedSubservice(serviceData.subservices[0]);
          }
        } else {
          console.log("Service not found with ID:", id);
          setError("El servicio no existe o fue eliminado.");
        }
      } catch (err) {
        console.error("Error fetching service:", err);
        setError(`Error al cargar la información: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    } else {
      console.error("No service ID provided");
      setError("ID de servicio no proporcionado");
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-red-500 text-xl font-bold mb-2">Error</div>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => navigate("/services")} 
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Volver a Servicios
        </button>
      </div>
    );
  }

  // Función para manejar reserva
  const handleBookService = (subservice = null) => {
    const bookingService = {
      id: service.id,
      name: subservice ? `${service.name} - ${subservice.name}` : service.name,
      serviceName: service.name,
      subserviceName: subservice ? subservice.name : null,
      price: subservice ? subservice.price : service.basePrice || service.price,
      duration: subservice ? (subservice.duration || 20) : (service.duration || 60),
      description: subservice ? subservice.description : service.description,
      image: service.image,
      category: service.category
    };
    
    navigate(`/booking?serviceId=${service.id}`, { 
      state: { selectedService: bookingService }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Botón Volver */}
        <button 
          onClick={() => navigate("/services")} 
          className="flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a servicios
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal - Información del Servicio */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              {/* Header con Imagen */}
              <div className="relative h-64 md:h-80 bg-gray-200">
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span className="text-lg">Sin imagen disponible</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-1.5 bg-white/90 backdrop-blur text-purple-600 font-bold rounded-full shadow-sm text-sm uppercase tracking-wide">
                    {service.category}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-8">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                  <p className="text-gray-600 text-lg">
                    {service.description || "Servicio de belleza profesional"}
                  </p>
                </div>

                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duración base</p>
                      <p className="font-semibold text-gray-800">{service.duration || 60} min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Desde</p>
                      <p className="font-semibold text-gray-800">${service.basePrice || service.price || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Variantes</p>
                      <p className="font-semibold text-gray-800">{service.subservices?.length || 1}</p>
                    </div>
                  </div>
                </div>

                {/* Botón de reserva general */}
                {(!service.subservices || service.subservices.length === 0) && (
                  <button
                    onClick={() => handleBookService()}
                    className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar size={20} />
                    Reservar este servicio
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Columna Lateral - Subservicios */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="text-purple-600" size={20} />
                {service.subservices && service.subservices.length > 0 ? 'Elige tu variante' : 'Información'}
              </h2>

              {service.subservices && service.subservices.length > 0 ? (
                <div className="space-y-4">
                  {service.subservices.map((subservice, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedSubservice?.name === subservice.name
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedSubservice(subservice)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {subservice.name}
                        </h3>
                        <span className="text-purple-600 font-bold text-sm">
                          ${subservice.price}
                        </span>
                      </div>
                      
                      {subservice.description && (
                        <p className="text-gray-600 text-xs mb-2">
                          {subservice.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {subservice.duration || 20} min
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Botón de reserva para subservicio seleccionado */}
                  {selectedSubservice && (
                    <button
                      onClick={() => handleBookService(selectedSubservice)}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mt-6"
                    >
                      <Calendar size={18} />
                      Reservar - ${selectedSubservice.price}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="mb-4">Este servicio no tiene variantes específicas.</p>
                  <button
                    onClick={() => handleBookService()}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} />
                    Reservar ahora
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
