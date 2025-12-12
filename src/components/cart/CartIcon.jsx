// src/components/cart/CartIcon.jsx

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartIcon = ({ onClick }) => {
  const { getTotalItems, toggleCart } = useCart();
  const itemCount = getTotalItems();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Si se proporciona onClick externo, usarlo; si no, usar toggleCart del contexto
    if (onClick) {
      onClick();
    } else {
      toggleCart();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="topbar__action-btn relative"
      aria-label={`Carrito de compras${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
    >
      <ShoppingBag size={20} />
      {itemCount > 0 && (
        <span className="absolute top-1.5 right-1.5 bg-purple-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-[10px]">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;