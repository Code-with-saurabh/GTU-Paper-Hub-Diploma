# SEO Setup — Full Checklist

Canonical domain: **`https://gtu-paper-hub-diploma.netlify.app`**

## 1. On-page meta (`index.html` head)

- `<title>` — primary keywords + brand (unique, ~60 chars).
- `meta description` — benefit-driven, includes "BE CSE", "Summer & Winter", "gtu.ac.in" (~155 chars).
- `meta keywords` — GTU-specific long-tails (secondary signal).
- `meta author` — **Saurabh Sharma**.
- `meta robots` — `index, follow, max-image-preview:large, max-snippet:-1`.
- `link canonical` — self-referencing.
- `theme-color` pair (light/dark) + `color-scheme`.
- Semantic HTML: **single `h1`**, ordered `h2` sections, real copy (no keyword stuffing).

## 2. Social cards (OG + Twitter)

- `og:type=website`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:locale`.
- `og:image` → `/assets/og-image.png` (1200×630, declared with width/height/alt).
- `twitter:card=summary_large_image` + title/description/image.

> Test karo: <https://cards-dev.twitter.com/validator> aur
> <https://developers.facebook.com/tools/debug/> — cache clear karke.

## 3. Structured data (JSON-LD `@graph`)

| Node | Purpose |
|---|---|
| `WebSite` + `SearchAction` | site identity + sitelinks search box |
| `WebPage` + `BreadcrumbList` + dates | page-level semantics |
| `Person` (Saurabh Sharma) | authorship — `sameAs` GitHub + portfolio |
| `WebApplication` | EducationalApplication, free, OS=web |

Validate: <https://validator.schema.org/> ya Rich Results Test.

## 4. Crawl files (root pe — folder me shift NAHI ho sakte)

- **`robots.txt`** — allow all, disallow `/api/`, sitemap pointer.
- **`sitemap.xml`** — single URL, `lastmod`, `changefreq=weekly`, `priority=1.0`.

## 5. Assets (`/assets/`)

- `manifest.webmanifest` — PWA name/short_name/icons (192, 512), standalone display.
- `apple-touch-icon.png` (180), `icon-192/512.png`.
- `og-image.png` — custom editorial card (cream, serif title, gold underline, credit line).

## 6. Performance / indexability

- Zero build, static HTML → crawlers ko JS-render ki zaroorat nahi (content SSR jaisa, pehle se HTML+JS data).
- `data.js` snapshot = instant interactivity, low CLS (fixed card sizes).
- Netlify headers (`netlify.toml`): `nosniff`, `X-Frame-Options: DENY`, referrer policy,
  `/assets/*` week cache, `/css|js` 1h cache.

## 7. Post-deploy SEO steps (manual)

1. Google Search Console me property add (URL prefix) → verify.
2. Sitemap submit: `https://gtu-paper-hub-diploma.netlify.app/sitemap.xml`.
3. URL Inspection → Request indexing (home).
4. Bing Webmaster Tools me bhi submit (Share exchange ya manual).
5. OG/debug tools se social preview check.
6. Har syllabus/exam-season update ke baad `sitemap.xml` ka `lastmod` bump karo.

## 8. Content SEO moat (kyun rank ho sakta hai)

- Specific intent: "GTU CSE <subject> previous year paper" queries pe *direct answer*.
- Old-code mapping = long-tail coverage jo koi aur nahi deta.
- Freshness: exam-season sync + `lastmod`.
- Original design + real utility = dwell time + shares in college WhatsApp groups (off-site SEO signal).
