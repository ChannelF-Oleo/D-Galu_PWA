// src/pages/Services/ServicesView.jsx
import { useState, useEffect, useCallback } from "react";
import Portal from "../components/ui/Portal";
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Image as ImageIcon,
} from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase"; 
import { hasPermission } from "../utils/rolePermissions";
import { validateFormData } from "../utils/validation";
import { serviceFormSchema } from "../types";
import ImageUploader from "../components/shared/ImageUploader";
import "./ServicesView.css";

const ServicesView = ({ userRole }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Permisos
  const canEdit = hasPermission(userRole, "canEditServices");
  const canDelete = hasPermission(userRole, "canDeleteServices");

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "Manicura/Pedicura",
    image: null,
    subservices: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showSubserviceForm, setShowSubserviceForm] = useState(false);
  const [subserviceData, setSubserviceData] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
  });

  // Fetch services
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const servicesRef = collection(db, "services");
      const q = query(servicesRef, orderBy("name", "asc"));

      const snapshot = await getDocs(q);
      setServices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching services:", error);
      
      // Fallback sin orderBy si falla el índice
      if (error.code === "failed-precondition") {
        try {
          const fallbackSnapshot = await getDocs(collection(db, "services"));
          setServices(
            fallbackSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
          );
        } catch (fallbackError) {
          console.error("Fallback también falló:", fallbackError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Image upload is now handled by ImageUploader component

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData(initialFormState);
    setImagePreview(null);
  };

  const openCreateModal = () => {
    setFormData(initialFormState);
    setEditingService(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setFormData({
      name: service.name || "",
      description: service.description || "",
      price: service.price?.toString() || "",
      duration: service.duration?.toString() || "",
      category: service.category || "Manicura/Pedicura",
      image: service.image || null,
      subservices: service.subservices || [],
    });
    setEditingService(service);
    setImagePreview(service.image);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data with Zod
    if (!formData) {
      return alert("Error: Datos del formulario no disponibles");
    }

    const validationResult = validateFormData(serviceFormSchema, {
      ...formData,
      price: formData.price || "0",
      duration: formData.duration || "0",
    });

    if (!validationResult.success) {
      const fieldErrors = validationResult.fieldErrors || {};
      const generalErrors = validationResult.generalErrors || [];
      const errorMessages = Object.values(fieldErrors).concat(generalErrors);
      return alert("Errores de validación:\n" + errorMessages.join("\n"));
    }

    setUploading(true);
    try {
      // Image URL is already set by ImageUploader component
      const imageUrl = formData.image || editingService?.image || "";

      const servicePayload = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : "",
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration) || 0,
        category: formData.category,
        image: imageUrl,
        subservices: formData.subservices || [], // Incluir subservicios
        updatedAt: serverTimestamp(),
      };

      if (editingService) {
        await updateDoc(doc(db, "services", editingService.id), servicePayload);
        alert("¡Servicio actualizado!");
      } else {
        await addDoc(collection(db, "services"), {
          ...servicePayload,
          createdAt: serverTimestamp(),
        });
        alert("¡Servicio creado!");
      }

      closeModal();
      fetchServices();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el servicio");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`¿Eliminar "${service.name}"?`)) return;

    try {
      await deleteDoc(doc(db, "services", service.id));
      
      // Borrar imagen si existe
      if (service.image) {
        try {
          await deleteObject(ref(storage, service.image));
        } catch (e) {}
      }

      alert("Servicio eliminado");
      fetchServices();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  };

  // Subservice management
  const addSubservice = () => {
    if (!subserviceData.name) {
      return alert("El nombre del subservicio es obligatorio");
    }

    const newSubservice = {
      id: Date.now().toString(),
      name: subserviceData.name.trim(),
      price: subserviceData.price ? parseFloat(subserviceData.price) : 0,
      duration: parseInt(subserviceData.duration) || 0,
      description: subserviceData.description ? subserviceData.description.trim() : "",
    };

    setFormData((prev) => ({
      ...prev,
      subservices: [...(prev.subservices || []), newSubservice],
    }));

    setSubserviceData({ name: "", price: "", duration: "", description: "" });
    setShowSubserviceForm(false);
  };

  const removeSubservice = (subserviceId) => {
    setFormData((prev) => ({
      ...prev,
      subservices: prev.subservices.filter((sub) => sub.id !== subserviceId),
    }));
  };

  // Filter services
  const filteredServices = services.filter((service) =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="services-view">
      <div className="services-view__header">
        <h1>Gestión de Servicios</h1>
        <p>Administra los servicios del salón</p>
      </div>

      <div className="services-view__controls">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {canEdit && (
          <button
            className="services-view__add-btn"
            onClick={openCreateModal}
          >
            <Plus size={20} /> Nuevo Servicio
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Scissors size={48} className="mx-auto mb-4 opacity-50" />
          <p>No se encontraron servicios.</p>
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-card__image">
                {service.image ? (
                  <img src={service.image} alt={service.name} />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-300">
                    <ImageIcon size={40} />
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                  {service.category}
                </span>
              </div>

              <div className="service-card__content p-4">
                <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {service.description}
                </p>

                <div className="flex justify-between items-center mb-3 text-sm">
                  <span className="font-semibold text-green-600">
                    ${service.price}
                  </span>
                  <span className="text-gray-500">
                    ⏱ {service.duration} min
                  </span>
                </div>

                <div className="flex gap-2">
                  {canEdit && (
                    <button
                      onClick={() => openEditModal(service)}
                      className="flex-1 btn-outline flex items-center justify-center gap-2 py-2 text-sm rounded border hover:bg-gray-50"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(service)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <Portal>
          <div
            className="flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingService ? "Editar Servicio" : "Nuevo Servicio"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Carga de Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Servicio
                </label>
                <ImageUploader
                  folder="services"
                  currentImage={imagePreview}
                  onUpload={(url) => {
                    setImagePreview(url);
                    setFormData({ ...formData, image: url });
                  }}
                  disabled={uploading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Ej. Manicura Spa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (min) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="45"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="Manicura/Pedicura">Manicura/Pedicura</option>
                    <option value="Peluquería">Peluquería</option>
                    <option value="Maquillaje">Maquillaje</option>
                    <option value="Depilación">Depilación</option>
                    <option value="Spa/Bienestar">Spa/Bienestar</option>
                    <option value="Pestañas/Cejas">Pestañas/Cejas</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 border rounded-lg resize-none"
                    placeholder="Detalles del servicio..."
                  />
                </div>
              </div>

              {/* Sección de Subservicios */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Subservicios</h3>
                  <button
                    type="button"
                    onClick={() => setShowSubserviceForm(true)}
                    className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
                  >
                    Agregar
                  </button>
                </div>

                {/* Lista de subservicios existentes */}
                {formData.subservices && formData.subservices.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.subservices.map((subservice) => (
                      <div key={subservice.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{subservice.name}</div>
                          <div className="text-xs text-gray-600">
                            ${subservice.price} • {subservice.duration} min
                            {subservice.description && ` • ${subservice.description}`}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => removeSubservice(subservice.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario para agregar subservicio */}
                {showSubserviceForm && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Nuevo Subservicio</h4>
                      <button
                        type="button"
                        onClick={() => setShowSubserviceForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Nombre del subservicio"
                          value={subserviceData.name}
                          onChange={(e) => setSubserviceData(prev => ({...prev, name: e.target.value}))}
                          className="w-full p-2 border rounded text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio ($)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={subserviceData.price}
                          onChange={(e) => setSubserviceData(prev => ({...prev, price: e.target.value}))}
                          className="w-full p-2 border rounded text-sm"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duración (min)
                        </label>
                        <input
                          type="number"
                          placeholder="30"
                          value={subserviceData.duration}
                          onChange={(e) => setSubserviceData(prev => ({...prev, duration: e.target.value}))}
                          className="w-full p-2 border rounded text-sm"
                          step="5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <input
                          type="text"
                          value={subserviceData.description}
                          onChange={(e) => setSubserviceData(prev => ({...prev, description: e.target.value}))}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="Descripción opcional"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={addSubservice}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Agregar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSubserviceForm(false)}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
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
                  disabled={uploading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {uploading ? "Guardando..." : "Guardar Servicio"}
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

export default ServicesView;
