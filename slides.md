<div class="badge">📽 demo presentation — built with presis</div>

# presis

### Markdown slides in a glowing terminal window

**No install. No code. No developer tools needed.**
Just a text file and a double‑click.

This deck you're reading *is* presis — a working demo of the app,
explaining itself. Press **Enter** or click **next ›** to continue →

---

## Easy by design

- ✅ Write slides in a plain text file — `slides.md`
- ✅ Double‑click `index.html` to present — no server required
- ✅ No installs, no accounts, no command line
- ✅ Works offline, on Windows, Mac, or Linux
- ✅ If you can use a text editor, you can use this

---

## 📥 Get your own copy

Click **⇩ download app (.zip)** in the status bar below this slide.

- Downloads `presis.zip` — everything needed, ready to use
- Always the latest official version, straight from this website
- Unzip it → open the folder → double‑click `index.html`
- Then edit `slides.md` inside to write your own deck

That's it. Nothing to install, nothing to configure.

---

## What is this?

`presis` turns plain **Markdown** into a slide deck that looks like a
modern terminal emulator — dark, glowing, GitHub‑flavored typography.

- No build step, no install, no framework
- One HTML file + CSS + a tiny JS file
- Your slides are just **this file** — `slides.md`

---

## How it works

- Your slides live in **this plain text file**, `slides.md`
- Slides are separated by a line containing only `---`
- `marked.js` (bundled in `vendor/`) renders Markdown → HTML
- `app.js` loads this file, splits it, shows one slide at a time

No coding required to write a presentation — just Markdown.

---

## How to use it

**Got the app via ⇩ download or someone shared you this folder:**

1. Edit **`slides.md`** in any text editor (Notepad, TextEdit, VS Code…)
2. Double‑click **`index.html`** to open the deck in your browser
3. Click **📂 open deck** in the status bar and pick your `slides.md`

**If it's hosted on a website** (like this page): `slides.md` loads
automatically — nothing to click.

---

## Navigation

| Key              | Action        |
|-------------------|---------------|
| `Enter` / `→` / `Space` | Next slide |
| `←` / `Backspace`       | Previous slide |
| `Home` / `End`          | First / last slide |
| `f`                     | Fullscreen |
| `+` / `-` / `0`         | Zoom in / out / reset |

Or just click **‹ prev** / **next ›** in the status bar.

---

## Writing your own deck

<div class="callout">

⚠️ **Everything you've seen so far — this whole file, `slides.md` — is
just a demo.** It's not special or locked. Delete it and write your own.

</div>

Open `slides.md` and replace everything with your own Markdown:

- Use `#`, `##`, `###` for headings
- `-` or `1.` for lists, **bold**, *italics*, `code`, tables, links
- Put a line with only `---` wherever you want a new slide to start
- Save the file — no other file needs to change

---

## Customizing the look (optional, for developers)

All styling lives in **`style.css`**:

- `--accent` — the glow color (default terminal green)
- `--term-bg`, `--bg` — background shades
- Markdown rendering rules are under `.markdown-body`

Change a few CSS variables to re‑theme the whole deck.

---

## Files at a glance

```text
presis/
├── slides.md            ← your presentation content (edit this!)
├── index.html            ← terminal chrome, loads slides.md
├── style.css             ← dark glow theme + markdown styling
├── app.js                ← deck loading + navigation logic
└── vendor/marked.min.js  ← offline markdown parser
```

> Edit `slides.md`, open `index.html`, and you're presenting. ✨
