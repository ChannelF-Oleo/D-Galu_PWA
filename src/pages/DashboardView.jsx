// src/pages/DashboardView.jsx
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
          let bookingsCount = 0;
          let studentsCount = 0;
          let lowStockCount = 0;

          // 1. LÓGICA DE CITAS (BOOKINGS) CORREGIDA
          try {
            const bookingsRef = collection(db, "bookings");
            const now = new Date();
            
            // Definir rangos para Timestamp
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            
            // Definir string para búsqueda por texto (YYYY-MM-DD)
            // Ajustamos a formato local para coincidir con lo que guardan los inputs de fecha
            const todayStr = now.toLocaleDateString('en-CA'); // Formato: "YYYY-MM-DD"

            // ESTRATEGIA A: Intentar consulta por String (Más probable si usas inputs type="date")
            const stringQuery = query(
              bookingsRef,
              where("date", "==", todayStr)
            );
            const stringSnapshot = await getDocs(stringQuery);

            if (!stringSnapshot.empty) {
              // Si encontramos citas por string, usamos este resultado
              bookingsCount = stringSnapshot.size;
            } else {
              // ESTRATEGIA B: Si no hay por string, intentar por Rango Timestamp
              const timestampQuery = query(
                bookingsRef,
                where("date", ">=", Timestamp.fromDate(startOfDay)),
                where("date", "<", Timestamp.fromDate(endOfDay))
              );
              const timestampSnapshot = await getDocs(timestampQuery);
              
              if (!timestampSnapshot.empty) {
                bookingsCount = timestampSnapshot.size;
              } else {
                // ESTRATEGIA C (Fallback final): Traer todo y filtrar en memoria 
                // (Solo si las anteriores fallan o devuelven 0 y queremos estar 100% seguros)
                // Nota: Esto consume más lecturas, usar con precaución en producción
                /*
                const allDocs = await getDocs(bookingsRef);
                bookingsCount = allDocs.docs.filter(doc => {
                  const d = doc.data().date;
                  if (!d) return false;
                  // Comparar si es string
                  if (typeof d === 'string') return d === todayStr;
                  // Comparar si es Timestamp
                  if (d.toDate) {
                    const tDate = d.toDate();
                    return tDate >= startOfDay && tDate < endOfDay;
                  }
                  return false;
                }).length;
                */
               bookingsCount = 0; // Si A y B dieron 0, asumimos 0.
              }
            }
          } catch (bookingsError) {
            console.warn("Error calculando citas:", bookingsError);
            bookingsCount = 0;
          }

          // 2. LÓGICA DE ALUMNOS (Sin cambios)
          try {
            const enrollmentsRef = collection(db, "course_enrollments");
            const enrollmentsSnapshot = await getDocs(enrollmentsRef);
            studentsCount = enrollmentsSnapshot.size;
          } catch (enrollmentsError) {
            console.warn("Error obteniendo enrollments:", enrollmentsError);
          }

          // 3. LÓGICA DE STOCK BAJO (Sin cambios)
          try {
            const productsRef = collection(db, "products");
            const productsSnapshot = await getDocs(productsRef);
            lowStockCount = productsSnapshot.docs.filter(doc => {
              const data = doc.data();
              return (data.stock || 0) <= (data.minStock || 5);
            }).length;
          } catch (productsError) {
            console.warn("Error obteniendo products:", productsError);
          }

          setStats({
            bookingsToday: bookingsCount,
            monthlyRevenue: 0, 
            activeStudents: studentsCount,
            pendingOrders: lowStockCount,
          });

        } else {
          // Vista limitada para staff sin permisos de estadísticas globales
          setStats({
            bookingsToday: 0,
            monthlyRevenue: 0,
            activeStudents: 0,
            pendingOrders: 0,
          });
        }
      } catch (error) {
        console.error("Error general en dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userRole, canViewAllStats]); // Añadido userRole a dependencias para recargar si cambia

  if (loading) {
    return (
      <div className="dashboard-view">
        <div className="dashboard-loading">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-500">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      {/* Grid de estadísticas */}
      <div className="dashboard-view__stats">
        {canViewAllStats ? (
          <>
            <StatCard
              title="Citas Hoy"
              value={stats.bookingsToday}
              icon={Calendar}
              color="#f43f5e"
              trend={stats.bookingsToday > 0 ? "Agenda activa" : "Sin citas hoy"}
            />
            {canViewFinancials && (
              <StatCard
                title="Ingresos Mes"
                value={`$${stats.monthlyRevenue.toLocaleString()}`}
                icon={DollarSign}
                color="#10b981"
                trend="Estimado"
              />
            )}
            <StatCard
              title="Alumnos Activos"
              value={stats.activeStudents}
              icon={GraduationCap}
              color="#8b5cf6"
            />
            <StatCard
              title="Stock Bajo"
              value={stats.pendingOrders}
              icon={ShoppingBag}
              color="#f59e0b"
              trend={stats.pendingOrders > 0 ? "Reponer stock" : "Stock saludable"}
            />
          </>
        ) : (
          <div className="col-span-full p-4 bg-blue-50 text-blue-800 rounded-lg">
            Bienvenido al panel de control. Selecciona una opción del menú.
          </div>
        )}
      </div>

      {/* Actividad reciente */}
      <RecentActivity />
    </div>
  );
};

export default DashboardView;