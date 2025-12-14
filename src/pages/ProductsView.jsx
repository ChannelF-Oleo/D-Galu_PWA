// src/pages/ProductsView.jsx
import { useState, useEffect, useCallback } from "react";
import Portal from "../components/ui/Portal";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Package,
  AlertTriangle,
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
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { hasPermission } from "../utils/rolePermissions";
import ImageUploader from "../components/shared/ImageUploader";

// Importamos la hoja de estilos original
import "./ProductsView.css";

const ProductsView = ({ userRole }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Permisos
  const canEdit = hasPermission(userRole, "canManageProducts");
  const canDelete = hasPermission(userRole, "canManageProducts");

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    stock: "",
    minStock: "",
    category: "Esmaltes",
    brand: "",
    sku: "",
    tags: "",
    image: null,
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching products:", error);
      try {
        const fallbackSnapshot = await getDocs(collection(db, "products"));
        setProducts(
          fallbackSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (fallbackError) {
        console.error("Fallback también falló:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setImagePreview(null);
  };

  const openCreateModal = () => {
    setFormData(initialFormState);
    setEditingProduct(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      minStock: product.minStock?.toString() || "",
      category: product.category || "Esmaltes",
      brand: product.brand || "",
      sku: product.sku || "",
      tags: product.tags?.join(", ") || "",
      image: product.images?.[0] || null,
      isActive: product.isActive !== false,
    });
    setEditingProduct(product);
    setImagePreview(product.images?.[0]);
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
    if (!formData.name || !formData.price) {
      return alert("Nombre y precio son obligatorios");
    }

    setUploading(true);
    try {
      const imageUrl = formData.image || editingProduct?.images?.[0] || "";
      const tagsArray = formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];

      const productPayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || "",
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 0,
        category: formData.category,
        brand: formData.brand.trim() || "",
        sku: formData.sku.trim() || `PRD-${Date.now()}`,
        tags: tagsArray,
        images: imageUrl ? [imageUrl] : [],
        isActive: formData.isActive,
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productPayload);
        alert("¡Producto actualizado!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productPayload,
          createdAt: serverTimestamp(),
        });
        alert("¡Producto creado!");
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el producto");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      await deleteDoc(doc(db, "products", product.id));
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (e) {
            console.warn("No se pudo borrar imagen:", imageUrl);
          }
        }
      }
      alert("Producto eliminado");
      fetchProducts();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="products-view">
      <div className="products-view__header">
        <h1>Gestión de Productos</h1>
        <p>Administra el inventario de productos del salón</p>
      </div>

      <div className="products-view__controls">
        <div className="search-container">
          <Search size={20} />
          {/* El CSS original se encarga de estilizar el input dentro de .search-container */}
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {canEdit && (
          // Usamos la clase .bg-purple-600 definida en tu CSS
          <button
            className="flex items-center gap-2 bg-purple-600"
            onClick={openCreateModal}
          >
            <Plus size={20} /> Nuevo Producto
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package
            size={48}
            className="mx-auto mb-4 opacity-50 text-gray-400"
          />
          <p className="text-gray-500">No se encontraron productos.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock <= product.minStock;
            const isOutOfStock = product.stock === 0;

            return (
              <div key={product.id} className="product-card">
                <div className="product-card__image">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className="product-card__placeholder">
                      <Package size={40} />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {/* Usamos las clases de estado del CSS (.text-red-600, etc.) o badges estilo Tailwind si el CSS lo requiere */}
                    {isOutOfStock && (
                      <span className="text-red-600 bg-white/90 px-2 py-1 rounded text-xs shadow-sm">
                        Agotado
                      </span>
                    )}
                    {isLowStock && !isOutOfStock && (
                      <span className="text-yellow-600 bg-white/90 px-2 py-1 rounded text-xs shadow-sm flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Stock Bajo
                      </span>
                    )}
                  </div>

                  {/* Badge de Categoría usando estilo CSS */}
                  <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                    {product.category}
                  </span>
                </div>

                <div className="product-card__content">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  {product.brand && (
                    <p className="text-sm text-gray-500 mb-2">
                      {product.brand}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center mb-2 text-sm mt-auto pt-2 border-t border-gray-50">
                    <span className="font-bold text-lg text-gray-800">
                      ${product.price}
                    </span>
                    {/* El CSS tiene reglas para .text-green-600 que añaden el punto pulsante */}
                    <span
                      className={
                        product.stock > 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      Stock: {product.stock}
                    </span>
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="bg-purple-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    {canEdit && (
                      <button
                        onClick={() => openEditModal(product)}
                        // Usamos la clase semántica del CSS para botones de acción
                        className="text-purple-600 flex-1 flex items-center justify-center gap-2"
                      >
                        <Edit2 size={16} /> Editar
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-500 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <Portal>
          {/* El contenedor .products-view asegura que las reglas CSS anidadas apliquen dentro del portal */}
          <div className="products-view contents">
            {/* Overlay: usamos la clase bg-black/50 que el CSS estiliza con backdrop-blur */}
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={closeModal}
            >
              {/* Contenido: usamos max-w-2xl que el CSS anima y estiliza */}
              <div
                className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-purple-600">
                    {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Imagen del Producto
                    </label>
                    <ImageUploader
                      folder="products"
                      currentImage={imagePreview}
                      onUpload={(url) => {
                        setImagePreview(url);
                        setFormData({ ...formData, image: url });
                      }}
                      disabled={uploading}
                    />
                  </div>

                  {/* Grid para el formulario */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Nombre del Producto *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej. Esmalte Rojo Pasión"
                        required
                        // Sin clases extra: el CSS .products-view input[type="text"] lo estiliza
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Precio ($) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Stock Actual
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Stock Mínimo
                      </label>
                      <input
                        type="number"
                        name="minStock"
                        value={formData.minStock}
                        onChange={handleInputChange}
                        placeholder="5"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Categoría *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="Esmaltes">Esmaltes</option>
                        <option value="Kits">Kits</option>
                        <option value="Cuidado">Cuidado</option>
                        <option value="Herramientas">Herramientas</option>
                        <option value="Accesorios">Accesorios</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Marca
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="Ej. OPI, Essie"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="Auto"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full resize-none"
                        placeholder="Detalles..."
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Tags (separados por comas)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="rojo, brillante, duradero"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Producto activo (visible en la tienda)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 border-t mt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {uploading ? "Guardando..." : "Guardar Producto"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default ProductsView;
