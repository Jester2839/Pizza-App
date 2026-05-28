import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart, CartProvider } from './useCart';
import React from 'react';

// Pomocný obal pro hook, aby měl přístup ke Contextu
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('useCart Hook', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should start with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
  });

  it('should add a pizza to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        pizzaId: 1,
        name: 'Margherita',
        price: 150,
        quantity: 1,
        image: 'test.png',
        dough: 'Tenké',
        base: 'Rajčatový'
      });
    });

    expect(result.current.itemCount).toBe(1);
    expect(result.current.items[0].name).toBe('Margherita');
  });

  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addItem({
        pizzaId: 1,
        name: 'Pizza 1',
        price: 100,
        quantity: 1,
        image: 'img.png'
      });
      result.current.addItem({
        pizzaId: 2,
        name: 'Pizza 2',
        price: 200,
        quantity: 2,
        image: 'img.png'
      });
    });

    // 1*100 + 2*200 = 500
    expect(result.current.total).toBe(500);
  });

  it('should remove an item from the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        pizzaId: 1,
        name: 'Margherita',
        price: 150,
        quantity: 1,
        image: 'test.png'
      });
    });

    const itemId = result.current.items[0].id;
    expect(result.current.itemCount).toBe(1);

    act(() => {
      result.current.removeItem(itemId);
    });

    expect(result.current.itemCount).toBe(0);
    expect(result.current.items).toHaveLength(0);
  });

  it('should update item quantity and total price', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        pizzaId: 1,
        name: 'Margherita',
        price: 150,
        quantity: 1,
        image: 'test.png'
      });
    });

    const itemId = result.current.items[0].id;

    act(() => {
      result.current.updateQuantity(itemId, 3);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.itemCount).toBe(3);
    // 3 * 150 = 450
    expect(result.current.total).toBe(450);

    // Test validace: nemělo by dovolit nastavit méně než 1
    act(() => {
      result.current.updateQuantity(itemId, 0);
    });
    expect(result.current.items[0].quantity).toBe(3); // Zůstane na 3
  });

  it('should clear the entire cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ pizzaId: 1, name: 'P1', price: 100, quantity: 1, image: '' });
      result.current.addItem({ pizzaId: 2, name: 'P2', price: 200, quantity: 1, image: '' });
    });

    expect(result.current.itemCount).toBe(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.itemCount).toBe(0);
    expect(result.current.items).toHaveLength(0);
  });

  it('should persist cart to sessionStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        pizzaId: 1,
        name: 'Persisted Pizza',
        price: 200,
        quantity: 1,
        image: 'test.png'
      });
    });

    const savedData = JSON.parse(sessionStorage.getItem('pizza-app-cart') || '[]');
    expect(savedData).toHaveLength(1);
    expect(savedData[0].name).toBe('Persisted Pizza');
  });

  it('should load initial data from sessionStorage', () => {
    const mockData = [
      {
        id: 'old-id',
        pizzaId: 99,
        name: 'Cached Pizza',
        price: 300,
        quantity: 2,
        image: 'cached.png'
      }
    ];
    sessionStorage.setItem('pizza-app-cart', JSON.stringify(mockData));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Cached Pizza');
    expect(result.current.total).toBe(600);
  });

  it('should sanitize corrupted data loaded from sessionStorage', () => {
    const corruptedData = [
      {
        id: '1',
        pizzaId: 1,
        name: 'Corrupted',
        price: 100,
        quantity: null, // Mělo by se změnit na 1
      }
    ];
    sessionStorage.setItem('pizza-app-cart', JSON.stringify(corruptedData));

    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items[0].quantity).toBe(1);
  });
});