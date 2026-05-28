// =========================================
// API SERVIS PRO KOMUNIKACI S PHP BACKENDEM
// =========================================

import type {
  Pizza,
  Order,
  OrderStatus,
  Ingredient,
  IngredientCategoryGroup,
  Dough,
  Base,
  Edge,
} from '../types';

// Základní URL API – PHP soubory jsou na https://b2024novyja.delta-www.cz/api/
const API_BASE_URL = 'https://b2024novyja.delta-www.cz/api';

// Klíče pro sessionStorage
const STORAGE_KEYS = {
  PIZZAS: 'pizza_app_pizzas',
  INGREDIENTS: 'pizza_app_ingredients',
  OPTIONS: 'pizza_app_options',
  ORDERS: 'pizza_app_admin_orders',
};

const getAdminHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Token': sessionStorage.getItem('admin_token') || '',
  };
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

export async function login(username: string, password: string): Promise<{ role: string; token: string }> {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Přihlášení selhalo');
  }

  return response.json();
}

export async function createPizza(pizza: Omit<Pizza, 'id'>): Promise<Pizza> {
  try {
    const response = await fetch(`${API_BASE_URL}/pizzas/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(pizza),
    });
    if (!response.ok) throw new Error(`Chyba při vytváření pizzy! Status: ${response.status}`);
    const responseData = await response.json();

    // Backend vrací pouze { message: "...", id: "9" }, nikoliv celou pizzu.
    // Vytvoříme proto kompletní objekt z našich odeslaných dat a nového ID.
    const newPizza: Pizza = {
      ...pizza,
      id: Number(responseData.id),
    };

    const cachedPizzas = getFromStorage<Pizza[]>(STORAGE_KEYS.PIZZAS);
    if (cachedPizzas) {
      setToStorage(STORAGE_KEYS.PIZZAS, [...cachedPizzas, newPizza]);
    }
    return newPizza;
  } catch (error) {
    console.error('Error creating pizza:', error);
    throw error;
  }
}

export async function updatePizza(pizza: Pizza): Promise<Pizza> {
  try {
    // Náš objekt má vlastnost `id`, ale backend při UPDATE vyžaduje `id_pizzas`,
    // naprosto stejně jako to požaduje u funkce deletePizza.
    const payload: any = {
      ...pizza,
      id_pizzas: pizza.id,
    };

    // Pokud uživatel při editaci nezměnil select základu, hodnota default_base_code by chyběla.
    if (!payload.default_base_code && payload.defaultBaseId) {
      const options = await fetchPizzaOptions();
      const base = options.bases.find(b => b.id === payload.defaultBaseId);
      if (base) payload.default_base_code = base.code;
    }

    const response = await fetch(`${API_BASE_URL}/pizzas/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Chyba při aktualizaci pizzy! Status: ${response.status}`);
    // Backend při PUT pravděpodobně opět vrací jen zprávu,
    // použijeme proto pro aktualizaci stavu přímo data, která jsme odeslali.

    const cachedPizzas = getFromStorage<Pizza[]>(STORAGE_KEYS.PIZZAS);
    if (cachedPizzas) {
      const updatedPizzas = cachedPizzas.map(p => p.id === pizza.id ? pizza : p);
      setToStorage(STORAGE_KEYS.PIZZAS, updatedPizzas);
    }
    return pizza;
  } catch (error) {
    console.error(`Error updating pizza ${pizza.id}:`, error);
    throw error;
  }
}

export async function deletePizza(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/pizzas/`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
      body: JSON.stringify({ id_pizzas: id }),
    });
    if (!response.ok) throw new Error(`Chyba při mazání pizzy! Status: ${response.status}`);

    const cachedPizzas = getFromStorage<Pizza[]>(STORAGE_KEYS.PIZZAS);
    if (cachedPizzas) {
      const updatedPizzas = cachedPizzas.filter(p => p.id !== id);
      setToStorage(STORAGE_KEYS.PIZZAS, updatedPizzas);
    }
  } catch (error) {
    console.error(`Error deleting pizza ${id}:`, error);
    throw error;
  }
}

/**
 * Načte všechny pizzy z API (/api/pizzas/) s využitím cache
 */
export async function fetchPizzas(): Promise<Pizza[]> {
  const cachedPizzas = getFromStorage<Pizza[]>(STORAGE_KEYS.PIZZAS);
  if (cachedPizzas) return cachedPizzas;

  try {
    const response = await fetch(`${API_BASE_URL}/pizzas/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const pizzas: Pizza[] = data.map((pizza: any) => ({
      id: Number(pizza.id),
      code: pizza.code,
      name: pizza.name ?? '',
      description: pizza.description ?? '',
      price: Number(pizza.price ?? 0),
      image: pizza.image ?? 'pizza.png',
      category: pizza.category ?? ['meat'],
      defaultBaseId: pizza.defaultBaseId ? Number(pizza.defaultBaseId) : undefined,
    }));

    setToStorage(STORAGE_KEYS.PIZZAS, pizzas);
    return pizzas;
  } catch (error) {
    console.error('Error fetching pizzas:', error);
    throw error;
  }
}

/**
 * Načte detail pizzy podle ID
 */
export async function fetchPizzaById(id: number): Promise<Pizza | null> {
  const cachedPizzas = getFromStorage<Pizza[]>(STORAGE_KEYS.PIZZAS);
  if (cachedPizzas) {
    const pizza = cachedPizzas.find(p => p.id === id);
    if (pizza) return pizza;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pizzas/?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const pizzaData = await response.json();
    return {
      id: Number(pizzaData.id),
      code: pizzaData.code,
      name: pizzaData.name ?? '',
      description: pizzaData.description ?? '',
      price: Number(pizzaData.price ?? 0),
      image: pizzaData.image ?? 'pizza.png',
      category: pizzaData.category ?? ['meat'],
      defaultBaseId: pizzaData.defaultBaseId ? Number(pizzaData.defaultBaseId) : undefined,
    };
  } catch (error) {
    console.error(`Error fetching pizza ${id}:`, error);
    throw error;
  }
}

// ==========================================
// INGREDIENTS API
// ==========================================

/**
 * Vytvoří novou ingredienci.
 */
export async function createIngredient(ingredient: Omit<Ingredient, 'id'>): Promise<Ingredient> {
  try {
    const response = await fetch(`${API_BASE_URL}/ingredients/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(ingredient),
    });
    if (!response.ok) throw new Error(`Chyba při vytváření ingredience! Status: ${response.status}`);
    const responseData = await response.json();

    const newIngredient: Ingredient = {
      ...ingredient,
      id: Number(responseData.id),
    };

    const cachedIngredientGroups = getFromStorage<IngredientCategoryGroup[]>(STORAGE_KEYS.INGREDIENTS);
    if (cachedIngredientGroups) {
      const targetGroup = cachedIngredientGroups.find(group => group.category === newIngredient.category);
      if (targetGroup) {
        targetGroup.items.push(newIngredient);
      } else {
        cachedIngredientGroups.push({ category: newIngredient.category, items: [newIngredient] });
      }
      setToStorage(STORAGE_KEYS.INGREDIENTS, [...cachedIngredientGroups]);
    }
    return newIngredient;
  } catch (error) {
    console.error('Error creating ingredient:', error);
    throw error;
  }
}

/**
 * Aktualizuje existující ingredienci.
 */
export async function updateIngredient(ingredient: Ingredient): Promise<Ingredient> {
  try {
    const payload: any = {
      ...ingredient,
      id_ingredients: ingredient.id,
    };

    const response = await fetch(`${API_BASE_URL}/ingredients/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Chyba při aktualizaci ingredience! Status: ${response.status}`);

    const cachedIngredientGroups = getFromStorage<IngredientCategoryGroup[]>(STORAGE_KEYS.INGREDIENTS);
    if (cachedIngredientGroups) {
      const updatedGroups = cachedIngredientGroups.map(group => ({
        ...group,
        items: group.items.map(item => item.id === ingredient.id ? ingredient : item),
      }));
      setToStorage(STORAGE_KEYS.INGREDIENTS, updatedGroups);
    }
    return ingredient;
  } catch (error) {
    console.error(`Error updating ingredient ${ingredient.id}:`, error);
    throw error;
  }
}

/**
 * Smaže ingredienci podle ID.
 */
export async function deleteIngredient(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/ingredients/`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
      body: JSON.stringify({ id_ingredients: id }),
    });
    if (!response.ok) throw new Error(`Chyba při mazání ingredience! Status: ${response.status}`);

    const cachedIngredientGroups = getFromStorage<IngredientCategoryGroup[]>(STORAGE_KEYS.INGREDIENTS);
    if (cachedIngredientGroups) {
      const updatedGroups = cachedIngredientGroups.map(group => ({
        ...group,
        items: group.items.filter(item => item.id !== id),
      })).filter(group => group.items.length > 0);
      setToStorage(STORAGE_KEYS.INGREDIENTS, updatedGroups);
    }
  } catch (error) {
    console.error(`Error deleting ingredient ${id}:`, error);
    throw error;
  }
}

/**
 * Načte všechny ingredience z API
 */
export async function fetchIngredients(): Promise<IngredientCategoryGroup[]> {
  const cachedIngredients = getFromStorage<IngredientCategoryGroup[]>(STORAGE_KEYS.INGREDIENTS);
  if (cachedIngredients) return cachedIngredients;

  try {
    const response = await fetch(`${API_BASE_URL}/ingredients/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const ingredients: IngredientCategoryGroup[] = data.map((category: any) => ({
      category: category.category ?? 'Ostatní',
      items: (category.items ?? []).map((item: any) => ({
        id: Number(item.id),
        code: item.code,
        name: item.name,
        price: Number(item.price ?? 0),
        category: item.category,
      })),
    }));

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

let pizzaOptionsFetchPromise: Promise<PizzaOptionsData> | null = null;

/**
 * Vytvoří novou pizza option (těsto, základ, okraj).
 */
export async function createPizzaOption(option: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/pizzaOptions/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(option),
    });
    if (!response.ok) throw new Error(`Chyba při vytváření pizza option! Status: ${response.status}`);
    const responseData = await response.json();

    // Invalidujeme cache, aby se data znovu načetla z API
    sessionStorage.removeItem(STORAGE_KEYS.OPTIONS);
    
    return {
      ...option,
      id: Number(responseData.id),
    };
  } catch (error) {
    console.error('Error creating pizza option:', error);
    throw error;
  }
}

/**
 * Aktualizuje existující pizza option (těsto, základ, okraj).
 */
export async function updatePizzaOption(option: any): Promise<any> {
  try {
    // Backend nyní očekává payload přímo s 'id' a 'type',
    // jak bylo definováno v požadavcích.
    const payload = {
      ...option
    };

    const response = await fetch(`${API_BASE_URL}/pizzaOptions/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Chyba při aktualizaci pizza option! Status: ${response.status}`);

    // Aktualizace cache
    const optionId = Number(option.id);
    const cachedOptions = getFromStorage<PizzaOptionsData>(STORAGE_KEYS.OPTIONS);
    if (cachedOptions) {
      let updatedOptions = { ...cachedOptions };
      const findAndReplace = (list: any[]) => list.map(item => item.id === optionId ? { ...item, ...option } : item);

      if (option.type === 'doughs') {
        updatedOptions.doughs = findAndReplace(cachedOptions.doughs);
      } else if (option.type === 'bases') {
        updatedOptions.bases = findAndReplace(cachedOptions.bases);
      } else if (option.type === 'edges') {
        updatedOptions.edges = findAndReplace(cachedOptions.edges);
      }
      setToStorage(STORAGE_KEYS.OPTIONS, updatedOptions);
    }
    return option;
  } catch (error) {
    console.error(`Error updating pizza option ${option.id}:`, error);
    throw error;
  }
}

/**
 * Smaže pizza option (těsto, základ, okraj) podle ID.
 */
export async function deletePizzaOption(payload: { type: string, id: number }): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/pizzaOptions/`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Chyba při mazání pizza option! Status: ${response.status}`);

    // Aktualizace cache
    const cachedOptions = getFromStorage<PizzaOptionsData>(STORAGE_KEYS.OPTIONS);
    if (cachedOptions) {
      const updatedOptions = {
        doughs: cachedOptions.doughs.filter(d => d.id !== payload.id),
        bases: cachedOptions.bases.filter(b => b.id !== payload.id),
        edges: cachedOptions.edges.filter(e => e.id !== payload.id),
      };
      setToStorage(STORAGE_KEYS.OPTIONS, updatedOptions);
    }
  } catch (error) {
    console.error(`Error deleting pizza option ${payload.id}:`, error);
    throw error;
  }
}

export async function fetchPizzaOptions(): Promise<PizzaOptionsData> {
  if (pizzaOptionsFetchPromise) return pizzaOptionsFetchPromise;
  
  const cachedOptions = getFromStorage<PizzaOptionsData>(STORAGE_KEYS.OPTIONS);
  if (cachedOptions) return cachedOptions;

  pizzaOptionsFetchPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pizzaOptions/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const options: PizzaOptionsData = {
        doughs: (data.doughs ?? []).map((d: any) => ({ id: Number(d.id), code: d.code, name: d.name, price: Number(d.price ?? 0), })),
        bases: (data.bases ?? []).map((b: any) => ({ id: Number(b.id), code: b.code, name: b.name, price: Number(b.price ?? 0), })),
        edges: (data.edges ?? []).map((e: any) => ({ id: Number(e.id), code: e.code, name: e.name, displayName: e.displayName ?? e.name, price: Number(e.price ?? 0), })),
      };

      setToStorage(STORAGE_KEYS.OPTIONS, options);
      return options;
    } catch (error) {
      pizzaOptionsFetchPromise = null;
      console.error('Error fetching pizza options:', error);
      throw error;
    } finally {
      pizzaOptionsFetchPromise = null;
    }
  })();
  
  return pizzaOptionsFetchPromise;
}

// ==========================================
// POMOCNÉ FUNKCE
// ==========================================

export function filterPizzasByCategory(
  pizzas: Pizza[], 
  category: 'all' | string
): Pizza[] {
  if (category === 'all') return pizzas;
  return pizzas.filter((pizza) => pizza.category?.includes(category as any));
}

// ==========================================
// ADMIN ORDERS API
// ==========================================

export async function fetchOrders(forceRefresh = false): Promise<Order[]> {
  if (!forceRefresh) {
    const cachedOrders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS);
    if (cachedOrders) return cachedOrders;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
      headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error(`Chyba při načítání objednávek! Status: ${response.status}`);
    const orders = await response.json();
    setToStorage(STORAGE_KEYS.ORDERS, orders);
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ id_orders: orderId, status }),
    });
    if (!response.ok) throw new Error(`Chyba při aktualizaci stavu! Status: ${response.status}`);
    
    const cachedOrders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS);
    if (cachedOrders) {
      const updatedOrders = cachedOrders.map(order => 
        order.id_orders === orderId ? { ...order, status } : order
      );
      setToStorage(STORAGE_KEYS.ORDERS, updatedOrders);
    }
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
      body: JSON.stringify({ id_orders: orderId }),
    });
    if (!response.ok) throw new Error(`Chyba při mazání objednávky! Status: ${response.status}`);
    
    const cachedOrders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS);
    if (cachedOrders) {
      const updatedOrders = cachedOrders.filter(order => order.id_orders !== orderId);
      setToStorage(STORAGE_KEYS.ORDERS, updatedOrders);
    }
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    throw error;
  }
}
