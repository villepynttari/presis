/* presis — terminal-styled markdown slide deck
 *
 * Slides are plain Markdown, written in `slides.md`, separated by a line
 * containing only `---`. Loading order:
 *   1. fetch("slides.md") — works when served over http/https
 *   2. the last deck picked via the "open deck" file button (file://-safe)
 *   3. a tiny placeholder deck (<script id="deck-source">) with instructions
 */

(function () {
  "use strict";

  const SLIDE_SEPARATOR = /\r?\n-{3,}\r?\n/;
  const ZOOM_MIN = 0.6;
  const ZOOM_MAX = 2.2;
  const ZOOM_STEP = 0.1;
  const ZOOM_DEFAULT = 1;
  const ZOOM_STORAGE_KEY = "presis-zoom";
  const LOCAL_DECK_STORAGE_KEY = "presis-local-deck";
  const LOCAL_DECK_NAME_KEY = "presis-local-deck-name";

  // The download button always points here — the canonical, always-up-to-date
  // GitHub Pages copy — rather than a same-folder "presis.zip" that could be
  // an older copy sitting next to a locally-opened index.html.
  const CANONICAL_DOWNLOAD_URL = "https://villepynttari.github.io/presis/presis.zip";

  const els = {
    slide: document.getElementById("slide"),
    current: document.getElementById("slide-current"),
    total: document.getElementById("slide-total"),
    prevBtn: document.getElementById("prev-btn"),
    nextBtn: document.getElementById("next-btn"),
    statusMode: document.getElementById("status-mode"),
    zoomInBtn: document.getElementById("zoom-in-btn"),
    zoomOutBtn: document.getElementById("zoom-out-btn"),
    zoomLevel: document.getElementById("zoom-level"),
    deckTitle: document.getElementById("deck-title"),
    openFileBtn: document.getElementById("open-file-btn"),
    fileInput: document.getElementById("file-input"),
    downloadLink: document.getElementById("download-link"),
  };

  let slides = [];
  let index = 0;
  let zoom = loadZoom();

  function loadZoom() {
    const saved = parseFloat(localStorage.getItem(ZOOM_STORAGE_KEY));
    return Number.isFinite(saved) ? clampZoom(saved) : ZOOM_DEFAULT;
  }

  function clampZoom(z) {
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  }

  function applyZoom() {
    els.slide.style.fontSize = (16 * zoom) + "px";
    els.zoomLevel.textContent = Math.round(zoom * 100) + "%";
    els.zoomOutBtn.disabled = zoom <= ZOOM_MIN;
    els.zoomInBtn.disabled = zoom >= ZOOM_MAX;
    localStorage.setItem(ZOOM_STORAGE_KEY, String(zoom));
  }

  function setZoom(z) {
    zoom = clampZoom(z);
    applyZoom();
  }

  function zoomIn() { setZoom(Math.round((zoom + ZOOM_STEP) * 100) / 100); }
  function zoomOut() { setZoom(Math.round((zoom - ZOOM_STEP) * 100) / 100); }
  function zoomReset() { setZoom(ZOOM_DEFAULT); }

  function splitDeck(raw) {
    return raw
      .trim()
      .split(SLIDE_SEPARATOR)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  function setDeck(raw, label) {
    slides = splitDeck(raw);
    if (slides.length === 0) slides = ["# Empty deck"];
    index = 0;
    if (label) els.deckTitle.textContent = "presis — " + label;
    render();
  }

  function render() {
    const html = window.marked.parse(slides[index] || "");
    els.slide.innerHTML = html;
    els.slide.scrollTop = 0;
    els.slide.focus({ preventScroll: true });

    els.current.textContent = index + 1;
    els.total.textContent = slides.length;

    els.prevBtn.disabled = index === 0;
    els.nextBtn.disabled = index === slides.length - 1;

    els.statusMode.textContent = index === slides.length - 1 ? "END" : "NORMAL";
  }

  function goTo(i) {
    const clamped = Math.max(0, Math.min(i, slides.length - 1));
    if (clamped !== index) {
      index = clamped;
      render();
    }
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function bindControls() {
    els.downloadLink.href = CANONICAL_DOWNLOAD_URL;
    els.nextBtn.addEventListener("click", next);
    els.prevBtn.addEventListener("click", prev);
    els.zoomInBtn.addEventListener("click", zoomIn);
    els.zoomOutBtn.addEventListener("click", zoomOut);
    els.zoomLevel.addEventListener("click", zoomReset);
    els.openFileBtn.addEventListener("click", () => els.fileInput.click());
    els.fileInput.addEventListener("change", onFilePicked);

    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) return; // leave native browser zoom alone

      // Ignore repeats of modifier combos; keep it simple & forgiving.
      switch (e.key) {
        case "Enter":
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
        case "Backspace":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(slides.length - 1);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
        case "_":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          e.preventDefault();
          zoomReset();
          break;
      }
    });
  }

  function onFilePicked(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      localStorage.setItem(LOCAL_DECK_STORAGE_KEY, text);
      localStorage.setItem(LOCAL_DECK_NAME_KEY, file.name);
      setDeck(text, file.name);
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-picking the same file later
  }

  async function loadDeck() {
    // 1. An external slides.md — works when served over http/https.
    try {
      const res = await fetch("slides.md", { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        if (text.trim().length > 0) return { text, label: "slides.md" };
      }
    } catch (_) {
      /* fetch is blocked under file:// — fall through */
    }

    // 2. The last deck picked via the "open deck" button (persists locally).
    const saved = localStorage.getItem(LOCAL_DECK_STORAGE_KEY);
    if (saved && saved.trim().length > 0) {
      const name = localStorage.getItem(LOCAL_DECK_NAME_KEY) || "slides.md";
      return { text: saved, label: name };
    }

    // 3. Tiny placeholder deck with instructions.
    const embedded = document.getElementById("deck-source");
    return {
      text: embedded ? embedded.textContent : "# No slides found",
      label: "no deck loaded — click 📂 open deck",
    };
  }

  loadDeck().then(({ text, label }) => {
    bindControls();
    applyZoom();
    setDeck(text, label);
  });
})();
