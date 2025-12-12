// src/components/home/ProductsSection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ProductCard from '../products/ProductCard';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

const ProductsSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        
        // Simplificar query para evitar problemas de índices
        const productsQuery = query(
          collection(db, 'products'),
          where('isActive', '==', true)
        );

        const snapshot = await getDocs(productsQuery);

        let productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filtrar productos destacados primero, luego limitar a 6
        const featuredProducts = productsData.filter(p => p.featured);
        if (featuredProducts.length > 0) {
          productsData = featuredProducts.slice(0, 6);
        } else {
          productsData = productsData.slice(0, 6);
        }

        setProducts(productsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error al cargar productos');
        
        // Fallback: mostrar productos de ejemplo si hay error
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product) => {
    // La funcionalidad del carrito se maneja en ProductCard
    console.log('Agregar al carrito desde ProductsSection:', product);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="w-48 h-6 bg-gray-300 rounded animate-pulse mx-auto mb-2"></div>
            <div className="w-64 h-4 bg-gray-300 rounded animate-pulse mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-gray-300 rounded mb-4"></div>
                <div className="w-1/4 h-6 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && products.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Productos D'Galú
          </h2>
          <p className="text-gray-600 mb-6">
            Próximamente tendremos productos disponibles para ti
          </p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Ver Catálogo Completo
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header de la sección */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <ShoppingBag className="w-8 h-8 text-purple-600" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Productos D'Galú
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Descubre nuestra línea exclusiva de productos profesionales para el cuidado 
            y belleza de tus uñas. Calidad premium para resultados excepcionales.
          </p>

          {products.length > 0 && (
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                Productos destacados
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                En stock
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Pocas unidades
              </span>
            </div>
          )}
        </div>

        {/* Grid de productos */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  showAddToCart={true}
                />
              ))}
            </div>

            {/* Call to action */}
            <div className="text-center">
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-all hover:shadow-lg font-semibold"
              >
                Ver Catálogo Completo
                <ArrowRight size={20} />
              </button>
              
              <p className="text-sm text-gray-500 mt-3">
                Más de {products.length} productos disponibles
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Catálogo en Preparación
            </h3>
            <p className="text-gray-600 mb-6">
              Estamos preparando nuestros productos exclusivos para ti
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Explorar Productos
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;