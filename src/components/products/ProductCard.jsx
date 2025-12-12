// src/components/products/ProductCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Package, AlertTriangle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, onAddToCart, showAddToCart = true }) => {
  const navigate = useNavigate();
  const { addItem, isInCart, getItemQuantity } = useCart();

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Evitar que se active el click del card
    
    // Agregar al carrito usando el contexto
    addItem(product, 1);
    
    // Llamar callback si existe (para compatibilidad)
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const isLowStock = product.stock <= product.minStock;
  const isOutOfStock = product.stock === 0;

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group ${
        isOutOfStock ? 'opacity-50 grayscale' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Imagen del producto */}
      <div className="relative overflow-hidden">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className={`w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300 ${
            isOutOfStock ? 'grayscale' : ''
          }`}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              Destacado
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <AlertTriangle size={10} />
              Pocas unidades
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Agotado
            </span>
          )}
        </div>

        {/* Stock indicator - Solo mostrar en vista admin, no en vista pública */}
      </div>

      {/* Contenido del producto */}
      <div className="p-3">
        {/* Categoría */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
            {product.category}
          </span>
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">
                {product.rating.toFixed(1)} ({product.reviews})
              </span>
            </div>
          )}
        </div>

        {/* Nombre del producto */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors text-sm">
          {product.name}
        </h3>

        {/* Descripción */}
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>

        {/* Especificaciones clave */}
        {product.specifications && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {product.specifications.brand && (
                <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-xs">
                  {product.specifications.brand}
                </span>
              )}
              {product.specifications.volume && (
                <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-xs">
                  {product.specifications.volume}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Precio y acciones */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              SKU: {product.sku}
            </span>
          </div>

          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium text-xs transition-all ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md'
              }`}
            >
              <ShoppingCart size={12} />
              {isOutOfStock ? 'Agotado' : isInCart(product.id) ? `(${getItemQuantity(product.id)})` : 'Agregar'}
            </button>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-purple-50 text-purple-600 px-1 py-0.5 rounded text-xs"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;