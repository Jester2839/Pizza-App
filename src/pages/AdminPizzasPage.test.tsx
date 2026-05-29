import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPizzasPage from './AdminPizzasPage';
import { fetchPizzas, createPizza, updatePizza, deletePizza, fetchPizzaOptions } from '../services/api';
import { ModalProvider } from '../hooks/useAlert';
// import React from 'react';

// Mockování API služeb
vi.mock('../services/api', () => ({
  fetchPizzas: vi.fn(),
  createPizza: vi.fn(),
  updatePizza: vi.fn(),
  deletePizza: vi.fn(),
  fetchPizzaOptions: vi.fn(),
}));

const mockPizzas = [
  { id: 1, name: 'Margherita', description: 'Klasika', price: 150, image: 'marge.png', category: ['vegetarian'], defaultBaseId: 1 },
];

const mockBases = [
  { id: 1, name: 'Rajčatový', price: 0, code: 'tomato' },
];

describe('AdminPizzasPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchPizzas as any).mockResolvedValue(mockPizzas);
    (fetchPizzaOptions as any).mockResolvedValue({ bases: mockBases });
  });

  const renderAdminPizzas = () => render(
    <ModalProvider>
      <AdminPizzasPage />
    </ModalProvider>
  );

  it('should render the list of pizzas from API', async () => {
    renderAdminPizzas();
    expect(await screen.findByText('Margherita')).toBeDefined();
  });

  it('should generate correct slug code when creating a new pizza', async () => {
    (createPizza as any).mockResolvedValue({ ...mockPizzas[0], id: 2, name: 'Speciální Pizza', code: 'specialni-pizza' });
    renderAdminPizzas();

    // Počkat na načtení úvodních dat (zajistí, že bases jsou v selectu)
    await screen.findByText('Margherita');

    // Otevřít modál
    fireEvent.click(screen.getByText(/Přidat pizzu/i));

    // Vyplnit formulář
    fireEvent.change(screen.getByLabelText(/Název:/i), { target: { value: 'Speciální Pizza', name: 'name' } });
    fireEvent.change(screen.getByLabelText(/Složení:/i), { target: { value: 'Složení', name: 'description' } });
    fireEvent.change(screen.getByLabelText(/Cena \(Kč\):/i), { target: { value: '200', name: 'price' } });
    fireEvent.change(screen.getByLabelText(/Výchozí základ:/i), { target: { value: 'tomato', name: 'default_base_code' } });

    fireEvent.click(screen.getByText(/Uložit/i));

    await waitFor(() => {
      // Ověřujeme, že se zavolalo createPizza s automaticky vygenerovaným kódem
      expect(createPizza).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Speciální Pizza',
        code: 'specialni-pizza' // Testujeme tvou logiku normalize().replace()...
      }));
    });
  });

  it('should call update API when editing a pizza', async () => {
    (updatePizza as any).mockResolvedValue({ ...mockPizzas[0], name: 'Upravená Margherita' });
    renderAdminPizzas();

    const editBtn = await screen.findByText(/Upravit/i);
    fireEvent.click(editBtn);

    fireEvent.change(screen.getByLabelText(/Název:/i), { target: { value: 'Upravená Margherita', name: 'name' } });
    fireEvent.click(screen.getByText(/Uložit/i));

    await waitFor(() => {
      expect(updatePizza).toHaveBeenCalled();
    });
  });

  it('should show confirmation modal and call delete API', async () => {
    renderAdminPizzas();
    await screen.findByText('Margherita');
    
    const deleteBtn = screen.getByLabelText(/Smazat pizzu/i);
    fireEvent.click(deleteBtn);

    expect(screen.getByText(/Opravdu chcete smazat tuto pizzu/i)).toBeDefined();

    const confirmBtn = screen.getByRole('button', { name: /^Smazat$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deletePizza).toHaveBeenCalledWith(1);
    });
  });
});