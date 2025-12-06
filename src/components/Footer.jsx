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
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Styles.css";

const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { name: "Servicios", path: "/services" },
    { name: "Productos", path: "/products" },
    { name: "Academy", path: "/academy" },
    { name: "Nosotros", path: "/about" },
    { name: "Blog", path: "/blog" }, // futura página
    { name: "Login / Admin", path: "/login" },
  ];

  return (
    <footer className="bg-gray-800 pt-16 pb-8 border-t-4 border-rose-400 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* --- CONTACTO --- */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-serif font-bold mb-4 text-white">
              Contacta tu Cita
            </h3>

            <div className="space-y-3 text-sm">
              <p className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-1 text-rose-400" />
                <span>
                  Av. Principal #123, Ensanche Ozama,
                  <br className="hidden sm:block" />
                  Santo Domingo Este.
                </span>
              </p>

              <p className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-rose-400" />
                <a
                  href="tel:+18095551234"
                  className="hover:text-rose-200 transition"
                >
                  +1 (809) 555-1234
                </a>
              </p>

              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-rose-400" />
                <a
                  href="mailto:contacto@dgalu.com"
                  className="hover:text-rose-200 transition"
                >
                  contacto@dgalu.com
                </a>
              </p>
            </div>
          </div>

          {/* --- NAVEGACIÓN --- */}
          <div className="col-span-1">
            <h3 className="text-xl font-serif font-bold mb-4 text-white">
              Navegación
            </h3>

            <ul className="space-y-2 text-sm">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="hover:text-rose-400 transition block text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* --- HORARIO + REDES --- */}
          <div className="col-span-1">
            <h3 className="text-xl font-serif font-bold mb-4 text-white">
              Horario & Social
            </h3>

            <p className="flex items-center mb-6 text-sm">
              <Clock className="h-5 w-5 mr-3 text-rose-400" />
              <span>Mar - Sab: 9:00 AM - 7:00 PM</span>
            </p>

            <div className="flex space-x-4">
              <a
                href="#"
                target="_blank"
                aria-label="Instagram"
                className="p-3 rounded-full bg-gray-700 text-rose-400 hover:bg-rose-400 hover:text-white transition transform hover:scale-110 hover:-translate-y-1 shadow-md"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                target="_blank"
                aria-label="Facebook"
                className="p-3 rounded-full bg-gray-700 text-rose-400 hover:bg-rose-400 hover:text-white transition transform hover:scale-110 hover:-translate-y-1 shadow-md"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                target="_blank"
                aria-label="Newsletter"
                className="p-3 rounded-full bg-gray-700 text-rose-400 hover:bg-rose-400 hover:text-white transition transform hover:scale-110 hover:-translate-y-1 shadow-md"
              >
                <Send className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* --- MAPA --- */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-serif font-bold mb-4 text-white">
              Encuéntranos
            </h3>

            <div className="bg-gray-700 h-32 w-full flex items-center justify-center text-sm rounded-lg shadow-inner text-gray-400">
              [Mapa próximamente]
            </div>

            <p className="text-sm mt-3 text-gray-400">
              Siempre un ambiente de primera para tu belleza. 💅
            </p>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} D'Galú. Todos los derechos reservados. |{" "}
        Desarrollado con <Heart className="inline w-4 h-4 text-rose-400" /> por
        ChannelF_Oleo.
      </div>
    </footer>
  );
};

export default Footer;
