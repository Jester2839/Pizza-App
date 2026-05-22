import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { QuantitySelector } from '../components/QuantitySelector';
import { OrderForm } from '../components/OrderForm';
import type { Coupon } from '../types';

export const formatPrice = (price: number) => {
  return price.toFixed(2).replace('.', ',') + ' Kč';
};

export function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCart();
  const [showPromo, setShowPromo] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  // Slevové kódy logic
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = sessionStorage.getItem('applied-coupon');
    return saved ? JSON.parse(saved) : null;
  });
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (appliedCoupon) {
      sessionStorage.setItem('applied-coupon', JSON.stringify(appliedCoupon));
    } else {
      sessionStorage.removeItem('applied-coupon');
    }
  }, [appliedCoupon]);

  const overitKod = async () => {
    if (!promoCode.trim()) return;

    setIsApplying(true);
    setPromoError(null);

    try {
      const response = await fetch(
        `https://b2024novyja.delta-www.cz/api/coupons/?code=${promoCode}`
      );
      const data = await response.json();

      if (response.ok && data && data.is_active === '1') {
        setAppliedCoupon(data);
        setPromoCode('');
        setShowPromo(false);
      } else {
        setPromoError(data.error || 'Neplatný nebo neaktivní slevový kód');
      }
    } catch (error) {
      console.error('Chyba spojení:', error);
      setPromoError('Chyba spojení se serverem');
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const value = parseFloat(appliedCoupon.value);
    if (appliedCoupon.type === 'percentage') {
      return (total * value) / 100;
    }
    return value;
  };

  const discountValue = calculateDiscount();
  const finalTotal = Math.max(0, total - discountValue);

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
                  <p>
                    {item.dough?.replace(/\s*\(\+\d+,-\)/g, '')}, 
                    {' '}{item.base?.replace(/\s*\(\+\d+,-\)/g, '')}
                    {item.edge && `, ${item.edge.replace(/\s*\(\+\d+,-\)/g, '')}`}
                  </p>
                  {item.extras && item.extras.length > 0 && (
                    <p style={{ color: '#d4a017' }}>+ {item.extras.join(', ')}</p>
                  )}
                </div>

                <div className="cart-item-actions">
                  <QuantitySelector
                    quantity={item.quantity}
                    onChange={(qty) => updateQuantity(item.id, qty)}
                  />
                  <div className="cart-item-price">{formatPrice(item.price * item.quantity)}</div>
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
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>Doprava</span>
              <span style={{ color: '#4CAF50', fontWeight: 700 }}>Zdarma</span>
            </div>

            {appliedCoupon && (
              <>
                <div className="summary-divider"></div>
                <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666', display: 'flex', alignItems: 'center' }}>
                  Aplikované kupóny:
                  <button className="coupon-remove-btn" onClick={removeCoupon} title="Odstranit kód">
                    <strong>{appliedCoupon.code}</strong>
                    <i className="ph ph-x remove-icon"></i>
                  </button>
                </div>
                <div className="summary-row discount-row">
                  <span className="discount-label">Sleva</span>
                  <span className="discount-value">-{formatPrice(discountValue)}</span>
                </div>
              </>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Celkem k úhradě</span>
              <span>{formatPrice(finalTotal)}</span>
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
              <input
                type="text"
                placeholder="Zadejte kód slevy"
                className="promo-input"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && overitKod()}
              />
              <button
                className="promo-apply-btn"
                onClick={overitKod}
                disabled={isApplying || !promoCode.trim()}
              >
                {isApplying ? '...' : 'Použít'}
              </button>
            </div>
            {promoError && (
              <div className="promo-error-message">
                {promoError}
              </div>
            )}
          </div>
        </div>
      </div>
      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        discount={discountValue}
        finalTotal={finalTotal}
      />
    </main>
  );
}
