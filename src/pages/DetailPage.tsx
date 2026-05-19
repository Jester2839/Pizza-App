import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pizzas } from '../data/pizzas';
import { useCart } from '../hooks/useCart';
import { extraIngredients } from '../data/ingredients';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const pizza = pizzas.find((p) => p.id === id) ?? pizzas[0];

  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [dough, setDough] = useState('Klasické těsto');
  const [base, setBase] = useState('Rajčatová omáčka');
  const [edge, setEdge] = useState('Klasický okraj');

  const extrasPrice = Array.from(selectedExtras).reduce((sum, extraId) => {
    const extra = extraIngredients.flatMap((cat) => cat.items).find((i) => i.id === extraId);
    return sum + (extra?.price ?? 0);
  }, 0);

  const edgePrice = edge.includes('Sýrový') ? 40 : edge.includes('Párkový') ? 50 : 0;
  const totalPrice = pizza.price + extrasPrice + edgePrice;

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(extraId)) {
        next.delete(extraId);
      } else {
        next.add(extraId);
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    const extras = Array.from(selectedExtras).map((extraId) => {
      const extra = extraIngredients.flatMap((cat) => cat.items).find((i) => i.id === extraId);
      return extra?.name ?? '';
    });

    addItem({
      pizzaId: pizza.id,
      name: pizza.name,
      price: totalPrice,
      quantity: 1,
      image: pizza.image,
      dough,
      base,
      edge: edge !== 'Klasický okraj' ? edge : undefined,
      extras: extras.length > 0 ? extras : undefined,
    });

    navigate('/kosik');
  };

  return (
    <main className="detail-container">
      <Link to="/" className="btn-back">
        <i className="ph ph-arrow-left"></i>
        Zpět na nabídku
      </Link>

      <div className="detail-grid">
        <div className="detail-image-wrapper">
          <img src={pizza.image} alt={pizza.name} className="detail-pizza-img" />
        </div>

        <div className="detail-info">
          <h1 className="detail-title-main">{pizza.name}</h1>
          <p className="detail-sub-desc">{pizza.description}</p>

          <div className="config-row">
            <div className="config-group">
              <label>TĚSTO</label>
              <select value={dough} onChange={(e) => setDough(e.target.value)}>
                <option>Klasické těsto</option>
                <option>Celozrnné těsto</option>
              </select>
            </div>
            <div className="config-group">
              <label>ZÁKLAD</label>
              <select value={base} onChange={(e) => setBase(e.target.value)}>
                <option>Rajčatová omáčka</option>
                <option>Smetanový základ</option>
              </select>
            </div>
            <div className="config-group">
              <label>PLNĚNÉ OKRAJE</label>
              <select value={edge} onChange={(e) => setEdge(e.target.value)}>
                <option>Klasický okraj</option>
                <option>Sýrový okraj (+40,-)</option>
                <option>Párkový okraj (+50,-)</option>
              </select>
            </div>
          </div>

          <div className="action-row">
            <div className="final-price">{totalPrice},-</div>
            <button className="btn-cart-solid" onClick={handleAddToCart}>
              PŘIDAT DO KOŠÍKU
            </button>
          </div>
        </div>
      </div>

      <div className="extra-ingredients-wrapper">
        <div className="divider-title">
          <span>Ingredience navíc</span>
        </div>

        <div className="ingredients-columns">
          {extraIngredients.map((category) => (
            <div key={category.category} className="ingredient-category">
              <h3>{category.category}</h3>
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className={`ing-item ${selectedExtras.has(item.id) ? 'selected' : ''}`}
                  onClick={() => toggleExtra(item.id)}
                >
                  <span className="ing-name">{item.name}</span>
                  <span className="ing-price">+{item.price},-</span>
                  <i className={`ph ${selectedExtras.has(item.id) ? 'ph-trash' : 'ph-plus'}`}></i>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
