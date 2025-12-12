// src/components/cart/ShoppingCart.jsx

import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, CreditCard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './ShoppingCart.css';

const ShoppingCart = ({ isOpen, onClose }) => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice 
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    try {
      // Aquí se integrará PayPal
      console.log('Iniciando checkout con PayPal...', {
        items,
        total: getTotalPrice()
      });
      
      // Simular proceso de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('¡Funcionalidad de pago con PayPal próximamente disponible!');
      
    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel del carrito */}
      <div className={`cart-panel ${isOpen ? 'open' : ''}`}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="cart-header">
            <div className="cart-title">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
              <h2>Carrito ({getTotalItems()})</h2>
            </div>
            <button onClick={onClose} className="cart-close-btn">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido del carrito */}
          <div className="cart-content">
            {items.length === 0 ? (
              <div className="cart-empty">
                <ShoppingBag className="cart-empty-icon" />
                <h3 className="cart-empty-title">Tu carrito está vacío</h3>
                <p className="cart-empty-text">
                  Agrega algunos productos para comenzar
                </p>
                <button onClick={onClose} className="cart-continue-btn">
                  Continuar comprando
                </button>
              </div>
            ) : (
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    {/* Imagen del producto */}
                    <div className="cart-item-image">
                      <img
                        src={item.imageUrl || '/placeholder-product.jpg'}
                        alt={item.name}
                      />
                    </div>

                    {/* Información del producto */}
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-price">${item.price} c/u</p>
                      
                      {/* Controles de cantidad */}
                      <div className="cart-item-controls">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="cart-quantity-btn"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        
                        <span className="cart-quantity">{item.quantity}</span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="cart-quantity-btn"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Precio total y eliminar */}
                    <div className="cart-item-actions">
                      <p className="cart-item-total">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="cart-remove-btn"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer con total y checkout */}
          {items.length > 0 && (
            <div className="cart-footer">
              {/* Resumen */}
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Subtotal</span>
                  <span className="cart-summary-value">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Envío</span>
                  <span className="cart-summary-value">Gratis</span>
                </div>
                <div className="cart-summary-row">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="cart-actions">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="cart-checkout-btn"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="cart-loading"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pagar con PayPal
                    </>
                  )}
                </button>
                
                <button onClick={clearCart} className="cart-clear-btn">
                  Vaciar carrito
                </button>
              </div>

              {/* Nota sobre PayPal */}
              <p className="cart-note">
                🔒 Pago seguro con PayPal • Próximamente disponible
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;