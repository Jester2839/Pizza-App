// =========================================
// CART PAGE - KOŠÍK FUNCTIONS
// =========================================

import { $, byId, closest, setText, toggleClass, fadeOutAndRemove, exposeGlobal } from './lib/dom';

/**
 * Aktualizuje počet kusů položky v košíku
 */
export function updateQty(btn: HTMLButtonElement, change: number): void {
  const qtySpan = $<HTMLSpanElement>('.qty-number', btn.parentElement!);
  if (!qtySpan) return;

  const currentQty = parseInt(qtySpan.innerText);
  const newQty = currentQty + change;

  if (newQty >= 1) {
    setText(qtySpan, newQty.toString());
  }
}

/**
 * Odstraní položku z košíku s animací
 */
export function removeItem(btn: HTMLButtonElement): void {
  const item = closest(btn, '.cart-item');
  fadeOutAndRemove(item);
}

/**
 * Zobrazí/skryje vstupní pole pro slevový kód
 */
export function togglePromo(): void {
  toggleClass(byId('promoWrapper'), 'active');
}

// Export pro globální použití v HTML
exposeGlobal('updateQty', updateQty);
exposeGlobal('removeItem', removeItem);
exposeGlobal('togglePromo', togglePromo);
