import { useState, useRef, useEffect } from 'react';
import { PizzaCard } from '../components/PizzaCard';
import { usePizzas } from '../hooks/usePizzas';
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
  const { pizzas, loading, error } = usePizzas();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({});
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Aktualizuj pozici slideru při změně aktivního filtru
  useEffect(() => {
    if (activeButtonRef.current) {
      const button = activeButtonRef.current;
      const parent = button.parentElement;
      
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        
        setSliderStyle({
          left: buttonRect.left - parentRect.left + 'px',
          width: buttonRect.width + 'px',
          height: buttonRect.height + 'px',
        });
      }
    }
  }, [activeFilter]);

  // Aktualizuj slider při změně velikosti okna
  useEffect(() => {
    const handleResize = () => {
      if (activeButtonRef.current) {
        const button = activeButtonRef.current;
        const parent = button.parentElement;
        
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const buttonRect = button.getBoundingClientRect();
          
          setSliderStyle({
            left: buttonRect.left - parentRect.left + 'px',
            width: buttonRect.width + 'px',
            height: buttonRect.height + 'px',
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredPizzas = activeFilter === 'all'
    ? pizzas
    : pizzas.filter((pizza) => pizza.category.includes(activeFilter));

  // Loading stav
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍕</div>
          <p style={{ fontSize: '18px', color: '#666' }}>Načítám nabídku pizz...</p>
        </div>
      </div>
    );
  }

  // Error stav
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <p style={{ fontSize: '18px', color: '#b82132' }}>Nepodařilo se načíst pizzy.</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>{error}</p>
        </div>
      </div>
    );
  }

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
            {/* Animovaný slider pozadí */}
            <div 
              className="filter-slider"
              style={sliderStyle}
            />
            
            {filters.map((filter) => (
              <button
                key={filter.value}
                ref={activeFilter === filter.value ? activeButtonRef : null}
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
        {filteredPizzas.length > 0 ? (
          filteredPizzas.map((pizza) => (
            <PizzaCard key={pizza.id} pizza={pizza} />
          ))
        ) : (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px',
            color: '#666'
          }}>
            <p style={{ fontSize: '18px' }}>Žádné pizzy nenalezeny pro tuto kategorii.</p>
          </div>
        )}
      </main>
    </>
  );
}
