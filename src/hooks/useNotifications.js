// src/hooks/useNotifications.js

import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Solo administradores, managers y staff reciben notificaciones
    if (!['admin', 'manager', 'staff'].includes(user.role)) {
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    
    // Simplificar query para evitar problemas de índices
    const q = query(
      notificationsRef,
      where('targetRoles', 'array-contains', user.role)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = [];
      let unread = 0;

      snapshot.forEach((doc) => {
        const notification = {
          id: doc.id,
          ...doc.data()
        };
        notificationsData.push(notification);
        
        if (!notification.readBy || !notification.readBy.includes(user.uid)) {
          unread++;
        }
      });

      // Ordenar por fecha localmente
      notificationsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      setNotifications(notificationsData);
      setUnreadCount(unread);
      setLoading(false);
    }, (error) => {
      console.error('Error loading notifications:', error);
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
    });

    return () => unsubscribe();
  }, [user]);

  // Crear nueva notificación
  const createNotification = async (notificationData) => {
    try {
      const notification = {
        ...notificationData,
        targetRoles: notificationData.targetRoles || ['admin', 'manager', 'staff'],
        readBy: [],
        createdAt: serverTimestamp(),
        isActive: true
      };

      await addDoc(collection(db, 'notifications'), notification);
      console.log('Notification created successfully');
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    if (!user) return;

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification && (!notification.readBy || !notification.readBy.includes(user.uid))) {
        const updatedReadBy = [...(notification.readBy || []), user.uid];
        await updateDoc(notificationRef, {
          readBy: updatedReadBy,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadNotifications = notifications.filter(
        n => !n.readBy || !n.readBy.includes(user.uid)
      );

      const promises = unreadNotifications.map(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        const updatedReadBy = [...(notification.readBy || []), user.uid];
        return updateDoc(notificationRef, {
          readBy: updatedReadBy,
          updatedAt: serverTimestamp()
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead
  };
};

export default useNotifications;