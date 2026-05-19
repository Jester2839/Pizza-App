# Pizza App - Dokumentace projektu

## Přehled

**PizzAllettante** je moderní webová aplikace pro objednávání pizzy, postavená na React + TypeScript + Vite.

## Technologie

| Technologie | Verze | Účel |
|-------------|-------|------|
| React | 18.x | UI framework |
| React Router | 6.x | Routing (SPA) |
| TypeScript | 5.x | Typová bezpečnost |
| Vite | 5.x | Build nástroj |
| SCSS | - | Stylování |

## Struktura projektu

```
src/
├── App.tsx                 # Hlavní komponenta + definice routes
├── main.tsx                # React entry point, providery
├── index.html              # Jediný HTML soubor (SPA)
│
├── components/             # Znovupoužitelné UI komponenty
│   ├── Layout.tsx          # Wrapper s Header + Footer
│   ├── Header.tsx          # Navigace, logo, cart badge
│   ├── Footer.tsx          # Patička
│   ├── PizzaCard.tsx       # Karta pizzy v mřížce
│   └── QuantitySelector.tsx # +/- tlačítka pro množství
│
├── pages/                  # Stránkové komponenty
│   ├── HomePage.tsx        # Seznam pizz s filtry
│   ├── DetailPage.tsx      # Konfigurátor pizzy
│   └── CartPage.tsx        # Košík a shrnutí
│
├── hooks/                  # React hooks
│   └── useCart.tsx         # Cart context + provider
│
├── data/                   # Statická data
│   ├── pizzas.ts           # Definice pizz
│   └── ingredients.ts      # Extra ingredience
│
├── types/                  # TypeScript typy
│   └── index.ts            # Pizza, CartItem, atd.
│
└── scss/                   # Styly
    ├── main.scss           # Hlavní vstupní soubor
    ├── _variables.scss     # Barvy, fonty, breakpointy
    ├── _mixins.scss        # SCSS mixiny
    ├── _base.scss          # Reset, základní styly
    ├── _header.scss        # Header styly
    ├── _hero.scss          # Hero sekce
    ├── _cards.scss         # Pizza karty
    ├── _detail.scss        # Detail stránka
    ├── _cart.scss          # Košík
    └── _footer.scss        # Patička
```

## Routing

| Cesta | Komponenta | Popis |
|-------|------------|-------|
| `/` | `HomePage` | Hlavní stránka s nabídkou pizz |
| `/detail/:id` | `DetailPage` | Konfigurace konkrétní pizzy |
| `/kosik` | `CartPage` | Nákupní košík |

## State Management

Aplikace používá **React Context** pro správu košíku:

```tsx
// Použití v komponentě
import { useCart } from '../hooks/useCart';

function MyComponent() {
  const { items, addItem, removeItem, updateQuantity, total, itemCount } = useCart();
  // ...
}
```

### Cart Context API

| Metoda | Popis |
|--------|-------|
| `items` | Pole položek v košíku |
| `itemCount` | Celkový počet kusů |
| `total` | Celková cena |
| `addItem(item)` | Přidá položku do košíku |
| `removeItem(id)` | Odstraní položku |
| `updateQuantity(id, qty)` | Změní množství |
| `clearCart()` | Vyprázdní košík |

## Datové typy

```typescript
interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: PizzaCategory[];
}

type PizzaCategory = 'favorite' | 'meat' | 'spicy' | 'vegetarian';

interface CartItem {
  id: string;
  pizzaId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  dough?: string;
  base?: string;
  edge?: string;
  extras?: string[];
}
```

## Skripty

```bash
npm run dev       # Spustí dev server
npm run build     # Produkční build
npm run preview   # Náhled produkčního buildu
npm run lint      # ESLint kontrola
npm run format    # Prettier formátování
```

## Konfigurace

### Vite (`vite.config.ts`)
- React plugin
- SCSS preprocessing s globálními proměnnými
- Path aliasy (`@components`, `@pages`, `@data`, atd.)

### TypeScript (`tsconfig.json`)
- Strict mode
- JSX: `react-jsx`
- Path mapping pro aliasy
