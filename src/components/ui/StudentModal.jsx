import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import Portal from "./Portal";

const StudentModal = ({
  isOpen,
  onClose,
  onSave,
  editingStudent,
  availableCourses,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    courseId: "",
    status: "active",
    paymentStatus: "paid",
  });
  const [loading, setLoading] = useState(false);

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
  }, [editingStudent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    onClose();
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-lg"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full p-2 border rounded-lg"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso
              </label>
              <select
                required
                className="w-full p-2 border rounded-lg"
                value={formData.courseId}
                onChange={(e) =>
                  setFormData({ ...formData, courseId: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
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
