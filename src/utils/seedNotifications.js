// src/utils/seedNotifications.js
import { db } from "../config/firebase";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";

// Notificaciones de ejemplo para el sistema
const notificationsData = [
  {
    id: "welcome-notification",
    title: "¡Bienvenido al Sistema D'Galú!",
    message: "El sistema de notificaciones está funcionando correctamente. Aquí recibirás alertas importantes sobre reservas, productos y más.",
    type: "system",
    priority: "low",
    targetRoles: ["admin", "manager", "staff"],
    readBy: [],
    isActive: true,
    createdAt: new Date(),
    bookingId: null,
    userId: null
  },
  {
    id: "new-booking-example",
    title: "Nueva Reserva Recibida",
    message: "María González ha reservado una cita para Manicura + Pedicura el 15 de diciembre a las 2:00 PM.",
    type: "new_booking",
    priority: "high",
    targetRoles: ["admin", "manager", "staff"],
    readBy: [],
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    bookingId: "booking-example-1",
    userId: "user-example-1"
  },
  {
    id: "low-stock-alert",
    title: "Stock Bajo - Esmalte Rojo",
    message: "El producto 'Esmalte Rojo Clásico' tiene solo 3 unidades en stock. Considera reordenar pronto.",
    type: "low_stock",
    priority: "medium",
    targetRoles: ["admin", "manager"],
    readBy: [],
    isActive: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
    productId: "product-example-1",
    userId: null
  },
  {
    id: "payment-received",
    title: "Pago Confirmado",
    message: "Se ha recibido el pago de $75 por la reserva de Ana Martínez para servicios de pestañas.",
    type: "payment_received",
    priority: "medium",
    targetRoles: ["admin", "manager"],
    readBy: [],
    isActive: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
    bookingId: "booking-example-2",
    userId: "user-example-2"
  },
  {
    id: "booking-cancelled",
    title: "Reserva Cancelada",
    message: "La cita de Laura Pérez para mañana a las 10:00 AM ha sido cancelada. El horario está ahora disponible.",
    type: "booking_cancelled",
    priority: "medium",
    targetRoles: ["admin", "manager", "staff"],
    readBy: [],
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
    bookingId: "booking-example-3",
    userId: "user-example-3"
  }
];

// Función para crear notificaciones de ejemplo
export const uploadNotifications = async () => {
  const batch = writeBatch(db);

  notificationsData.forEach((notification) => {
    const docRef = doc(db, "notifications", notification.id);
    
    // Procesar la notificación con timestamps de Firebase
    const notificationData = {
      ...notification,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    batch.set(docRef, notificationData);
  });

  try {
    await batch.commit();
    console.log("¡Notificaciones creadas exitosamente!");
    return { success: true, message: "✅ Sistema de notificaciones configurado correctamente." };
  } catch (error) {
    console.error("Error creando notificaciones:", error);
    throw new Error(`Error creando notificaciones: ${error.message}`);
  }
};

// Función para crear una nueva notificación
export const createNotification = async (notificationData) => {
  try {
    const docRef = doc(db, "notifications", `notification-${Date.now()}`);
    
    const notification = {
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || "system",
      priority: notificationData.priority || "low",
      targetRoles: notificationData.targetRoles || ["admin", "manager", "staff"],
      readBy: [],
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      bookingId: notificationData.bookingId || null,
      userId: notificationData.userId || null,
      productId: notificationData.productId || null
    };

    const batch = writeBatch(db);
    batch.set(docRef, notification);
    await batch.commit();
    
    console.log("Nueva notificación creada:", notification.title);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creando notificación:", error);
    throw error;
  }
};