# Architecture — How Everything Fits Together

## High-level flow

```
User action                app.js                      data / network
───────────                ──────                      ───────────────
Page load        →  renderSemGrid()            ←  GTU_CSE.semesters (static)
                   applyTheme()               ←  localStorage (theme.js)

Click semester   →  showLoader() (950ms)
                   renderSemView()            ←  snapshot (instant render)
                   refreshCodes(codes)        →  GET gtu.ac.in archive API
                   renderSemView() again      ←  liveCache merge (if API ok)

Search input     →  searchSubjects(q)         ←  SUBJECTS[] (client-side scoring)
Click result     →  openSubject()             →  refreshCodes(subject.codes)
                                           →  renderSubjectView()

Click paper btn  →  window.open(paperFileUrl)  ←  URL constructed from session+code
```

**Key idea:** rendering kabhi network pe depend nahi karta. `data.js` ka snapshot
*instant* truth hai; API sirf *upgrade/confirm* karta hai. Network fail ho toh
user ko pata bhi nahi chalta — snapshot data hi dikhta rehta hai.

## Load order (index.html)

1. **Inline `<head>` script** — saved theme apply karta hai *before first paint*
   (white flash / theme flicker rokne ke liye).
2. `css/style.css`
3. `js/data.js` → `window.GTU_DIPL` define hota hai.
4. `js/theme.js` → Appearance panel wire-up + `apply()`.
5. `js/app.js` → `renderSemGrid()` + event listeners.

## State (`app.js`)

```js
state = {
  view: "home" | "sem" | "subject",
  sem: null,            // currently open semester number
  subject: null,        // subject object jab search-se khola
  returnSem: null,      // subject view se back kahan jaana hai
  years: 3|4|5,         // past-years window (localStorage me saved)
  session: "all"|"summer"|"winter",
  live: false           // kya last refresh API se successful tha
}
```

`liveCache = { [subjectCode]: [sessions] }` — API se aaya fresh availability data.

## Render pipeline (app.js functions)

| Function | Role |
|---|---|
| `renderSemGrid()` | 8 semester cards (asymmetric grid) |
| `openSemester(sem)` | loader → panel render → live refresh → re-render |
| `openSubject(subject, returnSem)` | search result se subject view |
| `renderSemView()` | us semester ke saare subjects + papers |
| `renderSubjectView()` | single subject, 5-year window, all its codes |
| `subjectCard()` | ek subject ka card (code chips, kind, paper buttons) |
| `paperButton(p)` | ek Summer/Winter PDF link chip |
| `searchSubjects(q)` | scoring-based fuzzy search |
| `refreshCodes(codes)` | API refresh, 5 concurrent workers |
| `toast(msg, type)` | bottom-right notification |

## DOM contract

`index.html` IDs jo `app.js` use karta hai (ye rename mat karna):
`semGrid`, `semesterSection`, `loader`, `loaderBar`, `papersPanel`,
`panelTitle`, `panelMeta`, `panelNote`, `papersList`, `backBtn`,
`yearPills`, `sessionPills`, `yearsCtrl`, `searchInput`, `searchResults`,
`toasts`, `statSubjects`, `brandHome`.

`theme.js` IDs: `themeBtn`, `themePanel`, `themeClose`, `modePills`.

## Why no framework?

- Zero build step → Netlify pe empty build command.
- 8 semesters + few hundred subjects = client-side JS ke liye trivial.
- Instant load, no hydration, no bundle budget.
