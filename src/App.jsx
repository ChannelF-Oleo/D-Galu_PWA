// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Contexto
import { AuthProvider, useAuth } from "./context/AuthContext";

// Componentes Globales
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Páginas Públicas
import Home from "./pages/Home";
import Login from "./pages/Login";

// Páginas de Administración (Asumiendo que guardaste el archivo en pages)
import AdminDashboard from "./pages/AdminDashboard";

// Próximas páginas
import ServicesList from "./pages/Services/ServicesList";
import ServiceDetail from "./pages/Services/ServiceDetail";

import ProductsList from "./pages/Products/ProductsList";
import ProductDetail from "./pages/Products/ProductDetail";

import CoursesList from "./pages/Academy/CoursesList";
import CourseDetail from "./pages/Academy/CourseDetail";

import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Booking from "./pages/Booking";

// Componente para proteger rutas privadas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-white">
          {/* NAVBAR GLOBAL */}
          <Navbar />

          {/* CONTENIDO PRINCIPAL */}
          <main className="flex-grow">
            <Routes>
              {/* PUBLICAS */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* RUTA PRIVADA ADMIN */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* SERVICIOS */}
              <Route path="/services" element={<ServicesList />} />
              <Route path="/services/:id" element={<ServiceDetail />} />

              {/* PRODUCTOS */}
              <Route path="/products" element={<ProductsList />} />
              <Route path="/products/:id" element={<ProductDetail />} />

              {/* ACADEMY */}
              <Route path="/academy" element={<CoursesList />} />
              <Route path="/academy/:id" element={<CourseDetail />} />

              {/* OTRAS PÁGINAS */}
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/booking" element={<Booking />} />
            </Routes>
          </main>

          {/* FOOTER GLOBAL */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
