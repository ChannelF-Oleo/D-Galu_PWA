// src/hooks/useNotifications.js

import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, // <--- IMPORTANTE: Agregar esto
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

    if (!['admin', 'manager', 'staff'].includes(user.role)) {
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    
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
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

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

  // --- NUEVA FUNCIÓN ---
  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification // <--- Exportar la función
  };
};

export default useNotifications;