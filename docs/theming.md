# Theming System — 3 Palettes × Light / Dark / Auto

## User-facing settings

Topbar → **Appearance** button → panel:

- **Palette** (swatches ke saath):
  1. **The Scholar's Archive** — warm paper, oxblood, bookmark gold (default)
  2. **Modern Utility** — Swiss neutrals, ocean blue, ochre
  3. **Night Archive** — e-ink dark, sky blue, amber
- **Mode:** Light · Dark · **Auto** (system `prefers-color-scheme` follow karta hai)

Choice `localStorage["gtu_theme"]` me JSON:

```json
{ "palette": "1", "mode": "auto" }
```

## No-flash boot

`index.html` ke `<head>` me ek **inline script** (file load hone se pehle):

1. Saved prefs padhta hai.
2. `mode === "auto"` → `matchMedia("(prefers-color-scheme: dark)")` check.
3. `<html data-palette="1" data-mode="light|dark">` set kar deta hai.

CSS variables paint se pehle lag jaati hain → koi white flash nahi.

`js/theme.js` phir panel ke buttons bind karta hai aur `matchMedia` change listener lagata hai (auto mode live update).

## How CSS responds

`css/style.css` me **6 variable blocks**:

```css
html[data-palette="1"][data-mode="light"] { --bg: #FBF9F5; ... }
html[data-palette="1"][data-mode="dark"]  { --bg: #1A1815; ... }
html[data-palette="2"][data-mode="light"] { ... }
html[data-palette="2"][data-mode="dark"]  { ... }
html[data-palette="3"][data-mode="light"] { ... }
html[data-palette="3"][data-mode="dark"]  { ... }
```

Components **kabhi raw hex use nahi karte** — sirf tokens:

| Token | Use |
|---|---|
| `--bg`, `--bg-2`, `--card` | page / band / elevated surface |
| `--ink`, `--ink-2` | primary + secondary text |
| `--accent`, `--accent-ink`, `--accent-soft` | accent bg / readable text / tint |
| `--accent-2`, `--accent2-ink`, `--accent2-soft` | second accent (gold/ochre/amber) |
| `--line` | hairline borders |
| `--on-accent` | text jo accent-colour button pe baithta hai |
| `--invert-bg/ink/ink2/line` | inverted blocks (footer, provenance panel, toasts) |
| `--shadow`, `--shadow-soft` | elevation |
| `--grain-blend`, `--grain-opacity` | film-grain adapts to light/dark |

**Ise add karna hai koi naya component?** → sirf tokens use karo, naya hex mat likho.
Tabhi 6 combinations automatically sahi dikhte hain.

## Accent pair per palette

| Palette | Accent (primary) | Accent 2 |
|---|---|---|
| 1 Scholar | Oxblood `#8B261E` (dark me `#C0574A`) | Gold `#D9A05B` |
| 2 Utility | Ocean `#0284C7` (dark me `#56B6E9`) | Ochre `#D97706` |
| 3 Night | Sky `#38BDF8` (light me `#0E86C8`) | Amber `#FBBF24` |

Session chips: **Winter** = accent pair, **Summer** = accent-2 pair.
(So Winter/Summer kabhi rainbow colours nahi bante — palette ke andar rehte hain.)

## Grain

`body::after` fixed overlay, SVG `feTurbulence` noise:

- Light: `mix-blend-mode: multiply`, opacity ~0.04–0.05
- Dark: `mix-blend-mode: soft-light`, opacity ~0.07

Subtle "printed paper" texture — neon/AI-glow tropes ka exact opposite.

## Adding a 4th palette (recipe)

1. Choose 5 colours (bg, bg-2, ink, accent, accent-2) + derive soft/ink variants.
2. `css/style.css` me 2 naye blocks likho: `[data-palette="4"][data-mode="light|dark"]`.
3. `index.html` Appearance panel me naya `.pal` button `data-palette="4"` + swatch strip.
4. `js/theme.js`: validation arrays `["1","2","3"]` me `"4"` add karo (2 jagah — head script bhi).
5. Commit.
