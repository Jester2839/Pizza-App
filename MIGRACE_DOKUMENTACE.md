# Migrace Pizza App na moderní tooling stack

## 📋 Zadání

Přidat do existujícího projektu Pizza App kompletní moderní tooling:
- TypeScript compiler
- Sass compiler
- Vite build tool
- ESLint, Prettier, Stylelint
- Hot Module Replacement (HMR)
- Production build optimalizace

**Požadavky:**
- Zachovat veškerou funkcionalitu původního kódu
- Bez frameworků jako Next.js nebo Tailwind
- Plný tooling setup s linting a formátováním

## 🎯 Původní stav projektu

```
Pizza-App/
├── index.html          # Hlavní stránka s nabídkou pizz
├── detail.html         # Detail pizzy s konfigurací
├── kosik.html          # Košík s objednávkou
├── app.js              # Vanilla JavaScript (~55 řádků)
├── style.css           # CSS styly (~1100 řádků)
└── source/             # Obrázky pizz (4 PNG soubory)
```

**Technologie:**
- Čisté HTML, CSS, JavaScript
- Externí závislosti: Phosphor Icons, Google Fonts
- Žádný build proces

## 🔧 Implementovaný postup

### 1. Inicializace npm projektu

```bash
npm init
npm install --save-dev vite typescript sass eslint prettier stylelint
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev eslint-config-prettier stylelint-config-standard-scss
npm install --save-dev autoprefixer postcss
```

**Vytvořené konfigurační soubory:**
- `package.json` - skripty a dependencies
- `tsconfig.json` - TypeScript konfigurace (strict mode, ES2020)
- `vite.config.ts` - Vite setup s multi-page supportem
- `.eslintrc.json` - TypeScript linting pravidla
- `.prettierrc` - Code formatting pravidla
- `.stylelintrc.json` - SCSS linting pravidla
- `.gitignore` - Ignorování node_modules, dist

### 2. Struktura adresářů

Vytvořena nová struktura:
```
src/
├── index.html
├── detail.html
├── kosik.html
├── ts/
│   ├── main.ts
│   ├── cart.ts
│   ├── detail.ts
│   └── types/
│       └── index.ts
├── scss/
│   ├── main.scss
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _base.scss
│   ├── _header.scss
│   ├── _hero.scss
│   ├── _cards.scss
│   ├── _detail.scss
│   ├── _cart.scss
│   └── _footer.scss
└── assets/
    └── images/
        ├── sunka.png
        ├── syr.png
        ├── salam.png
        └── margerita.png
```

### 3. Migrace CSS → SCSS

**Rozdělení monolitického CSS na moduly:**

Original `style.css` (1100 řádků) rozdělen do 9 SCSS souborů:

1. **_variables.scss** - CSS proměnné převedeny na SCSS variables
   ```scss
   $primary-color: #b82132;
   $accent-color: #d4af37;
   $text-main: #2c2c2c;
   // atd.
   ```

2. **_mixins.scss** - Reusable SCSS mixiny
   ```scss
   @mixin hover-lift($translateY: -4px) { ... }
   @mixin center-flex { ... }
   ```

3. **_base.scss** - Reset a základní styly
4. **_header.scss** - Navigace a hlavička
5. **_hero.scss** - Hero sekce a filtry
6. **_cards.scss** - Pizza karty
7. **_detail.scss** - Detail stránka
8. **_cart.scss** - Košík
9. **_footer.scss** - Zápatí

**Využité SCSS features:**
- Vnořování selektorů
- `@use` místo deprecated `@import`
- Proměnné s prefixem `$`
- Mixiny pro opakující se patterny
- `&` parent selector

### 4. Migrace JavaScript → TypeScript

**Rozdělení `app.js` na TypeScript moduly:**

1. **types/index.ts** - Definice TypeScript typů
   ```typescript
   interface Pizza { id, name, price, ... }
   interface CartItem { ... }
   interface Ingredient { ... }
   ```

2. **detail.ts** - Funkce pro konfiguraci pizzy
   ```typescript
   export function toggleIng(element: HTMLElement, price: number): void
   ```

3. **cart.ts** - Funkce pro košík
   ```typescript
   export function updateQty(...)
   export function removeItem(...)
   export function togglePromo()
   ```

4. **main.ts** - Entry point
   ```typescript
   import '../scss/main.scss';
   import './detail';
   import './cart';
   ```

**Zachování kompatibility:**
- Funkce exportovány na `window` objekt pro inline onclick handlers
- Veškerá původní funkcionalita zachována

### 5. Vite konfigurace

**vite.config.ts:**
```typescript
export default defineConfig({
  root: 'src',
  publicDir: 'assets',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: 'src/index.html',
        detail: 'src/detail.html',
        kosik: 'src/kosik.html',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@scss/_variables.scss" as *;`,
      },
    },
  },
});
```

**Klíčové nastavení:**
- `root: 'src'` - Vite root v src/ složce
- `publicDir: 'assets'` - Assets servírovány z src/assets/
- Multi-page setup pro 3 HTML stránky
- SCSS s auto-importem proměnných

### 6. HTML úpravy

**Změny v HTML souborech:**
```html
<!-- Před -->
<link rel="stylesheet" href="style.css">
<script src="app.js"></script>

<!-- Po -->
<script type="module" src="./ts/main.ts"></script>
<!-- CSS importován v main.ts -->
```

**Cesty k obrázkům:**
```html
<!-- Před -->
<img src="source/sunka.png">

<!-- Po -->
<img src="/images/sunka.png">
```

## 🐛 Řešené problémy

### Problém 1: TypeScript se nenačítal v prohlížeči

**Příčina:** Vite měl `root: 'src/pages'`, ale cesta `../ts/main.ts` se snažila načíst z `/ts/main.ts` (relativně k rootu)

**Řešení:** 
- Přesun HTML souborů z `src/pages/` do `src/`
- Změna Vite root na `root: 'src'`
- Úprava cesty v HTML: `src="./ts/main.ts"`

### Problém 2: CSS se nezobrazovaly

**Příčina:** SCSS bylo importováno pouze v TypeScript, ale TS se nenačítal (viz Problém 1)

**Řešení:** Po opravě TS načítání začalo fungovat i SCSS (importováno v main.ts)

### Problém 3: Deprecation warnings při buildu

**Příčina:** Použití starého `@import` v SCSS místo moderního `@use`

**Řešení:**
```scss
// Před
@import 'variables';

// Po
@use 'variables' as *;
```

## 📊 Výsledky

### Build metriky
```
✓ built in 458ms

Výstupní soubory:
- index.html     9.58 kB (gzip: 1.80 kB)
- detail.html    9.17 kB (gzip: 1.73 kB)
- kosik.html     5.94 kB (gzip: 1.62 kB)
- main.css      14.36 kB (gzip: 3.27 kB)
- main.js        1.81 kB (gzip: 0.92 kB)
```

### Vyčištěné soubory
- ✅ `source/` složka (duplikáty obrázků)
- ✅ Staré HTML v rootu
- ✅ `app.js` (nahrazen TypeScriptem)
- ✅ `style.css` (nahrazen SCSS)

### Finální struktura

```
Pizza-App/
├── src/
│   ├── index.html
│   ├── detail.html
│   ├── kosik.html
│   ├── ts/          (4 TypeScript soubory)
│   ├── scss/        (9 SCSS modulů)
│   └── assets/
│       └── images/  (4 PNG soubory)
├── dist/            (build output)
├── node_modules/    (244 packages)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.json
├── .prettierrc
├── .stylelintrc.json
├── .gitignore
└── README.md
```

## 🚀 Dostupné příkazy

```bash
# Development server s HMR
npm run dev

# Production build
npm run build

# Preview production buildu
npm run preview

# Linting
npm run lint          # TypeScript/JavaScript
npm run lint:fix      # Auto-fix
npm run lint:css      # SCSS
npm run lint:css:fix  # Auto-fix CSS

# Formátování
npm run format

# Type checking
npm run type-check
```

## ✨ Získané funkce

### Development
- ⚡ Hot Module Replacement (změny viditelné okamžitě)
- 🔥 TypeScript transpilace on-the-fly
- 🎨 SCSS kompilace on-the-fly
- 🔍 Source maps pro debugging
- 📊 Dev server s error overlay

### Production
- 📦 Code splitting a tree-shaking
- 🗜️ Minifikace CSS a JS
- 🖼️ Asset optimization
- 📝 HTML injection optimalizace
- 🎯 Multi-page build support

### Code Quality
- ✅ TypeScript strict mode
- 🎯 ESLint s TypeScript supportem
- 💅 Prettier auto-formátování
- 🎨 Stylelint pro SCSS
- 📖 Plná IntelliSense podpora

## 🎓 Klíčová poznání

1. **Vite root je kritický** - Musí správně odpovídat struktuře projektu
2. **SCSS @use > @import** - Moderní API předejde deprecation warnings
3. **HTML vedle TS/SCSS** - Nejjednodušší struktura pro Vite
4. **PublicDir pro assets** - Automatické servírování statických souborů
5. **Multi-page = rollupOptions** - Explicitní definice entry pointů
6. **TypeScript + window** - Pro zachování inline handlers

## 📚 Reference

- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Sass Documentation](https://sass-lang.com/documentation/)
- [ESLint Configuration](https://eslint.org/docs/latest/use/configure/)

---

**Migrace dokončena:** 2026-05-19
**Čas realizace:** ~1 hodina
**Status:** ✅ Plně funkční s plným tooling stackem
