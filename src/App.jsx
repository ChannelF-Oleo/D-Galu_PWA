// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Contexto
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Componentes Globales
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Páginas Públicas
import Home from "./pages/Home";
import Login from "./pages/Login";

// Páginas de Autenticación
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

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

// Componente de diagnóstico (TEMPORAL)
import SystemDiagnostic from "./components/debug/SystemDiagnostic";
import UploadServices from "./pages/UploadServices";
import TestNotifications from "./pages/TestNotifications";

// Componente para rutas que requieren autenticación básica (mantenido para compatibilidad)
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen text="Verificando autenticación..." />;
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
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
          <Routes>
          
          {/* GRUPO 1: RUTAS DEL ADMINISTRADOR (Sin Navbar/Footer) */}
          <Route
            path="/AdminDashboard"
            element={
              <ProtectedRoute 
                allowedRoles={['admin', 'manager', 'staff']}
                requiredPermission="dashboard"
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Rutas administrativas específicas con permisos granulares */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute 
                allowedRoles={['admin']}
                requiredPermission="canManageUsers"
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/services"
            element={
              <ProtectedRoute 
                allowedRoles={['admin', 'manager']}
                requiredPermission="canEditServices"
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute 
                allowedRoles={['admin', 'manager']}
                requiredPermission="canManageProducts"
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute 
                allowedRoles={['admin', 'manager', 'staff']}
                requiredPermission="canManageBookings"
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/academy"
            element={
              <ProtectedRoute 
                allowedRoles={['admin']}
                requiredPermission="canManageCourses"
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* GRUPO 2: RUTAS PÚBLICAS (Con Navbar/Footer) */}
          {/* Todas las rutas dentro de este Route usarán PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

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
            
            {/* Diagnóstico del Sistema (TEMPORAL) */}
            <Route 
              path="/diagnostic" 
              element={
                <div className="container mx-auto py-8">
                  <SystemDiagnostic />
                </div>
              } 
            />
            
            {/* Subir Servicios (TEMPORAL) */}
            <Route 
              path="/upload-services" 
              element={<UploadServices />} 
            />
            
            {/* Probar Notificaciones (TEMPORAL) */}
            <Route 
              path="/test-notifications" 
              element={<TestNotifications />} 
            />
          </Route>

          </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
