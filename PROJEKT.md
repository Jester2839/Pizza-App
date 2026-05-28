# Technická dokumentace - PizzAllettante

Tento dokument poskytuje hloubkový technický pohled na fungování aplikace PizzAllettante, její architekturu, datové modely a procesy.

## 1. Architektura aplikace

Aplikace je postavena jako **Single Page Application (SPA)** využívající knihovnu **React 18**. K sestavení a vývoji se používá **Vite**, který zajišťuje rychlý hot-reload a optimalizovaný build.

### Klíčové principy:
- **Deklarativní UI**: Rozhraní se mění automaticky na základě změn stavu (state).
- **Komponentová struktura**: Každá část UI (karta, tlačítko, navigace) je samostatná znovupoužitelná komponenta.
- **Typová bezpečnost**: Celý kód je napsán v **TypeScriptu**, což eliminuje chyby při předávání dat.

## 2. Technický Stack

- **Frontend**: React 18, React Router 6 (pro navigaci).
- **Stav**: React Context API (pro globální stav košíku), `useState` a `useReducer` (pro lokální stav).
- **Styling**: SCSS s modulární strukturou (variables, mixins, BEM-ish naming).
- **Nástroje**: ESLint (linting), Prettier (formátování), Stylelint (kontrola CSS).

## 3. Struktura projektu

```text
src/
├── assets/             # Statické soubory (obrázky, ikony)
├── components/         # Komponenty (Layout, PizzaCard, Button atd.)
├── data/               # Lokální konfigurační data (ingredience, statické texty)
├── hooks/              # Custom hooky (useCart, usePizzas)
├── pages/              # Stránky (Home, Detail, Cart, Admin, Story)
├── scss/               # Modulární styly
├── services/           # Komunikace s API a externími službami
├── types/              # Definice rozhraní (Interfaces)
├── App.tsx             # Definice routování
└── main.tsx            # Vstupní bod, inicializace Context Providerů
```

## 4. Práce s daty a API

Aplikace dynamicky načítá data o produktech a umožňuje odesílání objednávek.

### Načítání dat (Data Fetching)
K načítání pizz se používá custom hook `usePizzas.ts`, který interně volá asynchronní funkce ze složky `services/api.ts`.
- **Proces**: Při načtení komponenty `HomePage` nebo `DetailPage` se spustí asynchronní požadavek.
- **Stavy**: Hook vrací stavy `loading` (pro zobrazení spinneru), `error` (pro chybové hlášky) a `pizzas` (samotná data).

### Perzistence (Ukládání)
- **Košík**: Položky v košíku jsou spravovány přes `CartProvider`. Pro zachování dat po obnovení stránky (F5) se používá **localStorage**. Při každé změně v košíku se stav synchronizuje s úložištěm prohlížeče.
- **Objednávky**: Po dokončení nákupu se data odesílají skrze POST požadavek na API endpoint.

## 5. State Management (Správa stavu)

### Cart Context
Nejdůležitější částí aplikace je `CartContext`, který je dostupný napříč celou aplikací. Umožňuje:
- Přidávání pizz do košíku s unikátní konfigurací (různá těsta, extra ingredience).
- Výpočet celkové ceny v reálném čase.
- Sledování počtu položek pro odznak (badge) v hlavičce.

### Lokální stavy
- **Konfigurátor**: V `DetailPage` se používá lokální state pro sledování vybraných ingrediencí a typu těsta předtím, než uživatel potvrdí přidání do košíku.
- **Admin panel**: Sleduje vybrané filtry a stavy objednávek pro zobrazení v dashboardu.

## 6. Databázová struktura a Modely

Aplikace pracuje s následujícími entitami:

### Pizza
Základní objekt nabízeného produktu.
```typescript
interface Pizza {
  id: string;      // Unikátní identifikátor
  name: string;    // Název (např. Margherita)
  price: number;   // Základní cena
  image: string;   // URL obrázku
  category: string[]; // Kategorie (vegetarian, spicy atd.)
}
```

### CartItem (Položka v košíku)
Rozšířený model pizzy o uživatelskou konfiguraci.
```typescript
interface CartItem {
  cartId: string;    // Unikátní ID v rámci košíku (generováno při přidání)
  pizzaId: string;   // Reference na původní pizzu
  quantity: number;  // Počet kusů
  dough: string;     // Typ těsta (tenké, silné...)
  extras: string[];  // ID vybraných ingrediencí navíc
  totalPrice: number; // Vypočtená cena za položku včetně extra ingrediencí
}
```

### Order (Objednávka)
Model odesílaný do databáze/API.
```typescript
interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'delivered';
  createdAt: string;
}
```

## 7. Administrace a Správa

Aplikace obsahuje skrytou část pro administraci (`AdminPage`), která umožňuje:
1. **Správu objednávek**: Změna stavu objednávky (např. z "Čeká" na "Připravuje se") pomocí vizuálního slideru.
2. **Správu menu**: Možnost měnit ceny a dostupnost pizz nebo ingrediencí (napojené na backend API).

## 8. Styling a UI

Vizuální stránka je definována pomocí **SCSS**.
- **Theming**: Všechny barvy (`$primary-color`, `$accent-color`) jsou definovány jako proměnné v `_variables.scss`, což umožňuje snadnou změnu brandingu.
- **Responzivita**: Používáme mobil-first přístup s mixiny pro breakpointy (`tablet`, `desktop`).
- **Animace**: Přechody mezi stránkami a interakce v košíku využívají CSS transitions a bounce efekty pro moderní "feel".

## 9. Deployment a Build

1. **Build**: `npm run build` vygeneruje statické soubory do složky `dist/`.
2. **Optimalizace**: Vite provede minifikaci kódu, odstraní nepoužité části (tree-shaking) a optimalizuje obrázky.
3. **Routing**: Pro správné fungování na produkci musí server směrovat všechny požadavky na `index.html` (standardní SPA konfigurace).

---
*Dokumentace je pravidelně aktualizována s vývojem nových funkcí.*
