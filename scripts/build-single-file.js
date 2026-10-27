#!/usr/bin/env node
// Inlines style.css, vendor/marked.min.js, app.js, and slides.md into
// index.html, producing one fully standalone .html file with zero
// external references — no "file not found" under file://, no CORS
// fetch() of slides.md needed, nothing to unzip.
//
// Run after changing index.html, style.css, app.js, vendor/*, or
// slides.md. Output: <repo-folder-name>-standalone.html (gitignored —
// it's a generated artifact, not something to hand-edit).
//
// Usage: node scripts/build-single-file.js [output-file]

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = process.argv[2] || `${path.basename(ROOT)}-standalone.html`;

function read(name) {
  return fs.readFileSync(path.join(ROOT, name), "utf8");
}

// Never allow a literal "</script>" through verbatim inside an inlined
// <script> block — it would close the tag early and break the page.
// None of the current source files contain this, but fail loudly
// instead of silently emitting a broken file if that ever changes.
function assertSafeForInlineScript(label, text) {
  if (/<\/script/i.test(text)) {
    throw new Error(
      `${label} contains a literal "</script" sequence; cannot inline it ` +
        "verbatim. Escape it (e.g. split the string) before building."
    );
  }
}

let html = read("index.html");
const css = read("style.css");
const marked = read("vendor/marked.min.js");
const appJs = read("app.js");
const slides = read("slides.md");

assertSafeForInlineScript("app.js", appJs);
assertSafeForInlineScript("vendor/marked.min.js", marked);
assertSafeForInlineScript("slides.md", slides);

// 1. Inline style.css in place of the <link>.
html = html.replace(
  /<link rel="stylesheet" href="style\.css">/,
  () => `<style>\n${css}\n</style>`
);

// 2. Inline vendor/marked.min.js and app.js in place of their <script src>.
html = html.replace(
  /<script src="vendor\/marked\.min\.js"><\/script>/,
  () => `<script>\n${marked}\n</script>`
);
html = html.replace(
  /<script src="app\.js"><\/script>/,
  () => `<script>\n${appJs}\n</script>`
);

// 3. Replace the embedded placeholder deck with the real slides.md
// content, so the very first thing app.js's loadDeck() falls back to
// (fetch("slides.md") always fails under file://, and there's no saved
// localStorage deck on a fresh machine) is the actual presentation, not
// the "no slides.md found" instructions.
html = html.replace(
  /(<script type="text\/markdown" id="deck-source">)[\s\S]*?(\s*<\/script>)/,
  (_match, open, close) => `${open}\n${slides}\n${close}`
);

fs.writeFileSync(path.join(ROOT, OUT), html);
console.log(`Built ${OUT} (${(html.length / 1024).toFixed(1)} KiB, single file, no dependencies)`);
