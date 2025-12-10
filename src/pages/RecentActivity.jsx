import React, { useState, useEffect } from "react";
import { Activity, Clock } from "lucide-react";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../config/firebase";
import "./RecentActivity.css";

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar actividades en tiempo real desde Firebase
  useEffect(() => {
    setLoading(true);
    
    const activitiesRef = collection(db, "activities");
    const q = query(
      activitiesRef, 
      orderBy("timestamp", "desc"), 
      limit(10)
    );

    // Suscripción en tiempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setActivities(activitiesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar actividades:", error);
        setLoading(false);
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Recién";
    
    // Convertir Firestore Timestamp a Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    
    if (minutes < 1) return "Justo ahora";
    if (minutes < 60) return `Hace ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString("es-DO");
  };

  const getIconForType = (type) => {
    const icons = {
      booking: "📅",
      enrollment: "🎓",
      inventory: "⚠️",
      order: "🛍️",
      payment: "💰",
      service: "✂️",
      user: "👤",
      default: "📌"
    };
    return icons[type] || icons.default;
  };

  return (
    <div className="recent-activity">
      <div className="recent-activity__header">
        <Activity size={20} className="recent-activity__header-icon" />
        <h3 className="recent-activity__title">Actividad Reciente</h3>
      </div>

      {loading ? (
        <div className="recent-activity__loading">
          <div className="spinner"></div>
          <p>Cargando actividad...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="recent-activity__empty">
          <p>No hay actividad reciente</p>
        </div>
      ) : (
        <div className="recent-activity__list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <span className="activity-item__icon">
                {getIconForType(activity.type)}
              </span>
              <div className="activity-item__content">
                <p className="activity-item__message">{activity.message}</p>
                <span className="activity-item__time">
                  <Clock size={12} />
                  {getTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;