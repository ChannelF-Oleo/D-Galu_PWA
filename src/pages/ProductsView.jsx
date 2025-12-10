import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Edit2, 
  Trash2,
  Package,
  AlertTriangle,
  Search
} from "lucide-react";
import { 
  collection, 
  query, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { hasPermission } from "../utils/rolePermissions";
import "./ProductsView.css";

const ProductsView = ({ userRole }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const canManage = hasPermission(userRole, "canManageProducts");
  const canManageInventory = hasPermission(userRole, "canManageInventory");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newStock) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: serverTimestamp()
      });

      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? { ...product, stock: newStock }
            : product
        )
      );
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      alert("Error al actualizar el stock");
    }
  };

  const getStockStatus = (stock, minStock = 10) => {
    if (stock === 0) {
      return { label: "Agotado", class: "stock--out", icon: AlertTriangle };
    } else if (stock <= minStock) {
      return { label: "Bajo", class: "stock--low", icon: AlertTriangle };
    } else {
      return { label: "Disponible", class: "stock--ok", icon: Package };
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      filterCategory === "all" || product.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  if (!canManage && !canManageInventory) {
    return (
      <div className="products-view__no-access">
        <ShoppingBag size={48} />
        <h2>Acceso Restringido</h2>
        <p>No tienes permisos para gestionar productos.</p>
      </div>
    );
  }

  return (
    <div className="products-view">
      {/* Header */}
      <div className="products-view__header">
        <div className="products-view__filters">
          <div className="filter-group">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">Todas las categorías</option>
              <option value="cabello">Cabello</option>
              <option value="unas">Uñas</option>
              <option value="facial">Facial</option>
              <option value="herramientas">Herramientas</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        {canManage && (
          <button className="products-view__add-btn">
            <Plus size={20} />
            Nuevo Producto
          </button>
        )}
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="products-view__loading">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="products-view__empty">
          <ShoppingBag size={48} />
          <h3>No hay productos</h3>
          <p>
            {searchTerm || filterCategory !== "all"
              ? "No se encontraron productos con ese criterio"
              : "Comienza agregando productos a tu inventario"}
          </p>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                {canManageInventory && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.minStock);
                const StatusIcon = stockStatus.icon;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-info">
                        <div className="product-info__image">
                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <Package size={24} />
                          )}
                        </div>
                        <span className="product-info__name">{product.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{product.sku || "—"}</td>
                    <td>
                      <span className="category-badge">
                        {product.category || "Sin categoría"}
                      </span>
                    </td>
                    <td className="text-bold">
                      ${product.price?.toLocaleString() || 0}
                    </td>
                    <td>
                      {canManageInventory ? (
                        <input
                          type="number"
                          value={product.stock || 0}
                          onChange={(e) => {
                            const newStock = parseInt(e.target.value) || 0;
                            if (newStock >= 0) {
                              updateStock(product.id, newStock);
                            }
                          }}
                          className="stock-input"
                          min="0"
                        />
                      ) : (
                        <span>{product.stock || 0}</span>
                      )}
                    </td>
                    <td>
                      <span className={`stock-badge ${stockStatus.class}`}>
                        <StatusIcon size={14} />
                        {stockStatus.label}
                      </span>
                    </td>
                    {canManageInventory && (
                      <td>
                        <div className="table-actions">
                          {canManage && (
                            <button className="btn-icon btn-icon--edit">
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canManage && (
                            <button className="btn-icon btn-icon--delete">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsView;