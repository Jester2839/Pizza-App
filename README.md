# 🍕 Pizza App - Modern Web Application

Moderní pizza objednávková aplikace postavená s TypeScript, Sass a Vite.

web: https://b2024novyja.delta-www.cz


## 🚀 Tech Stack

- **TypeScript** - Typová bezpečnost a lepší developer experience
- **Sass (SCSS)** - Modulární CSS s proměnnými, mixiny a vnořováním
- **Vite** - Bleskový build tool s HMR (Hot Module Replacement)
- **ESLint** - Linting JavaScript/TypeScript kódu
- **Prettier** - Automatické formátování kódu
- **Stylelint** - Linting CSS/SCSS souborů

## 📁 Struktura projektu

```
Pizza-App/
├── src/
│   ├── index.html            # Hlavní stránka
│   ├── detail.html           # Detail pizzy
│   ├── kosik.html            # Košík
│   ├── ts/                   # TypeScript zdrojové soubory
│   │   ├── main.ts          # Entry point
│   │   ├── cart.ts          # Košík funkcionalita
│   │   ├── detail.ts        # Detail pizzy
│   │   └── types/           # TypeScript typy
│   ├── scss/                 # SASS/SCSS styly
│   │   ├── main.scss        # Main stylesheet
│   │   ├── _variables.scss  # CSS proměnné
│   │   ├── _mixins.scss     # SCSS mixiny
│   │   ├── _base.scss       # Reset a základní styly
│   │   ├── _header.scss     # Hlavička
│   │   ├── _hero.scss       # Hero sekce
│   │   ├── _cards.scss      # Pizza karty
│   │   ├── _detail.scss     # Detail stránka
│   │   ├── _cart.scss       # Košík
│   │   └── _footer.scss     # Zápatí
│   └── assets/
│       └── images/          # Obrázky pizz (4 PNG soubory)
├── dist/                    # Build výstup (git ignored)
├── node_modules/            # NPM závislosti (git ignored)
├── package.json             # NPM konfigurace
├── tsconfig.json            # TypeScript konfigurace
├── vite.config.ts           # Vite konfigurace
├── .eslintrc.json           # ESLint pravidla
├── .prettierrc              # Prettier nastavení
├── .stylelintrc.json        # Stylelint konfigurace
├── .gitignore               # Git ignore pravidla
└── README.md                # Dokumentace
```

## 🛠️ Dostupné příkazy

### Development
```bash
npm run dev
```
Spustí Vite development server na `http://localhost:5173/`
- Hot Module Replacement (změny viditelné okamžitě)
- Source maps pro debugging
- Rychlé načítání

### Production Build
```bash
npm run build
```
Vytvoří optimalizovaný production build v `dist/` složce:
- TypeScript kompilace
- CSS minifikace
- JavaScript minifikace a tree-shaking
- Asset optimalizace

### Preview Production Build
```bash
npm run preview
```
Lokální preview production buildu

### Linting & Formatting

```bash
# TypeScript/JavaScript linting
npm run lint

# Autofix linting issues
npm run lint:fix

# CSS/SCSS linting
npm run lint:css

# Autofix CSS issues
npm run lint:css:fix

# Format všech souborů
npm run format

# Type checking bez buildu
npm run type-check
```

## 🎨 SCSS Features

### Proměnné
Všechny barvy, velikosti a timing v `_variables.scss`:
```scss
$primary-color: #b82132;
$accent-color: #d4af37;
$transition-speed: 0.3s;
```

### Mixiny
Reusable SCSS mixiny v `_mixins.scss`:
```scss
@include hover-lift(-4px);
@include center-flex;
```

### Modulární struktura
- Každá komponenta má vlastní SCSS soubor
- `@use` místo deprecated `@import`
- Vnořování selektorů pro lepší čitelnost

## 📝 TypeScript

### Typy
Všechny typy definované v `src/ts/types/index.ts`:
```typescript
interface Pizza {
  id: string;
  name: string;
  price: number;
  // ...
}
```

### Moduly
- `main.ts` - Entry point, import všeho
- `detail.ts` - Konfigurace pizzy
- `cart.ts` - Funkce košíku

## 🌐 Multi-Page Setup

Vite automaticky detekuje všechny HTML soubory v `src/pages/`:
- `/` - index.html (hlavní stránka)
- `/detail.html` - detail pizzy
- `/kosik.html` - košík

## 🔧 Konfigurace

### Vite (`vite.config.ts`)
- Root nastaveno na `src/`
- Public assets z `src/assets/` (dostupné na `/`)
- Multi-page build konfigurace
- SCSS preprocessor s auto-import proměnných
- Path aliases (@, @ts, @scss, @assets)

**Obrázky:**
- Umístění: `src/assets/images/*.png`
- V HTML: `<img src="/images/xxx.png">`
- Vite automaticky servíruje assets z `publicDir`

### TypeScript (`tsconfig.json`)
- ES2020 target
- Strict mode zapnutý
- Module resolution: bundler

### ESLint (`.eslintrc.json`)
- TypeScript podpora
- Prettier integrace
- Recommended rules

## 🎯 Features

- ✅ TypeScript s plnou typovou podporou
- ✅ Moderní SCSS s @use
- ✅ Hot Module Replacement (HMR)
- ✅ Code splitting a tree-shaking
- ✅ Automatické linting a formátování
- ✅ Multi-page application
- ✅ Optimalizovaný production build
- ✅ Asset optimization

## 📦 Instalace

```bash
# Nainstalovat závislosti
npm install

# Spustit dev server
npm run dev

# Vytvořit production build
npm run build
```

## 🚀 Deployment

1. Build projekt: `npm run build`
2. Deploy `dist/` folder na hosting
3. Ujistěte se, že server podporuje SPA routing (pro správné cesty)

## 📄 License

MIT

---

Vytvořeno s ❤️ a 🍕
