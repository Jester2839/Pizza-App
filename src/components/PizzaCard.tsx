import { useNavigate } from 'react-router-dom';
import type { Pizza } from '../types';

interface PizzaCardProps {
  pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/detail/${pizza.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  return (
    <div className="card" onClick={handleClick}>
      <button
        className="btn-edit"
        onClick={handleActionClick}
        title="Upravit pizzu"
      >
        <i className="ph ph-pencil-simple"></i>
      </button>

      <img src={pizza.image} alt={pizza.name} className="card-pizza-img" />

      <h2 className="card-title">{pizza.name}</h2>
      <p className="card-description">{pizza.description}</p>
      <div className="card-price">{pizza.price},-</div>
      <button className="btn-add" onClick={handleActionClick}>
        <i className="ph ph-shopping-cart"></i>
        <span className="btn-text">Vybrat variantu</span>
      </button>
    </div>
  );
}
