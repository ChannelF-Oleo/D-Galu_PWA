import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  ShoppingBag,
  GraduationCap,
  Users,
} from "lucide-react";

// Importar componentes
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import DashboardView from "./DashboardView";
import ServicesView from "./ServicesView";
import BookingsView from "./BookingsView";
import ProductsView from "./ProductsView";
import AcademyView from "./AcademyView";
import UsersView from "./UsersView"; 

// Importar utilidades de roles
import { getMenuItemsByRole } from "../utils/rolePermissions";

// Estilos
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Obtener rol del usuario (debe venir de user.role en tu AuthContext)
  // Por defecto usamos 'admin', ajusta según tu estructura
  const userRole = user?.role || "admin";

  // Iconos para los items del menú
  const menuIcons = {
    dashboard: LayoutDashboard,
    bookings: Calendar,
    services: Scissors,
    products: ShoppingBag,
    academy: GraduationCap,
    users: Users,
  };

  // Obtener items del menú según el rol
  const menuItems = getMenuItemsByRole(userRole).map((item) => ({
    ...item,
    icon: menuIcons[item.id],
  }));

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al salir", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Renderizado del contenido principal según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView userRole={userRole} />;

      case "services":
        return <ServicesView userRole={userRole} />;

      case "bookings":
        return <BookingsView userRole={userRole} />;

      case "products":
        return <ProductsView userRole={userRole} />;

      case "academy":
        return <AcademyView userRole={userRole} />;

        case "users":
          return <UsersView userRole={userRole} />;

      default:
        return (
          <div className="placeholder-view">
            <p>Selecciona una opción del menú</p>
          </div>
        );
    }
  };

  // En AdminDashboard.jsx, antes del return
console.log("--- DEBUG ADMIN DASHBOARD ---");
console.log("Usuario actual:", user);
console.log("Rol detectado:", userRole);
console.log("Items del menú generados:", menuItems);

  return (
    <div className="admin-layout">
      <Sidebar
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        onLogout={handleLogout}
      />

      <div
        className={`admin-layout__main ${
          isSidebarCollapsed ? "admin-layout__main--expanded" : ""
        }`}
      >
        <TopBar
          user={user}
          activeTab={activeTab}
          menuItems={menuItems}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebarCollapse={toggleSidebarCollapse}
        />

        <main className="admin-layout__content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
