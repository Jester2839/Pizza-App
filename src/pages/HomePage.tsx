import { useState } from 'react';
import { PizzaCard } from '../components/PizzaCard';
import { pizzas } from '../data/pizzas';
import type { PizzaCategory } from '../types';

type FilterType = 'all' | PizzaCategory;

const filters: { label: string; value: FilterType }[] = [
  { label: 'Vše', value: 'all' },
  { label: 'Oblíbené', value: 'favorite' },
  { label: 'Masové', value: 'meat' },
  { label: 'Pikantní', value: 'spicy' },
  { label: 'Vegetariánské', value: 'vegetarian' },
];

export function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredPizzas = activeFilter === 'all'
    ? pizzas
    : pizzas.filter((pizza) => pizza.category.includes(activeFilter));

  return (
    <>
      <section className="hero">
        <h1>Gurmánský zážitek bez kompromisů</h1>
        <p>Prvotřídní suroviny s certifikací původu, italská tradice a řemeslná vášeň v každém kousku.</p>
      </section>

      <section className="menu-header">
        <div className="menu-title-wrapper">
          <h2>Naše nabídka</h2>
          <div className="menu-subtitle">TRADIČNÍ NEAPOLSKÁ RECEPTURA • 32 CM</div>
        </div>

        <div className="filters-container">
          <div className="filters">
            {filters.map((filter) => (
              <button
                key={filter.value}
                className={`filter-btn ${activeFilter === filter.value ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="grid-container">
        {filteredPizzas.map((pizza) => (
          <PizzaCard key={pizza.id} pizza={pizza} />
        ))}
      </main>
    </>
  );
}
