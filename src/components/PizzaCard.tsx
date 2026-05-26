import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { usePizzaOptions, getDefaultDough, getDefaultBase } from '../hooks/usePizzaOptions';
import type { Pizza } from '../types';

interface PizzaCardProps {
  pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { bases, doughs } = usePizzaOptions();

  // Získání výchozích hodnot z API dat
  const defaultDough = getDefaultDough(doughs);
  const defaultBase = getDefaultBase(bases);
  const defaultBaseId = pizza.defaultBaseId ?? defaultBase?.id;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Získat název základu z API dat
    const base = bases.find((b) => b.id === defaultBaseId);
    const baseName = base?.name ?? 'Rajčatový základ';
    
    // Přidat pizzu přímo do košíku s výchozími hodnotami (respektující složení pizzy)
    addItem({
      pizzaId: pizza.id,
      name: pizza.name,
      price: pizza.price,
      quantity: 1,
      image: pizza.image,
      dough: defaultDough?.name ?? 'Klasické těsto',
      doughId: defaultDough?.id,
      base: baseName,
      baseId: defaultBaseId,
    });
    
    // Přesměrovat do košíku
    navigate('/kosik');
  };

  const handleClick = () => {
    navigate(`/detail/${pizza.id}`);
  };

  return (
    <div className="card" onClick={handleClick}>
      <button
        className="btn-edit"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/detail/${pizza.id}`);
        }}
        title="Upravit pizzu"
      >
        <i className="ph ph-pencil-simple"></i>
      </button>

      <img src={pizza.image} alt={pizza.name} className="card-pizza-img" />

      <h2 className="card-title">{pizza.name}</h2>
      <p className="card-description">{pizza.description}</p>
      <div className="card-price">{pizza.price},-</div>
      <button className="btn-add" onClick={handleAddToCart}>
        <i className="ph ph-shopping-cart"></i>
        <span className="btn-text">Přidat do košíku</span>
      </button>
    </div>
  );
}
