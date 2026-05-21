// =========================================
// API SERVIS PRO KOMUNIKACI S PHP BACKENDEM
// =========================================

import type { Pizza } from '../types';
import type { Dough, Base, Edge } from '../data/pizzaOptions';
import type { IngredientCategory } from '../data/ingredients';

// Základní URL API – PHP soubory jsou na https://b2024novyja.delta-www.cz/api/
const API_BASE_URL = 'https://b2024novyja.delta-www.cz/api';

// Klíče pro sessionStorage
const STORAGE_KEYS = {
  PIZZAS: 'pizza_app_pizzas',
  INGREDIENTS: 'pizza_app_ingredients',
  OPTIONS: 'pizza_app_options',
};

// Pomocné funkce pro práci se sessionStorage
function getFromStorage<T>(key: string): T | null {
  const data = sessionStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Chyba při parsování dat z sessionStorage pro klíč ${key}:`, e);
    return null;
  }
}

function setToStorage<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Chyba při ukládání dat do sessionStorage pro klíč ${key}:`, e);
  }
}

// ==========================================
// PIZZAS API
// ==========================================

/**
 * Načte všechny pizzy z API (/api/pizzas/) s využitím cache
 */
export async function fetchPizzas(): Promise<Pizza[]> {
  // Nejdříve zkusíme načíst z cache
  const cachedPizzas = getFromStorage<Pizza[]>(STORAGE_KEYS.PIZZAS);
  if (cachedPizzas) {
    return cachedPizzas;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pizzas/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const pizzas = data.map((pizza: any) => ({
      id: pizza.id?.toString(),
      name: pizza.name,
      description: pizza.description ?? '',
      price: pizza.price ?? 0,
      image: pizza.image ?? 'pizza.png',
      category: pizza.category ?? ['meat'],
      defaultBaseId: pizza.defaultBaseId ?? 'tomato',
    }));

    // Uložíme do cache
    setToStorage(STORAGE_KEYS.PIZZAS, pizzas);
    
    return pizzas;
  } catch (error) {
    console.error('Error fetching pizzas:', error);
    throw error;
  }
}

/**
 * Načte detail pizzy podle ID (primárně z cache)
 */
export async function fetchPizzaById(id: string): Promise<Pizza | null> {
  // Zkusíme najít v cache
  const cachedPizzas = getFromStorage<Pizza[]>(STORAGE_KEYS.PIZZAS);
  if (cachedPizzas) {
    const pizza = cachedPizzas.find(p => p.id === id);
    if (pizza) return pizza;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pizzas/?id=${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Pizza nebyla nalezena, to je v pořádku
      }
      throw new Error(`HTTP error! status: ${response.status}`); // Ostatní chyby vyhodíme
    }
    const pizzaData = await response.json();
    return {
      id: pizzaData.id?.toString(),
      name: pizzaData.name,
      description: pizzaData.description ?? '',
      price: pizzaData.price ?? 0,
      image: pizzaData.image ?? 'pizza.png',
      category: pizzaData.category ?? ['meat'],
      defaultBaseId: pizzaData.defaultBaseId ?? 'tomato',
    };
  } catch (error) {
    console.error(`Error fetching pizza ${id}:`, error);
    // Zde vyhodíme chybu, aby ji volající mohl zpracovat
    throw error;;
  }
}

// ==========================================
// INGREDIENTS API
// ==========================================

/**
 * Načte všechny ingredience z API (/api/ingredients/) s využitím cache
 */
export async function fetchIngredients(): Promise<IngredientCategory[]> {
  // Nejdříve zkusíme cache
  const cachedIngredients = getFromStorage<IngredientCategory[]>(STORAGE_KEYS.INGREDIENTS);
  if (cachedIngredients) {
    return cachedIngredients;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ingredients/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const ingredients = data.map((category: any) => ({
      category: category.category ?? 'Ostatní',
      items: (category.items ?? []).map((item: any) => ({
        id: item.id?.toString(),
        name: item.name,
        price: item.price ?? 0,
      })),
    }));

    // Uložíme do cache
    setToStorage(STORAGE_KEYS.INGREDIENTS, ingredients);

    return ingredients;
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

// Promise pro deduplikaci souběžných volání fetchPizzaOptions
let pizzaOptionsFetchPromise: Promise<PizzaOptionsData> | null = null;

/**
 * Načte všechny pizza options z API (/api/pizzaOptions/) s využitím cache a deduplikace
 */
export async function fetchPizzaOptions(): Promise<PizzaOptionsData> {
  // 1. Pokud právě probíhá fetch, vrať existující promise (deduplikace souběžných volání)
  if (pizzaOptionsFetchPromise) {
    return pizzaOptionsFetchPromise;
  }
  
  // 2. Nejdříve zkusíme načíst z sessionStorage
  const cachedOptions = getFromStorage<PizzaOptionsData>(STORAGE_KEYS.OPTIONS);
  if (cachedOptions) {
    return cachedOptions;
  }

  // 3. Vytvoř nový fetch a ulož promise, aby se zabránilo dalším souběžným voláním
  pizzaOptionsFetchPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pizzaOptions/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const options = {
        doughs: (data.doughs ?? []).map((d: any) => ({ id: d.id?.toString(), name: d.name, price: d.price ?? 0, })),
        bases: (data.bases ?? []).map((b: any) => ({ id: b.id?.toString(), name: b.name, price: b.price ?? 0, })),
        edges: (data.edges ?? []).map((e: any) => ({ id: e.id?.toString(), name: e.name, displayName: e.displayName ?? e.name, price: e.price ?? 0, })),
      };

      // Uložíme do cache
      setToStorage(STORAGE_KEYS.OPTIONS, options);

      return options;
    } catch (error) {
      pizzaOptionsFetchPromise = null;
      console.error('Error fetching pizza options:', error);
      throw error;
    } finally {
      // Po dokončení (úspěch nebo chyba) vyčistíme promise, aby se mohl příště provést nový fetch
      pizzaOptionsFetchPromise = null;
    }
  })();
  
  return pizzaOptionsFetchPromise;
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

