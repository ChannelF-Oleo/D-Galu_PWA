// src/App.jsx

import React from "react";
// Importamos los componentes que ya hemos creado
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";

// Si usáramos React Router, los imports serían diferentes,
// pero para una estructura inicial, cargamos Home directamente.

const App = () => {
  return (
    // El div principal envuelve toda la aplicación
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. La barra de navegación se mantiene fija en la parte superior */}
      <Navbar />

      {/* 2. Contenido principal de la aplicación (la página Home por ahora) */}
      <main className="flex-grow">
        <Home />
        {/*
          Aquí es donde se integrarían las rutas (Ej: si usamos React Router):
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/servicios" element={<ServicesPage />} />
            <Route path="/cita" element={<BookingFlow />} />
            {/* ... otras rutas
          </Routes>
        */}
      </main>

      {/* 3. El pie de página */}
      <Footer />

      {/*
        Opcional: Si quieres incluir el botón flotante de WhatsApp,
        lo añadirías aquí, fuera de la estructura principal de la página,
        pero dentro del contenedor <div className="min-h-screen...">.
      */}
      {/* <WhatsAppButton /> */}
    </div>
  );
};

export default App;
