# Migrace na React

Tento dokument popisuje migraci aplikace z vanilla TypeScript multi-page architektury na React Single Page Application.

## Výchozí stav (před migrací)

### Architektura
- **Multi-page aplikace** - samostatné HTML soubory pro každou stránku
- **Vanilla TypeScript** - žádný UI framework
- **DOM manipulace** - ruční práce s `document.querySelector`, `classList`, atd.
- **Template strings** - generování HTML pomocí template literals

### Struktura souborů (před)

```
src/
├── index.html          # Hlavní stránka
├── detail.html         # Detail pizzy
├── kosik.html          # Košík
└── ts/
    ├── main.ts         # Entry point
    ├── detail.ts       # Logika detailu
    ├── cart.ts         # Logika košíku
    ├── lib/
    │   └── dom.ts      # DOM utility knihovna
    ├── data/
    │   └── pizzas.ts   # Data pizz
    ├── components/
    │   └── PizzaCard.ts # Template string renderer
    └── types/
        └── index.ts    # TypeScript typy
```

### Problémy výchozího řešení
1. **Duplicitní kód** - header/footer v každém HTML souboru
2. **Globální funkce** - `window.toggleIng`, `window.updateQty` atd.
3. **Imperativní DOM** - ruční manipulace s elementy
4. **Žádný state management** - stav roztroušený v proměnných
5. **Reload při navigaci** - každá stránka = nový request

## Cílový stav (po migraci)

### Architektura
- **Single Page Application** - jeden HTML, React Router
- **React 18** - deklarativní UI
- **React Context** - centralizovaný state
- **JSX komponenty** - typově bezpečné, znovupoužitelné

### Struktura souborů (po)

```
src/
├── index.html          # Jediný HTML (SPA shell)
├── main.tsx            # React entry point
├── App.tsx             # Root komponenta + routes
├── components/         # UI komponenty
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PizzaCard.tsx
│   └── QuantitySelector.tsx
├── pages/              # Stránkové komponenty
│   ├── HomePage.tsx
│   ├── DetailPage.tsx
│   └── CartPage.tsx
├── hooks/
│   └── useCart.tsx     # Cart context
├── data/
│   ├── pizzas.ts
│   └── ingredients.ts
├── types/
│   └── index.ts
└── scss/               # Beze změn
```

## Kroky migrace

### 1. Instalace závislostí

```bash
npm install react react-dom react-router-dom
npm install -D @vitejs/plugin-react@4 @types/react @types/react-dom
```

### 2. Konfigurace Vite

```typescript
// vite.config.ts
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ...
});
```

### 3. Konfigurace TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    // ...
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

### 4. Vytvoření React entry pointu

```tsx
// main.tsx
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CartProvider } from './hooks/useCart';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <CartProvider>
      <App />
    </CartProvider>
  </BrowserRouter>
);
```

### 5. Konverze komponent

#### Před (template string):
```typescript
export function renderPizzaCard(pizza: Pizza): string {
  return `
    <div class="card" onclick="...">
      <h2 class="card-title">${pizza.name}</h2>
      ...
    </div>
  `;
}
```

#### Po (React komponenta):
```tsx
export function PizzaCard({ pizza }: { pizza: Pizza }) {
  const navigate = useNavigate();
  
  return (
    <div className="card" onClick={() => navigate(`/detail/${pizza.id}`)}>
      <h2 className="card-title">{pizza.name}</h2>
      ...
    </div>
  );
}
```

### 6. State management

#### Před (globální proměnné + DOM):
```typescript
let currentPrice = basePrice;

export function toggleIng(element: HTMLElement, price: number): void {
  element.classList.toggle('selected');
  currentPrice += price;
  document.getElementById('totalPriceDisplay')!.innerText = `${currentPrice},-`;
}
```

#### Po (React state):
```tsx
const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());

const toggleExtra = (extraId: string) => {
  setSelectedExtras(prev => {
    const next = new Set(prev);
    next.has(extraId) ? next.delete(extraId) : next.add(extraId);
    return next;
  });
};

// Cena se počítá automaticky z state
const totalPrice = pizza.price + extrasPrice;
```

### 7. Routing

#### Před (navigace):
```typescript
window.location.href = 'detail.html?id=margherita';
```

#### Po (React Router):
```tsx
const navigate = useNavigate();
navigate(`/detail/${pizza.id}`);

// App.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/detail/:id" element={<DetailPage />} />
  <Route path="/kosik" element={<CartPage />} />
</Routes>
```

## Výhody po migraci

| Aspekt | Před | Po |
|--------|------|-----|
| Navigace | Page reload | Instant (SPA) |
| State | Globální proměnné | React Context |
| UI updates | Ruční DOM | Automatický re-render |
| Komponenty | Template strings | Typované JSX |
| Znovupoužitelnost | Kopírování HTML | Import komponent |
| DX | Console debugging | React DevTools |

## Zpětná kompatibilita

- **SCSS styly** - beze změn, pouze přesunuty importy
- **Data** - `pizzas.ts` a typy zůstaly stejné
- **Obrázky** - cesty nezměněny (`/images/...`)

## Další kroky (doporučení)

1. **Lazy loading** - `React.lazy()` pro stránky
2. **Error boundaries** - graceful error handling
3. **Persistentní košík** - `localStorage` nebo backend API
4. **Unit testy** - React Testing Library
5. **Formuláře** - React Hook Form pro checkout
