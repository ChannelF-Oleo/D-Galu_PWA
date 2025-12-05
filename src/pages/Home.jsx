// src/pages/Home.jsx

import React from "react";
// Importamos el componente Icon (para Iconify) y el objeto icons (que tiene todo)
import { Icon, icons } from "../utils/icons";

// Importamos la nueva hoja de estilos dedicada
import "../styles/Home.css";

// Imágenes
import trenzaRisaBackground from "../assets/images/dgalu_backgroundHero.jpg";
import trenzasFoto from "../assets/images/TRECCINE-AFRICANE-630x630.jpeg";
import uñasFoto from "../assets/images/uñas.jpg";
import peluqueriaFoto from "../assets/images/peluqueria.jpg";
import spaFoto from "../assets/images/spa.avif";

// --- Datos de configuración ---
// NOTA: Aquí usamos los strings de Iconify definidos en tu archivo icons.js
const serviceHighlights = [
  {
    title: "Trenzas Africanas",
    description: "Comodidad y estilo en cada hebra.",
    imgSrc: trenzasFoto,
    href: "#",
  },
  {
    title: "Uñas Acrílicas",
    description: "Manicure, pedicure y diseños exclusivos.",
    imgSrc: uñasFoto,
    href: "#",
  },
  {
    title: "Peluquería",
    description: "Cortes, brushing y peinados para cualquier ocasión",
    imgSrc: peluqueriaFoto,
    href: "#",
  },
  {
    title: "Spa",
    description: "Relajación y cuidado integral.",
    imgSrc: spaFoto,
    href: "#",
  },
  {
    title: "Pedicura Spa",
    description: "Relajación y cuidado integral.",
    imgSrc: "img/pedicure-spa.jpg",
    href: "#",
  },
  {
    title: "Pedicura Spa",
    description: "Relajación y cuidado integral.",
    imgSrc: "img/pedicure-spa.jpg",
    href: "#",
  },
];

// --- Tarjeta de Servicio ---
const ServiceCard = ({ title, description, imgSrc, href }) => (
  <a href={href} className="service-card glass-effect group">
    <div className="card-image-wrapper">
      <img src={imgSrc} alt={title} className="card-image" loading="lazy" />
      <div className="card-overlay"></div>
    </div>

    <div className="card-content">
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{description}</p>

      <div className="card-link">
        Ver Detalles
        {/* Renderiza Lucide (Es un componente, se usa directo) */}
        <icons.ArrowRight className="arrow-icon ml-2" size={20} />
      </div>
    </div>
  </a>
);

// --- Hero Section ---
const HeroSection = ({ setCurrentPage }) => (
  <section
    className="hero-section"
    style={{
      backgroundImage: `url(${trenzaRisaBackground})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
    <div className="hero-overlay"></div>

    <div className="hero-content animate-fade-in">
      <h1 className="hero-title">D'Galú</h1>

      <p className="hero-subtitle glass-effect">SALÓN · UÑAS · SPA · MASAJES</p>

      <p className="hero-quote">
        Belleza, elegancia y cuidado personalizado en cada servicio.
      </p>

      <button
        onClick={() => setCurrentPage("booking")}
        className="btn-cta btn-pulse flex items-center gap-2"
      >
        {/* Lucide Component */}
        <icons.Calendar size={24} />
        <span>¡Agendar Cita!</span>
      </button>
    </div>

  </section>
);

// --- Services Section ---
const ServicesSection = () => (
  <section id="servicios" className="services-section animate-fade-in">
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

// --- Placeholder Section ---
// Ahora acepta 'IconComponent' para renderizar componentes de Lucide
const PlaceholderSection = ({ title, IconComponent }) => (
  <section className="placeholder-section animate-fade-in">
    <div className="container flex flex-col items-center">
      {/* Renderizamos el componente pasado como prop */}
      <IconComponent
        className="placeholder-icon mb-4 text-purple-600"
        size={40}
      />

      <h2 className="text-3xl font-serif font-bold text-gray-800">{title}</h2>
      <p className="placeholder-subtitle">
        Pronto más detalles. Trabajando en el mejor estilo...
      </p>
    </div>
  </section>
);

// --- Home Principal ---
const Home = ({ setCurrentPage }) => {
  return (
    <main>
      <HeroSection setCurrentPage={setCurrentPage} />

      <ServicesSection />

      {/* Pasamos el componente Lucide como prop (sin < />) */}
      <PlaceholderSection title="Productos" IconComponent={icons.ShoppingBag} />
      <PlaceholderSection
        title="D'Galú Academy"
        IconComponent={icons.GraduationCap}
      />
    </main>
  );
};

export default Home;
