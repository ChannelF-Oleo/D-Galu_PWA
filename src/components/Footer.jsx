// src/components/Footer.jsx

import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Send,
  Clock,
  Heart,
} from "lucide-react";
import { COLORS } from "../utils/Colors"; // Importamos las constantes de colores
import "../styles/Styles.css"; // Importamos estilos base (aunque no aplica glass, asegura el ambiente)

const Footer = () => {
  const quickLinks = [
    { name: "Servicios", page: "services" },
    { name: "Productos", page: "products" },
    { name: "Academy", page: "academy" },
    { name: "Nosotros", page: "about" },
    { name: "Blog", page: "blog" },
  ];

  return (
    <footer
      className={`bg-gray-800 pt-16 pb-8 border-t-4 border-rose-400 text-gray-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Rejilla 100% Responsiva: 2 columnas en móvil, 4 en desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Columna 1: Contacto (col-span-2 en móvil para aprovechar espacio) */}
          <div className="col-span-2 md:col-span-1">
            <h3 className={`text-xl font-serif font-bold mb-4 text-white`}>
              Contacta tu Cita
            </h3>
            <div className="space-y-3 text-sm">
              <p className="flex items-start">
                <MapPin className={`h-5 w-5 mr-3 mt-1 text-rose-400`} />
                <span>
                  Av. Principal #123, Ensanche Ozama,{" "}
                  <br className="hidden sm:block" />
                  Santo Domingo Este.
                </span>
              </p>
              <p className="flex items-center">
                <Phone className={`h-5 w-5 mr-3 text-rose-400`} />
                <a
                  href="tel:+18095551234"
                  className="hover:text-rose-200 transition duration-200"
                >
                  +1 (809) 555-1234
                </a>
              </p>
              <p className="flex items-center">
                <Mail className={`h-5 w-5 mr-3 text-rose-400`} />
                <a
                  href="mailto:contacto@dgalu.com"
                  className="hover:text-rose-200 transition duration-200"
                >
                  contacto@dgalu.com
                </a>
              </p>
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="col-span-1">
            <h3 className={`text-xl font-serif font-bold mb-4 text-white`}>
              Navegación
            </h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={`#${link.page}`}
                    className="hover:text-rose-400 transition duration-200 block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Horario y Redes Sociales */}
          <div className="col-span-1">
            <h3 className={`text-xl font-serif font-bold mb-4 text-white`}>
              Horario & Social
            </h3>
            <p className="flex items-center mb-6 text-sm">
              <Clock className={`h-5 w-5 mr-3 text-rose-400`} />
              <span>Mar - Sab: 9:00 AM - 7:00 PM</span>
            </p>

            {/* Redes Sociales con Animación (Rosado) */}
            <div className="flex space-x-4">
              {/* Animación: Escala y traslación vertical en hover */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de D'Galú"
                className="p-3 rounded-full bg-gray-700 text-rose-400 hover:bg-rose-400 hover:text-white transition duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-md"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de D'Galú"
                className="p-3 rounded-full bg-gray-700 text-rose-400 hover:bg-rose-400 hover:text-white transition duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-md"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Newsletter de D'Galú"
                className="p-3 rounded-full bg-gray-700 text-rose-400 hover:bg-rose-400 hover:text-white transition duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-md"
              >
                <Send className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Columna 4: Ubicación/Mapa */}
          <div className="col-span-2 md:col-span-1">
            <h3 className={`text-xl font-serif font-bold mb-4 text-white`}>
              Encuéntranos
            </h3>
            {/* Contenedor del Mapa */}
            <div className="bg-gray-700 h-32 w-full flex items-center justify-center text-sm rounded-lg shadow-inner text-gray-400 overflow-hidden">
              {/* Recomendación de optimización: Usar 'loading="lazy"' si es un iframe de Google Maps */}
              [Placeholder de Mapa]
            </div>
            <p className="text-sm mt-3 text-gray-400">
              Siempre un ambiente de primera para tu belleza. 💅
            </p>
          </div>
        </div>
      </div>

      {/* Derechos de Autor */}
      <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} D'Galú. Todos los derechos reservados. |
        Desarrollado con <Heart className="inline w-4 h-4 text-rose-400" /> por
        Juniper Dev.
      </div>
    </footer>
  );
};

export default Footer;
