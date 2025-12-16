// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Agregamos 'limit' para optimizar la descarga
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/Home.css";
import { icons } from "../utils/icons";
import "../styles/Styles.css";
import ProductsSection from "../components/home/ProductsSection";
import AcademySection from "../components/home/AcademySection";
import ReviewsSection from "./ReviewsSection";

// Imágenes
import trenzaRisaBackground from "../assets/images/dgalu_backgroundHero.jpg";

// --- Card de Servicio (Limpia) ---
const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/services/${service.id}`);
  };

  return (
    <button onClick={handleClick} className="service-card group">
      {/* Wrapper de Imagen */}
      <div className="card-image-wrapper">
        <img
          src={service.image}
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

// --- Hero Section ---
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-background">
        <img src={trenzaRisaBackground} alt="Fondo D'Galú" />
      </div>
      <div className="hero-overlay"></div>

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

// --- Services Section (Solo Firebase) ---
const ServicesSection = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRef = collection(db, "services");
        
        // QUERY OPTIMIZADA: Solo trae los destacados (featured == true) y limita a 3
        const q = query(servicesRef, limit(3));
        
        const querySnapshot = await getDocs(q);

        const servicesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

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

  // Si no hay servicios cargados, no renderizamos la grilla vacía (opcional)
  if (services.length === 0) {
     return null; 
  }

  return (
    <section id="servicios" className="services-section">
      <div className="container">
        <h2 className="section-title">
          Nuestros <span className="highlight-text">Servicios Destacados</span>
        </h2>

        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/services")}
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

const Home = () => (
  <main className="home-main">
    <HeroSection />
    <div className="section-divider"></div>
    <ServicesSection />
    <div className="section-divider"></div>
    <ProductsSection />
    <div className="section-divider"></div>
    <ReviewsSection />
    <div className="section-divider"></div>
    <AcademySection />
  </main>
);

export default Home;
