# Design & UI — Rules Is Project Ke

Goal: **high-end design-agency jaisa custom feel** — na ki generic "AI template".

## Hard rules (yeh mat todna)

- ❌ Neon glow, glowing grid lines, glossy 3D spheres, isometric floating tech illustrations.
- ❌ Bright blue/purple gradients, cyberpunk palettes.
- ❌ Standard "icon + title + description" 3-column feature grid.
- ❌ Placeholder-y copy ("Optimize your workflow", "Empower your business").
- ✅ Asymmetric grids, varied section heights, intentional white space.
- ✅ Muted sophisticated tones, editorial type, human conversational copy.

## Typography

| Role | Font | Notes |
|---|---|---|
| Headings, big numerals, brand | **Fraunces** (Google Fonts) | High-contrast modern serif; italic axis bhi loaded hai (hero underline wale phrase ke liye) |
| Body, UI, chips | **Inter** | Clean, highly readable |

Fallbacks: Fraunces → Georgia/Iowan Old Style; Inter → system-ui.

Scale (fluid via clamp):

- `h1` hero: `clamp(38px, 6vw, 74px)`
- Section `h2`: `clamp(28px, 3.4vw, 44px)`
- Body: 15–16.5px, line-height 1.6

## Layout signatures

### Hero — 7/5 asymmetric split
- Left: eyebrow (letterspaced uppercase), oversized serif headline with **italic accent phrase + hand-drawn gold underline** (inline SVG wobbly path), specific copy, search, trust line.
- Right: organic blob SVG (accent-2, 16% opacity) + **stacked rotated "paper sheets"** with stats — naki icon grid. Rotations: -2°, +1.4°, -0.8°; slight negative margins = desk pe rakhe kagaz.

### Semester grid — 12-col asymmetric
```
[ span 5 ][ span 4 (offset +30px) ][ span 3 ]
[ span 4 ][ span 4 (offset +26px) ][ span 4 ]
[        span 6        ][        span 6 (offset +22px)       ]
```
Offsets aur spans se visual rhythm banta hai. ≤980px → 2-col, ≤640px → 1-col.

### Editorial section — 6 + 5 (col 7 gap)
- Left: numbered steps with italic serif numerals, hairline dividers, margin-note with accent left-border.
- Right: **inverted panel** (`--invert-bg`) — provenance statement + gold squiggle SVG.
- Footer bhi inverted.

## Details jo "custom" feel dete hain

- **Film grain** overlay (light/dark dono me adaptive).
- **Hand-drawn SVG strokes** — hero underline + squiggle (stroke-linecap round, intentionally wobbly Béziers).
- Hairline borders (`--line`) over heavy shadows; shadows sirf cards/toasts pe, soft.
- Radius discipline: cards 6–12px, chips 999px, sheets 6px.
- Micro-interaction: semester card pe arrow gap `7px → 12px` slide.
- Copy voice: specific, conversational — "minus the hunting", "Four taps to the PDF", "which semester are you stuck in?".

## Components quick reference (CSS)

| Class | Notes |
|---|---|
| `.hero-grid`, `.hero-copy`, `.hero-visual` | hero split |
| `.sheet`, `.sheet-1..3` | rotated stat papers |
| `.sem-grid`, `.sem-card` | asymmetric semester cards |
| `.toolbar`, `.pills`, `.pill` | panel controls (active pill = accent) |
| `.subject-card`, `.code-chip`, `.kind-*` | subject rows |
| `.paper-btn`, `.sess-winter/summer` | PDF chips |
| `.editorial`, `.steps`, `.editorial-panel` | bottom editorial block |
| `.theme-btn`, `.theme-panel`, `.pal` | appearance settings |

Sare components sirf CSS variables pe depend karte hain → 6 theme combos free me kaam karte hain.
