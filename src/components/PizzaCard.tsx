import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import type { Pizza } from '../types';

interface PizzaCardProps {
  pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Přidat pizzu přímo do košíku s výchozími hodnotami
    addItem({
      pizzaId: pizza.id,
      name: pizza.name,
      price: pizza.price,
      quantity: 1,
      image: pizza.image,
      dough: 'Klasické těsto',
      base: 'Rajčatová omáčka',
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
