import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { QuantitySelector } from '../components/QuantitySelector';
import { OrderForm } from '../components/OrderForm';

export function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCart();
  const [showPromo, setShowPromo] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      removeItem(id);
      setRemovingId(null);
    }, 300);
  };

  return (
    <main className="cart-page-container">
      <Link to="/" className="btn-back">
        <i className="ph ph-arrow-left"></i>
        <span>Zpět do menu</span>
      </Link>
      <h1 className="page-title">Váš košík</h1>

      <div className="cart-grid">
        <div className="cart-items-list">
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              Košík je prázdný
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="cart-item"
                style={{
                  opacity: removingId === item.id ? 0 : 1,
                  transform: removingId === item.id ? 'translateX(20px)' : 'none',
                  transition: 'opacity 0.3s, transform 0.3s',
                }}
              >
                <img src={item.image} alt={item.name} className="cart-item-img" />

                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>{item.dough}, {item.base}{item.edge && `, ${item.edge}`}</p>
                  {item.extras && item.extras.length > 0 && (
                    <p>+ {item.extras.join(', ')}</p>
                  )}
                </div>

                <div className="cart-item-actions">
                  <QuantitySelector
                    quantity={item.quantity}
                    onChange={(qty) => updateQuantity(item.id, qty)}
                  />
                  <div className="cart-item-price">{item.price * item.quantity},-</div>
                  <button className="btn-remove" onClick={() => handleRemove(item.id)}>
                    <i className="ph ph-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary-wrapper">
          <div className="cart-summary">
            <h2>Shrnutí objednávky</h2>

            <div className="summary-row">
              <span>Hodnota košíku</span>
              <span>{total},-</span>
            </div>
            <div className="summary-row">
              <span>Doprava</span>
              <span style={{ color: '#4CAF50', fontWeight: 700 }}>Zdarma</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Celkem k úhradě</span>
              <span>{total},-</span>
            </div>

            <button
              className="btn-cart-solid summary-btn"
              onClick={() => setIsOrderFormOpen(true)}
              disabled={items.length === 0}
            >
              POKRAČOVAT V OBJEDNÁVCE
            </button>

            <div className="promo-code-box" onClick={() => setShowPromo(!showPromo)}>
              <i className="ph ph-tag"></i>
              <span>Mám slevový kód</span>
            </div>

            <div className={`promo-input-wrapper ${showPromo ? 'active' : ''}`}>
              <input type="text" placeholder="Zadejte kód slevy" className="promo-input" />
              <button className="promo-apply-btn">Použít</button>
            </div>
          </div>
        </div>
      </div>
      <OrderForm isOpen={isOrderFormOpen} onClose={() => setIsOrderFormOpen(false)} />
    </main>
  );
}
