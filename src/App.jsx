// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"; // Agregué Outlet

// Contexto
import { AuthProvider, useAuth } from "./context/AuthContext";

// Componentes Globales
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Páginas Públicas
import Home from "./pages/Home";
import Login from "./pages/Login";

// Páginas de Administración
import AdminDashboard from "./pages/AdminDashboard";

// Próximas páginas (Tus imports originales)
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

// Layout para la parte pública (Con Navbar y Footer)
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        {/* Aquí se renderizará el contenido de la ruta hija */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* GRUPO 1: RUTAS DEL ADMINISTRADOR (Sin Navbar/Footer) */}
          <Route
            path="/AdminDashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* GRUPO 2: RUTAS PÚBLICAS (Con Navbar/Footer) */}
          {/* Todas las rutas dentro de este Route usarán PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Servicios */}
            <Route path="/services" element={<ServicesList />} />
            <Route path="/services/:id" element={<ServiceDetail />} />

            {/* Productos */}
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Academy */}
            <Route path="/academy" element={<CoursesList />} />
            <Route path="/academy/:id" element={<CourseDetail />} />

            {/* Otras Páginas */}
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/booking" element={<Booking />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
