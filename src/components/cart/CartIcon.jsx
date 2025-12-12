// src/components/cart/CartIcon.jsx

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartIcon = ({ onClick }) => {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <button
      onClick={onClick}
      className="topbar__action-btn relative"
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