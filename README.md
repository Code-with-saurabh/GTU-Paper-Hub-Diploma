# GTU-Paper-Hub-Diploma

**Previous year question papers for GTU Diploma Computer Engineering (CSE) students — semester-wise, Summer & Winter, straight from GTU's official archive.**

Live site: **[https://gtu-paper-hub-diploma.netlify.app/](https://gtu-paper-hub-diploma.netlify.app/)**
Built by **[Saurabh Sharma](https://saurabhsharma.is-a.dev)** · GitHub: **[@Code-with-saurabh](https://github.com/Code-with-saurabh)**

> **Full documentation (step-by-step):** [`docs/`](./docs/README.md) —
> [Getting Started](./docs/getting-started.md) · [Architecture](./docs/architecture.md) ·
> [GTU API & Data](./docs/gtu-api-and-data.md) · [App Logic](./docs/app-logic.md) ·
> [Theming](./docs/theming.md) · [Design](./docs/design.md) ·
> [SEO](./docs/seo.md) · [Maintenance](./docs/maintenance.md)

---

## What this project does

GTU uploads every exam's question paper as a PDF on `gtu.ac.in`, but finding them is painful —
you need the exact subject code, the exact session string (`S2024`, `W2023`…), and the archive's
own UI is not student-friendly. This site fixes that:

- **Pick a semester (1–6)** → instantly see every subject of the running diploma syllabus with its
  past 3/4/5 years of Summer + Winter papers.
- **Search any subject** by *name* ("Data Structures") or *code* (`4330704`, `DI03000021`) →
  get the last 5 years of papers, **including papers filed under a subject's older codes**
  (GTU renames codes often; the data maps every old code to the current subject).
- **One click = official PDF.** No re-uploads, no mirror copies, no login. Every button opens the
  real file on `gtu.ac.in` in a new tab.
- **Filters:** past-years window (3 / 4 / 5, remembered in `localStorage`) and exam-session
  filter (Summer + Winter / Winter / Summer).
- **Works offline-ish:** subject lists + a paper-availability snapshot ship as static JS, so the
  site renders instantly; a live API refresh only *confirms/updates* availability afterwards.
- **Appearance settings:** 3 hand-picked colour palettes × Light / Dark / Auto mode
  (Scholar's Archive, Modern Utility, Night Archive), saved per-device.

---

## How it works (architecture)

```
gtu-paper-hub-diploma.netlify.app   ← static site (no backend, no build step)
├── index.html              ← markup + full SEO head (OG, JSON-LD, canonical…)
├── css/style.css           ← all theming via CSS variables (3 palettes × 2 modes)
├── js/data.js              ← GTU Diploma (CSE) syllabus + paper-availability snapshot (the "database")
├── js/theme.js             ← Appearance panel (palette + light/dark/auto), localStorage
├── js/app.js               ← UI logic: semester view, search, filters, live refresh
├── assets/                 ← SEO/PWA assets
│   ├── manifest.webmanifest
│   ├── og-image.png        ← 1200×630 social share card
│   ├── icon-192.png / icon-512.png / apple-touch-icon.png
├── robots.txt              ← must stay at root (crawlers only check root)
├── sitemap.xml             ← must stay at root
└── netlify.toml            ← deploy config + caching/security headers
```

### Data layer (`js/data.js`)

A single global `window.GTU_DIPL` object:

| Field | Meaning |
|---|---|
| `apiBase` | `https://www.gtu.ac.in` |
| `sessions` | Ordered list of exam sessions, newest first: `S2026, W2025, S2025, …` |
| `snapshot` | `{ subject_code: [sessions where a PDF exists in GTU's archive] }` — generated from the archive, synced **Oct 2026** |
| `semesters` | Array of 8 semesters: `sem`, `label`, `level`, `effFrom` (syllabus year, e.g. 2026-27), `batch`, and `subjects[]` |
| `subjects[]` | `name`, `code` (current), `kind` (`core` / `elective` / `audit` / `project` / `mooc`), `codes[]` (current + all older codes) |

So the site **works with zero network calls** for rendering; the snapshot is the fallback truth.

### Live refresh (`js/app.js` → `refreshCodes()`)

When a semester or subject opens, the app re-validates availability against GTU's **Question
Paper Archive API** (5 concurrent workers, failures tolerated → falls back to snapshot silently):

```
GET https://www.gtu.ac.in/api/v1/question-papers/archive/search/
    ?subject_code=<CODE>&course=DI&page_size=50
→ JSON: { success: true, data: { papers: [ { session: "W2024", … } ] } }
```

Only the `session` strings are kept, merged into `liveCache[code]`, and the view re-renders.
If every call fails, `state.live` stays `false` and the snapshot data is used — the user never
sees an error for a network problem.

### PDF links

Constructed deterministically, no lookup needed:

```
https://www.gtu.ac.in/api/v1/question-papers/archive/file/<SESSION>/DI/<SUBJECT_CODE>.pdf
```

Examples: `…/file/W2024/DI/4330704.pdf`, `…/file/S2025/DI/DI03000021.pdf`

> The site **never hosts PDFs** — it only deep-links GTU's own archive. Papers remain the
> property of Gujarat Technological University.

### Search (`searchSubjects()`)

Plain client-side fuzzy-ish scoring over all subjects (exact code > code prefix > exact name >
name prefix > code substring > name substring), deduped by current code, top 8 results in a
dropdown. Enter / first-result click → `openSubject()` → 5-year window across **all** codes of
that subject.

### Theming (`js/theme.js` + CSS variables)

- User picks **palette 1|2|3** and **mode light|dark|auto** → saved as JSON in
  `localStorage["gtu_theme"]`.
- A tiny inline `<head>` script applies `data-palette` + `data-mode` on `<html>` **before first
  paint** (no white flash, no theme flicker).
- `css/style.css` defines the full token set (`--bg`, `--ink`, `--accent`, `--line`, `--invert-*`,
  grain settings…) for all 6 combinations. Components only use tokens — never raw hex.
- `prefers-color-scheme` is watched live when mode = Auto.

| Palette | Light | Dark |
|---|---|---|
| 1 — Scholar's Archive | Warm paper `#FBF9F5`, ink `#1C1E21`, oxblood `#8B261E`, gold `#D9A05B` | Warm charcoal, lightened oxblood |
| 2 — Modern Utility | `#F7F7F8`, slate `#0F172A`, ocean `#0284C7`, ochre `#D97706` | Deep slate, brighter blue |
| 3 — Night Archive | Cool light (derived from the dark set) | `#121417`, off-white `#E2E8F0`, sky `#38BDF8`, amber `#FBBF24` |

---

## Design notes

Deliberately **not** the default "AI landing page" look:

- Asymmetrical 12-column grid, varied section heights, real white space.
- Editorial type: **Fraunces** (high-contrast serif) for headings + **Inter** for body.
- Subtle film-grain overlay (SVG `feTurbulence`, blend mode adapts to light/dark).
- Hand-drawn touches: wobbly underline under the hero headline, squiggle in the provenance panel,
  rotated "paper sheet" stats instead of an icon-feature grid.
- No neon glows, no glossy 3D spheres, no isometric tech illustrations, no gradient-blob hero.

## SEO

- Unique title + meta description, canonical URL, `robots` with `max-image-preview:large`.
- Open Graph + Twitter `summary_large_image` cards (custom 1200×630 `og-image.png`).
- **JSON-LD** (`@graph`): `WebSite` (+ `SearchAction`), `WebPage` (breadcrumb, dates),
  `Person` (Saurabh Sharma — links to portfolio + GitHub), `WebApplication`
  (EducationalApplication, free, accessible-for-free).
- `robots.txt` + `sitemap.xml`, PWA `manifest.webmanifest`, apple-touch icons, theme-color pair.
- Semantic HTML: one `h1`, ordered `h2` sections, descriptive link text, alt-ready assets.

## Run locally

Just open `index.html` in a browser — no build, no install, no bundler.
(Or `npx serve .` / VS Code Live Server if you prefer a local host.)

## Deploy (Netlify)

1. Push this repo to GitHub.
2. Netlify → *Add new site* → *Import an existing project* → pick the repo.
3. Build command: *(leave empty)* · Publish directory: `/` (repo root).
4. Site URL will be `https://gtu-paper-hub-diploma.netlify.app` (or set a custom domain).

`netlify.toml` in this repo already sets the publish directory and caching/security headers.

## Maintenance

- **After each exam season**, re-sync `snapshot` in `js/data.js` from the archive API
  (search by course=DI, collect `session` per `subject_code`).
- **When GTU publishes a new syllabus**, update `semesters[].effFrom` / `batch` and add/rename
  subjects — always keep **all old codes** in `codes[]` so past papers stay reachable.
- New subject codes show papers only after GTU conducts (and uploads) the first exam —
  that's expected, and the UI explains it in place.

## Credits & disclaimer

- Built entirely by **Saurabh Sharma** — [saurabhsharma.is-a.dev](https://saurabhsharma.is-a.dev) ·
  [github.com/Code-with-saurabh](https://github.com/Code-with-saurabh).
- Not affiliated with Gujarat Technological University. All question papers remain the property
  of GTU; this site only links to GTU's own public archive for student revision.

---

<sub>MIT licensed · Made for GTU Diploma (CSE) students who revise the night before. 🙂</sub>
