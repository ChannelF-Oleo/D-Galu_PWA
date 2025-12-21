import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Clock,
  MapPin,
  Package,
  Users,
  Tag,
  Layers,
  Star,
} from "lucide-react";
import Portal from "./Portal";
import ImageUploader from "../shared/ImageUploader";

const CourseModal = ({ isOpen, onClose, onSave, editingCourse }) => {
  // Estado inicial con TODOS los campos necesarios
  const initialFormState = {
    title: "",
    description: "",
    instructor: "",
    price: "",
    duration: "",
    startDate: "",
    image: null,
    // Campos nuevos integrados
    schedule: "",
    modality: "Presencial",
    includesMaterials: false,
    capacity: 10,
    // Campos FALTANTES agregados ahora
    category: "General",
    level: "Principiante",
    modules: 4,
    featured: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  // Listas de opciones
  const categories = [
    "Peluquería",
    "Manicure",
    "Spa",
    "Maquillaje",
    "Pestañas",
    "Cejas",
    "Barbería",
    "General",
  ];

  const levels = ["Principiante", "Intermedio", "Avanzado"];

  useEffect(() => {
    if (editingCourse) {
      // Si estamos editando, rellenamos con datos existentes o defaults si faltan
      setFormData({
        ...initialFormState, // Asegura que no queden campos undefined
        ...editingCourse,
        // Manejo seguro de fechas de Firebase
        startDate: editingCourse.startDate?.toDate
          ? editingCourse.startDate.toDate().toISOString().split("T")[0]
          : editingCourse.startDate || "",
      });
    } else {
      // Resetear formulario para nuevo curso
      setFormData(initialFormState);
    }
  }, [editingCourse, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convertir todos los números correctamente antes de guardar
      const dataToSave = {
        ...formData,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity) || 0,
        modules: parseInt(formData.modules) || 0,
        studentsCount: editingCourse?.studentsCount || 0, // Preservar contador de estudiantes
      };

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800">
              {editingCourse ? "Editar Curso" : "Crear Nuevo Curso"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Sección Imagen */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portada del Curso
              </label>
              <ImageUploader
                folder="courses"
                currentImage={formData.image}
                onUpload={(url) => setFormData({ ...formData, image: url })}
              />
            </div>

            {/* Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Curso
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Categoría y Nivel (NUEVOS) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Tag size={16} /> Categoría
                </label>
                <select
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Layers size={16} /> Nivel
                </label>
                <select
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows="3"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Campos Específicos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin size={16} /> Modalidad
                </label>
                <select
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.modality}
                  onChange={(e) =>
                    setFormData({ ...formData, modality: e.target.value })
                  }
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Clock size={16} /> Horario
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lun y Mié 6pm - 9pm"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Users size={16} /> Cupo Máximo
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Layers size={16} /> Cant. Módulos
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.modules}
                  onChange={(e) =>
                    setFormData({ ...formData, modules: e.target.value })
                  }
                />
              </div>

              {/* Checkboxes: Materiales y Destacado */}
              <div className="col-span-2 flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <input
                    type="checkbox"
                    id="materials"
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    checked={formData.includesMaterials}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        includesMaterials: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="materials"
                    className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2"
                  >
                    <Package size={18} className="text-purple-600" />
                    Incluye Materiales
                  </label>
                </div>

                <div className="flex-1 flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <input
                    type="checkbox"
                    id="featured"
                    className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2"
                  >
                    <Star
                      size={18}
                      className="text-yellow-600 fill-yellow-600"
                    />
                    Destacado en Home
                  </label>
                </div>
              </div>

              {/* Resto de campos estándar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (RD$)
                </label>
                <input
                  type="number"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (Texto)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 4 Semanas"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
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
                {loading ? "Guardando..." : "Guardar Curso"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};

export default CourseModal;
