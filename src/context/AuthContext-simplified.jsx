// src/context/AuthContext-simplified.jsx
// Versión simplificada que se enfoca solo en autenticación

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { ErrorHandler } from "../utils/ErrorHandler";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función auxiliar para obtener datos del perfil de usuario
  const getUserProfile = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (err) {
      console.error('Error getting user profile:', err);
      return null;
    }
  };

  // Función de login básica
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, 'login');
      setError(errorState);
      throw errorState;
    } finally {
      setLoading(false);
    }
  };

  // Función para login con Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, 'loginWithGoogle');
      setError(errorState);
      throw errorState;
    } finally {
      setLoading(false);
    }
  };

  // Función de registro
  const signup = async (email, password, additionalData = {}) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar el perfil de Firebase Auth si se proporciona displayName
      if (additionalData.displayName) {
        await updateProfile(userCredential.user, {
          displayName: additionalData.displayName
        });
      }
      
      // El perfil se crea automáticamente por la Cloud Function onCreate
      console.log('User created - profile will be created by Cloud Function');
      
      return userCredential;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, 'signup');
      setError(errorState);
      throw errorState;
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      
      // Limpiar estado
      setUser(null);
      setError(null);
      
      // Limpiar cache local
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userPreferences');
        sessionStorage.clear();
      }
      
      return true;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, 'logout');
      setError(errorState);
      throw errorState;
    }
  };

  // Función para refrescar el token del usuario (útil para custom claims)
  const refreshUserToken = async () => {
    if (user) {
      try {
        const token = await user.getIdTokenResult(true);
        return token;
      } catch (err) {
        console.error('Error refreshing token:', err);
        return null;
      }
    }
    return null;
  };

  // Effect para manejar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setLoading(true);
        
        if (currentUser) {
          // Obtener perfil completo de Firestore
          let profile = await getUserProfile(currentUser.uid);
          
          // Si no existe perfil, esperar por la Cloud Function
          if (!profile) {
            console.log('Profile not found, waiting for Cloud Function...');
            // Esperar 2 segundos y volver a intentar
            await new Promise(resolve => setTimeout(resolve, 2000));
            profile = await getUserProfile(currentUser.uid);
          }
          
          // Combinar datos de Auth con perfil de Firestore
          const completeUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            // Agregar datos del perfil si existen
            ...(profile || {}),
            // Métodos útiles
            getIdToken: currentUser.getIdToken.bind(currentUser),
            getIdTokenResult: currentUser.getIdTokenResult.bind(currentUser)
          };
          
          setUser(completeUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        const errorState = ErrorHandler.handle(err, 'loadUserProfile');
        setError(errorState);
        
        // En caso de error, mantener datos básicos de Auth
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified,
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            role: 'customer', // Rol por defecto
            getIdToken: currentUser.getIdToken.bind(currentUser),
            getIdTokenResult: currentUser.getIdTokenResult.bind(currentUser)
          });
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    // Estado
    user,
    loading,
    error,
    
    // Métodos de autenticación
    login,
    loginWithGoogle,
    signup,
    logout,
    
    // Utilidades
    refreshUserToken,
    clearError: () => setError(null),
    
    // Helpers básicos (sin lógica compleja)
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,
    getUserId: () => user?.uid || null,
    getUserEmail: () => user?.email || null,
    getUserRole: () => user?.role || 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};