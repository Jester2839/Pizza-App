interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
}

export function QuantitySelector({ quantity, onChange }: QuantitySelectorProps) {
  return (
    <div className="quantity-selector">
      <button className="qty-btn" onClick={() => onChange(quantity - 1)} aria-label="Snížit množství">
        <i className="ph ph-minus"></i>
      </button>
      <span className="qty-number">{quantity}</span>
      <button className="qty-btn" onClick={() => onChange(quantity + 1)} aria-label="Zvýšit množství">
        <i className="ph ph-plus"></i>
      </button>
    </div>
  );
}
