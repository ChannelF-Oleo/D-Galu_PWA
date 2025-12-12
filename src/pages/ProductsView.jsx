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
import {
  ref,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase"; 
import { hasPermission } from "../utils/rolePermissions";
import ImageUploader from "../components/shared/ImageUploader";

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

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, orderBy("name", "asc"));

      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching products:", error);
      
      // Fallback sin orderBy
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

  // Image upload is now handled by ImageUploader component

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
      // Image URL is already set by ImageUploader component
      const imageUrl = formData.image || editingProduct?.images?.[0] || "";

      // Procesar tags
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
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
      
      // Borrar imágenes si existen
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

  // Filter products
  const filteredProducts = products.filter((product) =>
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
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {canEdit && (
          <button
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            onClick={openCreateModal}
          >
            <Plus size={20} /> Nuevo Producto
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p>No se encontraron productos.</p>
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
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isOutOfStock && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Agotado
                      </span>
                    )}
                    {isLowStock && !isOutOfStock && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Stock Bajo
                      </span>
                    )}
                  </div>

                  <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                    {product.category}
                  </span>
                </div>

                <div className="product-card__content p-4">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  {product.brand && (
                    <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                  )}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="font-semibold text-purple-600 text-lg">
                      ${product.price}
                    </span>
                    <span className="text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>

                  {product.sku && (
                    <p className="text-xs text-gray-400 mb-3">SKU: {product.sku}</p>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{product.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {canEdit && (
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex-1 btn-outline flex items-center justify-center gap-2 py-2 text-sm rounded border hover:bg-gray-50"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(product)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                      >
                        <Trash2 size={14} />
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
          <div
            className="flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Ej. Esmalte Rojo Pasión"
                    required
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
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="5"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="Esmaltes">Esmaltes</option>
                    <option value="Kits">Kits</option>
                    <option value="Cuidado">Cuidado</option>
                    <option value="Herramientas">Herramientas</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Ej. OPI, Essie"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Se genera automáticamente"
                  />
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
                    placeholder="Descripción del producto..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (separados por comas)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="rojo, brillante, duradero"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Producto activo (visible en la tienda)
                    </span>
                  </label>
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
                  disabled={uploading}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                >
                  {uploading ? "Guardando..." : "Guardar Producto"}
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

export default ProductsView;