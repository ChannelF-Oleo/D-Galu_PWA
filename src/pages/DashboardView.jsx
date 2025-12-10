import React, { useState, useEffect } from "react";
import { Calendar, DollarSign, GraduationCap, ShoppingBag } from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from "firebase/firestore";
import { db } from "../config/firebase";
import StatCard from "../components/admin/UI/StatCard";
import RecentActivity from "./RecentActivity";
import { hasPermission } from "../utils/rolePermissions";
import "./DashboardView.css";

const DashboardView = ({ userRole }) => {
  const [stats, setStats] = useState({
    bookingsToday: 0,
    monthlyRevenue: 0,
    activeStudents: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  const canViewFinancials = hasPermission(userRole, "canViewFinancials");
  const canViewAllStats = hasPermission(userRole, "canViewAllStats");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Obtener fecha de inicio y fin del día
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        // Obtener inicio del mes
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Citas de hoy
        if (canViewAllStats) {
          const bookingsRef = collection(db, "reservations");
          const todayQuery = query(
            bookingsRef,
            where("date", ">=", Timestamp.fromDate(startOfDay)),
            where("date", "<", Timestamp.fromDate(endOfDay)),
            where("status", "==", "confirmed")
          );
          const bookingsSnapshot = await getDocs(todayQuery);
          const bookingsCount = bookingsSnapshot.size;

          // Ingresos del mes (solo si tiene permiso)
          let revenue = 0;
          if (canViewFinancials) {
            const paymentsRef = collection(db, "payments");
            const monthQuery = query(
              paymentsRef,
              where("createdAt", ">=", Timestamp.fromDate(startOfMonth)),
              where("status", "==", "completed")
            );
            const paymentsSnapshot = await getDocs(monthQuery);
            revenue = paymentsSnapshot.docs.reduce((total, doc) => {
              return total + (doc.data().amount || 0);
            }, 0);
          }

          // Estudiantes activos
          const studentsRef = collection(db, "students");
          const studentsQuery = query(
            studentsRef,
            where("status", "==", "active")
          );
          const studentsSnapshot = await getDocs(studentsQuery);
          const studentsCount = studentsSnapshot.size;

          // Pedidos pendientes
          const ordersRef = collection(db, "orders");
          const ordersQuery = query(
            ordersRef,
            where("status", "in", ["pending", "processing"])
          );
          const ordersSnapshot = await getDocs(ordersQuery);
          const ordersCount = ordersSnapshot.size;

          setStats({
            bookingsToday: bookingsCount,
            monthlyRevenue: revenue,
            activeStudents: studentsCount,
            pendingOrders: ordersCount,
          });
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [canViewAllStats, canViewFinancials]);

  if (loading) {
    return (
      <div className="dashboard-view">
        <div className="dashboard-view__loading">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      {/* Grid de estadísticas */}
      <div className="dashboard-view__stats">
        {canViewAllStats && (
          <>
            <StatCard
              title="Citas Hoy"
              value={stats.bookingsToday}
              icon={Calendar}
              color="#f43f5e"
              trend={stats.bookingsToday > 0 ? `${stats.bookingsToday} confirmadas` : null}
            />
            {canViewFinancials && (
              <StatCard
                title="Ingresos Mes"
                value={`$${stats.monthlyRevenue.toLocaleString()}`}
                icon={DollarSign}
                color="#10b981"
                trend="+12%"
              />
            )}
            <StatCard
              title="Alumnos Activos"
              value={stats.activeStudents}
              icon={GraduationCap}
              color="#8b5cf6"
            />
            <StatCard
              title="Pedidos Pendientes"
              value={stats.pendingOrders}
              icon={ShoppingBag}
              color="#f59e0b"
              trend={stats.pendingOrders > 0 ? "Requieren atención" : null}
            />
          </>
        )}

        {!canViewAllStats && (
          <>
            <StatCard
              title="Mis Citas Hoy"
              value="3"
              icon={Calendar}
              color="#f43f5e"
            />
            <StatCard
              title="Tareas Pendientes"
              value="7"
              icon={ShoppingBag}
              color="#f59e0b"
            />
          </>
        )}
      </div>

      {/* Actividad reciente */}
      <RecentActivity />
    </div>
  );
};

export default DashboardView;