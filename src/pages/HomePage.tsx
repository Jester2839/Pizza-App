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
  const activeButtonRef = useRef<HTMLButtonElement>(null); // Ref pro aktivní tlačítko
  const filtersContainerRef = useRef<HTMLDivElement>(null); // Ref pro rodičovský kontejner tlačítek

  // Funkce pro aktualizaci pozice a velikosti slideru
  const updateSlider = () => {
    // Zkontrolujeme, zda jsou reference k dispozici
    if (activeButtonRef.current && filtersContainerRef.current) {
      const button = activeButtonRef.current;
      const parent = filtersContainerRef.current;
      
      const parentRect = parent.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      // Pokud má tlačítko nulovou šířku nebo výšku, pravděpodobně ještě není plně vykresleno.
      // V takovém případě slider skryjeme a počkáme na další pokus.
      if (buttonRect.width === 0 || buttonRect.height === 0) {
        setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
        return; 
      }

      // Nastavíme styl slideru, zajistíme viditelnost a plynulou animaci
      setSliderStyle({
        left: buttonRect.left - parentRect.left + 'px',
        width: buttonRect.width + 'px',
        height: buttonRect.height + 'px',
        opacity: 1, // Zajistíme viditelnost, jakmile jsou rozměry platné
        transition: 'left 0.3s ease, width 0.3s ease, height 0.3s ease, opacity 0.3s ease'
      });
    } else {
      // Pokud reference nejsou k dispozici, zajistíme, že slider je skrytý
      setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  // Efekt pro změnu aktivního filtru a počáteční načtení
  useEffect(() => {
    let animationFrameId: number;
    let timeoutId: number; // Změněno z NodeJS.Timeout na number
    let resizeObserver: ResizeObserver | null = null;

    const tryUpdate = () => {
      // Použijeme requestAnimationFrame pro zajištění, že se DOM vykreslí
      animationFrameId = requestAnimationFrame(() => {
        updateSlider();
        // Přidáme malý timeout jako záložní mechanismus pro pomalé vykreslování nebo načítání fontů
        timeoutId = setTimeout(updateSlider, 100);
      });
    };

    // Prvotní pokus o aktualizaci slideru
    tryUpdate();

    // Nastavíme ResizeObserver pro kontejner filtrů a aktivní tlačítko
    if (filtersContainerRef.current) {
      resizeObserver = new ResizeObserver(tryUpdate); // Znovu spustíme update při změně velikosti kontejneru
      resizeObserver.observe(filtersContainerRef.current);
      if (activeButtonRef.current) {
        resizeObserver.observe(activeButtonRef.current); // Sledujeme i samotné aktivní tlačítko
      }
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [activeFilter, loading]); // Znovu spustit, když se změní aktivní filtr nebo stav načítání (což může ovlivnit layout)

  // Aktualizuj slider při změně velikosti okna
  useEffect(() => {
    window.addEventListener('resize', updateSlider);
    window.addEventListener('load', updateSlider); // Důležité pro počáteční načtení po všech assetech
    
    return () => {
      window.removeEventListener('resize', updateSlider);
      window.removeEventListener('load', updateSlider);
    };
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

        <div className="filter-bar-outer-wrapper">
          <div className="filter-bar" ref={filtersContainerRef}>
            <div 
              className="filter-slider"
              style={sliderStyle}
            />
            <ul className="filter-list">
              {filters.map((filter) => (
                <li key={filter.value}>
                  <button
                    ref={activeFilter === filter.value ? activeButtonRef : null}
                    className={`filter-btn ${activeFilter === filter.value ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                </li>
              ))}
            </ul>
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
