import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ROLES, hasPermission } from "../utils/rolePermissions";
import LoadingSpinner from "../components/common/LoadingSpinner";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
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
      const errorState = ErrorHandler.handle(err, "getUserProfile");
      throw errorState;
    }
  };

  // Función para crear perfil de usuario completo (DEPRECATED - ahora se maneja en Cloud Function)
  // Esta función se mantiene solo para casos de emergencia o migración
  const createUserProfile = async (uid, userData) => {
    try {
      console.warn(
        "createUserProfile called - this should be handled by Cloud Function"
      );
      const defaultProfile = {
        email: userData.email,
        displayName: userData.displayName || userData.email.split("@")[0],
        role: ROLES.CUSTOMER || "customer", // Rol por defecto
        phone: userData.phone || null,
        avatar: userData.avatar || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...userData,
      };

      await setDoc(doc(db, "users", uid), defaultProfile);
      return defaultProfile;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, "createUserProfile");
      throw errorState;
    }
  };

  // Función para actualizar perfil de usuario
  const updateUserProfile = async (uid, updates) => {
    try {
      setProfileLoading(true);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "users", uid), updateData);

      // Actualizar el estado local del usuario
      if (user && user.uid === uid) {
        setUser((prevUser) => ({
          ...prevUser,
          ...updates,
        }));
      }

      return true;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, "updateUserProfile");
      throw errorState;
    } finally {
      setProfileLoading(false);
    }
  };

  // Función para actualizar rol de usuario (solo para admins)
  const updateUserRole = async (uid, newRole) => {
    try {
      if (!user || !hasPermission(user.role, "canManageUsers")) {
        throw new Error("No tienes permisos para actualizar roles de usuario");
      }

      if (!Object.values(ROLES).includes(newRole)) {
        throw new Error("Rol inválido");
      }

      await updateUserProfile(uid, { role: newRole });
      return true;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, "updateUserRole");
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

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // El perfil se crea automáticamente por la Cloud Function
      // Solo verificamos que existe, pero no lo creamos manualmente
      const profile = await getUserProfile(userCredential.user.uid);

      if (!profile) {
        console.warn("User profile not found - Cloud Function may have failed");
        // En caso de emergencia, crear perfil básico
        await createUserProfile(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
        });
      }

      return userCredential;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, "login");
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
      provider.addScope("email");
      provider.addScope("profile");

      const userCredential = await signInWithPopup(auth, provider);

      // El perfil se crea automáticamente por la Cloud Function
      // Solo verificamos que existe después de un breve delay
      setTimeout(async () => {
        const profile = await getUserProfile(userCredential.user.uid);
        if (!profile) {
          console.warn(
            "Google user profile not found - Cloud Function may have failed"
          );
          // En caso de emergencia, crear perfil básico
          await createUserProfile(userCredential.user.uid, {
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
            provider: "google",
          });
        }
      }, 1000); // Dar tiempo a la Cloud Function

      return userCredential;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, "loginWithGoogle");
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

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Actualizar el perfil de Firebase Auth si se proporciona displayName
      if (additionalData.displayName) {
        await updateProfile(userCredential.user, {
          displayName: additionalData.displayName,
        });
      }

      // El perfil se crea automáticamente por la Cloud Function onCreate
      // Ya no necesitamos crear el perfil manualmente aquí
      console.log("User created - profile will be created by Cloud Function");

      return userCredential;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, "signup");
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("userPreferences");
        sessionStorage.clear();
      }

      return true;
    } catch (err) {
      const errorState = ErrorHandler.handle(err, "logout");
      setError(errorState);
      throw errorState;
    }
  };

  useEffect(() => {
    let profileUnsubscribe = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setLoading(true);

        if (currentUser) {
          // Limpiar listener anterior si existe
          if (profileUnsubscribe) {
            profileUnsubscribe();
          }

          // SOLUCIÓN REAL AL RACE CONDITION: Usar onSnapshot para esperar el perfil
          profileUnsubscribe = onSnapshot(
            doc(db, "users", currentUser.uid),
            (profileDoc) => {
              try {
                if (profileDoc.exists()) {
                  const profile = profileDoc.data();

                  // Verificar que el perfil esté completo (tiene rol)
                  if (profile.role) {
                    const completeUser = {
                      uid: currentUser.uid,
                      email: currentUser.email,
                      emailVerified: currentUser.emailVerified,
                      ...profile,
                    };

                    setUser(completeUser);
                    setLoading(false);
                  } else {
                    // Perfil existe pero está incompleto, seguir esperando
                    console.log(
                      "Profile exists but incomplete, waiting for Cloud Function to finish..."
                    );
                  }
                } else {
                  // Perfil no existe, mostrar estado de carga con mensaje específico
                  console.log(
                    "Profile not found, waiting for Cloud Function to create it..."
                  );
                  setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    emailVerified: currentUser.emailVerified,
                    displayName:
                      currentUser.displayName ||
                      currentUser.email.split("@")[0],
                    isProfileLoading: true, // Flag especial para mostrar "Preparando tu cuenta..."
                  });
                }
              } catch (err) {
                console.error("Error in profile snapshot:", err);
                setError(ErrorHandler.handle(err, "profileSnapshot"));
                setLoading(false);
              }
            },
            (error) => {
              console.error("Profile snapshot error:", error);

              // Fallback: crear perfil manualmente si el listener falla
              createUserProfile(currentUser.uid, {
                email: currentUser.email,
                displayName:
                  currentUser.displayName || currentUser.email.split("@")[0],
              })
                .then((profile) => {
                  const completeUser = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    emailVerified: currentUser.emailVerified,
                    ...profile,
                  };
                  setUser(completeUser);
                })
                .catch((fallbackError) => {
                  console.error(
                    "Fallback profile creation failed:",
                    fallbackError
                  );
                  setError(
                    ErrorHandler.handle(
                      fallbackError,
                      "fallbackProfileCreation"
                    )
                  );
                })
                .finally(() => {
                  setLoading(false);
                });
            }
          );
        } else {
          // Usuario no logueado
          if (profileUnsubscribe) {
            profileUnsubscribe();
            profileUnsubscribe = null;
          }
          setUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in auth state change:", err);
        setError(ErrorHandler.handle(err, "authStateChange"));
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  const others = {
    login,
    loginWithGoogle,
    signup,
    logout,
    error,
    profileLoading,
    updateUserProfile,
    updateUserRole,
    checkPermission,
    clearError: () => setError(null),

    // utilidades de roles
    isAdmin: () => user?.role === ROLES.ADMIN,
    isManager: () => user?.role === ROLES.MANAGER,
    isStaff: () => user?.role === ROLES.STAFF,
    isCustomer: () => user?.role === ROLES.CUSTOMER,
    isStudent: () => user?.role === ROLES.STUDENT,

    getAvailableRoles: () => Object.values(ROLES),
  };

  return (
    <AuthContext.Provider value={{ user, loading, ...others }}>
      {children}
    </AuthContext.Provider>
  );
};
