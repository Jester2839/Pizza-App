# 🍕 PizzAllettante - Profesionální systém pro prodej pizzy

**PizzAllettante** je moderní, bleskově rychlá webová aplikace navržená pro pizzerie, které chtějí svým zákazníkům nabídnout prvotřídní zážitek z objednávání online a personálu usnadnit správu menu a objednávek.

web: https://b2024novyja.delta-www.cz/pizza-app

---

## ✨ Hlavní funkce pro zákazníky

Aplikace je navržena s důrazem na intuici a rychlost, aby zákazníka nic neodradilo od dokončení objednávky.

### 1. Interaktivní konfigurátor (Moje Pizza)
Zákazník si může každou pizzu přizpůsobit svým chutím. Systém automaticky přepočítává cenu při každé změně:
*   **Volba těsta:** Možnost výběru mezi tenkým, silným nebo speciálním těstem.
*   **Výběr základu:** Snadná změna mezi tomatovým, smetanovým nebo jiným základem.
*   **Speciální okraje:** Unikátní možnost přidat si plněné okraje (sýr, párek).
*   **Extra ingredience:** Přidávání surovin navíc přehledně rozdělených do kategorií (Maso, Sýry, Zelenina).

### 2. Inteligentní menu
*   **Dynamické filtry:** Okamžité filtrování podle preferencí (Vegetariánské, Pálivé, Oblíbené).
*   **Responzivita:** Aplikace funguje dokonale na mobilních telefonech, tabletech i počítačích.
*   **Rychlost:** Díky moderní technologii se stránky neobnovují – přechody mezi nabídkou a košíkem jsou okamžité.

---

## 🛡️ Administrační rozhraní (Pro pizzerii)

Zabezpečená sekce pro personál umožňuje kompletní správu provozu bez nutnosti zásahu programátora.

### 📊 Správa objednávek
*   **Přehled v reálném čase:** Okamžité zobrazení nových objednávek s detaily o zákazníkovi.
*   **Sledování stavu:** Intuitivní slider pro změnu stavu objednávky (Čeká ➔ Připravuje se ➔ Na cestě ➔ Doručeno).
*   **Historie:** Možnost procházet a spravovat vyřízené objednávky.

### 🍕 Správa nabídky a surovin
*   **Editor Menu:** Snadná změna cen, názvů a popisů pizz.
*   **Konfigurace surovin:** Správa dostupnosti a cen všech extra ingrediencí, typů těst a okrajů.
*   **Kategorie:** Možnost řadit produkty do kategorií pro lepší přehlednost.

---

## 📖 Návod k použití

### Pro uživatele
1.  **Výběr:** Na hlavní stránce si vyberte pizzu z nabídky.
2.  **Přizpůsobení:** Kliknutím na pizzu otevřete konfigurátor, kde si zvolíte těsto, okraje a ingredience navíc.
3.  **Košík:** V košíku zkontrolujte vybrané položky a jejich množství.
4.  **Objednávka:** Vyplňte doručovací údaje a potvrďte objednávku.

### Pro administrátory
1.  **Přihlášení:** Vstupte do admin sekce přes zabezpečený odkaz (přihlašovací údaje jsou spravovány v rámci systému).
2.  **Objednávky:** Na kartě "Objednávky" sledujte nové požadavky. Po zahájení přípravy stačí posunout stavový slider.
3.  **Aktualizace cen:** V sekci "Ingredience" nebo "Pizzy" můžete kdykoliv upravit ceny podle aktuální situace.

---

## ⚙️ Technické spuštění (pro vývojáře)

Pokud chcete aplikaci spustit lokálně pro účely testování nebo úprav:

1.  **Instalace:**
    ```bash
    npm install
    ```
2.  **Spuštění vývojového serveru:**
    ```bash
    npm run dev
    ```
3.  **Sestavení verze pro nasazení:**
    ```bash
    npm run build
    ```

---

## 🚀 Deployment
Aplikace je připravena pro nasazení na moderní hostingy. Pro správnou funkčnost všech cest (URL) je doporučeno nastavit server tak, aby všechny požadavky směroval na hlavní soubor `index.html`.

*Vytvořeno jako moderní řešení pro gastronomii.*
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
