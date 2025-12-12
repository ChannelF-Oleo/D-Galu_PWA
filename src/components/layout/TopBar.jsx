import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import NotificationBell from "../common/NotificationBell";
import "./TopBar.css";

const TopBar = ({
  user,
  activeTab,
  menuItems,
  toggleSidebar,
  isSidebarCollapsed,
  toggleSidebarCollapse,
}) => {

  // 1. Título Dinámico: Busca el label correspondiente al tab activo
  const currentTitle = menuItems.find((item) => item.id === activeTab)?.label || "Panel de Control";

  // 2. Lógica de Usuario: Obtener nombre e inicial
  const userName = user?.displayName || "Usuario";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="topbar">
      {/* SECCIÓN IZQUIERDA: Controles y Título */}
      <div className="topbar__left">
        {/* Botón Hamburguesa (Solo Móvil) */}
        <button 
          className="topbar__toggle-mobile" 
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>

        {/* Botón Colapsar (Solo Desktop) */}
        <button
          className="topbar__toggle-desktop"
          onClick={toggleSidebarCollapse}
          title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Título de la Sección Actual */}
        <h1 className="topbar__title">{currentTitle}</h1>
      </div>

      {/* SECCIÓN DERECHA: Perfil y Acciones */}
      <div className="topbar__right">
        {/* Componente de Notificaciones */}
        <NotificationBell />


        <div className="topbar__divider"></div>

        {/* Perfil de Usuario */}
        <div className="user-profile">
          <div className="user-profile__info">
            <span className="user-profile__greeting">Hola,</span>
            <span className="user-profile__name">{userName}</span>
          </div>
          
          <div className="user-avatar">
            {/* Si el usuario tiene foto la mostramos, si no, usamos la inicial */}
            {user?.photoURL ? (
              <img src={user.photoURL} alt={userName} className="user-avatar__img" />
            ) : (
              <span className="user-avatar__initial">{userInitial}</span>
            )}
          </div>
        </div>
      </div>

      

    </header>
  );
};

export default TopBar;