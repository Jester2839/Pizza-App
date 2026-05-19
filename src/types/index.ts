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
  base?: string;
  edge?: string;
  extras?: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  category: IngredientCategory;
}

export type IngredientCategory = 'cheese' | 'meat' | 'vegetable' | 'dip';
