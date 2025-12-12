import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import ProductCard from "../../components/products/ProductCard";
import { Search, Filter, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import "../../styles/ProductsList.css";

const ProductsList = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  // Categorías disponibles
  const categories = [
    { id: "all", name: "Todos los productos", count: 0 },
    { id: "esmaltes", name: "Esmaltes", count: 0 },
    { id: "kits", name: "Kits", count: 0 },
    { id: "cuidado", name: "Cuidado", count: 0 },
    { id: "herramientas", name: "Herramientas", count: 0 }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, "products");
        const q = query(
          productsRef,
          where("isActive", "==", true)
        );

        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrar y ordenar productos
  useEffect(() => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "stock":
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    console.log('Producto agregado al carrito:', product);
  };

  // Contar productos por categoría
  const getCategoryCount = (categoryId) => {
    if (categoryId === "all") return products.length;
    return products.filter(p => p.category === categoryId).length;
  };

  if (loading) {
    return (
      <div className="products-page pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="loading-spinner">
            <div className="spinner-glass"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header con efecto cristal */}
        <div className="products-header">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
            <h1>Productos D'Galú</h1>
          </div>
          <p>
            Descubre nuestra línea exclusiva de productos profesionales para el cuidado 
            y belleza de tus uñas. Calidad premium para resultados excepcionales.
          </p>
        </div>



        {/* Filtros con efecto cristal */}
        <div className="products-filters">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Ordenar */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-white" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="search-input"
                style={{ paddingLeft: '1rem' }}
              >
                <option value="name">Nombre A-Z</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
                <option value="rating">Mejor Valorados</option>
              </select>
            </div>
          </div>

          {/* Categorías */}
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              >
                {category.name} ({getCategoryCount(category.id)})
              </button>
            ))}
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredProducts.length} de {products.length} productos
            {searchTerm && ` para "${searchTerm}"`}
            {selectedCategory !== "all" && ` en ${categories.find(c => c.id === selectedCategory)?.name}`}
          </p>
        </div>

        {/* Grid de productos */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                showAddToCart={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== "all" 
                ? "Intenta ajustar tus filtros de búsqueda"
                : "Próximamente tendremos productos disponibles"
              }
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsList;
