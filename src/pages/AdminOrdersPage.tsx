import React, { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../services/api';
import { Order, OrderStatus } from '../types';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'pizzas' | 'ingredients'>('orders');

  const loadOrders = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders(force);
      // Sort orders by date descending
      const sorted = [...data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(sorted);
    } catch (err) {
      setError('Nepodařilo se načíst objednávky. Zkuste to prosím znovu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id_orders === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      alert('Chyba při změně stavu objednávky.');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!window.confirm('Opravdu chcete smazat tuto objednávku?')) return;
    
    try {
      await deleteOrder(orderId);
      // Update local state
      setOrders(prev => prev.filter(order => order.id_orders !== orderId));
    } catch (err) {
      alert('Chyba při mazání objednávky.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusOptions: OrderStatus[] = ['přijato', 'v přípravě', 'hotovo', 'doručeno', 'zrušeno'];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <nav className="admin-page__nav">
          <div 
            className={`admin-page__nav-item ${activeTab === 'orders' ? 'admin-page__nav-item--active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Objednávky
          </div>
          <div 
            className={`admin-page__nav-item ${activeTab === 'pizzas' ? 'admin-page__nav-item--active' : ''}`}
            onClick={() => setActiveTab('pizzas')}
          >
            Pizzy
          </div>
          <div 
            className={`admin-page__nav-item ${activeTab === 'ingredients' ? 'admin-page__nav-item--active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredience
          </div>
        </nav>
        
        <button 
          className="admin-page__refresh-btn"
          onClick={() => loadOrders(true)}
          disabled={loading}
        >
          {loading ? 'Načítání...' : 'Aktualizovat objednávky'}
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading && orders.length === 0 ? (
        <div className="admin-loading">Načítání objednávek...</div>
      ) : (
        <div className="admin-page__orders-grid">
          {orders.map(order => (
            <div key={order.id_orders} className="order-card">
              <div className="order-card__header">
                <div>
                  <div className="order-card__id">Objednávka #{order.id_orders}</div>
                  <div className="order-card__date">{formatDate(order.created_at)}</div>
                  {order.customer_name && (
                    <div className="order-card__customer">
                      <strong>{order.customer_name}</strong><br />
                      {order.phone}<br />
                      {order.address}
                    </div>
                  )}
                </div>
                {order.total_price && (
                  <div className="order-card__total">
                    {Number(order.total_price).toLocaleString('cs-CZ')} Kč
                  </div>
                )}
              </div>

              <ul className="order-card__items">
                {order.items.map((item, idx) => (
                  <li key={idx} className="order-card__items-item">
                    <span className="order-card__items-item-name">
                      {item.quantity ? `${item.quantity}x ` : ''}{item.pizza_name}
                    </span>
                    <div className="order-card__items-item-specs">
                      {[item.dough_name, item.edge_name, ...(item.extra_ingredients?.map(ing => ing.name) || [])]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="order-card__status-selector">
                {statusOptions.map(status => (
                  <button
                    key={status}
                    className={`order-card__status-btn ${order.status === status ? 'order-card__status-btn--active' : ''}`}
                    onClick={() => handleStatusChange(order.id_orders, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="order-card__footer">
                {(order.status === 'doručeno' || order.status === 'zrušeno') && (
                  <button 
                    className="order-card__delete-btn"
                    onClick={() => handleDelete(order.id_orders)}
                  >
                    Smazat objednávku
                  </button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && !loading && (
            <div className="admin-loading">Žádné objednávky k zobrazení.</div>
          )}
        </div>
      )}
    </div>
  );
};
