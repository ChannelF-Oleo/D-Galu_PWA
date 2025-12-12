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
        if (canViewAllStats) {
          // Variables para almacenar resultados
          let bookingsCount = 0;
          let studentsCount = 0;
          let lowStockCount = 0;

          // Intentar obtener citas de hoy - con múltiples estrategias
          try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

            const bookingsRef = collection(db, "bookings");
            
            // Primero intentar con query compuesta
            try {
              const todayQuery = query(
                bookingsRef,
                where("date", ">=", Timestamp.fromDate(startOfDay)),
                where("date", "<", Timestamp.fromDate(endOfDay))
              );
              const bookingsSnapshot = await getDocs(todayQuery);
              bookingsCount = bookingsSnapshot.size;
            } catch (queryError) {
              // Si falla el query compuesto, obtener todos y filtrar
              console.warn("Query compuesto falló, obteniendo todos los bookings:", queryError);
              const allBookingsSnapshot = await getDocs(bookingsRef);
              bookingsCount = allBookingsSnapshot.docs.filter(doc => {
                const data = doc.data();
                if (data.date) {
                  const bookingDate = data.date.toDate ? data.date.toDate() : new Date(data.date);
                  return bookingDate >= startOfDay && bookingDate < endOfDay;
                }
                return false;
              }).length;
            }
          } catch (bookingsError) {
            console.warn("Error obteniendo bookings:", bookingsError);
            // Si hay error, mostrar 0 en lugar de datos falsos
            bookingsCount = 0;
          }

          // Obtener inscripciones activas de cursos
          try {
            const enrollmentsRef = collection(db, "course_enrollments");
            const enrollmentsSnapshot = await getDocs(enrollmentsRef);
            studentsCount = enrollmentsSnapshot.size;
          } catch (enrollmentsError) {
            console.warn("Error obteniendo enrollments:", enrollmentsError);
            // Si hay error, mostrar 0 en lugar de datos falsos
            studentsCount = 0;
          }

          // Obtener productos con stock bajo
          try {
            const productsRef = collection(db, "products");
            const productsSnapshot = await getDocs(productsRef);
            lowStockCount = productsSnapshot.docs.filter(doc => {
              const data = doc.data();
              return (data.stock || 0) <= (data.minStock || 5);
            }).length;
          } catch (productsError) {
            console.warn("Error obteniendo products:", productsError);
            // Si hay error, mostrar 0 en lugar de datos falsos
            lowStockCount = 0;
          }

          // Mostrar datos reales (0 si no hay datos)
          setStats({
            bookingsToday: bookingsCount,
            monthlyRevenue: 0, // TODO: Calcular desde pagos reales
            activeStudents: studentsCount,
            pendingOrders: lowStockCount,
          });
        } else {
          // Para usuarios con permisos limitados - mostrar 0
          setStats({
            bookingsToday: 0,
            monthlyRevenue: 0,
            activeStudents: 0,
            pendingOrders: 0,
          });
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        // Fallback final - mostrar 0 en lugar de datos falsos
        setStats({
          bookingsToday: 0,
          monthlyRevenue: 0,
          activeStudents: 0,
          pendingOrders: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [canViewAllStats, canViewFinancials]);

  if (loading) {
    return (
      <div className="dashboard-view">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>
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