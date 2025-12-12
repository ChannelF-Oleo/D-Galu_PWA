// src/pages/Services/ServicesView.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
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
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase"; 
import { hasPermission } from "../utils/rolePermissions";
import { validateFormData } from "../utils/validation";
import { serviceFormSchema } from "../types";
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
    category: "",
    image: null,
    subservices: [], // Nuevo: array de subservicios
  };

  const [formData, setFormData] = useState(initialFormState);
  
  // Estados para subservicios
  const [showSubserviceForm, setShowSubserviceForm] = useState(false);
  const [editingSubservice, setEditingSubservice] = useState(null);
  const [subserviceForm, setSubserviceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "20" // Duración por defecto de 20 minutos
  });

  // Cargar servicios
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const servicesRef = collection(db, "services");
      const q = query(servicesRef, orderBy("name", "asc"));

      const snapshot = await getDocs(q);
      const servicesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesData);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      if (error.code === "failed-precondition") {
        try {
          const fallbackSnapshot = await getDocs(collection(db, "services"));
          setServices(
            fallbackSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
          );
        } catch (e) {
          console.error("Error crítico recuperando datos", e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Manejadores de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Máximo 5MB por imagen");
      if (!file.type.startsWith("image/")) return alert("Solo imágenes");

      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setImagePreview(null);
    setFormData(initialFormState);
    setShowSubserviceForm(false);
    setEditingSubservice(null);
    setSubserviceForm({
      name: "",
      description: "",
      price: "",
      duration: "20"
    });
  };

  // Funciones para manejar subservicios
  const handleSubserviceInputChange = (e) => {
    const { name, value } = e.target;
    setSubserviceForm(prev => ({ ...prev, [name]: value }));
  };

  const addSubservice = () => {
    if (!subserviceForm.name.trim() || !subserviceForm.price) {
      alert("Nombre y precio son requeridos para el subservicio");
      return;
    }

    const newSubservice = {
      id: Date.now().toString(), // ID temporal
      name: subserviceForm.name.trim(),
      description: subserviceForm.description.trim(),
      price: parseFloat(subserviceForm.price),
      duration: parseInt(subserviceForm.duration) || 20
    };

    if (editingSubservice) {
      // Editar subservicio existente
      setFormData(prev => ({
        ...prev,
        subservices: prev.subservices.map(sub => 
          sub.id === editingSubservice.id ? newSubservice : sub
        )
      }));
    } else {
      // Agregar nuevo subservicio
      setFormData(prev => ({
        ...prev,
        subservices: [...prev.subservices, newSubservice]
      }));
    }

    // Resetear formulario de subservicio
    setSubserviceForm({
      name: "",
      description: "",
      price: "",
      duration: "20"
    });
    setShowSubserviceForm(false);
    setEditingSubservice(null);
  };

  const editSubservice = (subservice) => {
    setSubserviceForm({
      name: subservice.name,
      description: subservice.description || "",
      price: subservice.price.toString(),
      duration: subservice.duration.toString()
    });
    setEditingSubservice(subservice);
    setShowSubserviceForm(true);
  };

  const removeSubservice = (subserviceId) => {
    setFormData(prev => ({
      ...prev,
      subservices: prev.subservices.filter(sub => sub.id !== subserviceId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data with Zod
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
      let imageUrl = editingService?.image || "";

      // Subir nueva imagen si existe
      if (formData.image instanceof File) {
        const fileName = `services/${Date.now()}_${formData.image.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);

        // Borrar imagen vieja
        if (editingService?.image) {
          try {
            await deleteObject(ref(storage, editingService.image));
          } catch (err) {
            console.warn("No se pudo borrar imagen antigua", err);
          }
        }
      }

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
      console.error("Error guardando:", error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`¿Eliminar "${service.name}"?`)) return;
    try {
      if (service.image) {
        try {
          await deleteObject(ref(storage, service.image));
        } catch (e) {}
      }
      await deleteDoc(doc(db, "services", service.id));
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  // Filtrado
  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canEdit && !canDelete)
    return (
      <div className="p-8 text-center text-gray-500">Acceso Restringido</div>
    );

  return (
    <div className="services-view fade-in">
      <div className="services-view__header">
        <div className="services-view__search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {canEdit && (
          <button
            className="services-view__add-btn"
            onClick={() => setShowModal(true)}
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
            <div key={service.id} className="service-card group">
              <div className="service-card__image relative overflow-hidden">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                  />
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
                <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-3">
                  {service.description || "Sin descripción disponible."}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-primary font-bold text-lg">
                    ${service.price?.toLocaleString()}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                    ⏱ {service.duration} min
                  </span>
                </div>

                <div className="flex gap-2">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setEditingService(service);
                        setFormData({ 
                          ...service, 
                          image: service.image,
                          subservices: service.subservices || [] // Cargar subservicios existentes
                        });
                        setImagePreview(service.image);
                        setShowModal(true);
                      }}
                      className="flex-1 btn-outline flex items-center justify-center gap-2 py-2 text-sm rounded border hover:bg-gray-50"
                    >
                      <Edit2 size={16} /> Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(service)}
                      className="px-3 text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
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
        <div
          className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
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
              <div className="flex justify-center">
                <div className="relative group cursor-pointer">
                  <div
                    className={`w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden ${
                      imagePreview ? "border-primary" : "border-gray-300"
                    }`}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload className="mx-auto mb-1" />
                        <span className="text-xs">Subir foto</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Servicio *
                  </label>
                  {/* FIX: Value || "" */}
                  <input
                    required
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Ej. Manicura Spa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (RD$) *
                  </label>
                  {/* FIX: Value || "" */}
                  <input
                    
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (min)
                  </label>
                  {/* FIX: Value || "" */}
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="45"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  {/* FIX: Value || "" */}
                  <select
                    required
                    name="category"
                    value={formData.category || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Uñas">Uñas</option>
                    <option value="Cabello">Cabello</option>
                    <option value="Facial">Facial</option>
                    <option value="Masajes">Masajes</option>
                    <option value="Depilación">Depilación</option>
                    <option value="Maquillaje">Maquillaje</option>
                    <option value="Pestañas/Cejas">Pestañas/Cejas</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  {/* FIX: Value || "" */}
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border rounded-lg resize-none"
                    placeholder="Detalles del servicio..."
                  />
                </div>
              </div>

              {/* Sección de Subservicios */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Subservicios ({formData.subservices?.length || 0})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowSubserviceForm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>

                {/* Lista de subservicios existentes */}
                {formData.subservices && formData.subservices.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.subservices.map((subservice) => (
                      <div key={subservice.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{subservice.name}</div>
                          <div className="text-sm text-gray-600">
                            ${subservice.price} • {subservice.duration} min
                            {subservice.description && ` • ${subservice.description}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editSubservice(subservice)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSubservice(subservice.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario de subservicio */}
                {showSubserviceForm && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {editingSubservice ? 'Editar Subservicio' : 'Nuevo Subservicio'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubserviceForm(false);
                          setEditingSubservice(null);
                          setSubserviceForm({ name: "", description: "", price: "", duration: "20" });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={subserviceForm.name}
                          onChange={handleSubserviceInputChange}
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="Ej: Manicura básica"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={subserviceForm.price}
                          onChange={handleSubserviceInputChange}
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="0.00"
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
                          name="duration"
                          value={subserviceForm.duration}
                          onChange={handleSubserviceInputChange}
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="20"
                          min="5"
                          step="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={subserviceForm.description}
                          onChange={handleSubserviceInputChange}
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="Descripción opcional"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={addSubservice}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        {editingSubservice ? 'Actualizar' : 'Agregar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubserviceForm(false);
                          setEditingSubservice(null);
                          setSubserviceForm({ name: "", description: "", price: "", duration: "20" });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
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
      )}
    </div>
  );
};

export default ServicesView;
