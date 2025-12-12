// src/pages/GalleryAdminView.jsx
import { useState, useEffect, useCallback } from "react";
import Portal from "../components/ui/Portal";
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Eye,
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
import ImageUploader from "../components/shared/ImageUploader";
import "./GalleryAdminView.css";

const GalleryAdminView = ({ userRole }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Permisos
  const canEdit = hasPermission(userRole, "canManageProducts") || userRole === 'admin';
  const canDelete = hasPermission(userRole, "canManageProducts") || userRole === 'admin';

  const categories = [
    { id: "all", name: "Todas" },
    { id: "trenzas", name: "Trenzas Africanas" },
    { id: "uñas", name: "Uñas y Manicure" },
    { id: "peluqueria", name: "Peluquería" },
    { id: "spa", name: "Spa y Relajación" },
    { id: "cejas", name: "Cejas y Pestañas" },
    { id: "maquillaje", name: "Maquillaje" },
    { id: "antes-despues", name: "Antes y Después" }
  ];

  const initialFormState = {
    title: "",
    description: "",
    category: "trenzas",
    tags: "",
    imageUrl: null,
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch images
  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const galleryRef = collection(db, "gallery");
      const q = query(galleryRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setImages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching gallery:", error);
      // Fallback sin orderBy
      try {
        const fallbackSnapshot = await getDocs(collection(db, "gallery"));
        setImages(fallbackSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (fallbackError) {
        console.error("Fallback también falló:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const closeModal = () => {
    setShowModal(false);
    setEditingImage(null);
    setFormData(initialFormState);
    setImagePreview(null);
  };

  const openCreateModal = () => {
    setFormData(initialFormState);
    setEditingImage(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (image) => {
    setFormData({
      title: image.title || "",
      description: image.description || "",
      category: image.category || "trenzas",
      tags: image.tags?.join(", ") || "",
      imageUrl: image.imageUrl || null,
      isActive: image.isActive !== false,
    });
    setEditingImage(image);
    setImagePreview(image.imageUrl);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.imageUrl) {
      return alert("Título e imagen son obligatorios");
    }

    setUploading(true);
    try {
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const imagePayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || "",
        category: formData.category,
        tags: tagsArray,
        imageUrl: formData.imageUrl,
        isActive: formData.isActive,
        updatedAt: serverTimestamp(),
      };

      if (editingImage) {
        await updateDoc(doc(db, "gallery", editingImage.id), imagePayload);
        alert("¡Imagen actualizada!");
      } else {
        await addDoc(collection(db, "gallery"), {
          ...imagePayload,
          createdAt: serverTimestamp(),
        });
        alert("¡Imagen agregada a la galería!");
      }

      closeModal();
      fetchImages();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image) => {
    if (!window.confirm(`¿Eliminar "${image.title}"?`)) return;

    try {
      await deleteDoc(doc(db, "gallery", image.id));
      
      // Borrar imagen de storage si existe
      if (image.imageUrl && image.imageUrl.includes('firebase')) {
        try {
          const imageRef = ref(storage, image.imageUrl);
          await deleteObject(imageRef);
        } catch (e) {
          console.warn("No se pudo borrar imagen:", image.imageUrl);
        }
      }

      alert("Imagen eliminada");
      fetchImages();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  };

  // Filter images
  const filteredImages = images.filter((image) => {
    const matchesSearch = 
      image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="gallery-admin-view">
      <div className="gallery-admin-view__header">
        <h1>Gestión de Galería</h1>
        <p>Administra las imágenes del portafolio del salón</p>
      </div>

      <div className="gallery-admin-view__controls">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar imágenes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {canEdit && (
          <button
            className="gallery-admin-view__add-btn"
            onClick={openCreateModal}
          >
            <Plus size={20} /> Nueva Imagen
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>No se encontraron imágenes.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredImages.map((image) => (
            <div key={image.id} className="gallery-card">
              <div className="gallery-card__image">
                {image.imageUrl ? (
                  <img src={image.imageUrl} alt={image.title} />
                ) : (
                  <div className="gallery-card__placeholder">
                    <ImageIcon size={40} />
                  </div>
                )}
                <span className="gallery-card__category">
                  {categories.find(c => c.id === image.category)?.name || image.category}
                </span>
              </div>

              <div className="gallery-card__content">
                <h3>{image.title}</h3>
                <p className="line-clamp-2">{image.description}</p>

                {image.tags && image.tags.length > 0 && (
                  <div className="gallery-card__tags">
                    {image.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="gallery-card__actions">
                  {canEdit && (
                    <button onClick={() => openEditModal(image)} className="btn-edit">
                      <Edit2 size={14} /> Editar
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(image)} className="btn-delete">
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
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingImage ? "Editar Imagen" : "Nueva Imagen"}</h2>
                <button onClick={closeModal} className="modal-close">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label>Imagen *</label>
                  <ImageUploader
                    folder="gallery"
                    currentImage={imagePreview}
                    onUpload={(url) => {
                      setImagePreview(url);
                      setFormData({ ...formData, imageUrl: url });
                    }}
                    disabled={uploading}
                  />
                </div>

                <div className="form-group">
                  <label>Título *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ej. Trenzas Africanas Elegantes"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Descripción de la imagen..."
                  />
                </div>

                <div className="form-group">
                  <label>Tags (separados por comas)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="trenzas, africanas, elegante"
                  />
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Imagen visible en la galería pública</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={closeModal} className="btn-cancel">
                    Cancelar
                  </button>
                  <button type="submit" disabled={uploading} className="btn-submit">
                    {uploading ? "Guardando..." : "Guardar Imagen"}
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

export default GalleryAdminView;
