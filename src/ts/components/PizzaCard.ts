import type { Pizza } from '../types';

export function renderPizzaCard(pizza: Pizza): string {
  return `
    <div class="card" data-id="${pizza.id}" data-categories="${pizza.category.join(',')}" onclick="window.location.href='detail.html?id=${pizza.id}'">
      <button class="btn-edit" onclick="event.stopPropagation(); window.location.href='detail.html?id=${pizza.id}'" title="Upravit pizzu">
        <i class="ph ph-pencil-simple"></i>
      </button>
      
      <img src="${pizza.image}" alt="${pizza.name}" class="card-pizza-img">
      
      <h2 class="card-title">${pizza.name}</h2>
      <p class="card-description">${pizza.description}</p>
      <div class="card-price">${pizza.price},-</div>
      <button class="btn-add" onclick="event.stopPropagation(); addToCart('${pizza.id}')">
        <i class="ph ph-shopping-cart"></i>
        <span class="btn-text">Přidat do košíku</span>
      </button>
    </div>
  `;
}

export function renderPizzaGrid(pizzas: Pizza[], container: HTMLElement): void {
  container.innerHTML = pizzas.map(renderPizzaCard).join('');
}
