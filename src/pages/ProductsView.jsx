// src/pages/ProductsView.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Search,
  Package,
  AlertTriangle,
  Star
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
    sku: "",
    stock: "",
    minStock: "",
    category: "",
    image: null,
    featured: false,
    tags: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  // Categorías disponibles (se pueden expandir)
  const [categories, setCategories] = useState([
    "esmaltes",
    "kits", 
    "cuidado",
    "herramientas",
    "accesorios",
    "tratamientos"
  ]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Cargar productos
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, orderBy("name", "asc"));

      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      // Fallback sin orderBy
      try {
        const fallbackSnapshot = await getDocs(collection(db, "products"));
        setProducts(
          fallbackSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (e) {
        console.error("Error crítico recuperando productos", e);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Manejadores de formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "create-new") {
      setShowNewCategoryInput(true);
      setFormData(prev => ({ ...prev, category: "" }));
    } else {
      setShowNewCategoryInput(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      alert("Por favor ingresa un nombre para la categoría");
      return;
    }
    
    const categoryName = newCategoryName.trim().toLowerCase();
    
    if (categories.includes(categoryName)) {
      alert("Esta categoría ya existe");
      return;
    }
    
    // Agregar nueva categoría a la lista
    setCategories(prev => [...prev, categoryName]);
    setFormData(prev => ({ ...prev, category: categoryName }));
    setShowNewCategoryInput(false);
    setNewCategoryName("");
    alert(`Categoría "${categoryName}" creada exitosamente`);
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
    setEditingProduct(null);
    setImagePreview(null);
    setFormData(initialFormState);
    setShowNewCategoryInput(false);
    setNewCategoryName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price || !formData.category) {
      return alert("Nombre, precio y categoría son requeridos");
    }

    setUploading(true);
    try {
      let imageUrl = editingProduct?.images?.[0] || "";

      // Subir nueva imagen si existe
      if (formData.image instanceof File) {
        const fileName = `products/${Date.now()}_${formData.image.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);

        // Borrar imagen vieja si existe
        if (editingProduct?.images?.[0]) {
          try {
            const oldImageRef = ref(storage, editingProduct.images[0]);
            await deleteObject(oldImageRef);
          } catch (err) {
            console.warn("No se pudo borrar imagen antigua", err);
          }
        }
      }

      // Procesar tags
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const productPayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || "",
        price: parseFloat(formData.price),
        sku: formData.sku.trim() || `PROD-${Date.now()}`,
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 5,
        category: formData.category,
        images: imageUrl ? [imageUrl] : [],
        isActive: true,
        featured: formData.featured,
        tags: tagsArray,
        specifications: {
          brand: "D'Galú Professional"
        },
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productPayload);
        alert("¡Producto actualizado!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productPayload,
          createdAt: serverTimestamp(),
          sales: 0,
          rating: 0,
          reviews: 0
        });
        alert("¡Producto creado!");
      }

      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("Ocurrió un error al guardar el producto.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      // Borrar imágenes
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (e) {
            console.warn("Error borrando imagen:", e);
          }
        }
      }
      
      await deleteDoc(doc(db, "products", product.id));
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      alert("Producto eliminado");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar producto");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      sku: product.sku || "",
      stock: product.stock?.toString() || "",
      minStock: product.minStock?.toString() || "",
      category: product.category || "",
      image: null,
      featured: product.featured || false,
      tags: product.tags?.join(', ') || ""
    });
    setImagePreview(product.images?.[0] || null);
    setShowModal(true);
  };

  // Filtrado
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (product) => {
    if (product.stock === 0) return { status: 'out', label: 'Agotado', color: 'text-red-600' };
    if (product.stock <= product.minStock) return { status: 'low', label: 'Stock Bajo', color: 'text-yellow-600' };
    return { status: 'good', label: 'En Stock', color: 'text-green-600' };
  };

  if (!canEdit && !canDelete) {
    return (
      <div className="p-8 text-center text-gray-500">
        <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
        <h2>Acceso Restringido</h2>
        <p>No tienes permisos para gestionar productos.</p>
      </div>
    );
  }

  return (
    <div className="products-view fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600">Administra el catálogo de productos</p>
        </div>
        {canEdit && (
          <button
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} /> Nuevo Producto
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.stock > p.minStock).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.stock <= p.minStock && p.stock > 0).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agotados</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
            <X className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
          <p>No se encontraron productos.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.images?.[0] ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.images[0]}
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {product.name}
                              {product.featured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock} / {product.minStock} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(product)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
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
              <div className="flex justify-center">
                <div className="relative group cursor-pointer">
                  <div
                    className={`w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden ${
                      imagePreview ? "border-purple-500" : "border-gray-300"
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
                        <span className="text-xs">Subir imagen</span>
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
                    Nombre del Producto *
                  </label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ej. Esmalte Rojo Clásico"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (USD) *
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="PROD-001"
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
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="0"
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
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="5"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  {!showNewCategoryInput ? (
                    <select
                      required={!showNewCategoryInput}
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryChange}
                      className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="">Seleccionar categoría...</option>
                      {categories.map(category => (
                        <option key={category} value={category} className="capitalize">
                          {category}
                        </option>
                      ))}
                      <option value="create-new" className="text-purple-600 font-medium">
                        + Crear nueva categoría
                      </option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Nombre de la nueva categoría"
                          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                        />
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                        >
                          Crear
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setNewCategoryName("");
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancelar y seleccionar existente
                      </button>
                    </div>
                  )}
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
                    className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Descripción del producto..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (separados por comas)
                  </label>
                  <input
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="esmalte, rojo, larga duración"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Producto destacado
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
      )}
    </div>
  );
};

export default ProductsView;