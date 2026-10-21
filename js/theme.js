(function () {
  "use strict";

  var KEY = "gtu_theme";
  var root = document.documentElement;
  var btn = document.getElementById("themeBtn");
  var panel = document.getElementById("themePanel");
  var closeBtn = document.getElementById("themeClose");
  var palBtns = panel ? [].slice.call(panel.querySelectorAll(".pal")) : [];
  var modeBtns = panel ? [].slice.call(panel.querySelectorAll("#modePills button")) : [];

  var prefs = { palette: "1", mode: "auto" };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (["1", "2", "3"].indexOf(saved.palette) >= 0) prefs.palette = saved.palette;
    if (["light", "dark", "auto"].indexOf(saved.mode) >= 0) prefs.mode = saved.mode;
  } catch (e) {}

  var mq = window.matchMedia("(prefers-color-scheme: dark)");

  function resolvedMode() {
    if (prefs.mode === "auto") return mq.matches ? "dark" : "light";
    return prefs.mode;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {}
  }

  function apply() {
    root.setAttribute("data-palette", prefs.palette);
    root.setAttribute("data-mode", resolvedMode());
    palBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.palette === prefs.palette));
    });
    modeBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.mode === prefs.mode));
    });
  }

  function setPalette(p) { prefs.palette = p; save(); apply(); }
  function setMode(m) { prefs.mode = m; save(); apply(); }

  function openPanel() {
    if (!panel) return;
    panel.classList.remove("hidden");
    btn.setAttribute("aria-expanded", "true");
  }

  function closePanel() {
    if (!panel) return;
    panel.classList.add("hidden");
    btn.setAttribute("aria-expanded", "false");
  }

  if (btn && panel) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (panel.classList.contains("hidden")) openPanel();
      else closePanel();
    });

    closeBtn.addEventListener("click", closePanel);

    panel.addEventListener("click", function (e) { e.stopPropagation(); });

    document.addEventListener("click", function (e) {
      if (e.target && e.target.closest && !e.target.closest(".theme-wrap")) closePanel();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePanel();
    });
  }

  palBtns.forEach(function (b) {
    b.addEventListener("click", function () { setPalette(b.dataset.palette); });
  });

  modeBtns.forEach(function (b) {
    b.addEventListener("click", function () { setMode(b.dataset.mode); });
  });

  if (mq.addEventListener) {
    mq.addEventListener("change", function () {
      if (prefs.mode === "auto") apply();
    });
  }

  apply();
})();
