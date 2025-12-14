// src/pages/OrdersView.jsx
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Truck,
  Store,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Package,
  MapPin,
} from "lucide-react";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { hasPermission } from "../utils/rolePermissions";
import "./BookingsView.css"; // Reutilizamos estilos de BookingsView por consistencia

const OrdersView = ({ userRole }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Permisos (ajusta según necesites, por ejemplo 'canManageOrders')
  const canManage =
    hasPermission(userRole, "canManageBookings") || userRole === "admin";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(ordersData);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!window.confirm(`¿Cambiar estado a: ${newStatus}?`)) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      alert("Error al actualizar");
    }
  };

  // --- RENDERIZADORES DE UI ---

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      ready_for_pickup: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const labels = {
      pending: "Pendiente",
      paid: "Pagado",
      shipped: "Enviado",
      ready_for_pickup: "Listo para Retirar",
      completed: "Entregado",
      cancelled: "Cancelado",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
          styles[status] || styles.pending
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getDeliveryBadge = (method) => {
    if (method === "shipping") {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">
          <Truck size={12} /> Envío
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-100">
        <Store size={12} /> Retiro
      </span>
    );
  };

  // --- FILTRADO ---
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (!canManage)
    return <div className="p-8 text-center">No tienes acceso a pedidos.</div>;

  return (
    <div className="bookings-view">
      {" "}
      {/* Reutilizamos clase contenedora */}
      {/* HEADER */}
      <div className="bookings-view__header">
        <h1>
          <ShoppingBag className="text-purple-600" />
          Gestión de Pedidos
        </h1>
      </div>
      {/* CONTROLES */}
      <div className="bookings-view__filters">
        <div className="filter-group">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por ID, nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">Todos los estados</option>
            <option value="paid">Pagados (Nuevos)</option>
            <option value="shipped">Enviados</option>
            <option value="ready_for_pickup">Listos para retirar</option>
            <option value="completed">Completados</option>
          </select>
        </div>
      </div>
      {/* LISTA DE PEDIDOS */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bookings-view__empty">
          <Package size={48} className="text-gray-300 mb-4" />
          <h3>No hay pedidos encontrados</h3>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="booking-card border-l-4 border-l-purple-500"
            >
              {/* Card Header */}
              <div className="booking-card__header">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-mono">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleDateString()
                      : "Fecha desc."}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Content */}
              <div className="booking-card__content">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">
                    {order.customerName}
                  </h3>
                  {getDeliveryBadge(order.deliveryMethod)}
                </div>

                <div className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                  <p className="font-medium mb-1">
                    {order.items?.length || 0} productos:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-500">
                    {order.items?.slice(0, 2).map((item, i) => (
                      <li key={i}>
                        {item.name} (x{item.quantity})
                      </li>
                    ))}
                    {order.items?.length > 2 && (
                      <li>...y {order.items.length - 2} más</li>
                    )}
                  </ul>
                </div>

                {order.deliveryMethod === "shipping" && (
                  <div className="flex items-start gap-1 text-xs text-gray-500 mb-3">
                    <MapPin size={12} className="mt-0.5" />
                    <span className="line-clamp-2">
                      {order.shippingAddress || "Sin dirección"}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center font-bold text-gray-800 pt-2 border-t">
                  <span>Total</span>
                  <span className="text-lg text-purple-600">
                    ${order.total}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="booking-card__actions">
                {/* Flujo para ENVÍO */}
                {order.deliveryMethod === "shipping" &&
                  order.status === "paid" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "shipped")}
                      className="btn-action bg-purple-100 text-purple-700 hover:bg-purple-200"
                    >
                      <Truck size={14} /> Marcar Enviado
                    </button>
                  )}

                {/* Flujo para RETIRO */}
                {order.deliveryMethod === "pickup" &&
                  order.status === "paid" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "ready_for_pickup")
                      }
                      className="btn-action bg-teal-100 text-teal-700 hover:bg-teal-200"
                    >
                      <Store size={14} /> Listo para Retirar
                    </button>
                  )}

                {/* Finalizar */}
                {(order.status === "shipped" ||
                  order.status === "ready_for_pickup") && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "completed")}
                    className="btn-action bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    <CheckCircle size={14} /> Entregado
                  </button>
                )}

                {/* Ver Detalle (Placeholder) */}
                <button
                  className="btn-action btn-view"
                  onClick={() => alert(JSON.stringify(order, null, 2))}
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersView;
