// src/hooks/useUserProfile.js
// Hook especializado para manejar el perfil de usuario

import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { ErrorHandler } from '../utils/ErrorHandler';

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  /**
   * Actualizar perfil de usuario
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<boolean>}
   */
  const updateUserProfile = async (updates) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setProfileLoading(true);
      setProfileError(null);

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, "users", user.uid), updateData);
      
      return true;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, 'updateUserProfile');
      setProfileError(errorState);
      throw errorState;
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * Actualizar preferencias de usuario
   * @param {Object} preferences - Nuevas preferencias
   * @returns {Promise<boolean>}
   */
  const updateUserPreferences = async (preferences) => {
    return updateUserProfile({ preferences });
  };

  /**
   * Actualizar información de contacto
   * @param {Object} contactInfo - Nueva información de contacto
   * @returns {Promise<boolean>}
   */
  const updateContactInfo = async (contactInfo) => {
    const allowedFields = ['phone', 'address', 'emergencyContact'];
    const filteredInfo = Object.keys(contactInfo)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = contactInfo[key];
        return obj;
      }, {});

    return updateUserProfile(filteredInfo);
  };

  return {
    // Estado
    profileLoading,
    profileError,
    
    // Métodos
    updateUserProfile,
    updateUserPreferences,
    updateContactInfo,
    
    // Utilidades
    clearProfileError: () => setProfileError(null),
    
    // Datos del perfil actual
    profile: user ? {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
      phone: user.phone,
      address: user.address,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    } : null
  };
};