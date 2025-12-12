import React, { useState, useEffect } from "react";
import { LogOut, X, Sun, Moon, MoreHorizontal } from "lucide-react";
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
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showExpandedMenu, setShowExpandedMenu] = useState(false);

  // Cargar tema desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
    }
  }, []);

  // Aplicar tema al documento
  useEffect(() => {
    const adminLayout = document.querySelector('.admin-layout');
    if (adminLayout) {
      if (isDarkTheme) {
        adminLayout.classList.remove('light-theme');
        adminLayout.classList.add('dark-theme');
      } else {
        adminLayout.classList.remove('dark-theme');
        adminLayout.classList.add('light-theme');
      }
    }
    localStorage.setItem('admin-theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  // Items principales para móvil (primeros 3 + expansión)
  const mobileMainItems = menuItems.slice(0, 3);
  const mobileHiddenItems = menuItems.slice(3);
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
          {/* Desktop: mostrar todos los items */}
          <div className="desktop-nav">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                  title={isSidebarCollapsed ? item.label : ""}
                >
                  <div className="nav-icon-wrapper">
                    {IconComponent && <IconComponent size={20} />}
                  </div>
                  
                  {!isSidebarCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile: mostrar solo items principales */}
          <div className="mobile-nav">
            {mobileMainItems.map((item) => {
              const IconComponent = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowExpandedMenu(false);
                  }}
                  className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                >
                  <div className="nav-icon-wrapper">
                    {IconComponent && <IconComponent size={20} />}
                  </div>
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}

            {/* Botón de expansión en móvil */}
            {mobileHiddenItems.length > 0 && (
              <button
                onClick={() => setShowExpandedMenu(!showExpandedMenu)}
                className="nav-item expand-btn"
              >
                <div className="nav-icon-wrapper">
                  <MoreHorizontal size={20} />
                </div>
                <span className="nav-label">Más</span>
              </button>
            )}
          </div>
        </nav>

        {/* Footer: Cerrar Sesión y Tema */}
        <div className="sidebar-footer">
          {/* Botón de tema */}
          <button 
            onClick={toggleTheme}
            className="nav-item theme-btn"
            title={isSidebarCollapsed ? (isDarkTheme ? "Tema Claro" : "Tema Oscuro") : ""}
          >
            <div className="nav-icon-wrapper">
              {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            {!isSidebarCollapsed && (
              <span className="nav-label">
                {isDarkTheme ? "Tema Claro" : "Tema Oscuro"}
              </span>
            )}
          </button>

          {/* Botón de logout */}
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

      {/* Menú expandido para móvil */}
      {showExpandedMenu && (
        <div className="mobile-expanded-menu">
          <div className="mobile-expanded-overlay" onClick={() => setShowExpandedMenu(false)} />
          <div className="mobile-expanded-content">
            <div className="mobile-expanded-header">
              <h3>Más opciones</h3>
              <button onClick={() => setShowExpandedMenu(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mobile-expanded-items">
              {mobileHiddenItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowExpandedMenu(false);
                    }}
                    className={`mobile-expanded-item ${activeTab === item.id ? "active" : ""}`}
                  >
                    <div className="nav-icon-wrapper">
                      {IconComponent && <IconComponent size={20} />}
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              {/* Opciones adicionales en el menú expandido */}
              <button onClick={toggleTheme} className="mobile-expanded-item">
                <div className="nav-icon-wrapper">
                  {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
                </div>
                <span>{isDarkTheme ? "Tema Claro" : "Tema Oscuro"}</span>
              </button>
              
              <button onClick={onLogout} className="mobile-expanded-item logout">
                <div className="nav-icon-wrapper">
                  <LogOut size={20} />
                </div>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;