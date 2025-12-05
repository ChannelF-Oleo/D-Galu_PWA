import React, { useState, useEffect } from "react";
import { Menu, X, Calendar } from "lucide-react";
// Aunque tenemos las variables CSS, mantenemos el import por si necesitas lógica condicional JS
import { COLORS } from "../utils/Colors";
import "../styles/Navbar.css"; // Importamos los estilos específicos

const Navbar = ({ setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto para detectar scroll y cambiar la opacidad/sombra
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Servicios", page: "services" },
    { name: "Productos", page: "products" },
    { name: "Academy", page: "academy" },
    { name: "Galería", page: "gallery" },
    { name: "Nosotros", page: "about" },
  ];

  return (
    <nav className={`navbar-fixed ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-content">
          {/* --- LOGO --- */}
          <button
            onClick={() => setCurrentPage("home")}
            className="navbar-logo"
          >
            D'Galú
          </button>

          {/* --- MENÚ DESKTOP --- */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setCurrentPage(item.page)}
                className="nav-link group"
              >
                {item.name}
                {/* Línea animada inferior */}
                <span className="nav-link-indicator"></span>
              </button>
            ))}

            {/* CTA Desktop (Coincide con Hero) */}
            <button
              onClick={() => setCurrentPage("booking")}
              className="btn-nav-cta"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Cita</span>
            </button>
          </div>

          {/* --- BOTÓN MENÚ MÓVIL --- */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="mobile-menu-btn"
              aria-label="Abrir menú"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENÚ MÓVIL (Dropdown) --- */}
      <div className={`mobile-menu-dropdown ${isOpen ? "open" : ""}`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setCurrentPage(item.page);
                setIsOpen(false);
              }}
              className="mobile-nav-link"
            >
              {item.name}
            </button>
          ))}

          {/* CTA Móvil */}
          <button
            onClick={() => {
              setCurrentPage("booking");
              setIsOpen(false);
            }}
            className="btn-nav-cta w-full justify-center mt-4"
          >
            <Calendar className="w-5 h-5" />
            <span>Reservar Ahora</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
