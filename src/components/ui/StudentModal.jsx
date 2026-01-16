import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import Portal from "./Portal";
import { hasPermission } from "../../utils/rolePermissions";

const StudentModal = ({
  isOpen,
  onClose,
  onSave,
  editingStudent,
  availableCourses,
  userRole, // Nuevo prop
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    courseId: "",
    status: "active",
    paymentStatus: "paid",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingStudent) {
      setFormData(editingStudent);
    } else {
      setFormData({
        name: "",
        email: "",
        courseId: "",
        status: "active",
        paymentStatus: "paid",
      });
    }
    setErrors({});
  }, [editingStudent, isOpen]);

  if (!isOpen) return null;

  // Verificar permisos
  const canManage = hasPermission(userRole, "canManageCourses");
  
  if (!canManage) {
    return (
      <Portal>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle size={24} />
              <h2 className="text-xl font-bold">Acceso Denegado</h2>
            </div>
            <p className="text-gray-600 mb-6">
              No tienes permisos para gestionar estudiantes. Esta función está reservada para administradores.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Portal>
    );
  }

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.courseId) {
      newErrors.courseId = 'Debes seleccionar un curso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving student:', error);
      setErrors({ general: error.message || 'Error al guardar estudiante' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              {editingStudent ? "Editar Estudiante" : "Registrar Estudiante"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error general */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                  errors.name ? 'border-red-500' : ''
                }`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                  errors.email ? 'border-red-500' : ''
                }`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso *
              </label>
              <select
                required
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                  errors.courseId ? 'border-red-500' : ''
                }`}
                value={formData.courseId}
                onChange={(e) => {
                  setFormData({ ...formData, courseId: e.target.value });
                  if (errors.courseId) setErrors({ ...errors, courseId: null });
                }}
              >
                <option value="">Seleccionar...</option>
                {availableCourses && availableCourses.length > 0 ? (
                  availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title || c.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No hay cursos disponibles</option>
                )}
              </select>
              {errors.courseId && (
                <p className="text-xs text-red-600 mt-1">{errors.courseId}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};
export default StudentModal;
