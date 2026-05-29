import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';
import { SearchProvider } from '../hooks/useSearch';
import React from 'react';

describe('SearchBar Component', () => {
  const renderSearchBar = () => render(
    <SearchProvider>
      <SearchBar />
    </SearchProvider>
  );

  it('should toggle input visibility when clicking the search icon', () => {
    renderSearchBar();
    
    const icon = screen.getByTitle('Vyhledat');
    fireEvent.click(icon);

    const container = icon.closest('.search-bar-container');
    expect(container?.classList.contains('open')).toBe(true);
    expect(screen.getByPlaceholderText(/Hledat pizzu/i)).toBeDefined();
  });

  it('should clear the search query when clicking the clear button', () => {
    renderSearchBar();
    
    // Otevřít a napsat text
    fireEvent.click(screen.getByTitle('Vyhledat'));
    const input = screen.getByPlaceholderText(/Hledat pizzu/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Margherita' } });
    expect(input.value).toBe('Margherita');

    // Kliknout na křížek
    const clearBtn = screen.getByLabelText('Vymazat hledání');
    fireEvent.click(clearBtn);
    
    expect(input.value).toBe('');
  });

  it('should keep focus on input after clearing', () => {
    renderSearchBar();
    fireEvent.click(screen.getByTitle('Vyhledat'));
    const input = screen.getByPlaceholderText(/Hledat pizzu/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    
    fireEvent.click(screen.getByLabelText('Vymazat hledání'));
    expect(document.activeElement).toBe(input);
  });
});