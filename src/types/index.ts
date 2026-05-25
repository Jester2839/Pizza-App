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
  extraIds?: string[];
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

export interface Coupon {
  id_coupons: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  is_active: '0' | '1';
  created_at: string;
}

// =========================================
// TYPY PRO ADMINSTRACI
// =========================================

export type OrderStatus = 'přijato' | 'v přípravě' | 'hotovo' | 'doručeno' | 'zrušeno';

export interface OrderExtraIngredient {
  id_ingredients: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id_order_items?: string;
  id_pizzas?: string;
  pizza_name: string;
  id_doughs?: string;
  dough_name?: string;
  id_edges?: string;
  edge_name?: string;
  quantity?: number;
  price_per_unit?: number;
  extra_ingredients?: OrderExtraIngredient[];
}

export interface Order {
  id_orders: string;
  customer_name?: string;
  phone?: string;
  address?: string;
  total_price?: number;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}
