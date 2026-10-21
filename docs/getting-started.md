# Getting Started — Step by Step

## 1. Requirements

- A browser. That's it.
- Optional: [Git](https://git-scm.com), VS Code (Live Server extension), Python/Node for a local server.

## 2. Get the code

```bash
git clone https://github.com/Code-with-saurabh/-GTU-Paper-Hub.git
cd -GTU-Paper-Hub
```

Ya GitHub page se **Code → Download ZIP**.

## 3. Run locally

**Option A — directly:** `index.html` double-click karo. Sab kuch client-side chalta hai,
file:// se bhi kaam karega (fonts Google se load honge, baaki offline bhi chalega).

**Option B — local server (recommended):**

```bash
# Python
python -m http.server 8000

# or Node
npx serve .

# or VS Code: Live Server extension → Go Live
```

Browser me `http://localhost:8000` kholo.

## 4. Project layout

```
/
├── index.html               ← single page: SEO head + markup
├── css/style.css            ← design tokens + all component styles
├── js/data.js               ← syllabus + paper-availability snapshot
├── js/theme.js              ← Appearance settings (palettes + modes)
├── js/app.js                ← core UI logic
├── assets/                  ← icons, og-image, manifest
├── robots.txt               ← root pe compulsory
├── sitemap.xml              ← root pe compulsory
├── netlify.toml             ← deploy + headers config
└── docs/                    ← yeh documentation
```

## 5. Deploy on Netlify (step by step)

1. Push repo to GitHub (already done for the official repo).
2. <https://app.netlify.com> → **Add new site → Import an existing project**.
3. GitHub repo select karo (`Code-with-saurabh/-GTU-Paper-Hub`).
4. Settings:
   - **Build command:** *(khaali chhodo)*
   - **Publish directory:** `/` (repo root)
5. **Deploy.** 30 second me live URL milega, e.g. `https://something.netlify.app`.
6. (Optional) **Site settings → Change site name** → `gtu-paper-hub`
   → final URL: `https://gtu-paper-hub-diploma.netlify.app`.

> `netlify.toml` pehle se publish dir + cache/security headers set karta hai,
> toh Netlify pe manually kuch config nahi karna padta.

## 6. Verify after deploy

- [ ] Homepage loads, 8 semester cards dikhe.
- [ ] Koi semester kholo → papers list ho.
- [ ] Search me `Operating Systems` ya `3170724` type karo → dropdown results.
- [ ] Appearance button → palette/mode switch ho, refresh pe yaad rahe.
- [ ] <https://gtu-paper-hub-diploma.netlify.app/robots.txt> open ho.
- [ ] <https://gtu-paper-hub-diploma.netlify.app/sitemap.xml> open ho.
- [ ] LinkedIn/WhatsApp pe link paste karo → OG card (og-image) aaye.
- [ ] Google Search Console me sitemap submit karo.
