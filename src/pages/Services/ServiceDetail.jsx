// src/pages/Services/ServiceDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { 
  ArrowLeft, Clock, DollarSign, Tag, Calendar, CheckCircle 
} from "lucide-react";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const docRef = doc(db, "services", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("El servicio no existe o fue eliminado.");
        }
      } catch (err) {
        console.error("Error fetching service:", err);
        setError("Error al cargar la información.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
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
          onClick={() => navigate("/admin/services")} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver a Servicios
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      {/* Botón Volver */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Volver atrás
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
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
            <span className="px-4 py-1.5 bg-white/90 backdrop-blur text-gray-800 font-bold rounded-full shadow-sm text-sm uppercase tracking-wide">
              {service.category}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{service.name}</h1>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Calendar size={14} />
                Agregado el: {service.createdAt?.toDate().toLocaleDateString() || "N/A"}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-4xl font-bold text-blue-600">
                ${service.price?.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm">Pesos Dominicanos (DOP)</span>
            </div>
          </div>

          {/* Grid de Detalles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duración</p>
                <p className="font-semibold text-gray-800">{service.duration} minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <Tag size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Categoría</p>
                <p className="font-semibold text-gray-800">{service.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <p className="font-semibold text-gray-800">Activo</p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción del Servicio</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {service.description || "No hay una descripción detallada para este servicio."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
