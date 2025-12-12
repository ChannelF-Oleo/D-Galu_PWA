// src/pages/Home.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/Home.css";
import { icons } from "../utils/icons";
import "../styles/Styles.css";
import ProductsSection from "../components/home/ProductsSection";
import AcademySection from "../components/home/AcademySection";


// Imágenes
// Asegúrate de que estas rutas sean correctas según tu estructura
import trenzaRisaBackground from "../assets/images/dgalu_backgroundHero.jpg";
import trenzasFoto from "../assets/images/TRECCINE-AFRICANE-630x630.jpeg";
import uñasFoto from "../assets/images/uñas.jpg";
import peluqueriaFoto from "../assets/images/peluqueria.jpg";
import spaFoto from "../assets/images/spa.avif";
import CejasFoto from "../assets/images/Cejas.png";
import PosturaFoto from "../assets/images/Postura.png";

// --- Datos de Servicios Destacados (ICONOS ELIMINADOS) ---
const serviceHighlights = [
  {
    title: "Trenzas Africanas",
    description: "Comodidad y estilo en cada hebra.",
    imgSrc: trenzasFoto,
    href: "/services",
  },
  {
    title: "Uñas Acrílicas",
    description: "Manicure, pedicure y diseños exclusivos.",
    imgSrc: uñasFoto,
    href: "/services",
  },
  {
    title: "Peluquería",
    description: "Cortes, brushing y peinados.",
    imgSrc: peluqueriaFoto,
    href: "/services",
  },
  {
    title: "Extenciones y Pelucas",
    description: "Transforma tu look al instante.",
    imgSrc: PosturaFoto,
    href: "/services",
  },
  {
    title: "Cejas y Pestañas",
    description: "Resalta tu mirada con estilo.",
    imgSrc: CejasFoto,
    href: "/services",
  },
  {
    title: "Spa",
    description: "Relajación y cuidado integral.",
    imgSrc: spaFoto,
    href: "/services",
  },
];

// --- Card de Servicio conectada con Firebase ---
const ServiceCard = ({ service, fallbackImage }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navegar directamente al detalle del servicio específico
    navigate(`/services/${service.id}`);
  };

  return (
    <button onClick={handleClick} className="service-card group">
      {/* Wrapper de Imagen */}
      <div className="card-image-wrapper">
        <img 
          src={service.image || fallbackImage} 
          alt={service.name} 
          className="card-image" 
          loading="lazy" 
        />
      </div>

      {/* Contenido de Texto */}
      <div className="card-content">
        <h3 className="card-title">{service.name}</h3>
        <p className="card-desc">{service.description}</p>
        
        {/* Mostrar número de subservicios si existen */}
        {service.subservices && service.subservices.length > 0 && (
          <div className="text-sm text-purple-600 mb-2">
            {service.subservices.length} opciones disponibles
          </div>
        )}

        <div className="card-link">
          Ver Detalles
          <icons.ArrowRight className="arrow-icon" size={20} />
        </div>
      </div>
    </button>
  );
};

// Hero Section (Sin cambios, se mantiene igual)
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      {/* 1. Fondo dedicado para escritorio (CSS .hero-background) */}
      <div className="hero-background">
        <img src={trenzaRisaBackground} alt="Fondo D'Galú" />
      </div>

      {/* 2. Overlay oscuro (CSS .hero-overlay) */}
      <div className="hero-overlay"></div>

      {/* 3. Contenido Principal */}
      <div className="hero-content animate-fade-in">
        <h1 className="hero-title">D'Galú</h1>
        <p className="hero-subtitle">SALÓN · UÑAS · SPA · MASAJES</p>

        <p className="hero-quote">
          Belleza, elegancia y cuidado personalizado en cada servicio.
        </p>

        <button className="btn-cta" onClick={() => navigate("/booking")}>
          <icons.Calendar size={24} />
          <span>¡Agendar Cita!</span>
        </button>
      </div>

      {/* 4. Divisor de Ola (CSS .custom-shape-divider-bottom-1671234567) */}
      <div className="custom-shape-divider-bottom-1671234567">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="shape-fill"
          ></path>
        </svg>
      </div>
    </section>
  );
};

// Services Section conectada con Firebase
const ServicesSection = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeo de imágenes fallback para servicios conocidos
  const fallbackImages = {
    "trenzas": trenzasFoto,
    "uñas": uñasFoto,
    "peluqueria": peluqueriaFoto,
    "extensiones": PosturaFoto,
    "cejas": CejasFoto,
    "spa": spaFoto
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log("Fetching services from Firebase...");
        const servicesRef = collection(db, "services");
        // Simplificar la query - quitar el filtro por ahora
        const querySnapshot = await getDocs(servicesRef);
        
        const servicesData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Service found:", doc.id, data);
          servicesData.push({
            id: doc.id,
            ...data
          });
        });

        console.log("Total services loaded:", servicesData.length);
        
        // Filtrar servicios destacados primero, luego limitar a 3
        const featuredServices = servicesData.filter(s => s.featured);
        if (featuredServices.length >= 3) {
          setServices(featuredServices.slice(0, 3));
        } else {
          // Si no hay suficientes destacados, tomar los primeros 3
          setServices(servicesData.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        // Fallback a servicios estáticos si hay error
        console.log("Using fallback static services");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getFallbackImage = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('trenza')) return fallbackImages.trenzas;
    if (name.includes('uña')) return fallbackImages.uñas;
    if (name.includes('peluquer')) return fallbackImages.peluqueria;
    if (name.includes('extension') || name.includes('peluca')) return fallbackImages.extensiones;
    if (name.includes('ceja') || name.includes('pestaña')) return fallbackImages.cejas;
    if (name.includes('spa') || name.includes('masaje')) return fallbackImages.spa;
    return trenzasFoto; // imagen por defecto
  };

  if (loading) {
    return (
      <section id="servicios" className="services-section">
        <div className="container">
          <h2 className="section-title">
            Nuestros <span className="highlight-text">Servicios Destacados</span>
          </h2>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="servicios" className="services-section">
      <div className="container">
        <h2 className="section-title">
          Nuestros <span className="highlight-text">Servicios Destacados</span>
        </h2>

        <div className="services-grid">
          {services.length > 0 ? (
            services.map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service}
                fallbackImage={getFallbackImage(service.name)}
              />
            ))
          ) : (
            // Fallback a servicios estáticos si no hay datos de Firebase (solo 3)
            serviceHighlights.slice(0, 3).map((service, index) => (
              <ServiceCard 
                key={index} 
                service={{
                  id: `fallback-${index}`,
                  name: service.title,
                  description: service.description,
                  image: service.imgSrc
                }}
                fallbackImage={service.imgSrc}
              />
            ))
          )}
        </div>

        {/* Call to action para ver más servicios */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-all hover:shadow-lg font-semibold"
          >
            Ver Catálogo Completo
            <icons.ArrowRight size={20} />
          </button>
          
          <p className="text-sm text-gray-500 mt-3">
            Descubre todos nuestros servicios especializados
          </p>
        </div>
      </div>
    </section>
  );
};

// Secciones Placeholder (Sin cambios)
const PlaceholderSection = ({ title, IconComponent }) => (
  <section className="placeholder-section">
    <div className="container placeholder-wrapper">
      <IconComponent className="placeholder-icon" size={40} />
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-subtitle">
        Pronto más detalles. Estamos trabajando en el mejor estilo...
      </p>
    </div>
  </section>
);

const Home = () => (
  <main className="home-main">
    <HeroSection />
    <div className="section-divider"></div>
    <ServicesSection />
    <div className="section-divider"></div>
    <ProductsSection />
    <div className="section-divider"></div>
    <AcademySection />
  </main>
);

export default Home;
