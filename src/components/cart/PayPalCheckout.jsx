// src/components/cart/PayPalCheckout.jsx
import React, { useState } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./PayPalCheckout.css";

// Ahora recibe props extra: totalAmount y deliveryInfo
const PayPalCheckout = ({ onSuccess, onCancel, totalAmount, deliveryInfo }) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const [error, setError] = useState(null);

  // Crear la orden en PayPal
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: "Compra en D'Galú",
          amount: {
            value: totalAmount.toFixed(2), // Usamos el total que incluye envío
          },
        },
      ],
    });
  };

  // Capturar el pago y guardar en Firestore
  const onApprove = async (data, actions) => {
    try {
      const order = await actions.order.capture();

      // Guardar orden en Firestore "orders"
      await addDoc(collection(db, "orders"), {
        userId: user?.uid || "guest",
        customerName: user?.displayName || order.payer.name.given_name,
        email: user?.email || order.payer.email_address,
        items: items,
        total: parseFloat(totalAmount),
        subtotal: parseFloat(totalAmount) - (deliveryInfo.shippingFee || 0),
        shippingFee: deliveryInfo.shippingFee || 0,
        status: "paid", // Pagado con PayPal
        paymentId: order.id,
        deliveryMethod: deliveryInfo.method, // 'pickup' | 'shipping'
        shippingAddress: deliveryInfo.address,
        createdAt: serverTimestamp(),
      });

      clearCart();
      if (onSuccess) onSuccess();
      alert("¡Pago exitoso! Tu orden ha sido registrada.");
    } catch (err) {
      console.error("Error al procesar orden:", err);
      setError("Hubo un error al guardar tu orden. Contáctanos.");
    }
  };

  if (isPending)
    return <div className="paypal-loading">Cargando PayPal...</div>;

  return (
    <div className="paypal-container">
      {error && <div className="paypal-error">{error}</div>}
      <PayPalButtons
        style={{ layout: "vertical", shape: "rect" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={onCancel}
      />
    </div>
  );
};

export default PayPalCheckout;
