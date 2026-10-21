# GTU API & Data Layer

## Source of truth

Site **PDFs host nahi karta**. Sirf GTU ke official archive ko deep-link karta hai:

```
https://www.gtu.ac.in
```

`js/data.js` me `window.GTU_DIPL.apiBase = "https://www.gtu.ac.in"`.

## 1. Static snapshot (`js/data.js`)

```js
window.GTU_DIPL = {
  apiBase: "https://www.gtu.ac.in",

  // Newest first. S = Summer (Apr–May), W = Winter (Nov–Dec)
  sessions: ["S2026","W2025","S2025","W2024", ... ,"W2016"],

  // subject_code → sessions jisme archive me PDF exist karta hai
  snapshot: {
    "3170724": ["S2025","W2024","S2024","W2023", ...],
    "2180706": [],            // abhi tak koi paper nahi
    ...
  },

  // Running Diploma (CSE) syllabus, synced Oct 2026
  semesters: [
    {
      sem: 1,
      label: "Semester 1",
      level: "First Year",
      effFrom: "2026-27",     // syllabus applicable year
      batch: "Batch 2026",
      subjects: [
        {
          name: "Mathematics - I",
          code: "DI01C00021",         // current code
          kind: "core",               // core | elective | audit | project | mooc
          codes: [                    // current + saare purane codes
            "DI01C00021",
            "DI01000021",
            "C4300001",
            "4300001",
            "310034"
          ]
        },
        ...
      ]
    },
    ... // sem 2..8
  ]
};
```

### `codes[]` kyun zaroori hai?

GTU subject ka code time ke saath badalta hai (e.g. `310034` → `4300001` → `DI01000021` → `DI01C00021`).
Purane exam PDFs *purane code* ke neeche filed hote hain. `codes[]` me saare codes rakhne se
purane papers bhi aaj ke subject naam ke neeche mil jaate hain — search bhi isi list pe chalta hai.

### `kind` values

| kind | Matlab | UI me |
|---|---|---|
| `core` | Core theory/lab subject | accent chip |
| `elective` | Open/elective subject | gold chip |
| `audit` | Non-credit/audit | grey chip |
| `project` | Internship/project — GTU koi written paper rakhta hi nahi | explanatory note |
| `mooc` | MOOC — online platform pe exam hota hai, archive me PDF nahi | explanatory note |

## 2. Live archive API (validation)

Paper availability *confirm* karne ke liye:

```
GET https://www.gtu.ac.in/api/v1/question-papers/archive/search/
    ?subject_code=<CODE>
    &course=DI
    &page_size=50
Accept: application/json
```

Response shape:

```json
{
  "success": true,
  "data": {
    "papers": [
      { "session": "W2024", ... },
      { "session": "S2024", ... }
    ]
  }
}
```

`app.js` sirf `papers[].session` nikalta hai aur `liveCache[code]` me store karta hai.

### Failure handling

- Har semester/subject open pe **5 concurrent workers** se codes queue process hote hain.
- Koi call fail → `failed++`, baaki chalte rehte hain.
- Agar **ek bhi** call fail ho gayi → `state.live = false` → snapshot data hi use hota hai,
  UI me "live from GTU archive" suffix nahi dikhta.
- User ko koi error kabhi nahi dikhta (silent fallback).

## 3. PDF URL pattern

Koi extra lookup nahi — URL deterministic hai:

```
{apiBase}/api/v1/question-papers/archive/file/{SESSION}/DI/{CODE}.pdf
```

Examples:

```
https://www.gtu.ac.in/api/v1/question-papers/archive/file/W2017/DI/3330704.pdf
https://www.gtu.ac.in/api/v1/question-papers/archive/file/S2026/DI/DI01C00021.pdf
```

`paperButton()` ise `target="_blank"` anchor me lagata hai + toast dikhata hai.

## 4. Paper selection logic

`papersForSubject(subject, window, sessionFilter)`:

1. Subject ke **har code** pe `sessionsForCode(code)` (liveCache ya snapshot) se sessions lo.
2. Window (`S2026,W2025,S2024...` ke first `years*2` entries) me filter karo.
3. Session filter: `summer` → sirf `S*`, `winter` → sirf `W*`, `all` → dono.
4. `SESSIONS_ALL` order me sort (newest first), code-index tiebreaker.

`olderSessionsOutside()` — agar current filter me kuch nahi mila, toh batata hai ki
archive me subject ke liye *kaunse* sessions available hain (user ko hint milta hai
"years badhao ya session switch karo").

## 5. Syncing the snapshot (maintenance)

Har exam season ke baad:

1. Har Diploma subject code pe `archive/search` call karo (`course=DI&page_size=50`).
2. `data.papers[].session` collect karke `snapshot[code]` update karo.
3. Naye syllabus ke naye codes add karo, purane `codes[]` me rakho.
4. `sessions` array me naya session prepend karo (e.g. `S2027`).
5. Commit + push. Netlify auto-deploy.
