// Navbar.jsx
import React, { useState, useEffect } from "react";
import { Menu, X, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Servicios", path: "/services" },
    { name: "Productos", path: "/products" },
    { name: "Academy", path: "/academy" },
    { name: "Galería", path: "/gallery" },
    { name: "Nosotros", path: "/about" },
  ];

  return (
    <nav className={`navbar-fixed ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-content">
          {/* LOGO */}
          <button onClick={() => navigate("/")} className="navbar-logo">
            D'Galú
          </button>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="nav-link group"
              >
                {item.name}
                <span className="nav-link-indicator"></span>
              </button>
            ))}

            {/* CTA DESKTOP */}
            <button
              onClick={() => navigate("/booking")}
              className="btn-nav-cta"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar</span>
            </button>

            {/* LOGIN DESKTOP */}

          </div>

          {/* BOTON_MENU_MOVIL */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="mobile-menu-btn"
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

      {/* MENU MOVIL */}
      <div className={`mobile-menu-dropdown ${isOpen ? "open" : ""}`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              className="mobile-nav-link"
            >
              {item.name}
            </button>
          ))}

          {/* CTA MOBILE */}
          <button
            onClick={() => {
              navigate("/booking");
              setIsOpen(false);
            }}
            className="btn-nav-cta w-full mt-4"
          >
            <Calendar className="w-5 h-5" />
            Reservar
          </button>

          {/* LOGIN MOBILE */}
          <button
            onClick={() => {
              navigate("/login");
              setIsOpen(false);
            }}
            className="mobile-nav-link flex items-center gap-2 mt-2"
          >
            <User size={20} />
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
