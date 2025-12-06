// src/pages/Home.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { icons } from "../utils/icons";
// Asegúrate de que esta ruta sea correcta según tu estructura
import "../styles/Styles.css";

// Imágenes
// Asegúrate de que estas rutas sean correctas según tu estructura
import trenzaRisaBackground from "../assets/images/dgalu_backgroundHero.jpg";
import trenzasFoto from "../assets/images/TRECCINE-AFRICANE-630x630.jpeg";
import uñasFoto from "../assets/images/uñas.jpg";
import peluqueriaFoto from "../assets/images/peluqueria.jpg";
import spaFoto from "../assets/images/spa.avif";
import CejasFoto from "../assets/images/cejas.png";
import PosturaFoto from "../assets/images/postura.png";

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

// --- Card de Servicio (ESTRUCTURA DE ICONO ELIMINADA) ---
const ServiceCard = ({ title, description, imgSrc, href }) => {
  const navigate = useNavigate();

  return (
    // Usamos button para mejorar la accesibilidad si toda la card es clickeable
    <button onClick={() => navigate(href)} className="service-card group">
      {/* Wrapper de Imagen */}
      <div className="card-image-wrapper">
        <img src={imgSrc} alt={title} className="card-image" loading="lazy" />
      </div>

      {/* Contenido de Texto (Se alinea automáticamente debajo de la imagen sin el icono intermedio) */}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-desc">{description}</p>

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

// Services Section (Sin cambios)
const ServicesSection = () => (
  <section id="servicios" className="services-section">
    <div className="container">
      <h2 className="section-title">
        Nuestros <span className="highlight-text">Servicios Destacados</span>
      </h2>

      <div className="services-grid">
        {serviceHighlights.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </div>
    </div>
  </section>
);

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
  <main>
    <HeroSection />
    <ServicesSection />
    <PlaceholderSection title="Productos" IconComponent={icons.ShoppingBag} />
    <PlaceholderSection
      title="D'Galú Academy"
      IconComponent={icons.GraduationCap}
    />
  </main>
);

export default Home;
