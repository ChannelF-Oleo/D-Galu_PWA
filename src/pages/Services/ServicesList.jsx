// src/pages/Services/ServicesList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase"; // Ajusta la ruta si es necesario
import { ArrowRight, Sparkles } from "lucide-react";


const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const servicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesData);
      } catch (error) {
        console.error("Error obteniendo servicios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-rose-500 text-xl font-serif animate-pulse">
          Cargando belleza... ✨
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-rose-500 font-semibold tracking-wider uppercase text-sm">
          Nuestro Menú
        </span>
        <h1 className="mt-2 text-4xl font-serif font-bold text-gray-900 sm:text-5xl">
          Servicios Exclusivos
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Descubre nuestra gama completa de tratamientos diseñados para realzar tu belleza natural.
        </p>
      </div>

      {/* GRID DE SERVICIOS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => navigate(`/services/${service.id}`)}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 flex flex-col"
          >
            {/* IMAGEN CARD */}
            <div className="relative h-56 overflow-hidden">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-rose-600 text-xs font-bold rounded-full uppercase tracking-wide">
                  {service.subservices?.length || 0} Variedades
                </span>
              </div>
            </div>

            {/* CONTENIDO CARD */}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-rose-500 transition-colors mb-2">
                {service.name}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                {service.description}
              </p>
              
              {/* LISTA PREVIA (Muestra los primeros 3) */}
              <ul className="space-y-1 mb-6">
                {service.subservices?.slice(0, 3).map((sub, idx) => (
                  <li key={idx} className="text-xs text-gray-400 flex items-center">
                    <Sparkles size={10} className="mr-2 text-rose-300" />
                    {sub.name.split('(')[0]} {/* Corta nombres muy largos */}
                  </li>
                ))}
                {service.subservices?.length > 3 && (
                  <li className="text-xs text-rose-400 font-medium italic">
                    + {service.subservices.length - 3} más...
                  </li>
                )}
              </ul>

              <div className="flex items-center text-rose-500 font-medium text-sm group-hover:translate-x-2 transition-transform mt-auto">
                Ver detalles <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesList;
