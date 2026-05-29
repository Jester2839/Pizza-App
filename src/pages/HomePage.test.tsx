import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';
import { usePizzas } from '../hooks/usePizzas';
import { useSearch } from '../hooks/useSearch';
import { BrowserRouter } from 'react-router-dom';
// import React from 'react';

// Mockování ResizeObserveru, který v JSDOM prostředí chybí
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
);

vi.mock('../hooks/usePizzas');
vi.mock('../hooks/useSearch');

const mockPizzas = [
  { id: 1, name: 'Margherita', category: ['vegetarian'], price: 150, image: '', description: 'Klasika' },
  { id: 2, name: 'Salami', category: ['meat'], price: 180, image: '', description: 'Salámová' },
  { id: 3, name: 'Diavola', category: ['spicy', 'meat'], price: 170, image: '', description: 'Pálivá' },
];

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePizzas).mockReturnValue({
      pizzas: mockPizzas as any,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('should render all pizzas initially', () => {
    vi.mocked(useSearch).mockReturnValue({ searchQuery: '', setSearchQuery: vi.fn() });
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Margherita')).toBeDefined();
    expect(screen.getByText('Salami')).toBeDefined();
    expect(screen.getByText('Diavola')).toBeDefined();
  });

  it('should filter pizzas by category when a filter button is clicked', () => {
    vi.mocked(useSearch).mockReturnValue({ searchQuery: '', setSearchQuery: vi.fn() });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const meatFilterBtn = screen.getByRole('button', { name: /Masové/i });
    fireEvent.click(meatFilterBtn);

    expect(screen.queryByText('Margherita')).toBeNull();
    expect(screen.getByText('Salami')).toBeDefined();
    expect(screen.getByText('Diavola')).toBeDefined();
  });

  it('should filter pizzas by search query (ignoring diacritics and case)', () => {
    // Test: Hledáme "dia" -> Diavola
    vi.mocked(useSearch).mockReturnValue({ searchQuery: 'dia', setSearchQuery: vi.fn() });

    const { rerender } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.queryByText('Margherita')).toBeNull();
    expect(screen.getByText('Diavola')).toBeDefined();

    // Test: Hledáme "šalámi" (diakritika + jiné case) -> Salami
    vi.mocked(useSearch).mockReturnValue({ searchQuery: 'ŠALÁMI', setSearchQuery: vi.fn() });
    
    rerender(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Salami')).toBeDefined();
    expect(screen.queryByText('Diavola')).toBeNull();
  });
});