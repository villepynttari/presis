#!/usr/bin/env bash
# Regenerates presis.zip — the distributable bundle of just the files
# needed to run the app (linked from the "download" button in index.html).
# Run this after changing index.html, style.css, app.js, or vendor/*.
set -euo pipefail

cd "$(dirname "$0")/.."

ZIP_NAME="presis.zip"
FILES=(index.html style.css app.js vendor/marked.min.js slides.md README.md AGENTS.md)

rm -f "$ZIP_NAME"
zip -q -r "$ZIP_NAME" "${FILES[@]}"

echo "Built $ZIP_NAME with:"
unzip -l "$ZIP_NAME"
