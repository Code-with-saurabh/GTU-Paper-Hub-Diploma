# Maintenance — Keeping It Alive

## A. After every exam season (Summer + Winter)

GTU naye papers upload karta rehta hai. Snapshot sync karo:

1. Subject codes ki list `js/data.js` → `semesters[].subjects[].codes` se lo.
2. Har code pe call:
   ```
   GET https://www.gtu.ac.in/api/v1/question-papers/archive/search/?subject_code=<CODE>&course=DI&page_size=50
   ```
3. `data.papers[].session` set → `snapshot[code]` replace karo.
4. Naye sessions `sessions` array ke top pe add (e.g. `W2026`, `S2027`).
5. Commit message: `Sync snapshot after S2026 exams`.

> Chhoti quick-fix: site pe semester kholke "live from GTU archive" suffix dekh lo —
> agar API live data de raha hai toh major break nahi hai; snapshot freshness phir bhi zaroori hai
> taaki offline/instant render accurate rahe.

## B. When GTU publishes a new syllabus

1. `semesters[]` me `effFrom` (e.g. `"2027-28"`) aur `batch` update karo.
2. Naye subjects add, removed subjects hatao — **lekin** `codes[]` me purane codes mat hatao
   (warna purane PDFs orphan ho jaayenge).
3. Subject rename hua? Naya `code` pehle position pe, naam naya, purane codes peeche.
4. Naya code = empty `snapshot` entry `[]` bana do; pehla exam conduct hone pe PDFs aayengi.

## C. Broken PDF link ka case

Agar kisi link pe 404 aaye:

1. GTU archive me session/code spelling check karo (`S2024` vs `W2024`).
2. Ho sakta hai GTU ne file hatai ho — phir snapshot se wo session hata do.
3. Code galat map hua hai toh `codes[]` fix karo.

## D. Theme/Design changes

- Sirf tokens (`--*` variables) badlo — raw hex components me mat likho.
- Naya palette: [docs/theming.md](./theming.md) ka "Adding a 4th palette" recipe follow karo.
- Design rules: [docs/design.md](./design.md) — asymmetric grids, muted palettes, editorial type.

## E. Release checklist

- [ ] `node --check js/app.js` (aur theme.js/data.js) — syntax OK.
- [ ] Local pe: semester open, search, filters, theme switch.
- [ ] `README.md` / docs me breaking changes document karo.
- [ ] `git add -A && git commit && git push` → Netlify auto-deploy.
- [ ] Live URL pe smoke test (og-image bhi cache-bust karke check).

## F. Ownership & credit

Built & maintained by **Saurabh Sharma**
— <https://saurabhsharma.is-a.dev> · <https://github.com/Code-with-saurabh>

Not affiliated with Gujarat Technological University. Papers remain GTU's property;
this project only deep-links GTU's public archive for student revision.
