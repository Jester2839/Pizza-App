// =========================================
// DETAIL PAGE - PIZZA CONFIGURATION
// =========================================

import { byId, $, toggleClass, hasClass, replaceClass, setText, exposeGlobal } from './lib/dom';

let basePrice = 181;
let currentPrice = basePrice;

/**
 * Přepíná výběr přísady a aktualizuje celkovou cenu
 */
export function toggleIng(element: HTMLElement, price: number): void {
  const priceDisplay = byId('totalPriceDisplay');
  if (!priceDisplay) return;

  toggleClass(element, 'selected');
  const icon = $<HTMLElement>('i', element);
  if (!icon) return;

  if (hasClass(element, 'selected')) {
    currentPrice += price;
    replaceClass(icon, 'ph-plus', 'ph-trash');
  } else {
    currentPrice -= price;
    replaceClass(icon, 'ph-trash', 'ph-plus');
  }
  setText(priceDisplay, `${currentPrice},-`);
}

// Export pro globální použití v HTML
exposeGlobal('toggleIng', toggleIng);
