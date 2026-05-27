// =========================================
// TYPY PRO PIZZA APP
// =========================================

export interface Pizza {
  id: number;
  code: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: PizzaCategory[];
  defaultBaseId?: number; // Výchozí základ pizzy
}

export type PizzaCategory = 'favorite' | 'meat' | 'spicy' | 'vegetarian';

export interface CartItem {
  id: string; // Unikátní ID položky v košíku (generované frontendem)
  pizzaId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  dough?: string;
  doughId?: number;
  base?: string;
  baseId?: number;
  edge?: string;
  edgeId?: number;
  extras?: string[];
  extraIds?: number[];
}

export interface Ingredient {
  id: number;
  code: string;
  name: string;
  price: number;
  category: IngredientCategory;
}

export type IngredientCategory = 'cheese' | 'meat' | 'vegetable' | 'dip' | 'other';

export interface IngredientCategoryGroup {
  category: string;
  items: Ingredient[];
}

// =========================================
// TYPY PRO KONFIGURACI PIZZY
// =========================================

export interface Dough {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
  isDefault?: boolean;
}

export interface Base {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
  isDefault?: boolean;
}

export interface Edge {
  id: number;
  code: string;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  isDefault?: boolean;
}

export type PizzaOption = Dough | Base | Edge;

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
  id_ingredients: number;
  name: string;
  price: number;
}

export interface OrderItem {
  id_order_items?: number;
  id_pizzas?: number;
  pizza_name: string;
  id_doughs?: number;
  dough_name?: string;
  id_bases?: number;
  base_name?: string;
  id_edges?: number;
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
