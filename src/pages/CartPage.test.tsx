import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartPage, formatPrice } from './CartPage';
import { useCart } from '../hooks/useCart';
import { BrowserRouter } from 'react-router-dom';
import { ModalProvider } from '../hooks/useAlert';
// import React from 'react';
import { CartItem } from '../types';

describe('CartPage Utils', () => {
  describe('formatPrice', () => {
    it('should format whole numbers correctly', () => {
      expect(formatPrice(100)).toBe('100,00 Kč');
    });

    it('should format decimal numbers with two digits and a comma', () => {
      expect(formatPrice(125.5)).toBe('125,50 Kč');
    });

    it('should handle zero correctly', () => {
      expect(formatPrice(0)).toBe('0,00 Kč');
    });
  });
});

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
vi.mock('../hooks/useCart');

const mockItems: CartItem[] = [
  {
    id: '1',
    pizzaId: 1,
    name: 'Margherita',
    price: 200,
    quantity: 1,
    image: 'img.png',
    dough: 'Klasické',
    base: 'Rajčatový'
  }
];

describe('CartPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (useCart as any).mockReturnValue({
      items: mockItems,
      total: 200,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
    });
  });

  const renderCart = () => render(
    <BrowserRouter>
      <ModalProvider>
        <CartPage />
      </ModalProvider>
    </BrowserRouter>
  );

  it('should render items in the cart', () => {
    renderCart();
    expect(screen.getByText('Margherita')).toBeDefined();
    expect(screen.getAllByText('200 Kč').length).toBeGreaterThan(0);
  });

  it('should show message when cart is empty', () => {
    (useCart as any).mockReturnValue({
      items: [],
      total: 0,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
    });
    renderCart();
    expect(screen.getByText(/Košík je prázdný/i)).toBeDefined();
  });

  it('should apply a percentage discount coupon', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 'PIZZA10',
        value: '10',
        type: 'percentage',
        is_active: '1'
      }),
    } as any);

    renderCart();

    // Otevřít input pro kód
    fireEvent.click(screen.getByText(/Mám slevový kód/i));
    
    const input = screen.getByPlaceholderText(/Zadejte kód slevy/i);
    fireEvent.change(input, { target: { value: 'PIZZA10' } });
    fireEvent.click(screen.getByText(/Použít/i));

    // Sleva 10% z 200 = 20
    expect(await screen.findByText(/-20,00 Kč/)).toBeDefined();
    // Celkem 180
    expect(screen.getByText('180,00 Kč')).toBeDefined();
  });

  it('should show error for invalid coupon', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Neplatný kód' }),
    } as any);

    renderCart();

    fireEvent.click(screen.getByText(/Mám slevový kód/i));
    fireEvent.change(screen.getByPlaceholderText(/Zadejte kód slevy/i), { 
      target: { value: 'INVALID' } 
    });
    fireEvent.click(screen.getByText(/Použít/i));

    await waitFor(() => {
      expect(screen.getByText(/Neplatný kód/i)).toBeDefined();
    });
  });
});