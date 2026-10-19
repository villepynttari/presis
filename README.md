# presis

A tiny, dependency-light slide deck viewer: your Markdown rendered GitHub-style,
wrapped in a dark, glowing "modern terminal emulator" window.

**Live demo:** https://villepynttari.github.io/presis/

## Get it

- **Recommended — download from GitHub Pages (always the latest):**
  click **⇩ download app (.zip)** on [the live demo](https://villepynttari.github.io/presis/),
  or grab it directly: https://villepynttari.github.io/presis/presis.zip
- **Clone instead:** `git clone https://github.com/villepynttari/presis.git`

Either way, no install step: unzip (or clone), then just open `index.html`.
The in-app download button always points to the GitHub Pages copy above,
even if you're viewing a shared/local copy — so it never serves you a
stale version.

## Usage

**No editing of HTML required** — your presentation is just `slides.md`, a
plain text file.

1. Open `slides.md` in any text editor and write your slides (Markdown,
   `---` between slides)
2. Open `index.html` in a browser:
   - **Hosted** (e.g. this page, or `python3 -m http.server 8080`):
     `slides.md` loads automatically.
   - **Opened directly** (double-click, `file://`): click **📂 open deck**
     in the status bar and select your `slides.md` — browsers block
     background file loading from `file://` for security, so this one
     click replaces that. It's remembered next time you open the app.

- **Next slide:** click `next ›`, press `Enter`, `→`, `Space`, or `Page Down`
- **Previous slide:** click `‹ prev`, press `←`, `Backspace`, or `Page Up`
- **Jump to first/last:** `Home` / `End`
- **Fullscreen:** `f`
- **Zoom:** click `+` / `−` in the titlebar, or press `+` / `-`; click the `%` to reset (`0`). Zoom level is remembered between visits.

## Editing your deck

Just edit **`slides.md`** — no HTML/CSS/JS knowledge needed. Separate
slides with a line containing only `---`.

(There's also a tiny placeholder deck embedded in `index.html`, shown only
if no `slides.md` can be found and nothing's been picked yet — it's not
meant to be edited, just a fallback with instructions.)

## Using an AI coding agent

This repo includes an [`AGENTS.md`](AGENTS.md) with context for AI coding
agents (Copilot, Claude, Codex, etc.) — project structure, conventions,
and constraints (no build step, no frameworks). Point your agent at it
before asking for changes.

## Files

- `slides.md` — your presentation content (edit this!)
- `index.html` — markup, terminal chrome, loads `slides.md`
- `style.css` — dark terminal + glow theme, GitHub-flavored markdown styling
- `app.js` — deck loading (fetch → file picker → placeholder), slide splitting, navigation
- `vendor/marked.min.js` — vendored [marked](https://github.com/markedjs/marked) markdown parser (MIT), works fully offline
- `AGENTS.md` — guidance for AI coding agents working in this repo
- `scripts/build-zip.sh` — regenerates `presis.zip` (run after changing any runtime file)
- `presis.zip` — prebuilt downloadable bundle of the files above

