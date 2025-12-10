import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Importamos Firestore
import { auth, db } from "../config/firebase"; // Asegúrate de importar 'db'

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  // 'user' ahora contendrá { uid, email, ...datosDeFirestore (role, name) }
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función auxiliar para obtener datos extras del usuario (Rol)
  const getUserProfile = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data(); // Devuelve { role: 'admin', ... }
    }
    return null;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Al registrarse, creamos el documento en Firestore como 'customer' por defecto
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      role: "customer", // Rol por defecto
      createdAt: new Date()
    });
    return userCredential;
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Si hay usuario logueado, buscamos su rol en Firestore
        const profile = await getUserProfile(currentUser.uid);
        
        // Combinamos el objeto de Auth con los datos de Firestore
        setUser({
          ...currentUser,
          ...profile // Aquí se inyecta el { role: 'admin' }
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
