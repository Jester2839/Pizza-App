// =========================================
// MAIN ENTRY POINT
// =========================================

import '../scss/main.scss';

// Import funkcí pro jednotlivé stránky
import './detail';
import './cart';
import { pizzas } from './data/pizzas';
import { renderPizzaGrid } from './components/PizzaCard';
import { $, exposeGlobal, navigateTo } from './lib/dom';

console.log('🍕 Pizza App loaded successfully!');

// Globální funkce pro přidání do košíku
exposeGlobal('addToCart', (id: string) => {
  console.log(`Přidávám pizzu ${id} do košíku`);
  navigateTo('kosik.html');
});

// Detekce stránky a inicializace relevantních funkcí
const currentPage = window.location.pathname.split('/').pop();

if (currentPage === 'detail.html') {
  console.log('📋 Detail page initialized');
} else if (currentPage === 'kosik.html') {
  console.log('🛒 Cart page initialized');
} else {
  console.log('🏠 Home page initialized');
  
  // Render pizza grid on home page
  const gridContainer = $<HTMLElement>('.grid-container');
  if (gridContainer) {
    renderPizzaGrid(pizzas, gridContainer);
  }
}
