// =========================================
// TYPY PRO PIZZA APP
// =========================================

export interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: PizzaCategory[];
  defaultBaseId?: string; // Výchozí základ pizzy (pokud není, použije se 'tomato')
}

export type PizzaCategory = 'favorite' | 'meat' | 'spicy' | 'vegetarian';

export interface CartItem {
  id: string;
  pizzaId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  dough?: string;
  doughId?: string;
  base?: string;
  baseId?: string;
  edge?: string;
  edgeId?: string;
  extras?: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  category: IngredientCategory;
}

export type IngredientCategory = 'cheese' | 'meat' | 'vegetable' | 'dip';

// =========================================
// TYPY PRO KONFIGURACI PIZZY (z pizzaOptions.ts)
// =========================================

export interface Dough {
  id: string;
  name: string;
  description?: string;
  price: number;
  isDefault?: boolean;
}

export interface Base {
  id: string;
  name: string;
  description?: string;
  price: number;
  isDefault?: boolean;
}

export interface Edge {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  isDefault?: boolean;
}
