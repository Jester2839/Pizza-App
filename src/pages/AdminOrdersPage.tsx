import React, { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../services/api';
import { Order, OrderStatus } from '../types';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Správa Objednávek</h1>
        <button 
          className="admin-page__refresh-btn"
          onClick={() => loadOrders(true)}
          disabled={loading}
          style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#b82132', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <i className="ph ph-arrows-clockwise" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
          {loading ? 'Načítání...' : 'Aktualizovat'}
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

        {loading && orders.length === 0 ? (
          <div className="admin-loading">
            <i className="ph ph-spinner ph-spin" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#b82132' }}></i>
            <p>Načítání objednávek...</p>
          </div>
        ) : (
          <div className="admin-page__orders-grid">
            {orders.map(order => (
              <div key={order.id_orders} className="order-card">
                <div className="order-card__header">
                  <div>
                    <div className="order-card__id">Objednávka #{order.id_orders}</div>
                    <div className="order-card__date">
                      <i className="ph ph-calendar-blank"></i> {formatDate(order.created_at)}
                    </div>
                    <div className="order-card__customer">
                      <strong><i className="ph ph-user"></i> {order.customer_name}</strong>
                      <i className="ph ph-phone"></i> {order.phone}<br />
                      <i className="ph ph-map-pin"></i> {order.address}
                    </div>
                  </div>
                  <div className="order-card__price">
                    {order.total_price} Kč
                  </div>
                </div>

                <ul className="order-card__items">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="order-card__items-item">
                      <span className="order-card__items-item-name">
                        <span style={{ color: '#b82132' }}>{item.quantity}x</span> {item.pizza_name}
                      </span>
                      <div className="order-card__items-item-specs">
                        <div>
                          <i className="ph ph-info"></i> {[item.dough_name, item.base_name, item.edge_name].filter(Boolean).join(', ')}
                        </div>
                        {item.extra_ingredients && item.extra_ingredients.length > 0 && (
                          <div className="extras">
                            + Extra: {item.extra_ingredients.map(ei => ei.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="order-card__status-section">
                  <div className="order-card__status-label">Stav objednávky</div>
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
                </div>

                <div className="order-card__footer">
              {['doručeno', 'zrušeno'].includes(order.status) && (
                    <button 
                      className="order-card__delete-btn"
                      onClick={() => handleDelete(order.id_orders)}
                    >
                      <i className="ph ph-trash"></i>
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
    </>
  );
};
