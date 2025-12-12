// src/pages/Users/UsersView.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Edit2,
  Trash2,
  Shield,
  X,
  User,
  CheckCircle,
  Mail,
  Plus,
  Save
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { hasPermission } from "../utils/rolePermissions";
import Portal from "../components/ui/Portal";
import ImageUploader from "../components/shared/ImageUploader";
import "./UsersView.css";

const UsersView = ({ userRole }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado del Modal y Formulario
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Estado inicial del formulario
  const initialFormState = {
    displayName: "",
    email: "",
    role: "client",
    photoURL: "" // Opcional, por si quieres manejar fotos en el futuro
  };
  const [formData, setFormData] = useState(initialFormState);

  // Permisos
  const canManageUsers = hasPermission(userRole, "canManageUsers") || userRole === 'admin';

  // --- CARGA DE DATOS ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      // Intentamos ordenar
      try {
        const q = query(usersRef, orderBy("email", "asc"));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        // Fallback si falta índice
        const snapshot = await getDocs(usersRef);
        setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- MANEJO DEL MODAL ---
  
  // Abrir para CREAR
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setCurrentId(null);
    setShowModal(true);
  };

  // Abrir para EDITAR
  const handleOpenEdit = (user) => {
    setIsEditing(true);
    setFormData({
      displayName: user.displayName || "",
      email: user.email || "",
      role: user.role || "client",
      photoURL: user.photoURL || ""
    });
    setCurrentId(user.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialFormState);
    setCurrentId(null);
  };

  // --- GUARDAR (CREAR O EDITAR) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) return alert("El email es obligatorio");

    setSubmitting(true);
    try {
      const userData = {
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role,
        photoURL: formData.photoURL,
        updatedAt: serverTimestamp(),
      };

      if (isEditing && currentId) {
        // ACTUALIZAR
        const userRef = doc(db, "users", currentId);
        await updateDoc(userRef, userData);
        
        setUsers(prev => prev.map(u => u.id === currentId ? { ...u, ...userData } : u));
        alert("Usuario actualizado correctamente.");
      } else {
        // CREAR (Nota: Esto crea el documento en Firestore. No crea la Auth de Firebase)
        const docRef = await addDoc(collection(db, "users"), {
          ...userData,
          createdAt: serverTimestamp()
        });
        
        setUsers(prev => [...prev, { id: docRef.id, ...userData }]);
        alert("Usuario creado en base de datos.");
      }
      closeModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- ELIMINAR ---
  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.email}?`)) return;

    try {
      await deleteDoc(doc(db, "users", user.id));
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar usuario");
    }
  };

  // Filtrado
  const filteredUsers = users.filter(
    (u) =>
      (u.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin": return "badge-admin";
      case "staff": return "badge-staff";
      default: return "badge-client";
    }
  };

  if (!canManageUsers) return <div className="p-8 text-center text-gray-500">Acceso Restringido</div>;

  return (
    <div className="users-view fade-in">
      {/* Header */}
      <div className="users-view__header">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-primary" /> Gestión de Usuarios
            </h2>
            <p className="text-sm text-gray-500">Administra perfiles y roles</p>
        </div>
        
        <div className="flex gap-3 flex-col sm:flex-row">
            <div className="users-view__search">
            <Search size={20} />
            <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            <button 
                onClick={handleOpenCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
            >
                <Plus size={20} /> Nuevo Usuario
            </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center p-12"><div className="spinner"></div></div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm mt-4">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className="users-table-container bg-white rounded-xl shadow-sm mt-6 overflow-hidden">
          <table className="users-table w-full text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium text-sm uppercase">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Rol</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={20}/>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.displayName || "Sin Nombre"}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={10}/> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeClass(user.role)}`}>
                      {user.role || "client"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(user)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL UNIVERSAL (CREAR / EDITAR) */}
      {showModal && (
        <Portal>
          <div className="flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                  {isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Foto de Perfil */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                    <ImageUploader
                      folder="avatars"
                      currentImage={formData.photoURL}
                      onUpload={(url) => setFormData({...formData, photoURL: url})}
                      disabled={submitting}
                    />
                </div>

                {/* Nombre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            required
                            className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="Ej. Juan Pérez"
                            value={formData.displayName}
                            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="email"
                            required
                            className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="usuario@ejemplo.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    {isEditing && (
                        <p className="text-xs text-orange-500 mt-1">
                            * Cambiar el email aquí no cambia el login del usuario.
                        </p>
                    )}
                </div>

                {/* Rol */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rol Asignado</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['client', 'staff', 'admin'].map((roleOption) => (
                            <label 
                                key={roleOption}
                                className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                                    formData.role === roleOption 
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary text-primary' 
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                            >
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value={roleOption}
                                    checked={formData.role === roleOption}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="hidden" 
                                />
                                <span className="capitalize font-bold text-sm">{roleOption}</span>
                                {formData.role === roleOption && <CheckCircle size={14} className="mt-1"/>}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50 font-medium text-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {submitting ? "Guardando..." : <><Save size={18}/> Guardar Usuario</>}
                    </button>
                </div>
            </form>
          </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default UsersView;