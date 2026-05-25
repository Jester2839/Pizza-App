import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePizzas } from '../hooks/usePizzas';
import { useIngredients } from '../hooks/useIngredients';
import { usePizzaOptions } from '../hooks/usePizzaOptions';
import { useCart } from '../hooks/useCart';
import {
  getDefaultDough,
  getDefaultBase,
  getDefaultEdge,
  getEdgeById,
} from '../hooks/usePizzaOptions';
import type { Dough, Base } from '../data/pizzaOptions';
import type { IngredientCategory } from '../data/ingredients';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // Načítání dat z API
  const { pizzas, loading: pizzasLoading, error: pizzasError } = usePizzas();
  const { ingredients: extraIngredients, loading: ingredientsLoading, error: ingredientsError } = useIngredients();
  const { 
    doughs, 
    bases, 
    edges, 
    loading: optionsLoading, 
    error: optionsError 
  } = usePizzaOptions();

  // Načtení výchozích hodnot z API dat
  const defaultDough = getDefaultDough(doughs);
  const defaultEdge = getDefaultEdge(edges);
  const defaultBase = getDefaultBase(bases);

  // --- VŠECHNY HOOKY (STATE I MEMO) Musí BÝT ZDE, PŘED EARLY RETURNS ---
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [doughId, setDoughId] = useState(defaultDough?.id ?? 'classic');
  const [baseId, setBaseId] = useState(defaultBase?.id ?? 'tomato');
  const [edgeId, setEdgeId] = useState(defaultEdge?.id ?? 'classic');

  // Výchozí základ se určí podle pizzy (pokud má defaultBaseId) nebo použije výchozí
  const pizza = pizzas.find((p) => p.id === id);
  const pizzaDefaultBaseId = pizza?.defaultBaseId ?? defaultBase?.id ?? 'tomato';

  // Výpočet ceny extra ingrediencí
  const extrasPrice = useMemo(() => {
    return Array.from(selectedExtras).reduce((sum, extraId) => {
      const extra = extraIngredients.flatMap((cat: IngredientCategory) => cat.items).find((i) => i.id === extraId);
      return sum + (extra?.price ?? 0);
    }, 0);
  }, [selectedExtras, extraIngredients]);

  // Výpočet ceny okraje
  const edgePrice = useMemo(() => {
    const edge = getEdgeById(edges, edgeId);
    return edge?.price ?? 0;
  }, [edgeId, edges]);

  // Výpočet ceny těsta
  const doughPrice = useMemo(() => {
    const dough = doughs.find((d: Dough) => d.id === doughId);
    return dough?.price ?? 0;
  }, [doughId, doughs]);

  // Výpočet ceny základu
  const basePrice = useMemo(() => {
    const base = bases.find((b: Base) => b.id === baseId);
    return base?.price ?? 0;
  }, [baseId, bases]);

  // Celková cena - přidáno "pizza?.price ?? 0" pro případ, že pizza ještě není načtená
  const totalPrice = (pizza?.price ?? 0) + extrasPrice + edgePrice + doughPrice + basePrice;

  // --- NYNÍ MŮŽOU NÁSLEDOVAT VŠECHNY EARLY RETURNS ---

  // Loading stav - načítáme pizzy, ingredience nebo options
  const isLoading = pizzasLoading || ingredientsLoading || optionsLoading;
  if (isLoading) {
    return (
      <main className="detail-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍕</div>
          <p style={{ fontSize: '18px', color: '#666' }}>Načítám detail pizzy...</p>
        </div>
      </main>
    );
  }

  // Error stav - některé z API selhalo
  const apiError = pizzasError || ingredientsError || optionsError;
  if (apiError) {
    return (
      <main className="detail-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <p style={{ fontSize: '18px', color: '#b82132' }}>Chyba při načítání dat.</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>{apiError}</p>
          <Link to="/" className="btn-back" style={{ marginTop: '16px', display: 'inline-block' }}>
            <i className="ph ph-arrow-left"></i>
            Zpět na nabídku
          </Link>
        </div>
      </main>
    );
  }

  // Nenalezeno stav
  if (!pizza) {
    return (
      <main className="detail-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <p style={{ fontSize: '18px', color: '#b82132' }}>Pizza nebyla nalezena.</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>ID: {id}</p>
          <Link to="/" className="btn-back" style={{ marginTop: '16px', display: 'inline-block' }}>
            <i className="ph ph-arrow-left"></i>
            Zpět na nabídku
          </Link>
        </div>
      </main>
    );
  }

  // Nastavení základu podle pizzy (po načtení dat)
  if (pizza && baseId !== pizzaDefaultBaseId) {
    setBaseId(pizzaDefaultBaseId);
  }

  // --- HANDLERY A LOGIKA PŘIDÁVÁNÍ ---

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
    const extras: string[] = [];
    const extraIds: string[] = [];

    selectedExtras.forEach((extraId) => {
      const extra = extraIngredients
        .flatMap((cat: IngredientCategory) => cat.items)
        .find((i) => i.id === extraId);
      if (extra) {
        extras.push(extra.name);
        extraIds.push(extra.id);
      }
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
      extraIds: extraIds.length > 0 ? extraIds : undefined,
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
