// =========================================
// API SERVIS PRO KOMUNIKACI S PHP BACKENDEM
// =========================================

import type { Pizza } from '../types';
import type { Dough, Base, Edge } from '../data/pizzaOptions';
import type { IngredientCategory } from '../data/ingredients';

// Základní URL API – PHP soubory jsou na https://b2024novyja.delta-www.cz/api/
const API_BASE_URL = 'https://b2024novyja.delta-www.cz/api';

// ==========================================
// PIZZAS API
// ==========================================

/**
 * Načte všechny pizzy z API (/api/pizzas/)
 */
export async function fetchPizzas(): Promise<Pizza[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pizzas/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((pizza: any) => ({
      id: pizza.id?.toString(),
      name: pizza.name,
      description: pizza.description ?? '',
      price: pizza.price ?? 0,
      image: pizza.image ?? 'pizza.png',
      category: pizza.category ?? ['meat'],
      defaultBaseId: pizza.defaultBaseId ?? 'tomato',
    }));
  } catch (error) {
    console.error('Error fetching pizzas:', error);
    throw error;
  }
}

/**
 * Načte detail pizzy podle ID
 */
export async function fetchPizzaById(id: string): Promise<Pizza | null> {
  try {
    const pizzas = await fetchPizzas();
    return pizzas.find(p => p.id === id) ?? null;
  } catch (error) {
    console.error(`Error fetching pizza ${id}:`, error);
    return null;
  }
}

// ==========================================
// INGREDIENTS API
// ==========================================

/**
 * Načte všechny ingredience z API (/api/ingredients/)
 */
export async function fetchIngredients(): Promise<IngredientCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/ingredients/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((category: any) => ({
      category: category.category ?? 'Ostatní',
      items: (category.items ?? []).map((item: any) => ({
        id: item.id?.toString(),
        name: item.name,
        price: item.price ?? 0,
      })),
    }));
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    throw error;
  }
}

// ==========================================
// PIZZA OPTIONS API
// ==========================================

interface PizzaOptionsData {
  doughs: Dough[];
  bases: Base[];
  edges: Edge[];
}

/**
 * Načte všechny pizza options z API (/api/pizzaOptions/)
 */
export async function fetchPizzaOptions(): Promise<PizzaOptionsData> {
  try {
    const response = await fetch(`${API_BASE_URL}/pizzaOptions/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      doughs: (data.doughs ?? []).map((d: any) => ({
        id: d.id?.toString(),
        name: d.name,
        price: d.price ?? 0,
      })),
      bases: (data.bases ?? []).map((b: any) => ({
        id: b.id?.toString(),
        name: b.name,
        price: b.price ?? 0,
      })),
      edges: (data.edges ?? []).map((e: any) => ({
        id: e.id?.toString(),
        name: e.name,
        displayName: e.displayName ?? e.name,
        price: e.price ?? 0,
      })),
    };
  } catch (error) {
    console.error('Error fetching pizza options:', error);
    throw error;
  }
}

// ==========================================
// POMOCNÉ FUNKCE
// ==========================================

/**
 * Filtruje pizzy podle kategorie
 */
export function filterPizzasByCategory(
  pizzas: Pizza[], 
  category: 'all' | string
): Pizza[] {
  if (category === 'all') {
    return pizzas;
  }
  return pizzas.filter((pizza) => 
    pizza.category?.includes(category as any)
  );
}
