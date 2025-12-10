import React from "react";
import { LogOut, X } from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ 
  menuItems, 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen,
  isSidebarCollapsed,
  onLogout 
}) => {
  return (
    <>
      {/* Overlay para móviles: cierra el menú al hacer click fuera */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""} ${isSidebarCollapsed ? "collapsed" : ""}`}>
        {/* Cabecera */}
        <div className="sidebar-header">
          <h2 className="sidebar-logo">
            {isSidebarCollapsed ? "D'" : "D'Galú"}
            {!isSidebarCollapsed && <span className="sidebar-subtitle">Admin</span>}
          </h2>
          {/* Botón cerrar solo visible en móvil */}
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            // Renderizamos el icono como componente
            const IconComponent = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  // En móvil, cerrar menú al elegir opción
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                title={isSidebarCollapsed ? item.label : ""}
              >
                {/* Contenedor del icono para centrado perfecto */}
                <div className="nav-icon-wrapper">
                  {IconComponent && <IconComponent size={20} />}
                </div>
                
                {/* Texto: oculto si está colapsado */}
                {!isSidebarCollapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: Cerrar Sesión */}
        <div className="sidebar-footer">
          <button 
            onClick={onLogout} 
            className="nav-item logout-btn"
            title={isSidebarCollapsed ? "Cerrar Sesión" : ""}
          >
            <div className="nav-icon-wrapper">
              <LogOut size={20} />
            </div>
            {!isSidebarCollapsed && <span className="nav-label">Salir</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;