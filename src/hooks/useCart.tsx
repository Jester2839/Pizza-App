import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { CartItem } from '../types';

const CART_STORAGE_KEY = 'pizza-app-cart';

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
  const [items, setItems] = useState<CartItem[]>(() => {
    // Načtení ze sessionStorage při inicializaci
    try {
      const savedCart = sessionStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Sanitizace: pokud je quantity porušené (null/NaN), nastaví se automaticky na 1
        return parsed.map((item: any) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          doughId: Number(item.doughId) || 1,
          baseId: Number(item.baseId) || 1,
          edgeId: Number(item.edgeId) || undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Chyba při načítání košíku ze sessionStorage:', error);
      return [];
    }
  });

  // Uložení do sessionStorage při každé změně items
  useEffect(() => {
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Chyba při ukládání košíku do sessionStorage:', error);
    }
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    const id = Date.now().toString();
    // Nová pizza se přidá na začátek pole (unshift)
    setItems((prev) => [{ ...newItem, id }, ...prev]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (typeof quantity !== 'number' || isNaN(quantity) || quantity < 1) return;
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
