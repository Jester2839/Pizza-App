// =========================================
// KONFIGURAČNÍ MOŽNOSTI PIZZY
// =========================================

export interface Dough {
  id: string;
  name: string;
  price: number;
}

export interface Base {
  id: string;
  name: string;
  price: number;
}

export interface Edge {
  id: string;
  name: string;
  displayName: string;
  price: number;
}

// ==========================================
// TĚSTA
// ==========================================
export const doughs: Dough[] = [
  { id: 'classic', name: 'Klasické těsto', price: 0 },
  { id: 'wholewheat', name: 'Celozrnné těsto', price: 10 },
];

// ==========================================
// ZÁKLADY (OMÁČKY)
// ==========================================
export const bases: Base[] = [
  { id: 'tomato', name: 'Rajčatová omáčka', price: 0 },
  { id: 'cream', name: 'Smetanový základ', price: 0 },
  { id: 'BBQ', name: 'BBQ omáčka', price: 5 },
];

// ==========================================
// OKRAJE
// ==========================================
export const edges: Edge[] = [
  { id: 'classic', name: 'Klasický okraj', displayName: 'Klasický okraj', price: 0 },
  { id: 'cheese', name: 'Sýrový okraj', displayName: 'Sýrový okraj (+40,-)', price: 30 },
  { id: 'sausage', name: 'Párkový okraj', displayName: 'Párkový okraj (+50,-)', price: 50 },
];

// ==========================================
// POMOCNÉ FUNKCE
// ==========================================
export function getDefaultDough(): Dough | undefined {
  return doughs.find((d) => d.id === 'classic');
}

export function getDefaultBase(): Base | undefined {
  return bases.find((b) => b.id === 'tomato');
}

export function getDefaultEdge(): Edge | undefined {
  return edges.find((e) => e.id === 'classic');
}

export function getEdgeById(id: string): Edge | undefined {
  return edges.find((e) => e.id === id);
}