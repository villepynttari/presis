# AGENTS.md

Guidance for AI coding agents (Copilot, Claude, Codex, Cursor, etc.) working
in this repository.

## What this project is

`presis` is a zero-dependency, zero-build static web app: a Markdown slide
deck rendered inside a dark, glowing "terminal emulator" window, styled like
GitHub's markdown viewer. There is no bundler, no package.json, no build
step — it runs by opening `index.html` directly (`file://`) or serving the
folder over any static HTTP host (including GitHub Pages).

## Files

| File                     | Purpose |
|--------------------------|---------|
| `slides.md`              | **The presentation content.** This is the only file a non-developer user should ever need to touch. |
| `index.html`             | Page structure: terminal chrome (titlebar, zoom controls, open-deck/download buttons, status bar) + a tiny placeholder deck inside `<script type="text/markdown" id="deck-source">`, used only when no `slides.md` is found and none was picked yet |
| `style.css`              | All visual styling — dark terminal theme, glow effects, GitHub-flavored markdown rendering rules (`.markdown-body`) |
| `app.js`                 | Vanilla JS, IIFE, no modules/build. Loads the deck, splits slides on `---`, handles navigation, zoom, fullscreen, keyboard shortcuts, the file-picker fallback |
| `vendor/marked.min.js`   | Vendored copy of the [marked](https://github.com/markedjs/marked) Markdown parser (MIT), loaded via `<script src>` so the app works fully offline |
| `scripts/build-zip.sh`   | Regenerates `presis.zip`, the distributable bundle linked from the page's download button |
| `scripts/build-single-file.js` | Generates `presis-standalone.html` (gitignored): inlines `style.css`, `vendor/marked.min.js`, `app.js`, and `slides.md` into one `.html` file with zero external references — the simplest possible way to hand someone (or email/Slack) a single double-clickable file that just works under `file://`, no download-and-unzip step |
| `presis.zip`             | Prebuilt zip of just the runtime files (including a copy of `slides.md`), for users who want a local copy without git |

## Download button points to GitHub Pages, not a relative path

`els.downloadLink.href` is set in `app.js` to the hardcoded constant
`CANONICAL_DOWNLOAD_URL` (`https://villepynttari.github.io/presis/presis.zip`),
overriding the static `href` already in `index.html`. This is intentional:
a user viewing a locally-opened or forwarded copy of `index.html` should
always get the current official zip from the live site, not a possibly
stale `presis.zip` sitting next to that copy. If the GitHub Pages URL for
this project ever changes, update `CANONICAL_DOWNLOAD_URL` in `app.js`
(and the matching `href` in `index.html`, and the links in `README.md`).

## How slides work

- Slide content lives as plain Markdown in `slides.md`.
- Slides are separated by a line containing only `---` (three or more
  hyphens, with a blank line on each side — this is also how Markdown
  expresses a horizontal rule, so don't use a bare `---` line mid-slide
  unless you intend it as a slide break).
- Markdown is converted to HTML at runtime via `marked.parse()` — don't
  hand-write HTML into the deck; keep it as Markdown.

## Deck loading order (important design constraint)

`app.js`'s `loadDeck()` tries, in order:

1. `fetch("slides.md")` — works whenever the page is served over
   `http://`/`https://` (GitHub Pages, `python3 -m http.server`, etc.)
2. A deck previously picked via the **📂 open deck** file-input button,
   cached in `localStorage` — this is the `file://`-safe path, since
   browsers block `fetch` of local files for security but do allow
   reading a user-selected file via `<input type="file">` + `FileReader`.
3. The placeholder deck embedded in `index.html`, shown only as a last
   resort with instructions to create `slides.md` or pick a file.

**Do not remove step 2 or regress to requiring a server** — the whole
point is that a non-developer can double-click `index.html` with zero
setup and point it at their own `slides.md` via the file picker.

## Making changes

- **Editing the deck:** edit `slides.md`. Never ask a user to edit
  `index.html` for content changes — that was the previous (removed)
  design and is intentionally no longer the primary workflow.
- **Editing styles:** everything is plain CSS custom properties at the top
  of `style.css` (`--accent`, `--bg`, `--term-bg`, etc.) plus rules under
  `.markdown-body` for rendered Markdown elements (headings, code, tables,
  blockquotes). Prefer changing variables over hardcoding new colors.
- **Editing behavior:** `app.js` is a single self-contained IIFE with no
  external deps beyond `window.marked`. Keep it dependency-free and
  working without a bundler — this is a design constraint, not an oversight.
- **After any change to `index.html`, `style.css`, `app.js`,
  `vendor/marked.min.js`, or `slides.md`:** re-run `scripts/build-zip.sh`
  to refresh `presis.zip` so the download link on the page stays in sync.
  Commit the regenerated zip alongside your change. Also re-run
  `node scripts/build-single-file.js` if you want an updated standalone
  `.html` copy — it's gitignored, so there's nothing to commit for it.

## Validating changes

There is no test suite or build step. To validate:

1. Syntax-check JS: `node --check app.js`
2. Sanity-check both decks still split/render as expected:
   ```sh
   node -e "
   const fs = require('fs');
   const marked = require('./vendor/marked.min.js');
   const split = raw => raw.trim().split(/\r?\n-{3,}\r?\n/).map(s=>s.trim()).filter(Boolean);

   const html = fs.readFileSync('index.html','utf8');
   const placeholder = html.match(/<script type=\"text\/markdown\" id=\"deck-source\">([\s\S]*?)<\/script>/)[1];
   split(placeholder).forEach(s => marked.parse(s));
   console.log('placeholder deck OK');

   const md = fs.readFileSync('slides.md','utf8');
   const slides = split(md);
   slides.forEach(s => marked.parse(s));
   console.log('slides.md OK, slide count:', slides.length);
   "
   ```
3. Serve locally and eyeball it: `python3 -m http.server 8080`, open
   `http://localhost:8080` — confirms `slides.md` auto-loads via fetch.
4. Also confirm `file://index.html` still works directly (double-click),
   and that the **📂 open deck** button successfully loads a picked
   `slides.md` — this is the primary distribution path for non-technical
   users.

## Deployment

This repo is deployed to **GitHub Pages** from the `main` branch root (no
Actions workflow, no build — "legacy" Pages build type). Pushing to `main`
redeploys automatically. Don't add a build step unless explicitly asked —
the whole point of this project is that it needs none.

## Constraints to respect

- No frameworks, no npm, no bundler, no TypeScript — keep it plain
  HTML/CSS/JS that any browser can run unmodified.
- Must keep working when opened directly from disk via `file://` (no CORS
  issues — avoid adding more `fetch`/`XHR` calls, or guard them like the
  existing `slides.md` fetch with a try/catch fallback).
- Keep the terminal/glow aesthetic and GitHub-markdown-like typography when
  adding new styling.
