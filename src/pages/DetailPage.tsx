import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pizzas } from '../data/pizzas';
import { useCart } from '../hooks/useCart';
import { extraIngredients } from '../data/ingredients';
import {
  doughs,
  bases,
  edges,
  getDefaultDough,
  getDefaultBase,
  getDefaultEdge,
  getEdgeById,
} from '../data/pizzaOptions';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const pizza = pizzas.find((p) => p.id === id) ?? pizzas[0];

  // Načtení výchozích hodnot z datových souborů
  const defaultDough = getDefaultDough();
  const defaultEdge = getDefaultEdge();

  // Výchozí základ se určí podle pizzy (pokud má defaultBaseId) nebo použije výchozí
  const pizzaDefaultBaseId = pizza.defaultBaseId ?? getDefaultBase()?.id ?? 'tomato';

  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [doughId, setDoughId] = useState(defaultDough?.id ?? 'classic');
  const [baseId, setBaseId] = useState(pizzaDefaultBaseId);
  const [edgeId, setEdgeId] = useState(defaultEdge?.id ?? 'classic');

  // Výpočet ceny extra ingrediencí
  const extrasPrice = useMemo(() => {
    return Array.from(selectedExtras).reduce((sum, extraId) => {
      const extra = extraIngredients.flatMap((cat) => cat.items).find((i) => i.id === extraId);
      return sum + (extra?.price ?? 0);
    }, 0);
  }, [selectedExtras]);

  // Výpočet ceny okraje
  const edgePrice = useMemo(() => {
    const edge = getEdgeById(edgeId);
    return edge?.price ?? 0;
  }, [edgeId]);

  // Výpočet ceny těsta
  const doughPrice = useMemo(() => {
    const dough = doughs.find((d) => d.id === doughId);
    return dough?.price ?? 0;
  }, [doughId]);

  // Výpočet ceny základu
  const basePrice = useMemo(() => {
    const base = bases.find((b) => b.id === baseId);
    return base?.price ?? 0;
  }, [baseId]);

  // Celková cena
  const totalPrice = pizza.price + extrasPrice + edgePrice + doughPrice + basePrice;

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

    const dough = doughs.find((d) => d.id === doughId);
    const base = bases.find((b) => b.id === baseId);
    const edge = edges.find((e) => e.id === edgeId);

    addItem({
      pizzaId: pizza.id,
      name: pizza.name,
      price: totalPrice,
      quantity: 1,
      image: pizza.image,
      dough: dough?.name,
      doughId,
      base: base?.name,
      baseId,
      edge: edge?.id !== 'classic' ? edge?.displayName : undefined,
      edgeId: edge?.id !== 'classic' ? edgeId : undefined,
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
              <select value={doughId} onChange={(e) => setDoughId(e.target.value)}>
                {doughs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.price > 0 ? ` (+${d.price},-)` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="config-group">
              <label>ZÁKLAD</label>
              <select value={baseId} onChange={(e) => setBaseId(e.target.value)}>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}{b.price > 0 ? ` (+${b.price},-)` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="config-group">
              <label>PLNĚNÉ OKRAJE</label>
              <select value={edgeId} onChange={(e) => setEdgeId(e.target.value)}>
                {edges.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.displayName}
                  </option>
                ))}
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
