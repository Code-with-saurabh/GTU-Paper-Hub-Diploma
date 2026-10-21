# App Logic (`js/app.js`) — Step by Step

## Boot sequence

```js
renderSemGrid();   // 8 semester cards
syncPills();       // year + session pills ko state se match karo
```

`SUBJECTS[]` — saare semesters ke subjects ek flat array (search ke liye),
`Object.assign({sem}, subject)` ke saath.

---

## Home → Semester

1. User `sem-card` click karta hai → `openSemester(sem)`.
2. `showLoader()`:
   - panel hide, semester section hide, loader show.
   - progress bar 18% → 100% animate, **950ms** baad `done()` callback.
   (Deliberate micro-delay — GTU API round-trip ke saath rhythm match karta hai.)
3. `state.view = "sem"`, `renderSemView()` — **snapshot se instantly** papers render.
4. `panel.scrollIntoView({behavior:"smooth"})`.
5. Background me `refreshCodes(codesOfSem(sem))` — API se fresh availability.
6. Agar view/sem abhi bhi same hai → `renderSemView()` again (live data ke saath).

## Semester view (`renderSemView`)

- `meta.label + " - " + meta.level` → toolbar title.
- `panelNote` me: syllabus year, batch, years window, session label.
- Har subject ke liye `papersForSubject()` → `subjectCard()` append.
- `panelMeta`: subject count, paper count, "live from GTU archive" suffix (agar live).

## Search

`searchSubjects(q)` scoring (lower score = better):

| Score | Match |
|---|---|
| 0 | exact current code |
| 1 | exact match on koi bhi old code |
| 2 | code prefix |
| 3 | exact name |
| 4 | name prefix |
| 5 | code substring |
| 6 | name substring |

- Results deduped by current `code`, top 8.
- Dropdown: code chip + name + "Sem N".
- **Enter** ya click → `openSubject(s, state.sem)`.
- Keyboard: `ArrowDown` first result pe, `Esc` close.

## Subject view (`openSubject` / `renderSubjectView`)

- Window hamesha **5 years** (search path), years-ctrl hide.
- `subjectCard(..., showSem=true)` — sem chip dikhta hai.
- Project/MOOC subjects → papers nahi, explain-note.
- Empty → `emptyState()` ya hint with available sessions.

## Filters

- **Past years (3/4/5):** pill click → `state.years` → `localStorage["gtu_paper_years"]` → re-render (sirf sem view).
- **Session (all/winter/summer):** → `state.session` → re-render (sem + subject dono).
- `sessionWindow(years)` = `SESSIONS_ALL.slice(0, years*2)` — har saal 2 sessions.

## Back button

- Subject view me + `returnSem` set hai → `openSemester(returnSem)`.
- Warna → home: panel hide, semester section show, top scroll.

## Toasts

Har paper click pe: "Opening official GTU paper: Winter 2024 (3170724)".
4.2s me fade out. `ok`/`warn` types border colour badalte hain.

## Edge cases handled

- **New subject code:** snapshot `[]` → "papers appear after first exam" note.
- **Filter too narrow:** `olderSessionsOutside()` → "archive has Winter 2022, Summer 2023…" hint.
- **Subject renamed:** `codes[]` se purane PDFs bhi milte hain.
- **API down:** silent snapshot fallback, `live` suffix nahi.
- **Doubled sessions:** snapshot me duplicate session entries ho toh bhi UI theek
  (same URL same PDF kholega).
