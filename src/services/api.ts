// =========================================
// API SERVIS PRO KOMUNIKACI S PHP BACKENDEM
// =========================================

import type { Pizza, Order, OrderStatus, Ingredient } from '../types';
import type { Dough, Base, Edge } from '../types';

// Základní URL API – PHP soubory jsou na https://b2024novyja.delta-www.cz/api/
const API_BASE_URL = 'https://b2024novyja.delta-www.cz/api';

// Klíče pro sessionStorage
const STORAGE_KEYS = {
  PIZZAS: 'pizza_app_pizzas',
  INGREDIENTS: 'pizza_app_ingredients',
  OPTIONS: 'pizza_app_options',
  ORDERS: 'pizza_app_admin_orders',
};

const ADMIN_TOKEN = 'MojeSuperTajneHesloPizzerie2026';
const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  'X-Admin-Token': ADMIN_TOKEN,
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
  const cachedPizzas = getFromStorage<Pizza[]>(STORAGE_KEYS.PIZZAS);
  if (cachedPizzas) return cachedPizzas;

  try {
    const response = await fetch(`${API_BASE_URL}/pizzas/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const pizzas: Pizza[] = data.map((pizza: any) => ({
      id: Number(pizza.id),
      code: pizza.code,
      name: pizza.name,
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
      name: pizzaData.name,
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

export interface IngredientCategoryGroup {
  category: string;
  items: Ingredient[];
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
      headers: ADMIN_HEADERS,
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
      headers: ADMIN_HEADERS,
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
      headers: ADMIN_HEADERS,
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
