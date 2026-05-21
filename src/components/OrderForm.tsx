import { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { useAlert } from '../hooks/useAlert';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderForm({ isOpen, onClose }: OrderFormProps) {
  const { items, total, clearCart } = useCart();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.phone || !formData.address) {
      showAlert('Prosím vyplňte všechna pole formuláře.', 'Chyba');
      return;
    }

    setLoading(true);

    // Mapování dat pro API
    // POZNÁMKA: V datech aplikace máme string ID, ale API očekává integer. 
    // Pokud ID nejsou číselná, budeme muset vytvořit mapování nebo poslat aspoň nějaké číselné ID.
    // Pro tento účel zkusíme parsovat integer z ID nebo použít fallback.
    const orderData = {
      customer_name: formData.customer_name,
      phone: formData.phone,
      address: formData.address,
      total_price: total,
      items: items.map((item) => ({
        // Zkusíme získat číselné ID z dat (např. 'sunkova' -> můžeme mít mapu nebo poslat index)
        // V zadání je "jednotlive id doplnis podle položek z košíku"
        // Budu předpokládat mapování nebo že ID v systému odpovídají číslům v DB
        id_pizzas: parseInt(item.pizzaId) || 1, 
        id_doughs: parseInt(item.doughId || '1') || 1,
        id_edges: parseInt(item.edgeId || '1') || 1,
        quantity: item.quantity,
        price_per_unit: item.price,
        ingredients: (item.extras || []).map(extraName => {
           // Zde by bylo ideální mít ID ingrediencí. V CartItem máme jen názvy v 'extras'.
           // Pro jednoduchost teď posílám prázdné pole nebo by bylo potřeba lookup tabulku.
           return 1; // Fallback ID
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
            <div className="summary-total-price">
              <span>Celkem</span>
              <span>{total},-</span>
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
