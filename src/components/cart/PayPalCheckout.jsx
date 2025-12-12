// src/components/cart/PayPalCheckout.jsx
import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useCart } from '../../context/CartContext';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import './PayPalCheckout.css';

const PayPalCheckout = ({ onSuccess, onCancel }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const [orderStatus, setOrderStatus] = useState(null); // 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  if (!paypalClientId) {
    return (
      <div className="paypal-error">
        <AlertCircle size={24} />
        <p>PayPal no está configurado correctamente</p>
      </div>
    );
  }

  const createOrder = (data, actions) => {
    const total = getTotalPrice();
    
    return actions.order.create({
      purchase_units: [
        {
          description: `Compra en D'Galú Salon - ${items.length} productos`,
          amount: {
            currency_code: 'EUR',
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: total.toFixed(2)
              }
            }
          },
          items: items.map(item => ({
            name: item.name.substring(0, 127),
            unit_amount: {
              currency_code: 'EUR',
              value: item.price.toFixed(2)
            },
            quantity: item.quantity.toString()
          }))
        }
      ],
      application_context: {
        brand_name: "D'Galú Salon",
        shipping_preference: 'NO_SHIPPING'
      }
    });
  };

  const onApprove = async (data, actions) => {
    setOrderStatus('processing');
    
    try {
      const details = await actions.order.capture();
      
      // Guardar la orden en Firebase
      const orderData = {
        paymentId: details.id,
        paypalOrderId: data.orderID,
        paymentMethod: 'paypal',
        status: 'paid',
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        total: getTotalPrice(),
        customerEmail: details.payer?.email_address || '',
        customerName: details.payer?.name?.given_name 
          ? `${details.payer.name.given_name} ${details.payer.name.surname || ''}`
          : 'Cliente',
        paypalDetails: {
          payerId: details.payer?.payer_id,
          payerEmail: details.payer?.email_address,
          captureId: details.purchase_units?.[0]?.payments?.captures?.[0]?.id
        },
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      setOrderStatus('success');
      clearCart();
      
      if (onSuccess) {
        onSuccess(details);
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      setOrderStatus('error');
      setErrorMessage('Error al procesar el pago. Por favor intenta de nuevo.');
    }
  };

  const onError = (err) => {
    console.error('PayPal Error:', err);
    setOrderStatus('error');
    setErrorMessage('Ocurrió un error con PayPal. Por favor intenta de nuevo.');
  };

  if (orderStatus === 'success') {
    return (
      <div className="paypal-success">
        <CheckCircle size={48} className="success-icon" />
        <h3>¡Pago Exitoso!</h3>
        <p>Tu pedido ha sido procesado correctamente.</p>
        <p className="success-note">Recibirás un email de confirmación pronto.</p>
      </div>
    );
  }

  if (orderStatus === 'processing') {
    return (
      <div className="paypal-processing">
        <Loader size={32} className="spinner" />
        <p>Procesando tu pago...</p>
      </div>
    );
  }

  if (orderStatus === 'error') {
    return (
      <div className="paypal-error">
        <AlertCircle size={32} />
        <p>{errorMessage}</p>
        <button 
          onClick={() => setOrderStatus(null)}
          className="retry-btn"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="paypal-checkout">
      <PayPalScriptProvider 
        options={{ 
          clientId: paypalClientId,
          currency: 'EUR',
          intent: 'capture'
        }}
      >
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 45
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={() => {
            if (onCancel) onCancel();
          }}
        />
      </PayPalScriptProvider>
      
      <p className="paypal-secure-note">
        🔒 Pago seguro con PayPal
      </p>
    </div>
  );
};

export default PayPalCheckout;
