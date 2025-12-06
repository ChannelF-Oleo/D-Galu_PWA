import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { icons } from "../utils/icons";
import "../styles/Home.css";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div
    style={{
      background: "white",
      padding: "1.5rem",
      borderRadius: "1rem",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    }}
  >
    <div
      style={{
        background: color,
        padding: "1rem",
        borderRadius: "0.75rem",
        color: "white",
        display: "flex",
      }}
    >
      <Icon size={24} />
    </div>
    <div>
      <p style={{ color: "var(--color-text-gray)", fontSize: "0.875rem" }}>
        {title}
      </p>
      <h3
        style={{
          fontSize: "1.5rem",
          fontWeight: "700",
          color: "var(--color-text-dark)",
        }}
      >
        {value}
      </h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al salir", error);
    }
  };

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      background: "#f3f4f6",
    },
    sidebar: {
      width: "260px",
      background: "var(--color-bg-dark)",
      color: "white",
      padding: "2rem 1rem",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      height: "100%",
      left: 0,
      top: 0,
    },
    main: {
      marginLeft: "260px",
      flexGrow: 1,
      padding: "2rem",
    },
    menuItem: (isActive) => ({
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      marginBottom: "0.5rem",
      cursor: "pointer",
      background: isActive ? "var(--color-primary)" : "transparent",
      color: isActive ? "white" : "rgba(255,255,255,0.7)",
      transition: "all 0.2s",
    }),
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "3rem",
            textAlign: "center",
          }}
        >
          D'Galú <span style={{ color: "var(--color-primary)" }}>Admin</span>
        </h2>

        <nav style={{ flexGrow: 1 }}>
          <div
            style={styles.menuItem(activeTab === "dashboard")}
            onClick={() => setActiveTab("dashboard")}
          >
            <icons.Star size={20} />
            <span>Dashboard</span>
          </div>
          <div
            style={styles.menuItem(activeTab === "services")}
            onClick={() => setActiveTab("services")}
          >
            <icons.Scissors size={20} />
            <span>Servicios</span>
          </div>
          <div
            style={styles.menuItem(activeTab === "bookings")}
            onClick={() => setActiveTab("bookings")}
          >
            <icons.Calendar size={20} />
            <span>Citas</span>
          </div>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            ...styles.menuItem(false),
            marginTop: "auto",
            border: "1px solid rgba(255,255,255,0.2)",
            justifyContent: "center",
          }}
        >
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      <main style={styles.main}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "2rem",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "bold",
              color: "var(--color-text-dark)",
            }}
          >
            Hola, Administrador
          </h1>
          <div
            style={{
              background: "white",
              padding: "0.5rem 1rem",
              borderRadius: "2rem",
              fontSize: "0.9rem",
              color: "var(--color-text-gray)",
            }}
          >
            {user?.email}
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="animate-fade-in">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <StatCard
                title="Citas Hoy"
                value="8"
                icon={icons.Calendar}
                color="#f43f5e"
              />
              <StatCard
                title="Total Servicios"
                value="12"
                icon={icons.Scissors}
                color="#8b5cf6"
              />
              <StatCard
                title="Nuevos Clientes"
                value="24"
                icon={icons.Star}
                color="#10b981"
              />
            </div>

            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "1rem",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  color: "var(--color-text-dark)",
                }}
              >
                Actividad Reciente
              </h3>
              <p style={{ color: "var(--color-text-gray)" }}>
                Aquí aparecerá la lista de últimas citas agendadas...
              </p>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="animate-fade-in">
            <h2 style={{ marginBottom: "1rem" }}>Gestión de Servicios</h2>
            <p>Aquí irá el CRUD de servicios.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
