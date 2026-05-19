import { createContext, useContext, useState, ReactNode } from 'react';
import type { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([
    // Demo data
    {
      id: '1',
      pizzaId: 'syrova',
      name: 'Quattro Formaggi',
      price: 304,
      quantity: 1,
      image: '/images/syr.png',
      dough: 'Klasické těsto',
      base: 'Rajčatová omáčka',
      extras: ['mozzarella', 'jalapeños'],
    },
    {
      id: '2',
      pizzaId: 'salami',
      name: 'Salámová',
      price: 249,
      quantity: 1,
      image: '/images/salam.png',
      dough: 'Celozrnné těsto',
      base: 'Smetanový základ',
    },
  ]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    const id = Date.now().toString();
    setItems((prev) => [...prev, { ...newItem, id }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
