import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import AdminIngredientsPage from './AdminIngredientsPage';
import { 
  fetchIngredients, 
  createIngredient, 
  fetchPizzaOptions, 
  deleteIngredient,
  updateIngredient
} from '../services/api';
import { ModalProvider } from '../hooks/useAlert';
// import React from 'react';

// Mockování API služeb
vi.mock('../services/api', () => ({
  fetchIngredients: vi.fn(),
  createIngredient: vi.fn(),
  updateIngredient: vi.fn(),
  deleteIngredient: vi.fn(),
  fetchPizzaOptions: vi.fn(),
  createPizzaOption: vi.fn(),
  updatePizzaOption: vi.fn(),
  deletePizzaOption: vi.fn(),
}));

const mockIngredients = [
  {
    category: 'MASO',
    items: [{ id: 1, name: 'Šunka', price: 30, category: 'MASO' }]
  }
];

const mockOptions = {
  doughs: [{ id: 1, name: 'Klasické', price: 0, code: 'classic' }],
  bases: [{ id: 1, name: 'Rajčatový', price: 0, code: 'tomato' }],
  edges: [{ id: 1, displayName: 'Klasický', price: 0, code: 'classic' }]
};

describe('AdminIngredientsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchIngredients as any).mockResolvedValue(mockIngredients);
    (fetchPizzaOptions as any).mockResolvedValue(mockOptions);
  });

  const renderIngredients = () => render(
    <ModalProvider>
      <AdminIngredientsPage />
    </ModalProvider>
  );

  it('should render ingredients and pizza options', async () => {
    renderIngredients();
    expect(await screen.findByText('Šunka')).toBeDefined();
    expect(await screen.findByText('Klasické')).toBeDefined();
    expect(await screen.findByText('Rajčatový')).toBeDefined();
  });

  it('should automatically generate slug code when adding new ingredient', async () => {
    renderIngredients();
    await screen.findByText('Šunka');

    // Cílíme pouze na tlačítko v sekci ingrediencí
    const ingredientsGrid = screen.getByText(/Extra Ingredience/i).closest('section')!;
    fireEvent.click(within(ingredientsGrid).getByText(/Přidat ingredienci/i));

    const nameInput = screen.getByLabelText(/Název:/i);
    fireEvent.change(nameInput, { target: { value: 'Extra Slanina' } });
    
    const priceInput = screen.getByLabelText(/Cena \(Kč\):/i);
    fireEvent.change(priceInput, { target: { value: '45' } });

    fireEvent.click(screen.getByText(/Uložit/i));

    await waitFor(() => {
      expect(createIngredient).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Extra Slanina',
        code: 'extra-slanina',
        price: 45
      }));
    });
  });

  it('should call update API when editing an ingredient', async () => {
    renderIngredients();
    await screen.findByText('Šunka');

    // Najdeme tlačítko "Upravit" specificky v sekci ingrediencí
    const ingredientsGrid = screen.getByText(/Extra Ingredience/i).closest('section')!;
    const editBtn = within(ingredientsGrid).getAllByTitle('Upravit')[0];
    fireEvent.click(editBtn);

    const priceInput = screen.getByLabelText(/Cena \(Kč\):/i);
    fireEvent.change(priceInput, { target: { value: '35' } });

    fireEvent.click(screen.getByText(/Uložit/i));

    await waitFor(() => {
      expect(updateIngredient).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        price: 35
      }));
    });
  });

  it('should show confirmation and handle deletion', async () => {
    renderIngredients();
    await screen.findByText('Šunka');

    // Najdeme tlačítko "Smazat" specificky v sekci ingrediencí
    const ingredientsGrid = screen.getByText(/Extra Ingredience/i).closest('section')!;
    const deleteBtn = within(ingredientsGrid).getAllByTitle('Smazat')[0];
    fireEvent.click(deleteBtn);

    expect(screen.getByText(/Opravdu chcete smazat položku/i)).toBeDefined();
    
    const confirmBtn = screen.getAllByRole('button', { name: /^Smazat$/i }).find(btn => btn.textContent === 'Smazat')!;
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteIngredient).toHaveBeenCalledWith(1);
    });
  });

  it('should show specialized error message when ingredient is used in orders', async () => {
    // Simulace chyby cizího klíče (MySQL error 1451)
    (deleteIngredient as any).mockRejectedValueOnce(new Error('Error: 1451 Cannot delete or update a parent row'));
    
    renderIngredients();
    await screen.findByText('Šunka');

    // Najdeme tlačítko "Smazat" specificky v sekci ingrediencí
    const ingredientsGrid = screen.getByText(/Extra Ingredience/i).closest('section')!;
    const deleteBtn = within(ingredientsGrid).getAllByTitle('Smazat')[0];
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getAllByRole('button', { name: /^Smazat$/i }).find(btn => btn.textContent === 'Smazat')!;
    fireEvent.click(confirmBtn);

    // Měl by se objevit alert s vysvětlujícím textem z tvého catch bloku
    expect(await screen.findByText(/Tuto ingredienci nelze smazat, protože je součástí existujících objednávek/i)).toBeDefined();
  });

  it('should refresh data when refresh button is clicked', async () => {
    renderIngredients();
    fireEvent.click(await screen.findByText(/Aktualizovat/i));
    expect(fetchIngredients).toHaveBeenCalledTimes(2); // Jednou při mountu, podruhé při kliku
  });
});