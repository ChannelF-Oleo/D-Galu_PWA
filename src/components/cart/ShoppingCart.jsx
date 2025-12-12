import { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import PayPalCheckout from './PayPalCheckout';
import './ShoppingCart.css';

const ShoppingCart = () => {
  const { 
    items, 
    isOpen, 
    setCartOpen, 
    removeItem, 
    updateQuantity, 
    clearCart,
    getTotalItems,
    getTotalPrice 
  } = useCart();
  
  const [showCheckout, setShowCheckout] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <>
      {/* Panel lateral del carrito - SIN overlay oscuro */}
      <div className={`shopping-cart-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="cart-sidebar-header">
          <div className="cart-sidebar-title">
            <ShoppingBag size={22} className="cart-icon" />
            <h2>Mi Carrito</h2>
            {getTotalItems() > 0 && (
              <span className="cart-count">{getTotalItems()}</span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="cart-close-btn"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-sidebar-content">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">
                <ShoppingBag size={48} />
              </div>
              <h3>Tu carrito está vacío</h3>
              <p>Agrega algunos productos para comenzar</p>
              <button 
                onClick={() => setCartOpen(false)}
                className="cart-continue-shopping"
              >
                Seguir comprando
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  {/* Product Image */}
                  <div className="cart-item-image">
                    {item.image || item.images?.[0] ? (
                      <img
                        src={item.image || item.images?.[0]}
                        alt={item.name}
                      />
                    ) : (
                      <div className="cart-item-placeholder">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-price">{formatPrice(item.price)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="cart-item-quantity">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="qty-btn"
                        aria-label="Reducir cantidad"
                      >
                        <Minus size={14} />
                      </button>
                      
                      <span className="qty-value">{item.quantity}</span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="qty-btn"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="cart-item-actions">
                    <span className="cart-item-total">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="cart-remove-btn"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-sidebar-footer">
            {/* Summary */}
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="cart-summary-row cart-total">
                <span>Total</span>
                <span className="total-price">{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="cart-actions">
              {!showCheckout ? (
                <>
                  <button 
                    className="cart-checkout-btn"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceder al Pago
                  </button>
                  
                  <button
                    onClick={clearCart}
                    className="cart-clear-btn"
                  >
                    Vaciar Carrito
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="cart-back-btn"
                    onClick={() => setShowCheckout(false)}
                  >
                    <ArrowLeft size={16} />
                    Volver al carrito
                  </button>
                  
                  <PayPalCheckout 
                    onSuccess={() => {
                      setShowCheckout(false);
                      // El carrito se limpia automáticamente en PayPalCheckout
                    }}
                    onCancel={() => setShowCheckout(false)}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay sutil - solo para cerrar al hacer click fuera */}
      {isOpen && (
        <div 
          className="cart-overlay-subtle"
          onClick={() => setCartOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default ShoppingCart;
