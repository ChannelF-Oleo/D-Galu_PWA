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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ROLES, hasPermission } from "../utils/rolePermissions";

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
  const [profileLoading, setProfileLoading] = useState(false);

  // Función auxiliar para obtener datos completos del usuario
  const getUserProfile = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, 'getUserProfile');
      throw errorState;
    }
  };

  // Función para crear perfil de usuario completo (DEPRECATED - ahora se maneja en Cloud Function)
  // Esta función se mantiene solo para casos de emergencia o migración
  const createUserProfile = async (uid, userData) => {
    try {
      console.warn('createUserProfile called - this should be handled by Cloud Function');
      const defaultProfile = {
        email: userData.email,
        displayName: userData.displayName || userData.email.split('@')[0],
        role: ROLES.CUSTOMER || "customer", // Rol por defecto
        phone: userData.phone || null,
        avatar: userData.avatar || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...userData
      };

      await setDoc(doc(db, "users", uid), defaultProfile);
      return defaultProfile;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, 'createUserProfile');
      throw errorState;
    }
  };

  // Función para actualizar perfil de usuario
  const updateUserProfile = async (uid, updates) => {
    try {
      setProfileLoading(true);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, "users", uid), updateData);
      
      // Actualizar el estado local del usuario
      if (user && user.uid === uid) {
        setUser(prevUser => ({
          ...prevUser,
          ...updates
        }));
      }

      return true;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, 'updateUserProfile');
      throw errorState;
    } finally {
      setProfileLoading(false);
    }
  };

  // Función para actualizar rol de usuario (solo para admins)
  const updateUserRole = async (uid, newRole) => {
    try {
      if (!user || !hasPermission(user.role, 'canManageUsers')) {
        throw new Error('No tienes permisos para actualizar roles de usuario');
      }

      if (!Object.values(ROLES).includes(newRole)) {
        throw new Error('Rol inválido');
      }

      await updateUserProfile(uid, { role: newRole });
      return true;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, 'updateUserRole');
      throw errorState;
    }
  };

  // Función para verificar permisos del usuario actual
  const checkPermission = (permission) => {
    if (!user || !user.role) return false;
    return hasPermission(user.role, permission);
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // El perfil se crea automáticamente por la Cloud Function
      // Solo verificamos que existe, pero no lo creamos manualmente
      const profile = await getUserProfile(userCredential.user.uid);
      
      if (!profile) {
        console.warn('User profile not found - Cloud Function may have failed');
        // En caso de emergencia, crear perfil básico
        await createUserProfile(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        });
      }
      
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
      
      // El perfil se crea automáticamente por la Cloud Function
      // Solo verificamos que existe después de un breve delay
      setTimeout(async () => {
        const profile = await getUserProfile(userCredential.user.uid);
        if (!profile) {
          console.warn('Google user profile not found - Cloud Function may have failed');
          // En caso de emergencia, crear perfil básico
          await createUserProfile(userCredential.user.uid, {
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
            provider: 'google'
          });
        }
      }, 1000); // Dar tiempo a la Cloud Function
      
      return userCredential;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, 'loginWithGoogle');
      setError(errorState);
      throw errorState;
    } finally {
      setLoading(false);
    }
  };

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
      // Ya no necesitamos crear el perfil manualmente aquí
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

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      
      // Limpiar completamente el estado de usuario
      setUser(null);
      setError(null);
      
      // Limpiar cualquier cache local si existe
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setLoading(true);
        
        if (currentUser) {
          // Si hay usuario logueado, buscamos su perfil completo en Firestore
          let profile = await getUserProfile(currentUser.uid);
          
          // Si no existe perfil, esperar un poco por la Cloud Function
          if (!profile) {
            console.log('Profile not found, waiting for Cloud Function...');
            // Esperar 2 segundos y volver a intentar
            await new Promise(resolve => setTimeout(resolve, 2000));
            profile = await getUserProfile(currentUser.uid);
            
            // Si aún no existe, crear uno como fallback
            if (!profile) {
              console.warn('Cloud Function failed - creating profile as fallback');
              profile = await createUserProfile(currentUser.uid, {
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email.split('@')[0]
              });
            }
          }
          
          // Combinamos el objeto de Auth con los datos completos de Firestore
          const completeUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified,
            ...profile // Incluye role, displayName, phone, avatar, etc.
          };
          
          setUser(completeUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        const errorState = ErrorHandler.handle(err, 'loadUserProfile');
        setError(errorState);
        
        // En caso de error, mantenemos solo los datos básicos de Auth
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            emailVerified: currentUser.emailVerified,
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            role: ROLES.CUSTOMER || 'customer'
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      login,
      loginWithGoogle, 
      signup, 
      logout, 
      loading, 
      error,
      profileLoading,
      updateUserProfile,
      updateUserRole,
      checkPermission,
      clearError: () => setError(null),
      // Funciones de utilidad para roles
      isAdmin: () => user?.role === ROLES.ADMIN,
      isManager: () => user?.role === ROLES.MANAGER,
      isStaff: () => user?.role === ROLES.STAFF,
      isCustomer: () => user?.role === ROLES.CUSTOMER,
      isStudent: () => user?.role === ROLES.STUDENT,
      // Función para obtener roles disponibles
      getAvailableRoles: () => Object.values(ROLES)
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
