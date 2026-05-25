import React from 'react';
import { useCart } from '../hooks/useCart';

export const ClearCartButton: React.FC = () => {
  const { clearCart } = useCart();

  const handleClearCart = () => {
    if (window.confirm('Opravdu chcete vyčistit košík?')) {
      clearCart();
      sessionStorage.removeItem('pizza_app_pizzas');
      sessionStorage.removeItem('pizza_app_ingredients');
      sessionStorage.removeItem('pizza_app_options');
      sessionStorage.removeItem('pizza_app_admin_orders');

      // Vynutit refresh stránky pro načtení nových dat a resetování stavu
      window.location.reload();
    }
  };

  return (
    <button 
      onClick={handleClearCart} 
      style={{
        padding: '10px 20px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      Vyčistit paměť a obnovit data
    </button>
  );
};