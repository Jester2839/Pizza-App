import { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { useAlert } from '../hooks/useAlert';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  discount?: number;
  finalTotal?: number;
}

export function OrderForm({ isOpen, onClose, discount, finalTotal }: OrderFormProps) {
  const { items, total, clearCart } = useCart();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState({
    customer_name: '',
    phone: '',
    address: '',
  });

  const displayTotal = finalTotal !== undefined ? finalTotal : total;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validatePhone = (phone: string): boolean => {
    // Regex pro telefonní číslo - volitelné +, jen číslice, minimálně 9 číslic
    const phoneRegex = /^\+?[0-9]{9,}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validace pro telefonní číslo
    if (name === 'phone') {
      if (!validatePhone(value)) {
        setErrors((prev) => ({ ...prev, phone: 'Telefonní číslo musí mít alespoň 9 číslic a obsahovat pouze číslice (volitelně s + na začátku).' }));
      } else {
        setErrors((prev) => ({ ...prev, phone: '' }));
      }
    }

    // Základní validace pro ostatní pole (jen pro zobrazení chyby hned)
    if (name === 'customer_name') {
      setErrors((prev) => ({ ...prev, customer_name: value ? '' : 'Jméno je povinné.' }));
    }
    if (name === 'address') {
      setErrors((prev) => ({ ...prev, address: value ? '' : 'Adresa je povinná.' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      customer_name: formData.customer_name ? '' : 'Jméno je povinné.',
      phone: validatePhone(formData.phone) ? '' : 'Zadejte platné telefonní číslo (alespoň 9 číslic, pouze číslice).',
      address: formData.address ? '' : 'Adresa je povinná.',
    };
    setErrors(newErrors);

    // Pokud jsou nějaké chyby, neodesílejte formulář
    if (Object.values(newErrors).some(error => error)) {
      showAlert('Prosím opravte chyby ve formuláři.', 'Chyba validace');
      return;
    }

    setLoading(true);

    const orderData = {
      customer_name: formData.customer_name,
      phone: formData.phone,
      address: formData.address,
      total_price: displayTotal,
      items: items.map((item) => ({
        id_pizzas: parseInt(item.pizzaId) || 1,
        id_doughs: parseInt(item.doughId || '1') || 1,
        id_edges: parseInt(item.edgeId || '1') || 1,
        quantity: item.quantity,
        price_per_unit: item.price,
        ingredients: (item.extras || []).map(() => {
           return 1; // Fallback ID - TODO: Implement proper ingredient ID mapping
        })
      }))
    };

    try {
      const response = await fetch('https://b2024novyja.delta-www.cz/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        showAlert('Vaše objednávka byla úspěšně odeslána!', 'Úspěch');
        clearCart();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showAlert(`Chyba při odesílání objednávky: ${errorData.message || response.statusText}`, 'Chyba');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      showAlert('Nepodařilo se odeslat objednávku. Zkontrolujte připojení k internetu.', 'Chyba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Dokončení objednávky</h3>
          <button className="modal-close-icon" onClick={onClose}>
            <i className="ph ph-x"></i>
          </button>
        </div>

        <form className="order-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customer_name">Jméno a příjmení</label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="Jan Novák"
              required
            />
            {errors.customer_name && <p className="error-message">{errors.customer_name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefonní číslo</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+420 777 888 999"
              required
            />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Adresa doručení</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ulice 123, Město"
              required
            />
            {errors.address && <p className="error-message">{errors.address}</p>}
          </div>

          <div className="order-summary-box">
            <h4>Shrnutí položek</h4>
            {items.map((item, index) => (
              <div key={item.id} className="summary-item">
                <div className="item-main">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{item.price * item.quantity},-</span>
                </div>
                <div className="item-variants">
                  {item.dough}, {item.base}{item.edge ? `, ${item.edge}` : ''}
                </div>
                {item.extras && item.extras.length > 0 && (
                  <div className="item-extras">
                    Extra: {item.extras.join(', ')}
                  </div>
                )}
                {index < items.length - 1 && <div style={{ borderBottom: '1px solid #eee', margin: '10px 0' }}></div>}
              </div>
            ))}
            {discount ? (
              <div className="summary-discount-price" style={{ display: 'flex', justifyContent: 'space-between', color: '#b82132', fontWeight: 700, margin: '5px 0' }}>
                <span>Sleva</span>
                <span>-{discount},-</span>
              </div>
            ) : null}
            <div className="summary-total-price">
              <span>Celkem</span>
              <span>{displayTotal},-</span>
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'center', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Odesílám...' : 'OBJEDNAT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
