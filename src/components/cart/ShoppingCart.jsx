// src/components/cart/ShoppingCart.jsx

import { useState } from "react";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Truck,
  Store,
  MapPin,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import PayPalCheckout from "./PayPalCheckout";
import "./ShoppingCart.css";

const ShoppingCart = () => {
  const {
    items,
    isOpen,
    setCartOpen,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);

  // NUEVOS ESTADOS
  const [deliveryMethod, setDeliveryMethod] = useState("pickup"); // 'pickup' | 'shipping'
  const [shippingAddress, setShippingAddress] = useState("");

  const SHIPPING_COST = 4; // Costo fijo de envío

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Calcular totales
  const subtotal = getTotalPrice();
  const shippingTotal = deliveryMethod === "shipping" ? SHIPPING_COST : 0;
  const finalTotal = subtotal + shippingTotal;

  return (
    <>
      <div className={`shopping-cart-sidebar ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="cart-sidebar-header">
          <div className="cart-sidebar-title">
            <ShoppingBag size={22} className="cart-icon" />
            <h2>Mi Carrito</h2>
            {getTotalItems() > 0 && (
              <span className="cart-count">{getTotalItems()}</span>
            )}
          </div>
          <button onClick={() => setCartOpen(false)} className="cart-close-btn">
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
                Seguir comprando <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <>
              {/* Lista de Productos */}
              <div className="cart-items-list">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
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
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-price">
                        {formatPrice(item.price)}
                      </p>
                      <div className="cart-item-quantity">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="qty-btn"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="qty-btn"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <span className="cart-item-total">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="cart-remove-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECCIÓN DE ENTREGA (Solo visible si no estamos en el paso final de pago) */}
              {!showCheckout && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Método de Entrega
                  </h3>

                  {/* Selector de Método */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setDeliveryMethod("pickup")}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        deliveryMethod === "pickup"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <Store size={24} className="mb-2" />
                      <span className="text-sm font-medium">
                        Retiro en Local
                      </span>
                      <span className="text-xs opacity-75">Gratis</span>
                    </button>

                    <button
                      onClick={() => setDeliveryMethod("shipping")}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        deliveryMethod === "shipping"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <Truck size={24} className="mb-2" />
                      <span className="text-sm font-medium">
                        Envío a Domicilio
                      </span>
                      <span className="text-xs opacity-75">
                        + ${SHIPPING_COST}
                      </span>
                    </button>
                  </div>

                  {/* Input de Dirección (Solo si es Envío) */}
                  {deliveryMethod === "shipping" && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                        <MapPin size={12} /> Dirección de Envío
                      </label>
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Calle, Número, Sector, Ciudad..."
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows="2"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-sidebar-footer">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {/* Mostrar costo de envío */}
              {deliveryMethod === "shipping" && (
                <div className="cart-summary-row text-purple-600">
                  <span>Costo de envío</span>
                  <span>+ {formatPrice(SHIPPING_COST)}</span>
                </div>
              )}

              <div className="cart-summary-row cart-total">
                <span>Total</span>
                <span className="total-price">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="cart-actions">
              {!showCheckout ? (
                <>
                  <button
                    className="cart-checkout-btn"
                    onClick={() => {
                      if (
                        deliveryMethod === "shipping" &&
                        !shippingAddress.trim()
                      ) {
                        alert("Por favor ingresa una dirección de envío");
                        return;
                      }
                      setShowCheckout(true);
                    }}
                  >
                    Proceder al Pago
                  </button>
                  <button onClick={clearCart} className="cart-clear-btn">
                    Vaciar Carrito
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="cart-back-btn"
                    onClick={() => setShowCheckout(false)}
                  >
                    <ArrowLeft size={16} /> Volver al carrito
                  </button>

                  {/* Pasamos los nuevos datos al Checkout */}
                  <PayPalCheckout
                    totalAmount={finalTotal}
                    deliveryInfo={{
                      method: deliveryMethod, // 'pickup' | 'shipping'
                      address:
                        deliveryMethod === "shipping" ? shippingAddress : null,
                      shippingFee:
                        deliveryMethod === "shipping" ? SHIPPING_COST : 0,
                    }}
                    onSuccess={() => {
                      setShowCheckout(false);
                      // El carrito se limpia dentro de PayPalCheckout o CartContext
                    }}
                    onCancel={() => setShowCheckout(false)}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

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
