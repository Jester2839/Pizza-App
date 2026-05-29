import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetailPage } from './DetailPage';
import { usePizzas } from '../hooks/usePizzas';
import { useIngredients } from '../hooks/useIngredients';
import { usePizzaOptions, getDefaultDough, getDefaultBase, getDefaultEdge, getEdgeById } from '../hooks/usePizzaOptions';
import { useCart } from '../hooks/useCart';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
// import React from 'react';

// Mockování hooků
vi.mock('../hooks/usePizzas');
vi.mock('../hooks/useIngredients');
vi.mock('../hooks/usePizzaOptions', () => ({
  usePizzaOptions: vi.fn(),
  getDefaultDough: vi.fn(),
  getDefaultBase: vi.fn(),
  getDefaultEdge: vi.fn(),
  getEdgeById: vi.fn(),
}));
vi.mock('../hooks/useCart');

const mockPizza = {
  id: 1,
  name: 'Margherita',
  price: 150,
  description: 'Klasika',
  image: 'marge.png',
  defaultBaseId: 1
};

const mockDoughs = [
  { id: 1, name: 'Klasické', price: 0, code: 'classic' },
  { id: 2, name: 'Bezlepkové', price: 50, code: 'gf' }
];

const mockBases = [
  { id: 1, name: 'Rajčatový', price: 0, code: 'tomato' },
  { id: 2, name: 'Smetanový', price: 20, code: 'cream' }
];

const mockEdges = [
  { id: 1, displayName: 'Klasický', price: 0, code: 'classic' },
  { id: 2, displayName: 'Sýrový', price: 40, code: 'cheese' }
];

const mockIngredients = [
  {
    category: 'SÝRY',
    items: [{ id: 10, name: 'Extra Mozzarella', price: 30 }]
  }
];

describe('DetailPage Component', () => {
  const addItemMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (getDefaultDough as any).mockReturnValue(mockDoughs[0]);
    (getDefaultBase as any).mockReturnValue(mockBases[0]);
    (getDefaultEdge as any).mockReturnValue(mockEdges[0]);
    (getEdgeById as any).mockImplementation((edges: any[], id: any) => edges.find(e => e.id === Number(id)));

    (usePizzas as any).mockReturnValue({ pizzas: [mockPizza], loading: false, error: null, refetch: vi.fn() });
    (useIngredients as any).mockReturnValue({ ingredients: mockIngredients, loading: false, error: null });
    (usePizzaOptions as any).mockReturnValue({ 
      doughs: mockDoughs as any, 
      bases: mockBases as any, 
      edges: mockEdges as any, 
      loading: false, 
      error: null 
    } as any);
    (useCart as any).mockReturnValue({ addItem: addItemMock });
  });

  const renderDetail = () => render(
    <MemoryRouter initialEntries={['/detail/1']}>
      <Routes>
        <Route path="/detail/:id" element={<DetailPage />} />
      </Routes>
    </MemoryRouter>
  );

  it('should render pizza details and initial price', () => {
    renderDetail();
    expect(screen.getByText('Margherita')).toBeDefined();
    // Základní cena 150 + výchozí (0+0+0) = 150
    expect(screen.getByText(/150,-/)).toBeDefined();
  });

  it('should update price when changing dough and base', async () => {
    renderDetail();

    const doughSelect = screen.getByLabelText(/TĚSTO/i);
    fireEvent.change(doughSelect, { target: { value: '2' } }); // Bezlepkové +50

    const baseSelect = screen.getByLabelText(/ZÁKLAD/i);
    fireEvent.change(baseSelect, { target: { value: '2' } }); // Smetanový +20

    // 150 + 50 + 20 = 220
    expect(screen.getByText(/220,-/)).toBeDefined();
  });

  it('should update price when adding extra ingredients', () => {
    renderDetail();

    const extraBtn = screen.getByText(/Extra Mozzarella/i);
    fireEvent.click(extraBtn);

    // 150 + 30 = 180
    expect(screen.getByText(/180,-/)).toBeDefined();

    // Zrušení ingredience
    fireEvent.click(extraBtn);
    expect(screen.getByText(/150,-/)).toBeDefined();
  });

  it('should call addItem with correct payload when adding to cart', () => {
    renderDetail();

    // Vybereme extra sýr (+30) a sýrový okraj (+40)
    fireEvent.click(screen.getByText(/Extra Mozzarella/i));
    
    const edgeSelect = screen.getByLabelText(/PLNĚNÉ OKRAJE/i);
    fireEvent.change(edgeSelect, { target: { value: '2' } });

    const addToCartBtn = screen.getByText(/PŘIDAT DO KOŠÍKU/i);
    fireEvent.click(addToCartBtn);

    // 150 (pizza) + 30 (extra) + 40 (okraj) = 220
    expect(addItemMock).toHaveBeenCalledWith(expect.objectContaining({
      pizzaId: 1,
      name: 'Margherita',
      price: 220,
      extras: ['Extra Mozzarella'],
      edge: 'Sýrový'
    }));
  });
});