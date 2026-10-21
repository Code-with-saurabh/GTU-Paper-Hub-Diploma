(function () {
  "use strict";

  const DATA = window.GTU_DIPL;
  const SUBJECTS = [];
  DATA.semesters.forEach((s) => s.subjects.forEach((sub) => SUBJECTS.push(Object.assign({ sem: s.sem }, sub))));
  const SESSIONS_ALL = DATA.sessions;
  const API = DATA.apiBase;
  const SNAPSHOT = DATA.snapshot;
  const MIN_YEARS = 3;
  const MAX_YEARS = 5;
  const SEARCH_YEARS = 5;
  const KIND_LABEL = { core: "Core", elective: "Elective", audit: "Audit / Non-credit", project: "Project / Internship", mooc: "MOOC" };

  const state = {
    view: "home",
    sem: null,
    subject: null,
    returnSem: null,
    years: loadYears(),
    session: "all",
    live: false
  };

  const liveCache = {};

  const el = {
    semGrid: document.getElementById("semGrid"),
    semesterSection: document.getElementById("semesterSection"),
    loader: document.getElementById("loader"),
    loaderBar: document.getElementById("loaderBar"),
    panel: document.getElementById("papersPanel"),
    panelTitle: document.getElementById("panelTitle"),
    panelMeta: document.getElementById("panelMeta"),
    panelNote: document.getElementById("panelNote"),
    papersList: document.getElementById("papersList"),
    backBtn: document.getElementById("backBtn"),
    yearPills: document.getElementById("yearPills"),
    sessionPills: document.getElementById("sessionPills"),
    yearsCtrl: document.getElementById("yearsCtrl"),
    searchInput: document.getElementById("searchInput"),
    searchResults: document.getElementById("searchResults"),
    toasts: document.getElementById("toasts"),
    statSubjects: document.getElementById("statSubjects"),
    brandHome: document.getElementById("brandHome")
  };

  function loadYears() {
    try {
      const v = parseInt(localStorage.getItem("gtu_paper_years"), 10);
      if (v >= MIN_YEARS && v <= MAX_YEARS) return v;
    } catch (e) {}
    return MIN_YEARS;
  }

  function saveYears(v) {
    try {
      localStorage.setItem("gtu_paper_years", String(v));
    } catch (e) {}
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function subjectsOfSem(sem) {
    const meta = DATA.semesters.find((m) => m.sem === sem);
    return meta ? meta.subjects.map((s) => Object.assign({ sem: sem }, s)) : [];
  }

  function sessionWindow(years) {
    return SESSIONS_ALL.slice(0, years * 2);
  }

  function sessionName(s) {
    return (s.charAt(0) === "S" ? "Summer " : "Winter ") + s.slice(1);
  }

  function paperFileUrl(session, code) {
    return API + "/api/v1/question-papers/archive/file/" + session + "/" + DATA.course + "/" + code + ".pdf";
  }

  function sessionsForCode(code) {
    if (liveCache[code]) return liveCache[code];
    return SNAPSHOT[code] || [];
  }

  function papersForSubject(subject, window, sessionFilter) {
    const out = [];
    subject.codes.forEach((code, ci) => {
      sessionsForCode(code).forEach((s) => {
        if (window.indexOf(s) === -1) return;
        if (sessionFilter === "summer" && s.charAt(0) !== "S") return;
        if (sessionFilter === "winter" && s.charAt(0) !== "W") return;
        out.push({ session: s, code: code, codeIndex: ci, sem: subject.sem, name: subject.name, url: paperFileUrl(s, code) });
      });
    });
    out.sort((a, b) => SESSIONS_ALL.indexOf(a.session) - SESSIONS_ALL.indexOf(b.session) || a.codeIndex - b.codeIndex);
    return out;
  }

  function olderSessionsOutside(subject, window, sessionFilter) {
    const out = [];
    subject.codes.forEach((code) => {
      sessionsForCode(code).forEach((s) => {
        if (window.indexOf(s) !== -1) return;
        if (sessionFilter === "summer" && s.charAt(0) !== "S") return;
        if (sessionFilter === "winter" && s.charAt(0) !== "W") return;
        if (SESSIONS_ALL.indexOf(s) > window.length + 4) return;
        out.push(s);
      });
    });
    return out;
  }

  /* ---------- live refresh from GTU archive API ---------- */

  async function fetchCodeSessions(code) {
    const url = API + "/api/v1/question-papers/archive/search/?subject_code=" + encodeURIComponent(code) + "&course=" + DATA.course + "&page_size=50";
    const res = await fetch(url, { headers: { accept: "application/json" } });
    const j = await res.json();
    if (!j || !j.success) throw new Error("bad response");
    return (j.data.papers || []).map((p) => p.session);
  }

  async function refreshCodes(codes) {
    const queue = codes.slice();
    const CONC = 5;
    let failed = 0;
    async function worker() {
      while (queue.length) {
        const code = queue.shift();
        try {
          liveCache[code] = await fetchCodeSessions(code);
        } catch (e) {
          failed++;
        }
      }
    }
    await Promise.all(Array.from({ length: CONC }, worker));
    state.live = failed === 0;
    return failed;
  }

  function codesOfSem(sem) {
    const set = new Set();
    subjectsOfSem(sem).forEach((s) => s.codes.forEach((c) => set.add(c)));
    return [...set];
  }

  /* ---------- render: home ---------- */

  function renderSemGrid() {
    el.statSubjects.textContent = String(SUBJECTS.length);
    el.semGrid.innerHTML = "";
    DATA.semesters.forEach((meta) => {
      const count = meta.subjects.length;
      const btn = document.createElement("button");
      btn.className = "sem-card";
      btn.type = "button";
      btn.dataset.sem = String(meta.sem);
      btn.innerHTML =
        '<span class="lvl">' + meta.level + "</span>" +
        '<div class="num">' + meta.label + "</div>" +
        '<div class="meta"><span>' + count + " subjects</span><span class=\"eff-chip\">" + meta.effFrom + "</span></div>" +
        '<span class="go">View papers &rarr;</span>';
      btn.addEventListener("click", () => openSemester(meta.sem));
      el.semGrid.appendChild(btn);
    });
  }

  function syncPills() {
    el.yearPills.querySelectorAll(".pill").forEach((p) => {
      p.classList.toggle("active", Number(p.dataset.y) === state.years);
    });
    el.sessionPills.querySelectorAll(".pill").forEach((p) => {
      p.classList.toggle("active", p.dataset.s === state.session);
    });
  }

  function showLoader(done) {
    el.panel.classList.add("hidden");
    el.semesterSection.classList.add("hidden");
    el.loader.classList.remove("hidden");
    el.loaderBar.style.width = "0%";
    requestAnimationFrame(() => {
      el.loaderBar.style.width = "18%";
      setTimeout(() => {
        el.loaderBar.style.width = "100%";
      }, 80);
    });
    setTimeout(() => {
      el.loader.classList.add("hidden");
      done();
    }, 950);
  }

  function openSemester(sem) {
    state.sem = sem;
    state.subject = null;
    state.live = false;
    showLoader(() => {
      state.view = "sem";
      renderPanel();
      el.panel.scrollIntoView({ behavior: "smooth", block: "start" });
      refreshCodes(codesOfSem(sem)).then(() => {
        if (state.view === "sem" && state.sem === sem) renderSemView();
      });
    });
  }

  function openSubject(subject, returnSem) {
    state.subject = subject;
    state.returnSem = returnSem || state.returnSem;
    state.live = false;
    showLoader(() => {
      state.view = "subject";
      renderPanel();
      el.panel.scrollIntoView({ behavior: "smooth", block: "start" });
      refreshCodes(subject.codes).then(() => {
        if (state.view === "subject" && state.subject === subject) renderSubjectView();
      });
    });
  }

  function goBack() {
    if (state.view === "subject" && state.returnSem) {
      openSemester(state.returnSem);
      return;
    }
    state.view = "home";
    state.sem = null;
    state.subject = null;
    el.panel.classList.add("hidden");
    el.semesterSection.classList.remove("hidden");
    el.semesterSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderPanel() {
    syncPills();
    el.panel.classList.remove("hidden");
    el.semesterSection.classList.add("hidden");

    if (state.view === "subject") {
      el.yearsCtrl.classList.add("hidden");
      renderSubjectView();
    } else {
      el.yearsCtrl.classList.remove("hidden");
      renderSemView();
    }
  }

  /* ---------- render: semester / subject ---------- */

  function liveSuffix() {
    return state.live ? " - live from GTU archive" : "";
  }

  function renderSemView() {
    const meta = DATA.semesters.find((m) => m.sem === state.sem);
    const subjects = subjectsOfSem(state.sem);
    const window = sessionWindow(state.years);
    const sessionLabel = state.session === "all" ? "Summer + Winter" : cap(state.session);

    el.panelTitle.textContent = meta.label + " - " + meta.level;
    el.panelNote.innerHTML =
      "Currently running syllabus: <b>" + meta.effFrom + "</b> (" + meta.batch + "). Showing papers of the last <b>" +
      state.years + " exam year" + (state.years > 1 ? "s" : "") + "</b> with <b>" + sessionLabel +
      "</b> sessions. Papers come from GTU's official question paper archive" + (state.live ? " (checked live just now)." : ".");

    let total = 0;
    const frag = document.createDocumentFragment();

    subjects.forEach((subject) => {
      const papers = papersForSubject(subject, window, state.session);
      total += papers.length;
      frag.appendChild(subjectCard(subject, papers, window, false));
    });

    el.papersList.innerHTML = "";
    el.papersList.appendChild(frag);
    el.panelMeta.textContent =
      subjects.length + " subjects - " + total + " papers - syllabus " + meta.effFrom + liveSuffix();
  }

  function renderSubjectView() {
    const subject = state.subject;
    const window = sessionWindow(SEARCH_YEARS);
    const papers = papersForSubject(subject, window, state.session);
    const sessionLabel = state.session === "all" ? "Summer + Winter" : cap(state.session);

    el.panelTitle.textContent = subject.name;
    el.panelMeta.textContent =
      subject.code + " - Semester " + subject.sem + " - GTU Diploma (CSE)" + liveSuffix();
    el.panelNote.innerHTML =
      "Search result: previous <b>5 years</b> of <b>" + sessionLabel + "</b> papers for <b>" +
      subject.name + "</b>. Older subject codes are included, so papers filed under previous codes also appear.";

    el.papersList.innerHTML = "";
    if (!papers.length && subject.kind !== "project" && subject.kind !== "mooc") {
      el.papersList.appendChild(emptyState("No papers found for this session in the last 5 years."));
    }
    el.papersList.appendChild(subjectCard(subject, papers, window, true));
  }

  function subjectCard(subject, papers, window, showSem) {
    const card = document.createElement("article");
    card.className = "subject-card";

    const head = document.createElement("div");
    head.className = "subject-head";
    head.innerHTML =
      '<span class="code-chip">' + subject.code + "</span>" +
      "<h3>" + subject.name + "</h3>" +
      (showSem ? '<span class="sem-chip">Sem ' + subject.sem + "</span>" : "") +
      '<span class="kind-chip kind-' + subject.kind + '">' + (KIND_LABEL[subject.kind] || subject.kind) + "</span>";
    card.appendChild(head);

    if (subject.codes.length > 1) {
      const legacy = document.createElement("p");
      legacy.className = "legacy-line";
      legacy.textContent = subject.codes.slice(1).join(", ");
      card.appendChild(legacy);
    }

    if (subject.kind === "project") {
      const note = document.createElement("p");
      note.className = "no-papers";
      note.textContent = "Internship / project subject - GTU does not hold a written question paper for it.";
      card.appendChild(note);
      return card;
    }

    if (subject.kind === "mooc") {
      const note = document.createElement("p");
      note.className = "no-papers";
      note.textContent = "MOOC course - exam is conducted online by the MOOC platform, so there is no GTU question paper in the archive.";
      card.appendChild(note);
      return card;
    }

    if (!papers.length) {
      const note = document.createElement("p");
      note.className = "no-papers";
      const older = olderSessionsOutside(subject, window, state.session);
      if (older.length) {
        note.textContent =
          "No papers inside the selected years/sessions. The archive has this subject for: " +
          older.slice(0, 6).map(sessionName).join(", ") +
          " - increase past years or switch the session filter.";
      } else {
        note.textContent =
          "No papers in GTU's archive yet for this subject's codes. For newly introduced codes, papers appear after the first exam is held.";
      }
      card.appendChild(note);
      return card;
    }

    const wrap = document.createElement("div");
    wrap.className = "papers";
    papers.forEach((p) => wrap.appendChild(paperButton(p)));
    card.appendChild(wrap);
    return card;
  }

  function paperButton(p) {
    const btn = document.createElement("a");
    btn.className = "paper-btn";
    btn.href = p.url;
    btn.target = "_blank";
    btn.rel = "noopener";
    const sess = p.session.charAt(0) === "S" ? "summer" : "winter";
    btn.innerHTML =
      '<span class="sess sess-' + sess + '">' + sessionName(p.session).toUpperCase() + "</span>" +
      '<span class="pcode">' + p.code + "</span>" +
      '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"></path><path d="M7 11l5 5 5-5"></path><path d="M5 21h14"></path></svg>';
    btn.addEventListener("click", () => {
      toast("Opening official GTU paper: " + sessionName(p.session) + " (" + p.code + ")", "ok");
    });
    return btn;
  }

  function emptyState(msg) {
    const div = document.createElement("div");
    div.className = "empty-state";
    div.textContent = msg;
    return div;
  }

  /* ---------- search ---------- */

  function searchSubjects(q) {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const scored = [];
    SUBJECTS.forEach((s) => {
      const name = s.name.toLowerCase();
      let score = -1;
      if (s.code.toLowerCase() === query) score = 0;
      else if (s.codes.some((c) => c.toLowerCase() === query)) score = 1;
      else if (s.codes.some((c) => c.toLowerCase().startsWith(query))) score = 2;
      else if (name === query) score = 3;
      else if (name.startsWith(query)) score = 4;
      else if (s.codes.some((c) => c.toLowerCase().includes(query))) score = 5;
      else if (name.includes(query)) score = 6;
      if (score >= 0) scored.push({ s: s, score: score });
    });
    scored.sort((a, b) => a.score - b.score || a.s.name.localeCompare(b.s.name));
    const seen = new Set();
    const out = [];
    scored.forEach((x) => {
      const key = x.s.code;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(x.s);
    });
    return out.slice(0, 8);
  }

  function renderSearchResults(q) {
    const matches = searchSubjects(q);
    if (!q.trim()) {
      el.searchResults.classList.add("hidden");
      return;
    }
    el.searchResults.innerHTML = "";
    el.searchResults.classList.remove("hidden");

    if (!matches.length) {
      const div = document.createElement("div");
      div.className = "search-empty";
      div.textContent = 'No subject found for "' + q.trim() + '". Try a code like DI03000021 or 4330704.';
      el.searchResults.appendChild(div);
      return;
    }

    matches.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "search-item";
      btn.innerHTML =
        '<span class="code">' + s.code + "</span>" +
        '<span class="sname">' + s.name + "</span>" +
        '<span class="sem-tag">Sem ' + s.sem + "</span>";
      btn.addEventListener("click", () => {
        el.searchResults.classList.add("hidden");
        el.searchInput.value = s.name;
        openSubject(s, state.sem);
      });
      el.searchResults.appendChild(btn);
    });
  }

  /* ---------- toast ---------- */

  function toast(msg, type) {
    const div = document.createElement("div");
    div.className = "toast " + (type || "");
    div.textContent = msg;
    el.toasts.appendChild(div);
    setTimeout(() => {
      div.style.opacity = "0";
      div.style.transition = "opacity 0.3s ease";
      setTimeout(() => div.remove(), 320);
    }, 4200);
  }

  /* ---------- events ---------- */

  el.yearPills.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    state.years = Number(btn.dataset.y);
    saveYears(state.years);
    syncPills();
    if (state.view === "sem") renderSemView();
  });

  el.sessionPills.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    state.session = btn.dataset.s;
    syncPills();
    if (state.view === "sem") renderSemView();
    else if (state.view === "subject") renderSubjectView();
  });

  el.backBtn.addEventListener("click", goBack);

  el.searchInput.addEventListener("input", () => renderSearchResults(el.searchInput.value));

  el.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      el.searchResults.classList.add("hidden");
      el.searchInput.blur();
    }
    if (e.key === "Enter") {
      const first = el.searchResults.querySelector(".search-item");
      if (first) first.click();
    }
    if (e.key === "ArrowDown") {
      const first = el.searchResults.querySelector(".search-item");
      if (first) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) el.searchResults.classList.add("hidden");
  });

  el.brandHome.addEventListener("click", (e) => {
    e.preventDefault();
    goBack();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  renderSemGrid();
  syncPills();

  window.GTU_PAPER_HUB = {
    state: state,
    liveCache: liveCache,
    snapshot: SNAPSHOT,
    sessionWindow: sessionWindow,
    papersForSubject: papersForSubject,
    searchSubjects: searchSubjects,
    subjectsOfSem: subjectsOfSem,
    paperFileUrl: paperFileUrl,
    sessionName: sessionName,
    refreshCodes: refreshCodes
  };
})();
